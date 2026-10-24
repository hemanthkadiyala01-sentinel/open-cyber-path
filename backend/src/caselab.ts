export const CASE_ID = 'midnight-blizzard-identity-response';
export const CASE_REVISION = '1.0.0';

const CASE_DEFINITION = {
  id: CASE_ID,
  revision: CASE_REVISION,
  title: 'Identity response after unusual sign-in activity',
  subtitle: 'Correlate authentication, OAuth consent, and mailbox audit signals.',
  topic: 'Identity & cloud security',
  difficulty: 'Intermediate',
  estimatedMinutes: 20,
  curationStatus: 'draft-awaiting-human-review',
  sourceCheckedAt: '2026-10-24',
  context: 'Public reporting by Microsoft described a 2023–2024 intrusion involving password spraying against a legacy non-production test account, followed by access to some corporate email accounts. Microsoft later described malicious OAuth applications and application permissions in the continuing activity. CISA issued Emergency Directive 24-02 for U.S. federal civilian executive branch agencies and also recommended strong identity protections more broadly.',
  learningObjectives: [
    'Correlate repeated authentication failures with a later success without treating the pattern alone as proof of compromise.',
    'Trace the relationship between OAuth consent, application permissions, and mailbox-access telemetry.',
    'Prioritize containment while preserving audit evidence and checking whether sessions or tokens remain usable.',
    'Separate source-backed incident facts from synthetic training evidence and state uncertainty accurately.',
  ],
  safetyAndScope: 'Training only. The evidence below is synthetic and was created for this exercise. It is not telemetry from Microsoft, an affected organization, or a real tenant. Use the exercise to practise defensive triage only; do not test the techniques against real accounts or systems.',
  evidenceDisclaimer: 'SYNTHETIC TRAINING EVIDENCE — every account, event, application name, timestamp, and activity record below is fictional. Documentation-only IP ranges are used. These records do not reproduce victim telemetry from the public incident.',
  factsAndLimits: [
    'Microsoft reported password spraying against a legacy non-production test tenant account beginning in late November 2023 and detected the activity on its corporate systems in January 2024.',
    'Microsoft later described the use of malicious OAuth applications and application permissions during continued activity.',
    'CISA Emergency Directive 24-02 applied to U.S. federal civilian executive branch agencies; it is not a universal legal requirement for every organisation.',
    'The training events are fictional. They illustrate defensive correlation questions, not the actual timeline, indicators, or internal logs from the Microsoft incident.',
  ],
  sources: [
    {
      id: 'msrc-disclosure-2024-01-19',
      publisher: 'Microsoft Security Response Center',
      title: 'Microsoft Actions Following Attack by Nation State Actor Midnight Blizzard',
      publishedAt: '2024-01-19',
      url: 'https://www.microsoft.com/en-us/msrc/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/',
      sourceType: 'Primary incident disclosure',
      supports: 'Microsoft’s stated discovery date, the reported password-spray foothold, the legacy non-production test account, and the limited corporate-email access described at that time.',
    },
    {
      id: 'mti-responder-guidance-2024-01-25',
      publisher: 'Microsoft Threat Intelligence',
      title: 'Midnight Blizzard: Guidance for responders on nation-state attack',
      publishedAt: '2024-01-25',
      url: 'https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/',
      sourceType: 'Primary technical guidance',
      supports: 'Microsoft’s later description of legacy test OAuth application abuse, malicious OAuth apps, app permissions, and the limits of IP-only detection in that activity.',
    },
    {
      id: 'cisa-ed-24-02-2024-04-11',
      publisher: 'Cybersecurity and Infrastructure Security Agency (CISA)',
      title: 'Emergency Directive 24-02: Mitigating the Significant Risk from Nation-State Compromise of Microsoft Corporate Email System',
      publishedAt: '2024-04-11',
      url: 'https://www.cisa.gov/news-events/directives/ed-24-02-mitigating-significant-risk-nation-state-compromise-microsoft-corporate-email-system',
      sourceType: 'Government response directive',
      supports: 'The federal directive’s response focus: assess exposed email contents, reset affected credentials, and secure privileged cloud accounts; the directive’s stated scope is federal civilian executive branch agencies.',
    },
    {
      id: 'msrc-update-2024-03-08',
      publisher: 'Microsoft Security Response Center',
      title: 'Update on Microsoft Actions Following Attack by Nation State Actor Midnight Blizzard',
      publishedAt: '2024-03-08',
      url: 'https://www.microsoft.com/en-us/msrc/blog/2024/03/update-on-microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard',
      sourceType: 'Primary incident update',
      supports: 'Microsoft’s later update on continued activity, password-spray volume, and attempts to use information found in exfiltrated email.',
    },
  ],
  tasks: [
    'Select the synthetic events that support an authentication-anomaly hypothesis.',
    'Correlate application consent and permission events with the supplied mailbox-access signal.',
    'Choose a defensible working hypothesis. A hypothesis is not the same as a confirmed conclusion.',
    'Select containment and evidence-preservation steps, then describe how you would validate them.',
  ],
  hypothesisOptions: [
    { id: 'identity-compromise-suspected', label: 'Suspected identity compromise with possible OAuth application abuse; contain and validate before declaring scope.' },
    { id: 'legitimate-automation', label: 'Likely legitimate automation; verify the application owner, approved change, and expected activity before closing.' },
    { id: 'insufficient-evidence', label: 'Evidence is insufficient to choose a likely explanation; preserve the records and gather identity and application context.' },
  ],
  responseActions: [
    { id: 'disable-oauth-app', label: 'Restrict or disable the suspicious app/consent through the approved incident process after confirming ownership and impact.' },
    { id: 'revoke-sessions', label: 'Revoke affected sessions and refresh tokens; verify revocation rather than assuming the request ended access.' },
    { id: 'reset-credentials', label: 'Reset credentials for affected identities and check for password reuse or related accounts where policy requires.' },
    { id: 'preserve-audit-logs', label: 'Preserve sign-in, directory audit, consent, application, and mailbox logs with UTC timestamps and collection notes.' },
    { id: 'review-privileged-access', label: 'Review privileged role assignments, application permissions, and all affected identities for scope and persistence.' },
    { id: 'confirm-with-account-owner', label: 'Verify unexpected activity with the account/app owner using an independently trusted channel.' },
  ],
} as const;

