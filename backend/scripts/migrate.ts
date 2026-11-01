import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';
import { getMigrationConfig } from './migration-config.js';

const { connectionString, contextSecret } = getMigrationConfig();

const migrationNames = ['001_initial.sql', '002_caselab.sql'];
const client = new pg.Client({ connectionString });

try {
  await client.connect();

  for (const migrationName of migrationNames) {
    const sqlPath = resolve(
      process.cwd(),
      '../database/migrations',
      migrationName,
    );

    const sql = await readFile(sqlPath, 'utf8');
    await client.query(sql);
    console.log(`Applied ${migrationName}.`);
  }

  await client.query(
    `INSERT INTO private.rls_secret (singleton, secret)
     VALUES (TRUE, $1)
     ON CONFLICT (singleton)
     DO UPDATE SET secret = EXCLUDED.secret`,
    [contextSecret],
  );

  console.log(
    'Applied initial and CaseLab migrations and synchronized the RLS context secret.',
  );
} finally {
  await client.end();
}
