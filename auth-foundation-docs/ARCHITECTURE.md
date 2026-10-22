# OpenCyberPath authentication and data architecture

## First-release boundaries

```text
React/Vite website             Capacitor Android
       |                              |
       | OIDC Authorization Code + PKCE (web flow in this starter)
       +---------------> Keycloak Identity Provider
                                  |
                         signed access token
                                  |
                                  v
                         Fastify REST API
                                  |
                   issuer + signature + audience checks
                                  |
                                  v
                        PostgreSQL runtime role
                                  |
                    transaction-local user identity
                                  |
                                  v
              PostgreSQL row-level security (RLS)
```

Identity and app data are separate concerns. Keycloak is the OIDC identity provider; PostgreSQL stores OpenCyberPath records. The API checks the issuer, signature, expiry, algorithm and required audience before querying personal data. It derives the user ID from the verified token's `sub` claim; a request body can never choose the owner ID.

## Database boundaries

- `keycloak` database: owned by the Keycloak service account and used only by Keycloak.
- `opencyberpath` database: owned by a migration/owner role; the API uses the restricted `opencyberpath_runtime` role.
- Do not grant the runtime role `BYPASSRLS`, ownership of application tables, or PostgreSQL superuser rights.
- `app.current_user_id` and an HMAC signature are set transaction-locally by the API using parameterized queries. RLS policies call a `SECURITY DEFINER` function that compares the signature to a secret in a private schema. The runtime role cannot read the secret. Merely changing the user-id setting is therefore insufficient to impersonate another learner. The signing secret is managed only by the migration/owner role and API environment; rotate it by updating the database value through the migration command before restarting the API.
- Browser and native offline data are caches, not an alternate authority. The eventual sync layer needs conflict/version rules and must not trust the client to declare verified skill capability.

## Why not add MariaDB and MongoDB immediately?

PostgreSQL is the source of truth for transactional records. PostgreSQL JSONB covers many flexible-document use cases. Adding multiple databases before workload evidence increases backup, migration, auth, access-control, consistency and operations costs. Revisit a specialized store only after profiling identifies a measurable need.

## Important release gate for Android

The included `keycloak-js` React provider is browser-focused. The native app needs a proper external-system-browser OIDC Authorization Code + PKCE flow and secure redirect handling (app/universal links). Do not persist tokens in localStorage or roll your own password exchange. Treat this as a separate release gate before shipping native account login.