export interface SyntheticEvidenceEvent {
  id: string;
  timestampUtc: string;
  sourceType: string;
  eventType: string;
  principal: string;
  source: string;
  result: string;
  detail: string;
  classification: 'synthetic';
}

const SYNTHETIC_EVIDENCE: SyntheticEvidenceEvent[] = [
  {
    id: 'evt-101', timestampUtc: '2026-02-04T08:12:03Z', sourceType: 'Identity sign-in log',
    eventType: 'sign-in.failure', principal: 'svc-legacy-test', source: '198.51.100.24', result: 'Failure',
    detail: 'Password authentication failed. Event 1 in a short sequence for the same synthetic account.', classification: 'synthetic',
  },
  {
    id: 'evt-102', timestampUtc: '2026-02-04T08:12:19Z', sourceType: 'Identity sign-in log',
    eventType: 'sign-in.failure', principal: 'svc-legacy-test', source: '198.51.100.24', result: 'Failure',
    detail: 'Another password failure for the same synthetic account and source. The supplied excerpt is not enough to attribute an actor.', classification: 'synthetic',
  },
  {
    id: 'evt-103', timestampUtc: '2026-02-04T08:13:07Z', sourceType: 'Identity sign-in log',
    eventType: 'sign-in.success', principal: 'svc-legacy-test', source: '198.51.100.24', result: 'Success; MFA result not recorded in this excerpt',
    detail: 'A success follows the failures. Verify the authentication method, device/context, MFA record, session, and account owner; the sequence alone does not prove compromise.', classification: 'synthetic',
  },
  {
    id: 'evt-104', timestampUtc: '2026-02-04T08:14:24Z', sourceType: 'Directory audit log',
    eventType: 'oauth.consent-granted', principal: 'svc-legacy-test', source: 'Synthetic tenant audit', result: 'Consent granted',
    detail: 'The account granted consent to an unfamiliar fictional application named “Calendar Bridge QA”. Confirm whether the app and permissions were approved.', classification: 'synthetic',
  },
  {
    id: 'evt-105', timestampUtc: '2026-02-04T08:15:09Z', sourceType: 'Directory audit log',
    eventType: 'application.permission-added', principal: 'Calendar Bridge QA', source: 'Synthetic tenant audit', result: 'Application permission added',
    detail: 'The fictional app was assigned a mailbox-related application permission. The excerpt does not show who approved it or whether it was expected.', classification: 'synthetic',
  },
  {
    id: 'evt-106', timestampUtc: '2026-02-04T08:18:51Z', sourceType: 'Mailbox audit log',
    eventType: 'mailbox.read-activity', principal: 'Calendar Bridge QA', source: 'Synthetic tenant audit', result: '45 read operations across 3 fictional mailboxes',
    detail: 'Mailbox access is recorded after the permission change. Validate the affected identities, operation details, and scope before drawing conclusions.', classification: 'synthetic',
  },
  {
    id: 'evt-107', timestampUtc: '2026-02-04T08:20:10Z', sourceType: 'Response tracking record',
    eventType: 'session-revocation.status', principal: 'svc-legacy-test', source: 'Synthetic response tracker', result: 'Not confirmed',
    detail: 'The supplied response tracker has no confirmation that affected sessions or tokens were invalidated. Treat this as an open validation item, not proof of continued access.', classification: 'synthetic',
  },
];

