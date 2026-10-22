import 'dotenv/config';

export interface Env {
  HOST: string;
  PORT: number;
  CORS_ORIGINS: string[];
  DATABASE_URL: string;
  DATABASE_SSL: boolean;
  DATABASE_CONTEXT_HMAC_SECRET: string;
  OIDC_ISSUER_URL: string;
  OIDC_AUDIENCE: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function loadEnv(): Env {
  const port = Number(process.env.PORT ?? '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
  const issuer = required('OIDC_ISSUER_URL').replace(/\/$/, '');
  const issuerUrl = new URL(issuer);
  if (!['http:', 'https:'].includes(issuerUrl.protocol)) throw new Error('OIDC_ISSUER_URL must use HTTP(S)');
  const databaseSsl = process.env.DATABASE_SSL === 'true';
  const contextHmacSecret = required('DATABASE_CONTEXT_HMAC_SECRET');
  if (!/^[a-fA-F0-9]{64,}$/.test(contextHmacSecret) || contextHmacSecret.length % 2 !== 0) {
    throw new Error('DATABASE_CONTEXT_HMAC_SECRET must be a hex-encoded secret of at least 32 bytes');
  }
  const corsOrigins = required('CORS_ORIGINS').split(',').map((x) => x.trim()).filter(Boolean);
  if (process.env.NODE_ENV === 'production') {
    if (issuerUrl.protocol !== 'https:') throw new Error('Production OIDC_ISSUER_URL must use HTTPS');
    if (!databaseSsl) throw new Error('Production DATABASE_SSL must be true');
    if (corsOrigins.some((origin) => !origin.startsWith('https://'))) throw new Error('Production CORS_ORIGINS must contain HTTPS origins only');
  }
  return {
    HOST: process.env.HOST?.trim() || '127.0.0.1',
    PORT: port,
    CORS_ORIGINS: corsOrigins,
    DATABASE_URL: required('DATABASE_URL'),
    DATABASE_SSL: databaseSsl,
    DATABASE_CONTEXT_HMAC_SECRET: contextHmacSecret,
    OIDC_ISSUER_URL: issuer,
    OIDC_AUDIENCE: process.env.OIDC_AUDIENCE?.trim() || 'opencyberpath-api',
  };
}
