# OpenCyberPath public discovery and site-guide automation

This is a targeted overlay for the existing OpenCyberPath React/Vite project. It does not replace the site, change its theme, or automatically add discovered items to the curated catalogue.

## What this update adds

- A floating **Ask OpenCyberPath** button that appears across the site.
- A site-guide chat that searches the existing local resources, labs, paths, certifications and videos, plus the unified public-discovery snapshot when available.
- One scheduled public-discovery refresh that produces `website/public/data/opencyberpath-discovery.json` and `website/public/data/opencyberpath-automation-status.json`.
- Public GitHub repository candidates, Remote OK cybersecurity-related job listings, upcoming CTFtime events, and consolidation of existing CyberPulse news/advisories, YouTube discoveries and RSS-learning candidates.
- Optional API connectors for Reddit public search, X recent public search, Instagram hashtag-scoped media, and LinkedIn posts from an explicitly authorized organization.
- Tests for URL safety, deduplication, privacy omissions and permission-gated connectors.

## Install locally

1. Extract this package into Downloads.
2. Open PowerShell and move to your existing project root (`C:\Users\dell\Downloads\open-cyber-path`).
3. Run the included installer:

   ```powershell
   Set-Location "$HOME\Downloads\open-cyber-path"
   py -3 "$HOME\Downloads\open-cyber-path-automation-update\apply_opencyberpath_automation.py"
   ```

   If Windows extracted the package with a suffix such as `(1)`, use the actual extracted path printed by `Get-ChildItem "$HOME\Downloads" -Recurse -Filter apply_opencyberpath_automation.py`.

4. First validate the new files and build the site:

   ```powershell
   py -3 tools\opencyberpath_automation\refresh_discovery.py --self-test
   py -3 -m unittest discover -s tests -v
   py -3 scripts\quality_checks.py
   Set-Location .\website
   npm run build
   ```

5. To fetch a local snapshot (requires internet access from your computer), return to the repository root and run:

   ```powershell
   Set-Location "$HOME\Downloads\open-cyber-path"
   py -3 tools\opencyberpath_automation\refresh_discovery.py
   ```

   The fetcher is best-effort: some providers can be blocked or unavailable. Failures appear in the status JSON; existing snapshots are retained as candidates where reasonable.

## Enable scheduled automation

Commit/push the added `.github/workflows/opencyberpath-public-discovery.yml` and source files to the default branch, then open **GitHub → Actions → OpenCyberPath public discovery refresh → Run workflow**. The workflow can commit only the two generated public JSON snapshots. Existing daily YouTube/resource discovery and six-hour CyberPulse workflows remain separate and unchanged.

The GitHub Action runs every six hours. GitHub scheduled events can be delayed. The combined feed reads the most recently generated snapshots from existing workflows; it does not force all other workflows to start in a fixed order.

## Optional provider configuration

Never place tokens in React code, JSON output, the source config file or committed `.env` files. Use repository Actions **Secrets** for secrets and **Variables** for non-secret settings.

| Provider | Repository secret / variable | Notes |
|---|---|---|
| GitHub | Uses the workflow's built-in `GITHUB_TOKEN` | Finds public repositories; it does not clone or execute code. |
| YouTube | Existing `YOUTUBE_API_KEY` secret | The existing daily YouTube job provides video discoveries. API quota applies. |
| Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` | Requires approved app/API access and compliance with Reddit's current terms. Use an authorized site-administrator account; do not bypass eligibility or access requirements. |
| X | `X_BEARER_TOKEN` | Recent Search depends on the actual API plan, token permissions and quota. |
| Instagram | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_IG_USER_ID`; optional variable `INSTAGRAM_GRAPH_API_VERSION` (defaults to `v24.0`) | Hashtag-scoped discovery requires eligible account setup and approved Graph API permissions. It cannot index every Instagram post. |
| LinkedIn | `LINKEDIN_ACCESS_TOKEN`; variable `LINKEDIN_ORG_URN`; optional variable `LINKEDIN_VERSION` (defaults to `202607`) | Only an explicitly authorized organization-scoped feed is attempted. Standard API access does not provide unrestricted global public-post search. |

If optional secrets are absent, the connector is reported as needing access; it does not scrape around login, API or permission controls. Configure platform credentials only when the owner/admin is eligible and the intended use is approved.

## What is and is not automated

Automated, best-effort discovery is implemented for GitHub repository search, Remote OK jobs, CTFtime events, existing CyberPulse public news/advisories, and existing YouTube/publisher-feed snapshots. Reddit and X search run only if valid approved credentials work. Instagram is hashtag scoped and LinkedIn is organization scoped. Global coverage of every post on every platform is not technically or contractually possible.

Every generated result is marked as a public-source candidate, not as endorsed, independently verified, or guaranteed safe. Jobs must be rechecked for eligibility and deadlines. Repository licences, release integrity, dependencies and README instructions must be reviewed. The scripts do not run discovered repositories, scan targets, apply for jobs, or publish discovered data into the trusted resource catalogue automatically.

The site-guide chat is an in-site navigation and indexed-search helper, not a desktop-control agent or a hosted generative-AI service. It searches data shipped with the current deployment and points to original sources. A future server-side search/LLM endpoint and authenticated user profiles would be separate integrations; this overlay does not invent those capabilities.