export function listPublicCases() {
  return [{
    id: CASE_ID,
    revision: CASE_REVISION,
    title: CASE_DEFINITION.title,
    topic: CASE_DEFINITION.topic,
    difficulty: CASE_DEFINITION.difficulty,
    estimatedMinutes: CASE_DEFINITION.estimatedMinutes,
    curationStatus: CASE_DEFINITION.curationStatus,
    summary: 'Investigate a synthetic authentication anomaly and correlate OAuth application activity with mailbox audit events.',
  }];
}

export function getPublicCase(caseId: unknown) {
  if (caseId !== CASE_ID) return null;
  return CASE_DEFINITION;
}

export function getCaseEvidence(caseId: unknown) {
  if (caseId !== CASE_ID) return null;
  return {
    caseId: CASE_ID,
    revision: CASE_REVISION,
    classification: 'synthetic-training-fixture',
    disclaimer: CASE_DEFINITION.evidenceDisclaimer,
    events: SYNTHETIC_EVIDENCE,
  };
}

export interface CaseSubmissionInput {
  caseRevision: string;
  evidenceRefs: string[];
  hypothesisId: string;
  responseActions: string[];
  findings: string;
  validationPlan: string;
}

const VALID_EVIDENCE_IDS = new Set(SYNTHETIC_EVIDENCE.map((event) => event.id));
const VALID_HYPOTHESES = new Set<string>(CASE_DEFINITION.hypothesisOptions.map((item) => item.id));
const VALID_ACTIONS = new Set<string>(CASE_DEFINITION.responseActions.map((item) => item.id));

export function validateCaseSubmission(value: unknown):
  | { ok: true; value: CaseSubmissionInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'body_must_be_object' };
  const input = value as Record<string, unknown>;
  const allowed = ['caseRevision', 'evidenceRefs', 'hypothesisId', 'responseActions', 'findings', 'validationPlan'];
  if (Object.keys(input).some((key) => !allowed.includes(key))) return { ok: false, error: 'unexpected_property' };
  if (input.caseRevision !== CASE_REVISION) return { ok: false, error: 'unsupported_case_revision' };
  if (!Array.isArray(input.evidenceRefs) || input.evidenceRefs.length > SYNTHETIC_EVIDENCE.length) {
    return { ok: false, error: 'invalid_evidence_refs' };
  }
  const evidenceRefs: string[] = [];
  for (const id of input.evidenceRefs) {
    if (typeof id !== 'string' || !VALID_EVIDENCE_IDS.has(id) || evidenceRefs.includes(id)) {
      return { ok: false, error: 'invalid_or_duplicate_evidence_ref' };
    }
    evidenceRefs.push(id);
  }
  if (typeof input.hypothesisId !== 'string' || !VALID_HYPOTHESES.has(input.hypothesisId)) {
    return { ok: false, error: 'invalid_hypothesis' };
  }
  if (!Array.isArray(input.responseActions) || input.responseActions.length > CASE_DEFINITION.responseActions.length) {
    return { ok: false, error: 'invalid_response_actions' };
  }
  const responseActions: string[] = [];
  for (const action of input.responseActions) {
    if (typeof action !== 'string' || !VALID_ACTIONS.has(action) || responseActions.includes(action)) {
      return { ok: false, error: 'invalid_or_duplicate_response_action' };
    }
    responseActions.push(action);
  }
  if (typeof input.findings !== 'string' || input.findings.trim().length < 40 || input.findings.length > 4000) return { ok: false, error: 'invalid_findings' };
  if (typeof input.validationPlan !== 'string' || input.validationPlan.trim().length < 10 || input.validationPlan.length > 2000) {
    return { ok: false, error: 'invalid_validation_plan' };
  }
  return {
    ok: true,
    value: {
      caseRevision: CASE_REVISION,
      evidenceRefs,
      hypothesisId: input.hypothesisId,
      responseActions,
      findings: input.findings.trim(),
      validationPlan: input.validationPlan.trim(),
    },
  };
}

export interface RubricCriterion {
  criterion: string;
  pointsAwarded: number;
  pointsPossible: number;
  feedback: string;
}

