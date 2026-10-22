import pg, { type PoolClient } from 'pg';
import { createHmac } from 'node:crypto';
import type { Env } from './env.js';

const { Pool } = pg;
export const pool = (env: Env) => new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 5_000,
  ...(env.DATABASE_SSL ? { ssl: { rejectUnauthorized: true } } : {}),
});

export async function withUserTransaction<T>(
  dbPool: InstanceType<typeof Pool>,
  userId: string,
  contextSecret: string,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    // Parameterized and transaction-local: it cannot leak to the next pooled request.
    const signature = createHmac('sha256', contextSecret).update(userId, 'utf8').digest('hex');
    await client.query(
      "SELECT set_config('app.current_user_id', $1, true), set_config('app.current_user_signature', $2, true)",
      [userId, signature],
    );
    await client.query("SET LOCAL statement_timeout = '5s'");
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* preserve the original error */ }
    throw error;
  } finally {
    client.release();
  }
}
