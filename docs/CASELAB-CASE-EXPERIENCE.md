# CaseLab Case Experience — The Unexpected Consent

Status: engineering candidate / draft awaiting human review. This is a single end-to-end case-solving experience, not a case library release.

## Product intent

The product unit is a complete investigation: mission briefing, evidence inspection, hypothesis selection, written findings, defensive response, post-action validation, assessment, and after-action review. New cases should be authored as complete investigation packages rather than shallow cards.

## What this patch changes

- Revisions the existing Midnight Blizzard-inspired case to `1.1.0` and expands it into six investigation stages.
- Adds 20 clearly synthetic records across identity, conditional-access, directory audit, application inventory, mailbox audit, change management, owner confirmation, and response tracking.
- Adds evidence search, per-stage progression, progressive hints, local JSON/CSV exports, and a downloadable multi-file ZIP case pack.
- Adds an authenticated after-action debrief endpoint. The guide is not included in the public case metadata; the current account must have submitted the case before reading it.
- Replaces the simplistic score weights with an explicit evidence-chain rubric. Written response checks remain deterministic/heuristic; they are formative, not semantic grading or certification.
- Preserves the existing authenticated, append-only submission and row-level security architecture. No database schema migration is required.

## Case integrity

The case is inspired by public Microsoft disclosures and CISA ED 24-02. All case telemetry is fictional. Do not imply that the synthetic evidence is extracted from Microsoft or any victim. The case remains `draft-awaiting-human-review` until an independent reviewer verifies sources, scenario coherence, expected conclusions, rubric fairness, artifact hashes and safe use.

## Evidence pack

The downloadable package contains JSONL and CSV datasets with a SHA-256 manifest. It is appropriate for local defensive analysis with Python/PowerShell and does not require a live target, production identity, malware execution or a remote range. It is structured synthetic telemetry, not native PCAP/EVTX or a real tenant export.

## API

- `GET /v1/cases/:caseId` returns the public mission brief, tasks, hints and source register.
- `GET /v1/cases/:caseId/evidence` returns synthetic evidence only.
- `POST /v1/cases/:caseId/submissions` validates and stores an authenticated attempt.
- `GET /v1/cases/:caseId/debrief` requires authentication and at least one prior submission by the requesting account.
- Existing `/v1/me/cases` endpoints continue to expose only the current user's attempts.

## Acceptance criteria before publication

1. Backend test/build and website quality gate pass on the user's current working tree.
2. Browser test covers every stage, search/filter, hints, artifact downloads, submission, debrief gating, reload and account separation.
3. SHA-256 manifest verifies every dataset included in the ZIP.
4. Independent reviewer checks source interpretation, event logic, alternative explanations, response sequencing, rubric boundaries and disclaimer.
5. A human approves publication; automation alone does not change the curation state.
