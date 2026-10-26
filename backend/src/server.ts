import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { loadEnv } from './env.js';
import { pool, withUserTransaction } from './db.js';
import { isValidItemId, validateNoteInput, validateProgressInput } from './validation.js';
import { registerCaseLabRoutes } from './caselab-routes.js';
import { createLiveIntelligenceService } from './live-intelligence.js';

interface Principal { sub: string; email?: string; name?: string; emailVerified: boolean; }
declare module 'fastify' { interface FastifyRequest { principal: Principal | null; } }

const env = loadEnv();
const db = pool(env);
const liveIntelligence = createLiveIntelligenceService();
const app = Fastify({
  logger: { redact: ['req.headers.authorization', 'req.headers.cookie'] },
  bodyLimit: 64 * 1024,
});
app.decorateRequest('principal', null);

const issuer = env.OIDC_ISSUER_URL;
const jwks = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

await app.register(helmet, { contentSecurityPolicy: false, strictTransportSecurity: false });
await app.register(cors, {
  origin(origin, callback) {
    // Requests without Origin can be health checks/server-to-server. Browser origins are allowlisted.
    if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: false,
});
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.authorization ?? '');
  if (!match) {
    await reply.code(401).send({ error: 'authentication_required' });
    return;
  }
  try {
    const { payload } = await jwtVerify(match[1]!, jwks, {
      issuer,
      audience: env.OIDC_AUDIENCE,
      algorithms: ['RS256'],
      requiredClaims: ['sub', 'exp', 'iat'],
    });
    if (typeof payload.sub !== 'string' || payload.sub.length < 1) throw new Error('Missing subject');
    const emailVerified = payload.email_verified === true;
    if (!emailVerified) {
      await reply.code(403).send({ error: 'verified_email_required' });
      return;
    }
    request.principal = {
      sub: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      emailVerified,
    };
  } catch (error) {
    const failure = error && typeof error === 'object'
      ? error as { name?: unknown; code?: unknown; claim?: unknown }
      : {};
    request.log.warn({
      tokenValidationError: typeof failure.name === 'string' ? failure.name : 'UnknownError',
      tokenValidationCode: typeof failure.code === 'string' ? failure.code : undefined,
      tokenValidationClaim: typeof failure.claim === 'string' ? failure.claim : undefined,
    }, 'Access token validation failed');
    await reply.code(401).send({ error: 'invalid_or_expired_token' });
  }
}

