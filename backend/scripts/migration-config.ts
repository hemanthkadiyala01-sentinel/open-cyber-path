import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';

export interface MigrationConfig {
  connectionString: string;
  contextSecret: string;
}

export function getMigrationConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): MigrationConfig {
  // Copy the environment rather than mutating process.env.
  let effectiveEnv: NodeJS.ProcessEnv = { ...env };

  // .env is opt-in, never loaded implicitly.
  if (effectiveEnv.MIGRATION_LOAD_DOTENV === 'true') {
    let parsedEnv: NodeJS.ProcessEnv;

    try {
      parsedEnv = parse(readFileSync(resolve(cwd, '.env'), 'utf8'));
    } catch {
      throw new Error(
        'Could not load .env for explicitly requested local migration configuration',
      );
    }

    // Explicit process environment variables always take precedence.
    effectiveEnv = { ...parsedEnv, ...effectiveEnv };
  }

  const connectionString = effectiveEnv.MIGRATION_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'MIGRATION_DATABASE_URL must be set to the separate database-owner account',
    );
  }

  let migrationUrl: URL;

  try {
    migrationUrl = new URL(connectionString);
  } catch {
    throw new Error('MIGRATION_DATABASE_URL must be a valid PostgreSQL URL');
  }

  if (
    migrationUrl.protocol !== 'postgres:' &&
    migrationUrl.protocol !== 'postgresql:'
  ) {
    throw new Error('MIGRATION_DATABASE_URL must use the PostgreSQL protocol');
  }

  const expectedHost = effectiveEnv.MIGRATION_EXPECTED_HOST?.trim();
  const expectedDatabase =
    effectiveEnv.MIGRATION_EXPECTED_DATABASE?.trim();

  if (!expectedHost || !expectedDatabase) {
    throw new Error(
      'MIGRATION_EXPECTED_HOST and MIGRATION_EXPECTED_DATABASE must be set',
    );
  }

  // Require a hostname only: no URL syntax, credentials, port, or whitespace.
  if (
    /[/:@?#\s]/.test(expectedHost) ||
    expectedHost.includes('\\')
  ) {
    throw new Error(
      'MIGRATION_EXPECTED_HOST must be a hostname without a port',
    );
  }

  // Database names are compared exactly after URL decoding.
  if (
    expectedDatabase.includes('/') ||
    expectedDatabase.includes('\\') ||
    /\s/.test(expectedDatabase)
  ) {
    throw new Error(
      'MIGRATION_EXPECTED_DATABASE must be a valid database name',
    );
  }

  if (!migrationUrl.hostname) {
    throw new Error('MIGRATION_DATABASE_URL must contain a hostname');
  }

  if (
    migrationUrl.hostname.toLowerCase() !== expectedHost.toLowerCase()
  ) {
    throw new Error(
      'MIGRATION_DATABASE_URL hostname does not match MIGRATION_EXPECTED_HOST',
    );
  }

  let actualDatabase: string;

  try {
    actualDatabase = decodeURIComponent(migrationUrl.pathname.slice(1));
  } catch {
    throw new Error(
      'MIGRATION_DATABASE_URL contains an invalid database name',
    );
  }

  if (!actualDatabase || actualDatabase !== expectedDatabase) {
    throw new Error(
      'MIGRATION_DATABASE_URL database does not match MIGRATION_EXPECTED_DATABASE',
    );
  }

  let migrationUser: string;

  try {
    migrationUser = decodeURIComponent(migrationUrl.username);
  } catch {
    throw new Error('MIGRATION_DATABASE_URL contains an invalid username');
  }

  if (migrationUser !== 'opencyberpath_owner') {
    throw new Error(
      'MIGRATION_DATABASE_URL must use the opencyberpath_owner role',
    );
  }

  const contextSecret = effectiveEnv.DATABASE_CONTEXT_HMAC_SECRET;

  if (
    !contextSecret ||
    !/^[a-fA-F0-9]{64,}$/.test(contextSecret) ||
    contextSecret.length % 2 !== 0
  ) {
    throw new Error(
      'DATABASE_CONTEXT_HMAC_SECRET must be a hex-encoded secret of at least 32 bytes',
    );
  }

  return { connectionString, contextSecret };
}