# Career Path Adviser and source-monitor smoke test

## Adviser

- [ ] Change target role and confirm the recommended credential sequence changes.
- [ ] Change the starting point from new to IT fundamentals and hands-on; confirm early stages are reprioritised.
- [ ] Select “Free learning first”; confirm paid exams are marked for later rather than described as free.
- [ ] Select different weekly study hours; verify the displayed first-study-block plan recalculates and is clearly marked as illustrative.
- [ ] Open each recommended credential and check that issuer, outline and preparation links work.
- [ ] Confirm each role shows at least three role skills and three concrete portfolio evidence suggestions.
- [ ] Check narrow mobile layout, keyboard navigation and select labels.

## Source monitor UI

- [ ] Before the first workflow run, the page says it is awaiting the first scheduled check.
- [ ] After an automation run, URL count, latest run and reachability values match `public/data/certification-source-status.json`.
- [ ] A changed page is labelled for review, not assumed to mean registration is open.
- [ ] Blocked or unreachable provider pages are not labelled as closed.
- [ ] A credential detail displays the source-check time and states that seat availability is not verified.

## Automation

- [ ] Run `npm run check:career-intelligence` and `npm run check` from `website/`.
- [ ] Run `npm run monitor:certification-sources` with public network access.
- [ ] Inspect the generated JSON diff and verify that the monitor didn't infer cost or enrollment facts from the fingerprint.
- [ ] After merging the workflow to the default branch, run **Certification Source Watch** manually from GitHub Actions.
- [ ] Confirm repository Actions settings allow `GITHUB_TOKEN` to update repository contents and issues.
- [ ] If an alert is created, review the provider manually before acknowledging it.

The monitor checks public page reachability/content-change signals. It is not a booking API, does not sign into exam portals, and cannot confirm region-specific appointment inventory.
