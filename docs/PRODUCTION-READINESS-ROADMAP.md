# OpenCyberPath Production-Readiness Roadmap

Status date: 24 October 2026
Status: Planning and release gates; not a claim that production deployment is complete.

## Product mission

OpenCyberPath helps learners build technology, secure it, investigate incidents, and demonstrate practical defensive skills. The intended learning journey is:

**Learn → Build → Secure → Investigate → Defend → Demonstrate evidence → Progress**

The primary differentiator is a connected, source-backed Real-World CaseLab. Hardware and embedded-device engineering will grow as a related Build & Defend track.

## Current evidence from the development session

The developer reported these local checks as successful:

- Python test suite: 136 tests passed.
- Website quality checks and Vite production build: passed, with a non-blocking large-chunk warning.
- Backend tests: 4 passed.
- Backend TypeScript build: no compiler errors reported.
- Capacitor sync and Android debug build: successful.
- After correcting the backend `OIDC_ISSUER_URL` to the active Keycloak issuer, backend logs showed `200` for `GET /v1/me`, `GET /v1/progress`, and a progress `PUT` request.

These are development-environment results, not a production security audit or availability guarantee. Re-run them on the latest main branch before release.

## Production readiness gates

### Gate 0 — Keep development and production configuration separate

- Do not commit `.env`, `.env.local`, credentials, access tokens, database URLs containing passwords, or real tunnel URLs.
- Do not use Cloudflare Quick Tunnel hostnames as permanent identity or API URLs. Their names are temporary and change when a new Quick Tunnel is created.
- Keep `infra/docker-compose.dev.yml` explicitly for local development; keep local loopback port bindings and localhost defaults there.
- Put production values only in each hosting provider's environment/secrets dashboard.
- A production OAuth/OIDC issuer must be stable. The `issuer` advertised by discovery must exactly match the backend's `OIDC_ISSUER_URL`, including realm and scheme.

### Gate 1 — Choose the deployment class honestly

There are two different targets:

**Free public preview / beta:** suitable for limited validation, with clearly disclosed sleeps, quotas, possible restarts, limited support, and data-recovery constraints. It is not automatically production-grade because the URLs are public.

**Production service:** requires an always-on supported application runtime, a database with a suitable backup/restore plan, stable identity hosting, secrets management, monitoring, and an operational recovery process. This can incur cost. Do not promise an availability SLA or durable storage unless the chosen provider and plan support it.

Current provider notes checked against official documentation on 24 October 2026:

- Cloudflare Pages can host the static Vite website. Official limits: https://developers.cloudflare.com/pages/platform/limits/
- Render offers free web services, but free services sleep after 15 minutes idle and spin-up can take about a minute. Its free Postgres database expires after 30 days and lacks backups; do not use that free database for important persistent learner data. Official details: https://render.com/docs/free
- Neon Free currently includes 100 CU-hours and 0.5 GB storage per project; compute scales to zero after five minutes of inactivity. Official limits: https://neon.com/docs/introduction/pro-plan
- Cloud-IAM's Keycloak Freemium is described by the provider as for testing/learning and not recommended for production. Official FAQ: https://documentation.cloud-iam.com/faq/plan.html

A possible $0 prototype stack is Cloudflare Pages + a limited free Node API service + Neon Free + a freemium identity option. This may demonstrate the end-to-end workflow, but the combination has sleep, usage, identity, and operational limitations. Revalidate current limits before deployment. A production launch needs a separate plan review before real users' important learning records are entrusted to it.

### Gate 2 — Deploy the website

- Connect the Git repository to Cloudflare Pages or another static host.
- Build command: `npm run build`.
- Build directory: `dist`.
- Configure `VITE_OIDC_URL`, `VITE_OIDC_REALM`, `VITE_OIDC_CLIENT_ID`, `VITE_NATIVE_OIDC_CLIENT_ID` (if needed), and `VITE_API_BASE_URL` as deployment build variables.
- Use the final stable HTTPS identity and API URLs before producing the release Android APK. Vite values are compiled into client assets, so changing environment variables alone does not change an already-built APK.
- Add SPA fallback/routing as required and test a direct refresh of nested routes.

### Gate 3 — Deploy the backend API

