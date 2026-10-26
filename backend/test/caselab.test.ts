import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CASE_ID,
  CASE_REVISION,
  getCaseDebrief,
  getCaseEvidence,
  getPublicCase,
  listPublicCases,
  scoreCaseSubmission,
  validateCaseSubmission,
} from '../src/caselab.js';

const completeInput = {
  caseRevision: CASE_REVISION,
  evidenceRefs: [
    'evt-101', 'evt-102', 'evt-103', 'evt-104', 'evt-105', 'evt-106', 'evt-107',
    'evt-108', 'evt-109', 'evt-110', 'evt-111', 'evt-112', 'evt-113', 'evt-114',
    'evt-115', 'evt-116', 'evt-117', 'evt-118', 'evt-119', 'evt-120',
  ],
  hypothesisId: 'identity-compromise-suspected',
  responseActions: ['disable-oauth-app', 'revoke-sessions', 'reset-credentials', 'preserve-audit-logs', 'review-privileged-access'],
  findings: 'The timeline in evt-101, evt-102, evt-103 and evt-104 shows failures followed by a successful sign-in with missing device and MFA context. Events evt-105, evt-106, evt-107, evt-110 and evt-111 form a possible consent-to-mailbox chain. This does not prove actor attribution or confirmed exfiltration. A legitimate automation or approved change is an alternative, but owner confirmation in evt-112 and the different known-good principal in evt-113 weaken that explanation. Validate against authoritative records.',
  validationPlan: 'Preserve and verify identity audit logs, app consent and permission records, credential history, mailbox logs, session/token revocation completion and owner confirmation. After the approved response, verify the app is disabled, permissions and credentials are removed, no further mailbox reads occur in a defined monitoring window, and the incident owner records closure.',
};

test('publishes one deep candidate investigation with source links and explicit synthetic telemetry scope', () => {
  assert.equal(listPublicCases().length, 1);
  const item = getPublicCase(CASE_ID);
  assert.ok(item);
  assert.equal(item.revision, CASE_REVISION);
  assert.equal(item.curationStatus, 'draft-awaiting-human-review');
  assert.ok(item.sources.length >= 10, 'the incident dossier should include a substantial set of original and supporting sources');
  assert.ok(item.sources.every((source) => source.url.startsWith('https://')));
  assert.ok(item.sources.every((source) => typeof source.sourceGroup === 'string' && source.sourceGroup.length > 0));
  assert.ok(item.sources.some((source) => source.sourceType.includes('Official investigation playbook')));
  assert.ok(item.sources.some((source) => source.sourceType.includes('Independent detection analysis')));
  assert.ok(item.tasks.length >= 6);
  assert.ok(item.hints.length >= 3);
  assert.equal(Object.hasOwn(item, 'debrief'), false);
  const evidence = getCaseEvidence(CASE_ID);
  assert.ok(evidence);
  assert.match(evidence.disclaimer, /SYNTHETIC TRAINING EVIDENCE/);
  assert.ok(evidence.events.length >= 18);
  assert.ok(evidence.events.every((event) => event.classification === 'synthetic'));
  assert.equal(getPublicCase('../wrong-case'), null);
  assert.equal(getCaseEvidence('../wrong-case'), null);
});

test('keeps the after-action answer guide separate from public case metadata', () => {
  assert.equal(getCaseDebrief('../wrong-case'), null);
  const guide = getCaseDebrief(CASE_ID);
  assert.ok(guide);
  assert.ok(guide.evidenceChains.length >= 3);
  assert.ok(guide.responseSequence.length >= 4);
  assert.ok(guide.closureChecks.length >= 4);
  assert.ok(guide.commonPitfalls.length >= 4);
});

test('validates submission shape, revision, identifiers, and rejects client-provided identity', () => {
  assert.equal(validateCaseSubmission(completeInput).ok, true);
  assert.equal(validateCaseSubmission({ ...completeInput, user_id: 'another-user' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, caseRevision: 'future-version' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, evidenceRefs: ['evt-101', 'evt-101'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, evidenceRefs: ['../other-user'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, responseActions: ['delete-evidence'] }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, validationPlan: 'too short' }).ok, false);
  assert.equal(validateCaseSubmission({ ...completeInput, findings: 'Not enough.' }).ok, false);
  assert.equal(validateCaseSubmission([]).ok, false);
});

test('evidence-relationship rubric is bounded to 100 and returns criterion-level feedback', () => {
  const validation = validateCaseSubmission(completeInput);
  assert.equal(validation.ok, true);
  if (!validation.ok) return;
  const grade = scoreCaseSubmission(validation.value);
  assert.equal(grade.score, 100);
  assert.equal(grade.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsAwarded, 0), 100);
  assert.equal(grade.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsPossible, 0), 100);
  assert.equal(grade.rubricFeedback.length, 5);
  const partial = scoreCaseSubmission({
    ...validation.value,
    evidenceRefs: ['evt-101'],
    responseActions: [],
    hypothesisId: 'insufficient-evidence',
    findings: 'evt-101 indicates one failure. More evidence is needed.',
    validationPlan: 'Review audit logs.',
  });
  assert.ok(partial.score < grade.score);
  assert.ok(partial.rubricFeedback.every((criterion) => criterion.pointsAwarded <= criterion.pointsPossible));
});
