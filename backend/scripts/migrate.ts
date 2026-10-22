import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) throw new Error('MIGRATION_DATABASE_URL must be set to the separate database-owner account');
let migrationUser = '';
try {
  migrationUser = decodeURIComponent(new URL(connectionString).username);
} catch {
  throw new Error('MIGRATION_DATABASE_URL must be a valid PostgreSQL URL');
}
if (migrationUser === 'opencyberpath_runtime') throw new Error('Refusing to run migrations as the runtime role');
const sqlPath = resolve(process.cwd(), '../database/migrations/001_initial.sql');
const sql = await readFile(sqlPath, 'utf8');
const contextSecret = process.env.DATABASE_CONTEXT_HMAC_SECRET;
if (!contextSecret || !/^[a-fA-F0-9]{64,}$/.test(contextSecret) || contextSecret.length % 2 !== 0) {
  throw new Error('DATABASE_CONTEXT_HMAC_SECRET must be a hex-encoded secret of at least 32 bytes');
}
const client = new pg.Client({ connectionString });
try {
  await client.connect();
  await client.query(sql);
  await client.query(
    `INSERT INTO private.rls_secret (singleton, secret) VALUES (TRUE, $1)
     ON CONFLICT (singleton) DO UPDATE SET secret = EXCLUDED.secret`,
    [contextSecret],
  );
  console.log('Applied migration 001_initial.sql and synchronized the RLS context secret.');
} finally {
  await client.end();
}
