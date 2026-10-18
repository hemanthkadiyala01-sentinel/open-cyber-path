# Certification intelligence and source monitoring

## What the adviser does

The Career Path Adviser uses explicit role profiles to order learning resources, candidate credentials and portfolio evidence. It adapts the starting point to the learner's stated experience and budget preference. The 40-hour first study block is a planning assumption, not an issuer-defined requirement. The catalogue does not promise that a particular credential guarantees a job or a faster placement.

The role profiles are curated guidance, not real-time vacancy counts. Before describing a skill as demanded by a specific employer, collect and review dated job-posting evidence from a permitted data source. Do not fabricate demand percentages or scrape a source contrary to its terms.

## What the source monitor does

`.github/workflows/certification-source-watch.yml` is configured to run daily and can also be started manually. On each run, `scripts/watch-certification-sources.mjs` extracts unique HTTPS URLs from the certification catalogue, requests public pages with a small concurrency limit, records HTTP reachability, title, ETag / Last-Modified headers and a content fingerprint, then writes `public/data/certification-source-status.json`.

A changed fingerprint is a **review signal**, not a claim that a fee, exam code, syllabus or enrollment state changed in a particular way. The monitor does not submit forms, sign in, bypass rate limits, reserve exam appointments or access provider accounts. `blocked`, `unreachable` and `review-required` are intentionally different from “closed.”

The workflow commits the refreshed JSON report to the default branch and opens or comments on a GitHub issue when a page changes or verification state transitions. For the scheduled pipeline to run, merge the workflow to the repository's default branch and ensure repository Actions settings permit the workflow's `GITHUB_TOKEN` to write repository contents and issues. Scheduled GitHub workflows run against the default branch; timing can be delayed during busy periods.

## What it cannot automatically know

A provider page responding does not prove that exam registration is open, that a voucher promotion has remaining capacity, or that an appointment seat exists in a particular country or city. Booking may depend on sign-in, exam delivery mode, account eligibility and regional availability. The website therefore continues to direct learners to the provider's official booking page when real availability is not published in a reliable public feed.

For a specific official page that changed after review:

1. Open the issuer page and confirm exam code/version, outline effective date, eligibility, local fee, voucher rules, renewal and scheduling details.
2. Review the result for that credential in the source report.
3. From `website/`, acknowledge the current page fingerprint only after review:

   ```powershell
   npm run ack:certification-source -- --url "https://exact-official-url-from-the-report"
   ```

4. Commit the resulting report change so the acknowledged state is retained on the repository's default branch.

An acknowledgement suppresses alerts for that exact page fingerprint; it does not prove that the provider facts were accurate. If the page changes again, it requires review again.

## Run locally

From `website/`:

```powershell
npm run check:career-intelligence
npm run monitor:certification-sources
```

The monitor requires public-network access and may take a minute. It should not run as part of the fast static/build check. After editing the report or acknowledging a source, inspect `git diff` before committing. Do not include Android/Capacitor files in a website-only commit.
