import 'dotenv/config';
import pg from 'pg';
import { createHmac, randomUUID } from 'node:crypto';

const databaseUrl = process.env.DATABASE_URL;
const contextSecret = process.env.DATABASE_CONTEXT_HMAC_SECRET;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

if (!databaseUrl || !contextSecret) {
  throw new Error('Required backend environment settings are missing; no values were printed.');
}

let parsedUrl: URL;
try {
  parsedUrl = new URL(databaseUrl);
} catch {
  throw new Error('DATABASE_URL is not a valid URL; no value was printed.');
}

const databaseUser = decodeURIComponent(parsedUrl.username);
const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

if (databaseUser !== 'opencyberpath_runtime') {
  throw new Error('Safety stop: DATABASE_URL must use opencyberpath_runtime. No database changes were made.');
}
if (databaseName !== 'opencyberpath' || !localHosts.has(parsedUrl.hostname)) {
  throw new Error('Safety stop: this integration test only runs against the configured local opencyberpath database.');
}
if (!/^[a-f0-9]{64,}$/i.test(contextSecret) || contextSecret.length % 2 !== 0) {
  throw new Error('DATABASE_CONTEXT_HMAC_SECRET is not in the expected hex format. No secret was printed.');
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});

let client: pg.PoolClient | undefined;
let transactionStarted = false;

type Counts = { profiles: number; progress_rows: number; notes: number; evidence_rows: number; case_submissions: number };

async function setIdentity(userId: string): Promise<void> {
  const signature = createHmac('sha256', contextSecret!).update(userId, 'utf8').digest('hex');
  await client!.query(
    `SELECT set_config('app.current_user_id', $1, true),
            set_config('app.current_user_signature', $2, true)`,
    [userId, signature],
  );
  const result = await client!.query('SELECT public.ocp_current_user_id() = $1 AS matches', [userId]);
  assert(result.rows[0]?.matches === true,
    'Signed identity was rejected; verify the backend and database signing-secret configuration.');
}

async function countsFor(userId: string): Promise<Counts> {
  const result = await client!.query(
    `SELECT
       (SELECT count(*)::int FROM learner_profiles WHERE user_id = $1) AS profiles,
       (SELECT count(*)::int FROM learning_progress WHERE user_id = $1) AS progress_rows,
       (SELECT count(*)::int FROM learner_notes WHERE user_id = $1) AS notes,
       (SELECT count(*)::int FROM evidence_records WHERE user_id = $1) AS evidence_rows,
       (SELECT count(*)::int FROM case_submissions WHERE user_id = $1) AS case_submissions`,
    [userId],
  );
  return result.rows[0] as Counts;
}

async function assertCounts(userId: string, expected: number, label: string): Promise<void> {
  const counts = await countsFor(userId);
  for (const [name, value] of Object.entries(counts)) {
    assert(value === expected, `${label}: expected ${name}=${expected}, received ${value}`);
  }
}

async function assertCrossAccountInsertRejected(sql: string, values: unknown[], label: string): Promise<void> {
  await client!.query('SAVEPOINT cross_account_insert');
  let rejected = false;
  let failure: unknown;
  try {
    await client!.query(sql, values);
  } catch (error) {
    failure = error;
    rejected = (error as { code?: string })?.code === '42501';
  } finally {
    await client!.query('ROLLBACK TO SAVEPOINT cross_account_insert');
    await client!.query('RELEASE SAVEPOINT cross_account_insert');
  }
  assert(rejected, `${label}: RLS did not reject the insert as expected${failure ? ` (code ${(failure as { code?: string }).code ?? 'unknown'})` : ''}.`);
}

async function assertRuntimeMutationDenied(sql: string, values: unknown[], label: string): Promise<void> {
  await client!.query('SAVEPOINT runtime_mutation_check');
  let denied = false;
  let failure: unknown;
  try {
    await client!.query(sql, values);
  } catch (error) {
    failure = error;
    denied = (error as { code?: string })?.code === '42501';
  } finally {
    await client!.query('ROLLBACK TO SAVEPOINT runtime_mutation_check');
    await client!.query('RELEASE SAVEPOINT runtime_mutation_check');
  }
  assert(denied, `${label}: runtime role was expected to be denied by grants${failure ? ` (code ${(failure as { code?: string }).code ?? 'unknown'})` : ''}.`);
}

