# OpenCyberPath: currentness and content-update design

## Update methods are not identical

| Area | Update method | What the automation can claim |
|---|---|---|
| Cybersecurity news and advisories | Public RSS / official API refresh every six hours | Headlines and small summaries were collected at the recorded time; follow source links for the original detail |
| LiveOps source radar | Existing LiveOps collector workflow, separate schedule | Source records/candidates were refreshed; candidate != approved challenge |
| Resource and video URLs | Existing weekly resource-health workflow | URL reachability only; not proof that content is current, free, safe, or accurate |
| Certifications and exams | Existing official source watcher / weekly review | Page fingerprints and reachability; issuer terms still require manual verification |
| Learning paths and modules | Editorial review ledger, every 90 days | Automation flags review due; it does not rewrite a syllabus without a reviewer |
| OS and DistroSea catalogue | Editorial review ledger, every 60 days | Catalogue review due date; an old listing is not proof that a live session remains available |
| Video instruction quality | Editorial review ledger, every 30 days | Current-version accuracy must be reviewed separately from link health |
| CTF learning-resource access notes | Editorial review ledger, every 30 days | Review platform access/rules and provider-owned terms; never claim an event is live without a current event data source |
| CyberRange, CTF Arcade and lab fixtures | Editorial review ledger, every 90 days | Rerun answer keys, fixture integrity and reproducible checks |
| Offline study pack | Editorial review ledger, every 180 days and on releases | Refresh the app/cache after a release; an old offline copy cannot self-update without a connection |
| Public cyber-safety guidance | Editorial review ledger, every 30 days | Official reporting/response routes need a human source review |

## Why we do not auto-rewrite every section

Automatically rewriting an answer key, legal/safety instruction, operating-system comparison, or career curriculum from a news feed could introduce incorrect or unsafe guidance. This system automates *discovery, collection, deduplication, timestamps, source status and review reminders*. Human review is still required for accuracy-sensitive editorial updates and challenge publication.

## Scheduled operation

The `opencyberpath-cyberpulse-refresh.yml` workflow runs on the default branch approximately every six hours and can also be run manually from GitHub Actions. GitHub can delay schedules; this is periodic refresh, not guaranteed real-time delivery. The workflow commits the public JSON snapshots only after the collector returns a successful partial/full refresh.

The existing LiveOps workflow and the existing weekly resource-maintenance and certification source-watch workflows are intentionally not replaced. They own their own data products. The freshness dashboard reads their latest generated timestamps where available.

## Source and content policy

- Keep titles, brief summaries, dates, source names and original links; do not republish full articles.
- The Hacker News community feed is a discovery signal, not a verified advisory.
- The collector does not include author/reporter fields in its normalized record schema. A public source link may still identify its author upstream; do not promise anonymity that we cannot enforce.
- Failed sources retain prior records and report stale/unavailable status instead of silently deleting their data.
- The `content-review-ledger.json` dates remain null until a person actually reviews a section. A link check or scheduled sync must not be recorded as an editorial approval.
- Only run external tests within an explicitly authorised scope. The news collector performs GET requests to configured public feed/source endpoints; it does not scan third-party systems.

## Manual commands

```powershell
py -3 tools\cyberpulse\refresh_feeds.py --self-test
py -3 -m unittest tools.cyberpulse.test_refresh_feeds -v
py -3 tools\cyberpulse\refresh_feeds.py
```

Outputs:

- `website/public/data/cyberpulse-feed.json`
- `website/public/data/site-freshness.json`

The static site needs its normal deployment/build step after updated JSON snapshots are committed.
