# OpenCyberPath learning-journey browser smoke test

Run these checks from `website/` after `npm run dev`. The site should be tested at desktop width and at a narrow mobile viewport. These are manual browser checks; static checks do not prove external destinations work.

## Automated checks

- [ ] `npm run check:static` passes.
- [ ] `npm run build` passes (or use `npm run check` to run both).
- [ ] Optional live reachability review: `npm run audit:links`. Interpret `REVIEW` results manually; providers may block automated checks or require sign-in.

## Start and navigation

- [ ] Home loads without a blank screen or browser-console exception.
- [ ] The hero's **Start learning free** button scrolls to the Start Here guide.
- [ ] Change both Start Here selectors; the recommendation updates and the action opens the selected/recommended career path.
- [ ] Direct path cards and navigation still open all career paths.

## Modules and progress

- [ ] Each path shows its prerequisites and module objectives.
- [ ] Each module shows Learn, Practise, Evidence, three self-reported checkpoints, and a knowledge-check reflection panel.
- [ ] Complete one module's three checkpoints, refresh, return to the same path, and confirm the checkpoints persist in the same browser.
- [ ] Confirm the progress summary changes and the completed state is described as self-reported, not a grade or certification.
- [ ] In a private/incognito session or with storage disabled, confirm the page remains usable even if persistence is unavailable.

## Resource trust and reporting

- [ ] Resource cards retain their original-provider link and display **Report a link or access problem**.
- [ ] Path-mapped external lab cards retain their provider link and have a reporting link.
- [ ] Click a reporting link and confirm GitHub opens a prefilled draft. Do not submit a test issue unless you intend to create one.
- [ ] Open several representative external resources, confirm each matches its label, and note account, payment, region, or access restrictions accurately.
- [ ] For online link audit findings marked `REVIEW`, use a browser to distinguish login or automated-request restrictions from genuine broken links.

## Workbench practice

- [ ] Each of the six fixture missions can be selected.
- [ ] Reveal hints one at a time; switch missions and confirm the hint count resets.
- [ ] Compare a run's output with **Show expected checkpoint and explanation**.
- [ ] Confirm the self-check asks learners to distinguish evidence from conclusions.
- [ ] Confirm labels continue to state that console output is simulated and no local shell/network commands are executed.
- [ ] Export an evidence note and inspect the `.txt` file. Evidence-field refresh persistence is not a required check; learners are told to export notes they want to keep.

## Accessibility and layout

- [ ] Use Tab and Shift+Tab across selectors, buttons, links, checkboxes, and details/summary controls; focus remains visible.
- [ ] At mobile width, confirm no card or control becomes clipped and no unintended page-wide horizontal scroll appears.
- [ ] Reduced-motion preference does not prevent controls from working.
- [ ] The browser console has no uncaught red exceptions after navigating across Home, a path, Resources, Labs, and the Workbench.

## Record results

Record browser/version, viewport width, tested path and module, results, and the exact steps needed to reproduce any failure. Do not include credentials, private logs, or personal data in issue reports.


## Weekly resource health and discovery

- Before the first scheduled workflow run, resource cards should show “Weekly link check pending”.
- After a successful weekly run and deployment, resource, video, and external-lab cards should show a last-check date and one status: link responded, possible broken link, or check access manually.
- Confirm that blocked or transient responses are not automatically shown as broken.
- Remember that an HTTP response does not prove the resource is useful, accurate, current, or free.
- Inspect `website/reports/weekly-resource-review.md` and `.json` in the repository after the workflow run.
- Confirm RSS candidates are included in the report and are not auto-inserted into the learner-facing catalogue.
- If `YOUTUBE_API_KEY` is configured as an Actions secret, confirm the report includes YouTube candidates or a specific API/source error. If it is not configured, the report must state that YouTube discovery was skipped.
- Check the report for feed failures and manual-review links; do not delete a catalogue entry solely because a host blocks automated requests.
