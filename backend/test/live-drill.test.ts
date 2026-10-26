import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_DRILL_REVISION,
  getLiveDrillResponseGuide,
  scoreLiveDrillSubmission,
  validateLiveDrillSubmission,
} from '../src/live-drill.js';

const validInput = {
  incidentId: 'certin-ciad-2026-0053',
  caseType: 'dependency-compromise',
  evidenceRefs: ['pkg-01', 'build-02', 'net-03', 'secret-04', 'release-05'],
  actionId: 'hold-preserve-scope',
  findings: 'The fictional package resolution and build log should be correlated with the egress event and artifact digest. This supports further scoping but does not prove secrets were exfiltrated.',
  validationPlan: 'Verify the lockfile, rebuild from trusted inputs, compare the artifact digest, review CI audit logs, and rotate exposed tokens only if the scope supports it.',
};

test('validates a live drill submission and exposes a stable drill revision', () => {
  assert.equal(LIVE_DRILL_REVISION, '1.1.0');
  assert.equal(validateLiveDrillSubmission(validInput).ok, true);
  assert.equal(validateLiveDrillSubmission({ ...validInput, user_id: 'other-user' }).ok, false);
  assert.equal(validateLiveDrillSubmission({ ...validInput, incidentId: '../other' }).ok, false);
  assert.equal(validateLiveDrillSubmission({ ...validInput, caseType: 'unknown' }).ok, false);
  assert.equal(validateLiveDrillSubmission({ ...validInput, caseType: 'vulnerability' }).ok, false, 'known incident IDs must use their mapped drill family');
  assert.equal(getLiveDrillResponseGuide('dependency-compromise', 'certin-ciad-2026-0053').join(' ').toLowerCase().includes('image tags'), true);
  assert.equal(getLiveDrillResponseGuide('vulnerability', 'cisa-cve-2026-76504').join(' ').toLowerCase().includes('admin-tech'), true);
  assert.equal(validateLiveDrillSubmission({ ...validInput, evidenceRefs: ['not-an-event'] }).ok, false);
  assert.equal(validateLiveDrillSubmission({ ...validInput, actionId: 'run-live-exploit' }).ok, false);
  assert.equal(validateLiveDrillSubmission({ ...validInput, findings: 'too short' }).ok, false);
});

test('server-side assessment is bounded to 100 and returns criterion feedback', () => {
  const checked = validateLiveDrillSubmission(validInput);
  assert.equal(checked.ok, true);
  if (!checked.ok) return;
  const result = scoreLiveDrillSubmission(checked.value);
  assert.equal(result.score, 100);
  assert.equal(result.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsAwarded, 0), 100);
  assert.equal(result.rubricFeedback.reduce((sum, criterion) => sum + criterion.pointsPossible, 0), 100);
  assert.equal(result.rubricFeedback.length, 4);
});

test('response guide does not produce an offensive action for unknown case types', () => {
  const guide = getLiveDrillResponseGuide('not-a-real-type');
  assert.ok(guide.length > 0);
  assert.match(guide.join(' '), /Verify the source|preserve records/i);
});


test('known live incidents return incident-specific defensive guidance', () => {
  const litellm = getLiveDrillResponseGuide('dependency-compromise', 'certin-ciad-2026-0053').join(' ');
  const php = getLiveDrillResponseGuide('vulnerability', 'bc-php2shell-exploitation-reported-before-patches').join(' ');
  const emudhra = getLiveDrillResponseGuide('certificate-compromise', 'certin-ciad-2026-0050').join(' ');
  const pwc = getLiveDrillResponseGuide('third-party-breach', 'reuters-pwc-third-party-incident-2026-10-23').join(' ');
  const cisco = getLiveDrillResponseGuide('vulnerability', 'cisa-cve-2026-76504').join(' ');
  assert.match(litellm, /package|image|build/i);
  assert.match(php, /PHP|version|patch/i);
  assert.match(emudhra, /certificate|trust/i);
  assert.match(pwc, /vendor|claim|scope/i);
  assert.match(cisco, /admin-tech|Cisco|manager/i);
});
