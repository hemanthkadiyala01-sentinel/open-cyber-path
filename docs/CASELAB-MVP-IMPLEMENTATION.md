# CaseLab MVP implementation notes

Status: first implementation slice; not a production launch approval.

## Scope

This change adds one candidate case, a browser investigation form, a transparent deterministic formative rubric, append-only attempt persistence, authenticated account APIs, and a PostgreSQL RLS policy for learner submissions.

The candidate case is based on public Microsoft disclosures about Midnight Blizzard and CISA Emergency Directive 24-02. The training timeline and every lab account/event are fictional. Source links and publication dates are exposed in the UI. The case is explicitly labelled `draft-awaiting-human-review`; do not represent it as approved until a human reviewer checks every factual claim and rubric outcome.

## API contract

- `GET /v1/cases` — public summaries.
- `GET /v1/cases/:caseId` — public case brief, source register, objectives, and response options.
- `GET /v1/cases/:caseId/evidence` — clearly labelled synthetic evidence only.
- `POST /v1/cases/:caseId/submissions` — authenticated, verified-email account required. Owner identity comes only from the verified JWT subject; unexpected properties such as `user_id` are rejected.
- `GET /v1/me/cases` — current account's saved attempts only.
- `GET /v1/me/cases/:submissionId` — one attempt belonging to the current account only.

Attempts are append-only through the runtime API. The database runtime role can `SELECT` and `INSERT` into `case_submissions`, but cannot `UPDATE` or `DELETE`. The table uses the existing HMAC-signed transaction context and PostgreSQL row-level security policy.

## Local setup

1. Ensure the API database is the local development database and use the configured migration-owner account only for migrations. Never run migrations with `opencyberpath_runtime`.
2. From `backend`, run `npm ci`, `npm test`, `npm run build`.
3. From `backend`, run `npm run migrate` with `MIGRATION_DATABASE_URL` and `DATABASE_CONTEXT_HMAC_SECRET` set according to `backend/.env.example`. The migration runner now applies `001_initial.sql` and `002_caselab.sql`.
4. Run `npm run test:rls` against the configured local `opencyberpath` database after migrations. This script must remain constrained to the local runtime database and rolls its test transaction back.
5. Configure the website's existing `VITE_API_BASE_URL` and account/OIDC settings; restart Vite after changing build-time environment values.
6. From `website`, run `npm ci`, `npm run check`, then open CaseLab from the Discover menu in a real browser. Test anonymous preview, sign-in, submission, reload, another device/session, and account separation.

## Rubric semantics

The API returns a deterministic 100-point formative rubric: authentication timeline (25), OAuth/application/mailbox correlation (25), hypothesis quality (15), core response actions (20), and validation plan (15). The text-field criterion uses simple length/topic checks; it is not semantic grading. The score is not a certification, proof of competence, or independent human assessment.

## Release blockers

- A human reviewer must confirm source interpretation, source dates, scenario realism, expected answers, and rubric scoring.
- Run migration and RLS integration tests against a fresh local database and the existing development DB.
- Run website browser/accessibility smoke tests and verify mobile layout.
- Test authentication required/expired-token/verified-email failure paths, cross-account reads, and invalid request bodies.
- Decide deployment, backup/restore, monitoring, rate limits, retention/deletion handling, and privacy notice before storing important learner records in production.
