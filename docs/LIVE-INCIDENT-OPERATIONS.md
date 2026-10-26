# OpenCyberPath — Live Incident Operations

Status: first engineering slice; source ingestion and local defensive drills are implemented as a candidate feature. Do not represent the workflow as production-proven until it has run in the target GitHub repository and the deployed website has been verified.

## Product intent

This is not a static incident library. The section is a live operations desk: public incident/advisory signals are refreshed on a schedule, each source card opens an interactive defensive response drill tailored to the incident family, and the learner must inspect supplied fictional evidence, choose and justify a response, and specify validation. The real report provides context; the interactive evidence is synthetic unless a record explicitly links to a suitably licensed public dataset.

No drill contacts, probes, or exploits a victim/affected target. For active incidents, the safe learning goal is to investigate public facts and practise protective response on fictional local telemetry.

## Automated source coverage (v1.1.0)

This feed expands the initial three-provider set to seven automated sources:

- CERT-In official advisory listing (India).
- BleepingComputer security-news RSS (global independent reporting).
- The Record from Recorded Future News RSS (global incident/cybercrime reporting).
- The Hacker News RSS (global cybersecurity reporting).
- UK NCSC all-publications RSS (official news, threat reports and guidance).
- CISA cybersecurity-advisories RSS (official US advisories).
- CISA Known Exploited Vulnerabilities JSON catalog (exploited-vulnerability signals).

The media feeds are reports, not proof by themselves; official advisories can describe a vulnerability or threat without establishing a specific victim compromise. Each card retains its publisher, original URL, publication date when supplied, signal type, and confidence/source-status label. The feed does not scrape or republish full news articles or article photography.

The generated JSON snapshot is refreshed every three hours by the GitHub Actions workflow after that workflow is present on the repository's default branch and has permission to write the feed snapshot. For local development, run `python tools/liveops/refresh_live_case_intelligence.py` from the repository root to refresh the local snapshot manually.

This is broad but not exhaustive coverage: undisclosed incidents, sources without compatible public feeds, language gaps, paywalled reporting, and changing publisher markup mean no public-source aggregator can guarantee every incident worldwide. Source failures are surfaced; recent last-known items are retained as stale where possible. If all sources fail, the previous snapshot is preserved and the refresh exits non-zero.

## Live incident → response drill

Each card is classified into a broad defensive drill family (dependency/supply-chain compromise, vulnerability response, certificate trust, AI-agent access, API abuse, third-party incident, identity/cloud, malware/ransomware, generic). Selecting a card opens a matching fictional evidence pack, response choices, written findings, validation plan, a formative rubric, and JSON export. Signed-in learners can submit an attempt to the existing authenticated CaseLab API; the server validates the incident ID, drill type, evidence references and allowed response action, then stores the attempt through the existing append-only row-level-secured `case_submissions` table. Recent live-drill attempts are shown in the learner's live investigation record. Anonymous learners can still inspect the public incident signals and export reports locally. This template mapping is a training aid; it does not claim to reproduce the exact attack chain or private telemetry of the public incident.

## On-demand refresh on page load

The API provides public read-only `GET /v1/live-intelligence` and rate-limited `POST /v1/live-intelligence/refresh` endpoints. The browser requests a no-cache snapshot on load and polls briefly while an eligible refresh is running. A server-side single-flight guard prevents concurrent refresh processes in one API instance; refresh attempts are limited to once per configured minimum interval (three minutes by default), and the five-minute threshold labels an old snapshot as stale. A manual refresh button uses the same guarded endpoint and returns a cooldown response when another attempt ran recently.

The API discovers the repository root by walking upward from the compiled/source module directory and the process working directory. The runtime must include `tools/liveops/refresh_live_case_intelligence.py`, Python (or set `LIVE_INTELLIGENCE_PYTHON`), and a writable `website/public/live-case-intelligence.json` snapshot. In deployments where these files are not in the API runtime, set `LIVE_INTELLIGENCE_REPO_ROOT` to a mounted checkout or keep using the scheduled snapshot; the front end transparently falls back to the no-cache static JSON and states that on-demand refresh is unavailable. Snapshot files should be shared/read-write across instances if multiple API replicas are used; otherwise the scheduled workflow remains the authoritative published feed.

The GET endpoint triggers an upstream refresh in the background when a page-load request arrives and the minimum interval has elapsed, even if the snapshot is relatively recent. It immediately returns the latest saved snapshot with refresh metadata rather than holding the page open for provider timeouts. The client polls for up to 50 seconds and then leaves the last saved snapshot visible. Each upstream record retains its publication timestamp and publisher status; a refresh attempt alone does not make the underlying report new or confirmed.

## Refresh workflow

Workflow: `.github/workflows/refresh-live-case-intelligence.yml`

- Cron schedule: every three hours, plus manual `workflow_dispatch`.
- Python standard-library only; no API keys or secrets are required for the public feeds.
- Unit tests run before fetching source data.
- Only `website/public/live-case-intelligence.json` is staged by the workflow. No source code, environment file, Docker configuration, or user artifact is committed by this workflow.
- The workflow needs repository Actions permission to write contents. If branch protection prevents the bot from updating the default branch, the workflow will fail; do not disable protection just to make the bot push. In that repository setup, use a reviewed feed-update pull request instead.
- A manual refresh is available from GitHub Actions after the workflow has been merged into the default branch; local development can run the refresh script directly.

## Source integrity and freshness

The feed keeps the publisher, article/advisory URL, publication date where available, signal type, a short summary, and confidence/source-status label. An official advisory, a media report, and a CISA KEV entry have different claim strengths and are not collapsed into “confirmed compromise.” The KEV label means the CVE is listed by CISA as exploited in the wild; it does not mean the learner's environment is affected.

The front end shows the generated snapshot age and source health. If source checks fail, stale status is explicit rather than inventing current events.

## Limitations in this first slice

- Source coverage is not exhaustive; many incidents are never publicly disclosed, and RSS/page structures can change.
- Reuters is linked but not automated in this slice.
- Category assignment uses transparent keyword classification and should be reviewed for significant cases.
- The case submission API persists signed-in live-drill assessments to the existing append-only `case_submissions` table; no schema migration is added. Server-side scoring is deterministic and formative, and does not semantically judge a learner's prose or prove professional competency.
- Rubric is deterministic and formative, not a professional certification or proof of human competency.
- The current drills use documentation-only example IP addresses and fictional principals. No actual victim telemetry is reproduced.

## Acceptance checks

1. `python -m unittest discover -s tools/liveops -p 'test_refresh_live_case_intelligence.py' -v` passes.
2. Run `python tools/liveops/refresh_live_case_intelligence.py` from repository root on a machine with network access. Review the source status summary; never overwrite the prior snapshot if all sources fail.
3. From `website`, run `npm run check`.
4. Browser smoke-test: loading state, feed unavailable state, search, type filter, load-more, source links, launch drill, select evidence, complete assessment, save attempt while authenticated, reload and verify live attempt history, anonymous sign-in path, export evidence/report, mobile layout and reduced-motion behavior.
5. Confirm the scheduled workflow runs from the default branch and source links remain valid.
6. Independent reviewer checks source interpretations and drill mappings before declaring any individual case approved.
