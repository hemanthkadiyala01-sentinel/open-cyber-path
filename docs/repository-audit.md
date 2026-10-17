# OpenCyberPath repository audit

**Audit date:** 2026-10-17
**Scope:** The OpenCyberPath v0.5 source overlay and the repository review supplied with this task.
**Status:** Baseline audit; not a penetration test or a production-readiness certification.

## Executive summary

OpenCyberPath is a static React/Vite learning-resource directory with original educational material, structured learning paths, local synthetic datasets, and a small detection-evaluation exercise. The direction is useful for learners who need a clear, low-cost path into cybersecurity. The highest-value next work is reliability, catalogue consistency, and automated checks—not adding a backend or AI features prematurely.

The separately supplied review rated the uploaded snapshot **7/10** and estimated the prototype at roughly **65%** of a basic learning-platform concept and **30%** of a broader planned platform. Those are qualitative reviewer estimates, not measured quality scores or formal task-completion metrics.

## What is evidenced in the reviewed v0.5 source

| Area | Source evidence | Assessment |
|---|---|---|
| Resource catalogue | `website/src/data/resources.js` and `data/resources.json` | 19 resources, searchable/filterable in the website; fields include provider, level, access type, account note, explanation, and source URL. |
| Catalogue consistency | Shared IDs exist in both catalogues | Shared descriptive/access fields drifted in the reviewed bundle. This overlay synchronises the JSON mirror to the runtime JS catalogue and adds a parity check. |
| Learning paths | `roadmaps/learning-tiers.md`, `roadmaps/threat-hunting.md`, `roadmaps/bug-bounty-foundations.md` plus UI path data | Foundations, threat hunting, bug-bounty/web security, and detection engineering have explicit learning directions. More role-specific paths such as DFIR, cloud security, and threat intelligence remain future work. |
| Labs and notes | `website/src/data/labs.js` and `website/public/notes/` | 11 lab/note catalogue entries; local PDF/DOCX learning materials are referenced from the UI. The quality check verifies referenced files exist. |
| Synthetic datasets | `website/public/labs/*.csv` and `windows-process-creation-samples.json` | Includes fictional authentication/DNS samples, bug-bounty worksheets, and detection evaluation cases. They must remain labelled as educational sample data. |
| Detection evaluator | `website/public/labs/evaluate-detection-cases.py` | Evaluates a narrow PowerShell encoded-command heuristic. It is not a general malware detector. |
| External research datasets | Resource cards for CIC-IDS2017, CTU-13, and Splunk BOTS v3 | The site links to original sources; the large external datasets are not bundled as local telemetry. Their age, labels, setup, and testbed limitations must be documented. |
| Safety and access messaging | Resource notes and learning materials | Scope-first bug-bounty guidance and caveats around free tiers/cloud costs are useful and should be preserved. |

## Observed synthetic detection result

The bundled evaluation dataset has 9 labelled rows, with 1 ambiguous row excluded. Its expected teaching result is:

| Metric | Result |
|---|---:|
| True positives | 2 |
| False positives | 1 |
| True negatives | 4 |
| False negatives | 1 |
| Accuracy | 75.0% |
| Precision | 66.7% |
| Recall | 66.7% |
| Specificity | 80.0% |
| F1 | 66.7% |

These numbers describe only the bundled synthetic cases and this narrow heuristic. They are not real-world detection performance estimates.

## Important limits of this audit

The overlay intentionally does **not** include the repository's existing `website/package.json`, lockfile, `.git` metadata, or deployment settings. Therefore this audit does not independently verify package versions, commit history, deployed behavior, production build status, or GitHub settings. A CI workflow is added by this patch, but it has not been run on the user's GitHub repository from this environment.

The current frontend is static. The reviewed source does not evidence a database, authentication, persisted learner progress, bookmarks, or access-control policies. Those are **not implemented/evidenced yet**, not confirmed security vulnerabilities. External resource URLs are checked for HTTPS shape, not fetched live; a syntactically valid URL can still be unavailable or outdated.

## Prioritised gaps

### P0 — Repository baseline and quality checks

1. Keep this audit in `docs/repository-audit.md` and update it when the architecture changes.
2. Run `npm ci` and `npm run build` on the repository's actual package/lockfile.
3. Add an automated workflow for the build, resource/catalogue checks, CSV/JSON validation, and the bundled evaluator smoke test.
4. Preserve reproducible output and state exactly which checks do and do not run.

### P1 — Catalogue maintenance

The website uses `website/src/data/resources.js` at runtime. For now, `data/resources.json` is a machine-readable mirror generated from that runtime source. Run `python scripts/sync_catalogue.py` after modifying the JavaScript catalogue, and require the quality check to pass before pushing. The longer-term architecture can move to a single canonical catalogue once the import/build constraints are evaluated.

### P1 — Evidence-led learning modules

For each advanced case study, retain source dataset attribution, a clear hypothesis, steps, expected results, uncertainty/limitations, and a short report template. Do not mix external data into locally calculated metrics unless the importing and evaluation process is reproducible.

### P2 — Accessibility and browser behavior

Manual checks still needed: keyboard-only navigation, visible focus, sensible heading order, contrast, reduced-motion preferences, small-screen layouts, actual file downloads, search/filter behavior, and browser-console errors. This initial CI workflow does not replace UI or accessibility tests.

### P2 — Broader paths and learner features

After the current catalogue and lab experience is reliable, add complete role-specific paths (for example DFIR, cloud security, and threat intelligence), reusable modules/prerequisites, then decide whether progress/bookmark persistence warrants a backend.

## Acceptance criteria for CP-01 and CP-02

- [x] Baseline findings and limitations are written down.
- [x] Resource JSON and runtime JS catalogues are compared field-by-field.
- [x] Resource URL shapes, IDs, local images, lab references, and sample files are validated.
- [x] The narrow detection evaluator is executed against the bundled CSV and its expected results are asserted.
- [x] GitHub Actions is configured to build and run validation on pushes and pull requests to `main`.
- [ ] The workflow has run successfully on the live repository.
- [ ] Browser-level and accessibility checks have been added.
