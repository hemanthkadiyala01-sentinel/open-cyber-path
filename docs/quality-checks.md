# OpenCyberPath quality checks (CP-02)

Run these commands from the repository root on Windows PowerShell:

```powershell
python scripts\sync_catalogue.py
python scripts\quality_checks.py
python -m unittest discover -s tests -v

Push-Location website
npm ci
npm run build
Pop-Location
```

`sync_catalogue.py` exports `website/src/data/resources.js` into `data/resources.json`. It is a one-way export: edit the runtime JS catalogue first, then run the sync script. The quality check compares every shared resource field so the mirror cannot silently drift.

## What is checked

- Resource IDs are unique and the JSON mirror matches the runtime JS catalogue.
- Required resource metadata is present, URLs use HTTPS, skill tags are non-empty, and local resource images exist.
- Lab IDs are unique and every referenced PDF, DOCX, dataset, script, worksheet, and illustration exists under `website/public`.
- CSV files have a header and consistent row widths; key exercise files have their expected columns.
- The Windows process-event sample is valid JSON.
- The detection evaluator exits successfully and produces the expected confusion-matrix/metric output for the bundled synthetic CSV.
- A production Vite build completes using the existing `website/package.json` and lockfile.

## What is not checked yet

- External URL availability, licensing/access changes, or live provider terms.
- Browser interaction, responsive visual regression, keyboard navigation, accessibility, or PDF/DOCX visual layout.
- Detection effectiveness on real telemetry. The test dataset is synthetic and the rule is intentionally narrow.
- Backend/authentication security: the current reviewed implementation is a static frontend without learner accounts or stored progress.

The GitHub Actions workflow runs the same local-file checks, Python tests, and production build. A green workflow means those specific checks passed; it is not a security certification.
