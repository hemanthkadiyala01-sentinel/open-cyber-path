import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CASE_ID,
  CASE_REVISION,
  getCaseEvidence,
  getPublicCase,
  listPublicCases,
  scoreCaseSubmission,
  validateCaseSubmission,
} from '../src/caselab.js';

const completeInput = {
  caseRevision: CASE_REVISION,
  evidenceRefs: ['evt-101', 'evt-102', 'evt-103', 'evt-104', 'evt-105', 'evt-106'],
  hypothesisId: 'identity-compromise-suspected',
  responseActions: ['disable-oauth-app', 'revoke-sessions', 'reset-credentials', 'preserve-audit-logs', 'review-privileged-access'],
  findings: 'Failures precede a successful sign-in, followed by an unfamiliar OAuth consent, application permission change, and mailbox reads. This suggests possible identity and app abuse but does not prove attribution.',
  validationPlan: 'Review sign-in and directory audit logs, verify app consent and mailbox permission scope, revoke active sessions and tokens, then confirm no later mailbox access appears in the audit log.',
};

test('publishes one candidate case with primary source references and an explicit synthetic evidence disclaimer', () => {
  assert.equal(listPublicCases().length, 1);
  const item = getPublicCase(CASE_ID);
  assert.ok(item);
  assert.equal(item.curationStatus, 'draft-awaiting-human-review');
  assert.ok(item.sources.length >= 2);
  assert.ok(item.sources.every((source) => source.url.startsWith('https://')));
  const evidence = getCaseEvidence(CASE_ID);
  assert.ok(evidence);
  assert.match(evidence.disclaimer, /SYNTHETIC TRAINING EVIDENCE/);
  assert.ok(evidence.events.every((event) => event.classification === 'synthetic'));
  assert.equal(getPublicCase('../wrong-case'), null);
});

test('validates submission shapes, identifiers, and rejects client-provided identity', () => {
  const valid = validateCaseSubmission(completeInput);
  assert.equal(valid.ok, true);
  assert.equal(validateCaseSubmission({ ...completeInput, user_id: 'another-user' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, caseRevision: 'future-version' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, evidenceRefs: ['evt-101', 'evt-101'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, evidenceRefs: ['../other-user'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, responseActions: ['delete-evidence'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, validationPlan: 'too short' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, findings: 'Not enough.' }).ok, false);
  assert.equal(validateCaseSubmission([]).ok, false);
});

test('deterministic rubric is bounded to 100 and provides per-criterion feedback', () => {
  const validation = validateCaseSubmission(completeInput);
  assert.equal(validation.ok, true);
  if (!validation.ok) return;
  const grade = scoreCaseSubmission(validation.value);
  assert.equal(grade.score, 100);
  assert.equal(grade.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsAwarded, 0), 100);
  assert.equal(grade.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsPossible, 0), 100);
  assert.equal(grade.rubricFeedback.length, 5);
  const partial = scoreCaseSubmission({ ...validation.value, evidenceRefs: [], responseActions: [], hypothesisId: 'insufficient-evidence', validationPlan: 'Review audit logs.' });
  assert.ok(partial.score < grade.score);
  assert.ok(partial.rubricFeedback.every((criterion) => criterion.pointsAwarded <= criterion.pointsPossible));
});
