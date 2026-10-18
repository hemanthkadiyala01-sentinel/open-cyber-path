# OpenCyberPath Cumulative Overlay Manifest

This ZIP is a cumulative overlay, not a full repository copy. It includes the eight-pillar map, ten career visions, career-to-application toolkit, connected-cursive study notes, curated security tool catalogue, movie case studies, route documentation, and quality checks. Back up or commit your local repository before merging, and review the files that will be replaced.

## Latest visual refresh

- Fixed malformed `website/public/images/learning/cloud-security-posture.svg`, which was making the Cloud Security, Security Engineering, AWS, and Azure cards appear image-less because they reused the invalid SVG.
- Added ten locally served, concept-specific career banners: SOC/Blue Team, threat hunting, DFIR, AppSec, cloud, GRC, penetration testing, security engineering, threat intelligence/OSINT, and malware analysis.
- Added resilient `onError` image handling to the hero, career, resource, lab, detail, notes, and attack-concept images.
- Added a prominent homepage quote spotlight immediately after the principles strip, with direct next-step buttons, and stronger pull-quote emphasis on the six reflection cards.
- Updated the website's note-download files to the 13-page SOC/SIEM PDF and 15-page Attack Patterns PDF, with matching editable DOCX files.

## Major features

- A visible at-a-glance grid for **all eight cybersecurity pillars**, plus the searchable/expandable map of 31 specialisations and safe first steps. It explicitly distinguishes OpenCyberPath's learning taxonomy from the official (ISC)² CISSP exam domains.
- **Ten selectable career visions:** SOC/Blue Team; Threat Hunting & Detection Engineering; DFIR; Application Security & Bug Bounty; Cloud Security; GRC & Security Fundamentals; Penetration Testing & Authorized Red Team; Security Engineering/DevSecOps/IAM; Threat Intelligence & Ethical OSINT; and Malware Analysis & Reverse Engineering. Each has a curriculum, capstone, and related resources/labs.
- Beginner journey checklist, resume studio, basic keyword review, curated job links, fictional application practice, and browser-local application tracker.
- A Tools & films area with 33 curated tool/reference profiles, safety context, cost/setup notes, safe starter tasks, defensive examples, and film case studies from *Mr. Robot*, *Hackers* (1995), and *Blackhat* (2015).
- **13-page SOC & SIEM notebook** and **15-page Common Attack Patterns guide**, each available as PDF and editable DOCX. PDFs embed a connected cursive script typeface on ruled notebook paper and include five and six diagrams respectively, staged teaching (beginner/intermediate/advanced), fictional examples, exercises, answer checks, and references. These are typeset in a script typeface, not scans of physically handwritten notes.
- Worksheets and PDF/DOCX pairs for DFIR evidence timelines, cloud-security posture reviews, and GRC risk registers.

## Key implementation files

- `website/src/App.jsx` and `website/src/styles.css` — page rendering, visible eight-pillar grid, ten vision cards, and responsive styling.
- `website/src/data/cybersecurityDomains.js` — eight pillars, 31 specialisations, safe first steps, related route mappings, and the distinct official CISSP-domain reference list.
- `website/src/data/careerPaths.js` and `roadmaps/` — ten route curricula and markdown roadmaps.
- `website/src/components/CareerExperience.jsx` and `careerHubData.js` — career-to-application tools.
- `website/src/components/ToolsThreats.jsx` and `tools-threats.css` — 33 tool/reference profiles and movie case studies.
- `website/public/notes/` — paired PDF/DOCX study notes.
- `scripts/quality_checks.py` and `tests/test_quality_checks.py` — Windows-compatible note page-count, diagrams, ten routes, visible eight-pillar grid, catalogue checks, and resource integrity.
- `TEN-CAREER-VISIONS.md`, `CYBERSECURITY-DOMAIN-MAP.md`, `TOOLS-CATALOGUE-CURATION.md`, `TOOLS-THREATS-MOVIE-STUDIES.md` — learner and implementation references.

## Not included

`website/package.json` is retained in the target repository and is not replaced by this overlay; dependency lockfiles, `node_modules`, build outputs, `.git`, credentials, and local environment files are excluded. No GitHub changes are pushed by preparing this ZIP.

## Validation

Validation in the packaging workspace: 10 Python unit tests pass; 25 SVG assets parse; ten career-image references are unique and all local images referenced by the career/resource/lab catalogues exist. JSX was parsed with the TypeScript TSX parser and CSS with `tinycss2`, both without syntax errors. These checks do not substitute for the local Vite production build or browser/accessibility tests.

Run from the repository root: `python scripts/sync_catalogue.py`, `python scripts/quality_checks.py`, and `python -m unittest discover -s tests -v`. Then run `npm ci` and `npm run build` from `website` and manually test the 8-pillar grid, ten career route cards/details, note downloads, responsive layout, and browser-local toolkit features. Structural tests do not replace that local build and browser review.
