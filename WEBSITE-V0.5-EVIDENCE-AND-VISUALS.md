# OpenCyberPath v0.5 — Concept-specific visuals and evidence

## What changed

- Replaced repeated abstract path-card artwork with concept-specific imagery: network infrastructure for foundations, an analyst reviewing authentication/DNS timelines for threat hunting, a purple web-testing workspace for bug bounty, and a blue-violet analytics workspace for detection engineering.
- Added a warm, paper-led notebook SVG with readable labels for event, context, evidence, and decision; reduced photo overlays so the visual subjects stay visible instead of being washed into one green tint.
- Added a purpose-built HTTP request/response diagram for the safe web-security lab.
- Added a five-day CIC-IDS2017 experiment-schedule timeline based on the original University of New Brunswick / Canadian Institute for Cybersecurity dataset page. It shows the published dates and attack categories, not invented counts or a live threat feed.
- Added an interactive homepage evidence section. It fetches `public/labs/threat-hunt-auth-dns-samples.csv` and `public/labs/detection-evaluation-cases.csv`, parses the CSVs, and computes sign-in/DNS counts, labels, a confusion matrix, and metrics from the same narrow sample rule used by the included Python evaluator.
- The screenshots and photos are illustrative artwork. The numeric chart and table values come from the local CSV files; all bundled examples are synthetic training data, not live telemetry or claims about real-world attack rates.

## Sample outcomes currently in the bundled files

From `threat-hunt-auth-dns-samples.csv`: 10 rows, 6 failed sign-ins, 2 successful sign-ins, 2 DNS events; label counts are 5 benign, 4 suspicious, and 1 ambiguous.

From `detection-evaluation-cases.csv`, using the included narrow rule: 8 scored cases and 1 ambiguous case excluded; TP=2, FP=1, TN=4, FN=1; accuracy=75.0%, precision=66.7%, recall=66.7%, specificity=80.0%, F1=66.7%. These metrics are only a teaching demonstration and are not a real-world performance estimate.

## Validate locally

From `website/` run:

```powershell
npm ci
npm run build
npm run dev
```

On the homepage, verify the evidence table loads and the metrics agree with:

```powershell
python public/labs/evaluate-detection-cases.py public/labs/detection-evaluation-cases.csv
```

Also test search/filters, learning paths, at least one PDF and DOCX download, sample CSV download, and the bug-bounty and threat-hunting worksheets.

## Future live data

Do not silently replace synthetic samples with invented metrics. To show real observations, connect an explicitly authorised data source, document the collection window and fields, minimise personal information, and retain a reproducible sample or query. Until that exists, keep the **SYNTHETIC TRAINING DATA** labels visible.


## Published data sources

The website also includes original-provider links for CIC-IDS2017, CTU-13, and Splunk BOTS v3. They are separate from the local synthetic CSV panel. See [`PUBLIC-DATA-SOURCES.md`](PUBLIC-DATA-SOURCES.md) for source notes, benchmark context, caveats, and citation details.