async function run(): Promise<void> {
  client = await pool.connect();
  await client.query('BEGIN');
  transactionStarted = true;
  await client.query("SET LOCAL statement_timeout = '5s'");

  const runId = randomUUID();
  const userA = `ocp-rls-test-a-${runId}`;
  const userB = `ocp-rls-test-b-${runId}`;
  const itemA = `rls-probe-${runId}-a`;
  const itemB = `rls-probe-${runId}-b`;

  await setIdentity(userA);
  await client.query('INSERT INTO learner_profiles (user_id, display_name) VALUES ($1, $2)', [userA, 'Temporary RLS test A']);
  await client.query(
    `INSERT INTO learning_progress (user_id, item_id, status, percent, metadata)
     VALUES ($1, $2, 'in_progress', 10, '{}'::jsonb)`, [userA, itemA],
  );
  const noteA = await client.query(
    'INSERT INTO learner_notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING note_id',
    [userA, 'Temporary RLS test A', 'Rollback-only test record'],
  );
  const evidenceA = await client.query(
    `INSERT INTO evidence_records (user_id, evidence_type, title, summary, metadata)
     VALUES ($1, 'security-test', $2, $3, '{}'::jsonb) RETURNING evidence_id`,
    [userA, 'Temporary RLS test A', 'Rollback-only test record'],
  );

  await client.query(
    `INSERT INTO case_submissions
      (user_id, case_id, case_revision, attempt_no, evidence_refs, hypothesis_id, response_actions, findings, validation_plan, score, rubric_feedback)
     VALUES ($1, $2, '1.0.0', 1, '[]'::jsonb, 'identity-compromise-suspected', '[]'::jsonb, 'RLS test record', 'Review audit logs and verify token/session revocation.', 10, '[]'::jsonb)
     RETURNING submission_id`,
    [userA, `rls-case-${runId}-a`],
  );

  await setIdentity(userB);
  await client.query('INSERT INTO learner_profiles (user_id, display_name) VALUES ($1, $2)', [userB, 'Temporary RLS test B']);
  await client.query(
    `INSERT INTO learning_progress (user_id, item_id, status, percent, metadata)
     VALUES ($1, $2, 'in_progress', 10, '{}'::jsonb)`, [userB, itemB],
  );
  const noteB = await client.query(
    'INSERT INTO learner_notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING note_id',
    [userB, 'Temporary RLS test B', 'Rollback-only test record'],
  );
  const evidenceB = await client.query(
    `INSERT INTO evidence_records (user_id, evidence_type, title, summary, metadata)
     VALUES ($1, 'security-test', $2, $3, '{}'::jsonb) RETURNING evidence_id`,
    [userB, 'Temporary RLS test B', 'Rollback-only test record'],
  );
  const caseSubmissionB = await client.query(
    `INSERT INTO case_submissions
      (user_id, case_id, case_revision, attempt_no, evidence_refs, hypothesis_id, response_actions, findings, validation_plan, score, rubric_feedback)
     VALUES ($1, $2, '1.0.0', 1, '[]'::jsonb, 'identity-compromise-suspected', '[]'::jsonb, 'RLS test record', 'Review audit logs and verify token/session revocation.', 10, '[]'::jsonb)
     RETURNING submission_id`,
    [userB, `rls-case-${runId}-b`],
  );
  console.log('PASS: both signed identities accepted and temporary rows created in the test transaction.');

  await assertCounts(userB, 1, 'Account B must see its own records');
  await assertCounts(userA, 0, 'Account B must not read Account A records');
  console.log('PASS: Account B can read its own rows but cannot read Account A rows in all five tables, including CaseLab submissions.');

  const updateCases: Array<{ label: string; sql: string; values: unknown[] }> = [
    { label: 'learner profile', sql: "UPDATE learner_profiles SET display_name = 'unauthorized' WHERE user_id = $1", values: [userA] },
    { label: 'learning progress', sql: 'UPDATE learning_progress SET percent = 20 WHERE user_id = $1 AND item_id = $2', values: [userA, itemA] },
    { label: 'learner note', sql: "UPDATE learner_notes SET title = 'unauthorized' WHERE note_id = $1", values: [noteA.rows[0].note_id] },
    { label: 'evidence record', sql: "UPDATE evidence_records SET title = 'unauthorized' WHERE evidence_id = $1", values: [evidenceA.rows[0].evidence_id] },
  ];
  for (const entry of updateCases) {
    const result = await client.query(entry.sql, entry.values);
    assert(result.rowCount === 0, `Account B unexpectedly updated Account A ${entry.label}.`);
  }
  console.log('PASS: Account B cannot update Account A rows in all four tables.');

  await assertRuntimeMutationDenied(
    "UPDATE case_submissions SET findings = 'must remain immutable' WHERE submission_id = $1",
    [caseSubmissionB.rows[0].submission_id], 'CaseLab submission UPDATE',
  );
  await assertRuntimeMutationDenied(
    'DELETE FROM case_submissions WHERE submission_id = $1',
    [caseSubmissionB.rows[0].submission_id], 'CaseLab submission DELETE',
  );
  console.log('PASS: the runtime database role cannot update or delete its own CaseLab submission; attempts remain append-only.');

  const deleteCases: Array<{ label: string; sql: string; values: unknown[] }> = [
    { label: 'learner profile', sql: 'DELETE FROM learner_profiles WHERE user_id = $1', values: [userA] },
    { label: 'learning progress', sql: 'DELETE FROM learning_progress WHERE user_id = $1 AND item_id = $2', values: [userA, itemA] },
    { label: 'learner note', sql: 'DELETE FROM learner_notes WHERE note_id = $1', values: [noteA.rows[0].note_id] },
    { label: 'evidence record', sql: 'DELETE FROM evidence_records WHERE evidence_id = $1', values: [evidenceA.rows[0].evidence_id] },
  ];
  for (const entry of deleteCases) {
    const result = await client.query(entry.sql, entry.values);
    assert(result.rowCount === 0, `Account B unexpectedly deleted Account A ${entry.label}.`);
  }
  console.log('PASS: Account B cannot delete Account A rows in all four tables.');

  await assertCrossAccountInsertRejected(
    'INSERT INTO learner_profiles (user_id, display_name) VALUES ($1, $2)',
    [userA, 'Unauthorized profile'], 'cross-account profile insert',
  );
  await assertCrossAccountInsertRejected(
    `INSERT INTO learning_progress (user_id, item_id, status, percent, metadata)
     VALUES ($1, $2, 'in_progress', 10, '{}'::jsonb)`,
    [userA, `cross-${runId}`], 'cross-account progress insert',
  );
  await assertCrossAccountInsertRejected(
    'INSERT INTO learner_notes (user_id, title, content) VALUES ($1, $2, $3)',
    [userA, 'Unauthorized note', 'Must be rejected'], 'cross-account note insert',
  );
  await assertCrossAccountInsertRejected(
    `INSERT INTO evidence_records (user_id, evidence_type, title, summary, metadata)
     VALUES ($1, 'security-test', $2, $3, '{}'::jsonb)`,
    [userA, 'Unauthorized evidence', 'Must be rejected'], 'cross-account evidence insert',
  );
  await assertCrossAccountInsertRejected(
    `INSERT INTO case_submissions
      (user_id, case_id, case_revision, attempt_no, evidence_refs, hypothesis_id, response_actions, findings, validation_plan, score, rubric_feedback)
     VALUES ($1, $2, '1.0.0', 1, '[]'::jsonb, 'identity-compromise-suspected', '[]'::jsonb, 'cross-account test', 'Review audit logs and verify token/session revocation.', 10, '[]'::jsonb)`,
    [userA, `cross-case-${runId}`], 'cross-account CaseLab insert',
  );
  console.log('PASS: RLS WITH CHECK rejects cross-account inserts into the protected learner tables, including CaseLab submissions.');

  await setIdentity(userA);
  await assertCounts(userA, 1, 'Account A must see its own records');
  await assertCounts(userB, 0, 'Account A must not read Account B records');
  console.log('PASS: Account A can read its own rows but cannot read Account B rows in all five tables, including CaseLab submissions.');

  const updateB = await client.query("UPDATE learner_notes SET title = 'unauthorized' WHERE note_id = $1", [noteB.rows[0].note_id]);
  assert(updateB.rowCount === 0, 'Account A unexpectedly updated Account B note.');
  const deleteB = await client.query('DELETE FROM evidence_records WHERE evidence_id = $1', [evidenceB.rows[0].evidence_id]);
  assert(deleteB.rowCount === 0, 'Account A unexpectedly deleted Account B evidence.');
  console.log('PASS: Account A cannot update Account B notes or delete Account B evidence.');

  await client.query('ROLLBACK');
  transactionStarted = false;
  console.log('RESULT: all runtime RLS isolation assertions passed.');
  console.log('CLEANUP: the transaction was rolled back; no test rows were committed.');
}

try {
  await run();
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : 'Unexpected test failure'}`);
  process.exitCode = 1;
} finally {
  if (transactionStarted && client) {
    try {
      await client.query('ROLLBACK');
      console.log('CLEANUP: outstanding test transaction rolled back.');
    } catch {
      console.error('WARNING: rollback could not be confirmed. Inspect the local database before continuing.');
      process.exitCode = 1;
    }
  }
  client?.release();
  await pool.end();
}
