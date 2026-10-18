# Visual refresh changelog — 2026-10-17

## What was fixed

The supplied browser screenshots showed empty artwork areas in the Cloud Security and Security Engineering career cards, and in the AWS/Azure learning resource cards. Inspection found that those components reused `website/public/images/learning/cloud-security-posture.svg`. That SVG contained the unescaped XML character sequence `Data & storage`, so the browser rejected it as malformed artwork.

The SVG now escapes the ampersand correctly. The ten career cards also have independent local concept images, so the route banners now visually distinguish SOC operations, threat hunting, DFIR, AppSec, Cloud Security, GRC, authorized penetration testing, security engineering, threat intelligence, and malware analysis.

## Images and resilience

Ten original AI-generated cybersecurity concept visuals are cropped into local WebP assets with `career-*.webp` names. They are conceptual artwork, not real product screenshots, real network telemetry, or incident evidence. Attribution and limitations are recorded in `website/public/images/IMAGE-ATTRIBUTION.md`.

The `handleArtworkError` handler provides a local foundations-art fallback across the hero, resource, path, lab, notes, path-detail, and attack-concept images. If even the fallback fails, the element is hidden rather than repeatedly retrying a broken path.

## Quotes and learner next actions

A prominent quote panel now appears shortly after the Home page's principle strip and before the career toolkit. It contains a short learning reflection and two direct actions: choose a path or open labs. The longer six-card reflection section retains original OpenCyberPath copy, with a large quotation mark, accent border, readable contrast, and its small actionable next step. No outside quotes are falsely attributed to famous people.

## Notes

The website's existing downloadable note filenames now contain the expanded files:

- `handwritten-style-soc-siem-fundamentals.pdf` — 13 pages, and the matching editable DOCX.
- `common-attack-patterns-beginner-guide.pdf` — 15 pages, and the matching editable DOCX.

## Verification

- `python scripts/sync_catalogue.py` completed and synced 28 resource entries.
- `python scripts/quality_checks.py` passed; includes validation of all local SVGs and quote/image-fallback wiring.
- `python -m unittest discover -s tests -v`: all 10 tests passed.
- TypeScript's TSX parser reported zero parse diagnostics for `App.jsx`; JavaScript data modules reported zero parse diagnostics.
- `tinycss2` reported zero CSS parse errors.
- All 10 career paths use distinct local artwork; all image references found in career, resource, and lab catalogues resolve to local files.

The full Vite production build and interactive browser acceptance tests should still be run on the learner's local repository after merging the overlay. This ZIP intentionally leaves `package.json`, lockfiles, and dependencies to the target repository.