// Public, read-only incident feed endpoint. Each page load gets a no-cache snapshot;
// an upstream refresh runs in the background only when the snapshot is due.
app.get('/v1/live-intelligence', {
  config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
}, async (_request, reply) => {
  reply.header('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  reply.header('Pragma', 'no-cache');
  const result = await liveIntelligence.getSnapshot();
  if (!result.ok) {
    return reply.code(503).send({ error: 'live_intelligence_unavailable', detail: result.error });
  }
  return result.feed;
});

// Manual provider refresh. Source URLs are fixed and allow-listed in the Python collector;
// this endpoint accepts no URL or command input and is throttled per client IP.
app.post('/v1/live-intelligence/refresh', {
  config: { rateLimit: { max: 1, timeWindow: '60 seconds' } },
}, async (_request, reply) => {
  reply.header('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  const result = await liveIntelligence.triggerRefresh();
  if (result.status === 'snapshot-only') {
    return reply.code(503).send({ status: result.status, error: 'on_demand_refresh_unavailable' });
  }
  if (result.status === 'cooldown') {
    reply.header('Retry-After', String(result.retryAfterSeconds ?? 60));
    return reply.code(429).send(result);
  }
  return reply.code(202).send(result);
});

app.get('/healthz', async (_request, reply) => {
  try {
    await db.query('SELECT 1');
    return { status: 'ok' };
  } catch {
    return reply.code(503).send({ status: 'unavailable' });
  }
});

app.get('/v1/me', { preHandler: requireAuth }, async (request, reply) => {
  const principal = request.principal;
  if (!principal) return reply.code(401).send({ error: 'authentication_required' });
  return withUserTransaction(db, principal.sub, env.DATABASE_CONTEXT_HMAC_SECRET, async (client) => {
    const result = await client.query(
      `INSERT INTO learner_profiles (user_id, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         email = COALESCE(EXCLUDED.email, learner_profiles.email),
         display_name = COALESCE(EXCLUDED.display_name, learner_profiles.display_name),
         updated_at = NOW()
       RETURNING user_id, email, display_name, created_at, updated_at`,
      [principal.sub, principal.email ?? null, principal.name ?? null],
    );
    return { profile: result.rows[0] };
  });
});

app.get('/v1/progress', { preHandler: requireAuth }, async (request, reply) => {
  const principal = request.principal;
  if (!principal) return reply.code(401).send({ error: 'authentication_required' });
  return withUserTransaction(db, principal.sub, env.DATABASE_CONTEXT_HMAC_SECRET, async (client) => {
    const result = await client.query(
      `SELECT item_id, status, percent, metadata, last_activity_at, updated_at
       FROM learning_progress ORDER BY updated_at DESC LIMIT 500`,
    );
    return { items: result.rows };
  });
});

app.put<{ Params: { itemId: string }; Body: unknown }>('/v1/progress/:itemId', {
  preHandler: requireAuth,
}, async (request, reply) => {
  const principal = request.principal;
  if (!principal) return reply.code(401).send({ error: 'authentication_required' });
  if (!isValidItemId(request.params.itemId)) return reply.code(400).send({ error: 'invalid_item_id' });
  const validation = validateProgressInput(request.body);
  if (!validation.ok) return reply.code(400).send({ error: validation.error });
  const { status, percent, metadata } = validation.value;
  return withUserTransaction(db, principal.sub, env.DATABASE_CONTEXT_HMAC_SECRET, async (client) => {
    const result = await client.query(
      `INSERT INTO learning_progress (user_id, item_id, status, percent, metadata, last_activity_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (user_id, item_id) DO UPDATE SET
         status = EXCLUDED.status, percent = EXCLUDED.percent,
         metadata = EXCLUDED.metadata, last_activity_at = NOW(), updated_at = NOW()
       RETURNING item_id, status, percent, metadata, last_activity_at, updated_at`,
      [principal.sub, request.params.itemId, status, percent, JSON.stringify(metadata)],
    );
    return { item: result.rows[0] };
  });
});

app.get('/v1/notes', { preHandler: requireAuth }, async (request, reply) => {
  const principal = request.principal;
  if (!principal) return reply.code(401).send({ error: 'authentication_required' });
  return withUserTransaction(db, principal.sub, env.DATABASE_CONTEXT_HMAC_SECRET, async (client) => {
    const result = await client.query(
      `SELECT note_id, title, content, created_at, updated_at
       FROM learner_notes ORDER BY updated_at DESC LIMIT 200`,
    );
    return { notes: result.rows };
  });
});

app.post<{ Body: unknown }>('/v1/notes', { preHandler: requireAuth }, async (request, reply) => {
  const principal = request.principal;
  if (!principal) return reply.code(401).send({ error: 'authentication_required' });
  const validation = validateNoteInput(request.body);
  if (!validation.ok) return reply.code(400).send({ error: validation.error });
  const note = await withUserTransaction(db, principal.sub, env.DATABASE_CONTEXT_HMAC_SECRET, async (client) => {
    const result = await client.query(
      `INSERT INTO learner_notes (user_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING note_id, title, content, created_at, updated_at`,
      [principal.sub, validation.value.title, validation.value.content],
    );
    return result.rows[0];
  });
  return reply.code(201).send({ note });
});

await registerCaseLabRoutes(app, db, env.DATABASE_CONTEXT_HMAC_SECRET, requireAuth);

app.setErrorHandler((error, request, reply) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error &&
    error.validation
  ) {
    return reply.code(400).send({ error: 'invalid_request' });
  }

  const errorName = error instanceof Error ? error.name : 'UnknownError';
  request.log.error({ errorName }, 'Request failed');
  return reply.code(500).send({ error: 'internal_server_error' });
});

const shutdown = async () => {
  await app.close();
  await db.end();
};
process.once('SIGINT', () => { void shutdown().finally(() => process.exit(0)); });
process.once('SIGTERM', () => { void shutdown().finally(() => process.exit(0)); });

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error({ errorName: error instanceof Error ? error.name : 'unknown' }, 'API startup failed');
  await db.end();
  process.exit(1);
}
