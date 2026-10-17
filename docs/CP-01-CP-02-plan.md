# CP-01 / CP-02 delivery note

## CP-01 — Repository audit

Deliverable: `docs/repository-audit.md`.

This report separates items observed in source files from things that remain unverified. It documents the static-front-end boundary, duplicate catalogue risk, synthetic-data scope, missing backend/learner persistence, and manual accessibility/browser checks that remain.

## CP-02 — Quality checks and CI

Deliverables:

- `scripts/quality_checks.py` — dependency-free integrity and evaluator smoke checks.
- `scripts/sync_catalogue.py` — updates the JSON catalogue mirror from the runtime JS data.
- `tests/test_quality_checks.py` — Python unit tests for the quality checker.
- `.github/workflows/quality.yml` — runs dependency install, production build, catalogue/lab checks, and Python tests.

## Completion definition

The patch files are prepared, and local structural checks should pass against the v0.5 source overlay. CP-02 is not considered complete until the user applies the overlay, runs the commands locally, and observes a successful GitHub Actions workflow on the real repository.
