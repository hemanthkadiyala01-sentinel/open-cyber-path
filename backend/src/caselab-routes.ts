import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { withUserTransaction } from './db.js';
import {
  CASE_ID,
  getCaseEvidence,
  getCaseDebrief,
  getPublicCase,
  listPublicCases,
  scoreCaseSubmission,
  validateCaseSubmission,
} from './caselab.js';
import {
  LIVE_DRILL_REVISION,
  getLiveDrillResponseGuide,
  scoreLiveDrillSubmission,
  validateLiveDrillSubmission,
} from './live-drill.js';

type AuthGate = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function registerCaseLabRoutes(
  app: FastifyInstance,
  db: Pool,
  contextSecret: string,
  requireAuth: AuthGate,
): Promise<void> {
  const authenticatedPreHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    // Authentication may already have sent an error response; prevent downstream route execution.
    if (reply.sent) return reply;
  };

  // Case metadata and synthetic evidence are public. No real tenant telemetry is served.
  app.get('/v1/cases', async () => ({ items: listPublicCases() }));

  app.get<{ Params: { caseId: string } }>('/v1/cases/:caseId', async (request, reply) => {
    const caseItem = getPublicCase(request.params.caseId);
    if (!caseItem) return reply.code(404).send({ error: 'case_not_found' });
    return { case: caseItem };
  });

  app.get<{ Params: { caseId: string } }>('/v1/cases/:caseId/evidence', async (request, reply) => {
    const evidence = getCaseEvidence(request.params.caseId);
    if (!evidence) return reply.code(404).send({ error: 'case_not_found' });
    return { evidence };
  });

  // The answer guide is available only after the current account has submitted this case.
  // It is deliberately excluded from the public case metadata/evidence endpoints.
  app.get<{ Params: { caseId: string } }>('/v1/cases/:caseId/debrief', {
    preHandler: authenticatedPreHandler,
  }, async (request, reply) => {
    const principal = request.principal;
    if (!principal) return reply.code(401).send({ error: 'authentication_required' });
    const debrief = getCaseDebrief(request.params.caseId);
    if (!debrief) return reply.code(404).send({ error: 'case_not_found' });
    const hasAttempt = await withUserTransaction(db, principal.sub, contextSecret, async (client) => {
      const result = await client.query(
        `SELECT 1 FROM case_submissions WHERE user_id = $1 AND case_id = $2 LIMIT 1`,
        [principal.sub, request.params.caseId],
      );
      return (result.rowCount ?? 0) > 0;
    });
    if (!hasAttempt) return reply.code(403).send({ error: 'case_attempt_required' });
    return { debrief };
  });

  // Dynamic source-linked drills are scored server-side and stored in the existing append-only,
  // row-level-secured case_submissions table. The public incident metadata never grants target access.
  app.post<{ Body: unknown }>('/v1/live-drills/submissions', {
    preHandler: authenticatedPreHandler,
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const principal = request.principal;
    if (!principal) return reply.code(401).send({ error: 'authentication_required' });
    const validation = validateLiveDrillSubmission(request.body);
    if (!validation.ok) return reply.code(400).send({ error: validation.error });

    const answer = validation.value;
    const caseId = `live-${answer.incidentId}`;
    const caseRevision = LIVE_DRILL_REVISION;
    const grade = scoreLiveDrillSubmission(answer);
    const submission = await withUserTransaction(db, principal.sub, contextSecret, async (client) => {
      await client.query(
        `INSERT INTO learner_profiles (user_id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET
           email = COALESCE(EXCLUDED.email, learner_profiles.email),
           display_name = COALESCE(EXCLUDED.display_name, learner_profiles.display_name),
           updated_at = NOW()`,
        [principal.sub, principal.email ?? null, principal.name ?? null],
      );
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [principal.sub, `${caseId}:${caseRevision}`]);
      const nextAttempt = await client.query(
        `SELECT COALESCE(MAX(attempt_no), 0) + 1 AS attempt_no
         FROM case_submissions WHERE user_id = $1 AND case_id = $2 AND case_revision = $3`,
        [principal.sub, caseId, caseRevision],
      );
      const attemptNo = Number(nextAttempt.rows[0]?.attempt_no ?? 1);
      const result = await client.query(
        `INSERT INTO case_submissions
          (user_id, case_id, case_revision, attempt_no, evidence_refs, hypothesis_id,
           response_actions, findings, validation_plan, score, rubric_feedback)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9, $10, $11::jsonb)
         RETURNING submission_id AS "submissionId", case_id AS "caseId",
                   case_revision AS "caseRevision", attempt_no AS "attemptNo",
                   evidence_refs AS "evidenceRefs", hypothesis_id AS "hypothesisId",
                   response_actions AS "responseActions", findings,
                   validation_plan AS "validationPlan", score,
                   rubric_feedback AS "rubricFeedback", submitted_at AS "submittedAt"`,
        [
          principal.sub, caseId, caseRevision, attemptNo,
          JSON.stringify(answer.evidenceRefs),
          `live-response-${answer.caseType}`,
          JSON.stringify([answer.actionId]), answer.findings, answer.validationPlan,
          grade.score, JSON.stringify(grade.rubricFeedback),
        ],
      );
      return result.rows[0];
    });
    return reply.code(201).send({
      submission,
      responseGuide: getLiveDrillResponseGuide(answer.caseType, answer.incidentId),
      scoringNotice: 'Formative server-side rubric; not a certification or independent human assessment.',
    });
  });

  app.get('/v1/me/cases', { preHandler: authenticatedPreHandler }, async (request, reply) => {
    const principal = request.principal;
    if (!principal) return reply.code(401).send({ error: 'authentication_required' });
    return withUserTransaction(db, principal.sub, contextSecret, async (client) => {
      const result = await client.query(
        `SELECT submission_id AS "submissionId", case_id AS "caseId",
                case_revision AS "caseRevision", attempt_no AS "attemptNo",
                evidence_refs AS "evidenceRefs", hypothesis_id AS "hypothesisId",
                response_actions AS "responseActions", findings,
                validation_plan AS "validationPlan", score,
                rubric_feedback AS "rubricFeedback", submitted_at AS "submittedAt"
         FROM case_submissions
         WHERE user_id = $1
         ORDER BY submitted_at DESC
         LIMIT 100`,
        [principal.sub],
      );
      return { submissions: result.rows };
    });
  });

  app.get<{ Params: { submissionId: string } }>('/v1/me/cases/:submissionId', {
    preHandler: authenticatedPreHandler,
  }, async (request, reply) => {
    const principal = request.principal;
    if (!principal) return reply.code(401).send({ error: 'authentication_required' });
    if (!UUID.test(request.params.submissionId)) return reply.code(400).send({ error: 'invalid_submission_id' });
    return withUserTransaction(db, principal.sub, contextSecret, async (client) => {
      const result = await client.query(
        `SELECT submission_id AS "submissionId", case_id AS "caseId",
                case_revision AS "caseRevision", attempt_no AS "attemptNo",
                evidence_refs AS "evidenceRefs", hypothesis_id AS "hypothesisId",
                response_actions AS "responseActions", findings,
                validation_plan AS "validationPlan", score,
                rubric_feedback AS "rubricFeedback", submitted_at AS "submittedAt"
         FROM case_submissions
         WHERE submission_id = $1 AND user_id = $2
         LIMIT 1`,
        [request.params.submissionId, principal.sub],
      );
      if (result.rowCount !== 1) return reply.code(404).send({ error: 'submission_not_found' });
      return { submission: result.rows[0] };
    });
  });

  app.post<{ Params: { caseId: string }; Body: unknown }>('/v1/cases/:caseId/submissions', {
    preHandler: authenticatedPreHandler,
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const principal = request.principal;
    if (!principal) return reply.code(401).send({ error: 'authentication_required' });
    if (request.params.caseId !== CASE_ID) return reply.code(404).send({ error: 'case_not_found' });
    const validation = validateCaseSubmission(request.body);
    if (!validation.ok) return reply.code(400).send({ error: validation.error });
    const answer = validation.value;
    const grade = scoreCaseSubmission(answer);

    const submission = await withUserTransaction(db, principal.sub, contextSecret, async (client) => {
      // The server derives identity solely from the verified OIDC subject. A supplied user_id is rejected by validation.
      await client.query(
        `INSERT INTO learner_profiles (user_id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET
           email = COALESCE(EXCLUDED.email, learner_profiles.email),
           display_name = COALESCE(EXCLUDED.display_name, learner_profiles.display_name),
           updated_at = NOW()`,
        [principal.sub, principal.email ?? null, principal.name ?? null],
      );
      // Serialize attempt-number allocation per user/case revision, then persist an immutable attempt.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [principal.sub, `${CASE_ID}:${answer.caseRevision}`]);
      const nextAttempt = await client.query(
        `SELECT COALESCE(MAX(attempt_no), 0) + 1 AS attempt_no
         FROM case_submissions WHERE user_id = $1 AND case_id = $2 AND case_revision = $3`,
        [principal.sub, CASE_ID, answer.caseRevision],
      );
      const attemptNo = Number(nextAttempt.rows[0]?.attempt_no ?? 1);
      const result = await client.query(
        `INSERT INTO case_submissions
          (user_id, case_id, case_revision, attempt_no, evidence_refs, hypothesis_id,
           response_actions, findings, validation_plan, score, rubric_feedback)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9, $10, $11::jsonb)
         RETURNING submission_id AS "submissionId", case_id AS "caseId",
                   case_revision AS "caseRevision", attempt_no AS "attemptNo",
                   evidence_refs AS "evidenceRefs", hypothesis_id AS "hypothesisId",
                   response_actions AS "responseActions", findings,
                   validation_plan AS "validationPlan", score,
                   rubric_feedback AS "rubricFeedback", submitted_at AS "submittedAt"`,
        [
          principal.sub,
          CASE_ID,
          answer.caseRevision,
          attemptNo,
          JSON.stringify(answer.evidenceRefs),
          answer.hypothesisId,
          JSON.stringify(answer.responseActions),
          answer.findings,
          answer.validationPlan,
          grade.score,
          JSON.stringify(grade.rubricFeedback),
        ],
      );
      return result.rows[0];
    });
    return reply.code(201).send({ submission });
  });
}
