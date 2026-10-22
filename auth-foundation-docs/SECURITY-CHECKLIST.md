# Security and acceptance checklist

## Authentication

- [ ] Email verification and account recovery are configured with a real SMTP provider in production.
- [ ] Production uses HTTPS and exact redirect URIs / Web Origins; no wildcard production origins.
- [ ] OIDC client uses Authorization Code + PKCE S256; implicit flow and direct password grants are disabled.
- [ ] Access tokens are not written to `localStorage`, IndexedDB, analytics or logs by the React code.
- [ ] API validates signature, issuer, expiration and `opencyberpath-api` audience.
- [ ] Passwordless/passkey sign-in is optional and tested on supported real origins before being advertised.
- [ ] Native Android login uses the system browser and verified app/universal-link redirect handling before release.

## Database and API

- [ ] API uses the `opencyberpath_runtime` role, not `opencyberpath_owner` or `postgres`.
- [ ] Runtime role is not table owner, superuser or `BYPASSRLS`.
- [ ] All personal tables have RLS enabled and forced; policy checks `app.current_user_id`.
- [ ] API sets identity and HMAC signature with `set_config(..., true)` inside a transaction for every personal-data access.
- [ ] Runtime role cannot read `private.rls_secret`; the signed RLS helper is executable only by the runtime role and schema owner as needed.
- [ ] Every value in SQL queries uses bound parameters. Never concatenate request input into SQL text.
- [ ] Request schemas reject oversized strings, invalid progress ranges and unexpected fields.
- [ ] CORS contains only expected origins. Production API is behind HTTPS/TLS and network access is restricted.
- [ ] Request logs redact Authorization and Cookie headers; never log tokens or passwords.
- [ ] Backup restore has been tested; migrations are versioned and reviewed.

## Functional tests

- [ ] Guest mode still works with the identity provider offline.
- [ ] Registration, verification, sign-in, sign-out and recovery work end to end.
- [ ] Invalid/expired tokens and tokens with the wrong issuer/audience return 401.
- [ ] User A cannot read, change or delete user B's rows (test profiles, progress, notes and evidence).
- [ ] Progress write is idempotent for the same `(user_id, item_id)`.
- [ ] Two-device conflict behavior is specified and tested before sync is released.
- [ ] Native Android auth and deep links pass tests on physical devices.
- [ ] Existing 99 Python tests, web production build and Android build still pass after integration.

## SQL injection

All queries in this starter use PostgreSQL placeholders (`$1`, `$2`, etc.). Keep that rule for every new query. For example, use `WHERE item_id = $1` with a values array, never `WHERE item_id = '${userInput}'`.