export function scoreCaseSubmission(input: CaseSubmissionInput): { score: number; rubricFeedback: RubricCriterion[] } {
  const refs = new Set(input.evidenceRefs);
  const authSignalCount = ['evt-101', 'evt-102', 'evt-103'].filter((id) => refs.has(id)).length;
  const authPoints = authSignalCount === 3 ? 25 : authSignalCount >= 2 ? 15 : 0;
  const appSignalCount = ['evt-104', 'evt-105', 'evt-106'].filter((id) => refs.has(id)).length;
  const appPoints = appSignalCount === 3 ? 25 : (refs.has('evt-104') && refs.has('evt-105')) ? 20 : appSignalCount === 2 ? 10 : 0;
  const findingsText = input.findings.trim().toLowerCase();
  const findingsReferenceEvidence = ['evt-', 'event', 'sign-in', 'signin', 'consent', 'permission', 'mailbox', 'audit']
    .some((term) => findingsText.includes(term));
  const findingsAcknowledgeUncertainty = [
    'does not prove', 'not prove', 'unknown', 'uncertain', 'insufficient',
    'not confirmed', 'cannot conclude', 'not enough evidence', 'verify', 'validate',
  ].some((term) => findingsText.includes(term));
  const hypothesisPoints = input.findings.trim().length >= 80 && findingsReferenceEvidence && findingsAcknowledgeUncertainty
    ? 15
    : input.findings.trim().length >= 40 && findingsReferenceEvidence ? 8 : 0;
  const criticalActions = ['disable-oauth-app', 'revoke-sessions', 'reset-credentials', 'preserve-audit-logs', 'review-privileged-access'];
  const matchedCriticalActions = criticalActions.filter((id) => input.responseActions.includes(id)).length;
  const actionPoints = matchedCriticalActions * 4;
  const planText = input.validationPlan.toLowerCase();
  const validationTopics = ['audit', 'token', 'session', 'sign-in', 'signin', 'consent', 'permission', 'mailbox', 'log', 'verify'];
  const matchedTopics = new Set(validationTopics.filter((topic) => planText.includes(topic)));
  const validationPoints = input.validationPlan.trim().length >= 80 && matchedTopics.size >= 2 ? 15 : matchedTopics.size >= 1 ? 8 : 0;
  const rubricFeedback: RubricCriterion[] = [
    {
      criterion: 'Authentication evidence correlation', pointsAwarded: authPoints, pointsPossible: 25,
      feedback: authPoints === 25
        ? 'You selected the supplied failures and following success. Keep the conclusion qualified until account, device, MFA, and session context are checked.'
        : authPoints === 15
          ? 'Part of the failure-to-success sequence is selected. Include the relevant failures and the later success to support the timeline.'
          : 'Select the relevant failed sign-ins and the later success; a success after failures is a signal to investigate, not proof by itself.',
    },
    {
      criterion: 'OAuth and mailbox evidence correlation', pointsAwarded: appPoints, pointsPossible: 25,
      feedback: appPoints === 25
        ? 'You connected consent, application permissions, and mailbox activity. Verify the owner, approval record, affected identities, and actual permission scope.'
        : 'Look for a linked sequence: consent granted, application permission changed, then mailbox activity. Do not infer scope from a single event.',
    },
    {
      criterion: 'Working hypothesis and uncertainty', pointsAwarded: hypothesisPoints, pointsPossible: 15,
      feedback: hypothesisPoints === 15
        ? 'Your findings cite relevant evidence and explicitly acknowledge uncertainty. Keep the chosen hypothesis provisional until identity, app ownership, permissions, and mailbox scope are validated.'
        : hypothesisPoints === 8
          ? 'Your findings mention a relevant evidence area, but add a concrete event relationship and state what remains unknown or unproven.'
          : 'Explain how the supplied events support your hypothesis and distinguish observations from assumptions. A hypothesis does not prove attribution or impact.',
    },
    {
      criterion: 'Containment and evidence preservation', pointsAwarded: actionPoints, pointsPossible: 20,
      feedback: `${matchedCriticalActions} of 5 core response steps selected. Consider application restriction, session/token revocation, credential reset, audit preservation, and privileged-access review; confirm impact and approvals as you act.`,
    },
    {
      criterion: 'Validation plan', pointsAwarded: validationPoints, pointsPossible: 15,
      feedback: validationPoints === 15
        ? 'The plan is sufficiently detailed and names multiple verification topics. State the exact logs or control checks, the expected post-remediation result, and who confirms closure.'
        : validationPoints === 8
          ? 'Your plan names a relevant verification topic, but it needs more detail and a second check. Specify which audit/sign-in/token/permission records will validate the action.'
          : 'Describe concrete post-response checks. Name the audit/sign-in/consent/token records to inspect and how you will verify that access is no longer active.',
    },
  ];
  return { score: rubricFeedback.reduce((total, item) => total + item.pointsAwarded, 0), rubricFeedback };
}