- Deploy `backend` as a Node.js service using Node 22 and `backend/package-lock.json`.
- Build command: `npm ci && npm run build`.
- Start command: `npm start`.
- The service must listen on the host and port required by the platform. Set `HOST=0.0.0.0` when the host requires a public listener; preserve the safer `127.0.0.1` default for local development.
- Required secret/configuration values: `DATABASE_URL`, `DATABASE_SSL=true` where provider TLS is required, `DATABASE_CONTEXT_HMAC_SECRET` (hex-encoded, at least 32 random bytes), `OIDC_ISSUER_URL`, `OIDC_AUDIENCE=opencyberpath-api`, and the exact comma-separated HTTPS `CORS_ORIGINS` list.
- Configure the platform health check to `/healthz`. Note: this endpoint executes `SELECT 1`, so it checks database connectivity as well as process availability.
- Never weaken JWT verification to make login work. Keep signature verification, issuer, audience, expiration, required claims, and verified-email checks enabled.

### Gate 4 — Configure identity

- Choose and document the stable public Keycloak issuer/realm.
- Verify the `.well-known/openid-configuration` document reports exactly the expected issuer and HTTPS authorization/token/logout endpoints.
- Configure web and native clients separately with exact redirect URIs and logout return URIs. Do not add wildcard redirect URIs.
- Verify `opencyberpath-api` audience is present in access tokens as required by the API configuration.
- Test login, logout, expired sessions, rejected/invalid tokens, and fresh login after logout.
- Never include access tokens, refresh tokens, client secrets, or credentials in issue descriptions, screenshots, logs, or commits.

### Gate 5 — Durable database and migrations

- Use a managed Postgres service that meets the intended data retention and recovery requirements.
- Run the checked-in migration workflow with the separate migration/owner identity; the runtime API should use its restricted database role.
- Confirm user rows are isolated by verified JWT `sub` and the existing row-level security/security-context protections.
- Verify automated backups, retention, restore procedure, schema migration procedure, connection limits, and TLS certificate validation.
- Do not use a free database that automatically expires or has no backup/restore support for important learner submissions.

### Gate 6 — CI and release validation

The quality workflow should validate website and backend code on each PR to `main`. Before each release, also verify locally:

```powershell
python -m unittest discover -s tests -v
python scripts/quality_checks.py
cd website
npm ci
npm run check
npx cap sync android
cd android
.\gradlew.bat assembleDebug
cd ..\..\backend
npm ci
npm test
npm run build
```

Run commands from the listed directories; do not run `cd` paths relative to the wrong working directory. These commands validate builds/tests, not hosted runtime behavior.

### Gate 7 — Production smoke tests

Use a clean browser profile and a phone on a network different from the developer's local Wi-Fi. With the developer laptop and its local services off, verify:

1. Website loads over HTTPS and direct routes refresh successfully.
2. Sign-up/sign-in and verified-email policy behave as expected.
3. `/v1/me` returns only the authenticated learner's profile.
4. Learning progress can be written, retrieved after a fresh session, and is isolated from another test account.
5. Notes/submissions are similarly account-isolated.
6. Logout ends the session; the next login succeeds.
7. A stopped/unreachable API produces a useful retry message, not a false success.
8. Database backup/restore and deployment rollback procedures are documented and tested.
9. Mobile callback flows work on a fresh install of the APK built with the final production URLs.

Do not claim the deployment is complete until these checks pass.

## Next product milestones after hosting

### Milestone A — Real-World CaseLab

Deliver one complete case before publishing a large case catalogue:

1. Source-backed incident briefing with source URL, publication date, event date if known, and source confidence.
2. Explicit confirmed facts vs unknowns, allegations, and unverified reporting.
3. A reproducible synthetic evidence pack inspired by the incident, never presented as affected-organisation telemetry.
4. Timeline investigation, competing hypotheses, defensive decisions, and evidence-backed report.
5. Rubric-based feedback covering evidence quality, reasoning, detection, remediation, validation, and limitations.
6. Persistent submissions, case versioning, retries/hints, and progress sync across devices.
7. SkillProof portfolio export that clearly marks learner claims as self-reported unless independently verified.

### Milestone B — Build & Defend Lab

Start with one ESP32 educational device project, not a catalogue of hardware pages:

1. A buildable sensor/display or local monitoring device.
2. Firmware source, bill of materials, wiring/architecture diagram, and reproducible test steps.
3. Secure configuration, protected credentials, supported firmware-integrity/update controls, and logging.
4. A safe simulated failure and detection/recovery exercise.
5. Evidence-backed report and automated checks.

### Acceptance standard

A feature is complete only when its source/evidence is accurate, the user workflow is usable on desktop and mobile, progress behaves as documented, tests exist, privacy/security boundaries are explicit, and the README tells contributors how to reproduce it. Avoid using “production-ready,” “AI evaluated,” or “verified skill” unless the implementation actually supports the claim.
