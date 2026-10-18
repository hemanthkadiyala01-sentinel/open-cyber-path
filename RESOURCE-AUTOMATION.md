# OpenCyberPath weekly resource automation

OpenCyberPath can automatically refresh resource-link reachability and prepare a weekly discovery report. The workflow runs at **09:00 India Standard Time on Mondays** (03:30 UTC), and can also be started manually from GitHub Actions.

## What the weekly workflow does

1. Checks external URLs in the resource directory, curated video list, mapped career-path exercises, official references, and the external links paired with local lab notes.
2. Generates `website/src/data/resourceHealth.generated.json`. Resource cards, video cards, and external-lab cards display the last check result.
3. Reads maintained publisher RSS feeds and looks for recent cybersecurity learning material.
4. If the `YOUTUBE_API_KEY` repository secret is configured, searches YouTube for recent learning videos across OpenCyberPath topics.
5. Writes `website/reports/weekly-resource-review.md` and `.json`, runs the site's static checks/build and repository tests, then commits only the generated health snapshot and review reports to the default branch when they change.

## Important quality boundary

The automatic HTTP probe checks **reachability only**. A successful response does not prove that the page's content is correct, still current, free, safe, or the exact exercise described. HTTP 401/403/429 and temporary/network errors are flagged for manual review rather than automatically considered broken. HTTP 404/410 are shown as possible broken links and should be checked in a normal browser.

New RSS and YouTube findings are **not inserted into the learner-facing catalogue automatically**. They are placed in the weekly review report so a maintainer can verify the creator/provider, useful learning outcome, access model, account requirements, publication date, topic, and safety/authorization guidance. This avoids promoting misleading, paywalled, unrelated, or unsafe entries simply because an automated search found them.

## Enable automatic YouTube discovery

RSS discovery and link-health refresh work without a YouTube API key. To automate YouTube search as well:

1. In Google Cloud Console, create/select a project and enable **YouTube Data API v3**.
2. Create an API key for that project. Restrict it according to Google's current API-key guidance where practical.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**.
4. Name the secret `YOUTUBE_API_KEY` and paste the key as its value. Do not put the key in source code, the catalogue, logs, or a commit.
5. Open **Actions → Weekly resource maintenance → Run workflow** to perform the first run. The normal weekly schedule then uses the same secret.

Official API documentation: <https://developers.google.com/youtube/v3/docs/search/list>

## Enable the workflow

- Commit `.github/workflows/weekly-resource-maintenance.yml` and the accompanying scripts/components to the repository's **default branch**.
- In GitHub, open **Settings → Actions → General** and ensure Actions are enabled and the workflow's repository token is allowed to write to repository contents. The workflow uses a minimum `contents: write` permission to commit its generated snapshot/report.
- If branch protection blocks direct commits from Actions, change the commit step to create a pull request, or allow an approved bot workflow for these generated files. Do not disable branch protection for the whole repository.
- Run the workflow manually once and inspect the summary and reports. A scheduled workflow can be delayed by GitHub's schedule load, and it only runs while Actions is enabled.

## Where to look after each run

- `website/src/data/resourceHealth.generated.json` — current last-check snapshot used by the site's link-status labels.
- `website/reports/weekly-resource-review.md` — human-readable weekly review.
- `website/reports/weekly-resource-review.json` — structured candidate and health data.
- GitHub Actions artifact `open-cyber-path-weekly-resource-review` — downloadable copy of the report for that run.

## Does this deploy the live site?

The workflow updates the repository's generated site data and builds the website. A live public site must also be connected to a deployment host that rebuilds from the default branch. This repository's weekly workflow does not assume a hosting provider or bypass its deployment controls. After setup, confirm that the host redeploys when the generated commit is pushed; if it does not, add a host-specific deploy step once the actual hosting platform is known.

## Run the jobs locally

From the project root:

```powershell
node website/scripts/refresh-resource-health.mjs
python scripts/weekly_resource_discovery.py
cd website
npm run check:static
npm run build
```

The link probe uses Node's built-in `fetch`; the discovery script uses Python's standard library and needs no extra package installation.
