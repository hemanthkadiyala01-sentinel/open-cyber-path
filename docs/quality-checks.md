# OpenCyberPath quality checks

Run from the repository root:

```powershell
python scripts\sync_catalogue.py
python scripts\quality_checks.py
python -m unittest discover -s tests -v
```

The runtime resource source is `website/src/data/resources.js`; `data/resources.json` is its checked machine-readable mirror. After changing the JavaScript catalogue, regenerate the mirror before running validation.

Current expected snapshot for the ten-vision upgrade:

- 28 curated resources
- 10 canonical career visions
- 14 lab entries with matching PDF/DOCX handouts
- 8 CSV files, including synthetic hunting examples and DFIR/cloud/GRC worksheets
- 10 automated unit tests

Checks cover resource ID parity, required resource metadata, local image paths, lab IDs, document and worksheet references, CSV/JSON structure, the ten canonical career visions and their references, and the deterministic synthetic detection-evaluation output.

These checks do not establish that every external provider URL remains live, do not replace manual browser and accessibility testing, and do not make the synthetic detection results a real-world benchmark.

## Eight-pillar domain map

`python scripts/quality_checks.py` checks `website/src/data/cybersecurityDomains.js` for eight unique pillar IDs, 31 named specialisations, non-empty descriptions and beginner first steps, related-path IDs, and the separately represented official eight-domain CISSP exam list. It checks that the Paths page explains the framework distinction and links the official (ISC)² exam outline. These are structural checks, not browser or external-link monitoring.
