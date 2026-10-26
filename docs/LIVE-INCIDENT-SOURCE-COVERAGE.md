# OpenCyberPath — Live Incident Source Coverage v1.1.0

## Purpose

Expand the auto-refreshed public incident/advisory feed beyond the original three providers. The feed is a curated signal stream, not an exhaustive census of every cyber incident in the world.

## Automated sources

| Source | What it contributes | How to interpret it |
|---|---|---|
| CERT-In | Official Indian cyber advisories | Official advisory; may describe vulnerabilities or campaigns, not necessarily a specific victim |
| BleepingComputer | Global incident and vulnerability reporting | Media report; cross-check significant claims against primary disclosures |
| The Record / Recorded Future News | Global cybercrime, breach, and threat reporting | Media report; keep claims attributed to the outlet |
| The Hacker News | Global cybersecurity reporting | Media report; keep claims attributed to the outlet |
| UK NCSC | Official news, threat reports and guidance | Official publication; distinguish reporting from general guidance |
| CISA Cybersecurity Advisories | Official US cybersecurity advisories | Official advisory; not proof of compromise of a specific organization |
| CISA KEV | Known exploited vulnerabilities catalog | Exploitation evidence for the CVE class; not evidence the learner's own assets are affected |

The first implementation keeps each article's publisher and HTTPS article URL. It stores a short paraphrased summary, publication timestamp where available, signal category and confidence/status label; it does not download and rehost entire articles or copyrighted news photography. Archive art remains original illustrative art and must not be represented as a real incident photo.

## Update cadence

`.github/workflows/refresh-live-case-intelligence.yml` checks the feeds every three hours on the default branch and supports manual dispatch. GitHub Actions must have permission to commit the generated `website/public/live-case-intelligence.json` snapshot. If branch protection blocks direct updates, use a reviewed pull request; do not disable protections.

For local development, run this from the repository root:

```powershell
python tools/liveops/refresh_live_case_intelligence.py
```

That network refresh updates the local JSON snapshot only. Rebuild/reload the website afterwards. A deployed site receives automatic feed updates only after the source/workflow changes are merged into the deployment branch and the scheduled workflow succeeds.

## Reliability and trust

- Each RSS/Atom source has an explicit allow-list of HTTPS article hosts; off-domain links are rejected.
- One failed source does not prevent the other providers from being parsed.
- Recent last-known records for failed sources remain marked stale where possible.
- If every source fails, the last-known snapshot is preserved and the refresh command exits non-zero.
- Source confidence is preserved: `reported` is not rendered as `confirmed`; official advisories and KEV records have different meaning.
- The UI still labels synthetic drill telemetry as fictional. A news item can launch a category-matched practice drill, but the drill evidence does not reconstruct private victim logs or prove local compromise.

## Coverage limits

No public source set can guarantee every global incident: many attacks are undisclosed, some reporting is paywalled, feeds change, and language/region coverage is uneven. The source set should be monitored for outages and expanded only with documented source ownership, HTTPS/link validation, provenance and parser tests. The cases are pointers for learning, not a substitute for the original report or an incident-response authority.


## CISA advisory feed fallback (v1.1.1)

CISA advisories are collected from three official RSS endpoints: `all.xml`, `cybersecurity-advisories.xml`, and `alerts.xml`. The refresher tries all configured endpoints, discards endpoints that fail or yield no recent security records, and deduplicates successful results by canonical source URL. If at least one endpoint returns valid items, the provider remains healthy and its `feedEndpoints`, `successfulFeedCount`, and optional `partialFeedErrors` fields record diagnostics. Only if every endpoint fails or returns no usable items is the provider marked failed/stale; the existing snapshot-preservation behavior remains in effect.


## CISA RSS request negotiation (v1.1.2)

The CISA RSS requests now use `Accept: application/rss+xml, application/xml, text/xml, */*`, matching the header value in the local PowerShell probe that returned HTTP 200 for the cybersecurity-advisories and alerts feeds. Other providers retain the existing default `Accept` header. This change is a targeted compatibility adjustment, not a guarantee that every endpoint or network path will be accepted; validate it with a real refresh and preserve stale records when CISA is unavailable.


## Windows CISA RSS transport fallback (v1.1.3)

Local Python `urllib` diagnostics returned HTTP 403 HTML pages for the three CISA RSS endpoints, while a PowerShell `Invoke-WebRequest` probe previously returned HTTP 200 for two endpoints. On Windows, the refresh script now tries an allow-listed CISA RSS URL through `powershell.exe`/`pwsh` with `-UseBasicParsing` first, then falls back to Python `urllib` if the native request fails. Only those fixed CISA RSS URLs are permitted by the PowerShell helper; other sources continue to use the existing standard-library HTTP client. The code does not mark CISA healthy unless the XML yields usable recent records. On non-Windows runners, Python `urllib` remains the transport; if the upstream denies that client, the source must stay stale/error rather than be falsely marked healthy. The Windows fallback has unit-test coverage but must still be verified with a real local refresh.
