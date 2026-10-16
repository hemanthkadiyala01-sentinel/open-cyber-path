# OpenCyberPath

**Discover your path. Learn for free. Build your future.**

OpenCyberPath is a learner-built directory of cybersecurity learning resources, hands-on labs, beginner-friendly notes, and career roadmaps. It helps students discover resources that already exist around the world, understand their access conditions, and follow a clearer path from foundational knowledge to practical skills.

We are learners too. This is an independent community project, not a paid course provider or placement company. The core directory and our original learning aids are intended to be usable without a paid subscription. Students still need a computer and internet access for many resources, and some external platforms have limits or paid extras.

## What is available

- **Resource directory:** searchable resource cards with category, level, access type, account needs, and links to official providers.
- **Learning tiers:** Beginner, Intermediate, and Advanced tracks, plus a SOC Analyst roadmap.
- **Labs & notes:** original PDF and DOCX notes, including notebook/handwriting-inspired beginner notes, Windows process-event triage, detection evaluation, zero-budget lab setup, and advanced detection tuning.
- **Sample cases:** clearly labelled synthetic JSON/CSV records for safe practice.
- **Detection-evaluation exercise:** a small Python script that applies a narrow sample rule and calculates TP, FP, TN, FN, accuracy, precision, recall, specificity, and F1.
- **Video guide directory:** curated third-party YouTube tutorials/provider-linked webinars paired with official documentation. Videos may be older; current official documentation takes precedence for product-version steps.
- **Career planning:** learning steps and portfolio milestones for SOC Analyst and related roles.

## Run the website locally

From the repository root:

```powershell
cd website
npm ci
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). To create a production build, run `npm run build` from the `website` directory.

## Try the labs

Open the **Labs & notes** section of the website and download the PDF/DOCX handouts or sample data. To run the detection-evaluation script from the `website` directory:

```powershell
python public/labs/evaluate-detection-cases.py public/labs/detection-evaluation-cases.csv
```

The bundled data is synthetic and designed for education. The rule and labels are deliberately small and manually curated; their metrics are **not** estimates of real-world detection performance. The advanced exercise asks learners to modify one rule condition and compare the precision/recall trade-off.

## Learning roadmaps

- [`roadmaps/soc-analyst.md`](roadmaps/soc-analyst.md) — foundations through job preparation.
- [`roadmaps/learning-tiers.md`](roadmaps/learning-tiers.md) — beginner, intermediate, and advanced milestones.

## Resource catalogue and verification

- [`data/resources.json`](data/resources.json) — machine-readable catalogue snapshot.
- [`website/src/data/resources.js`](website/src/data/resources.js) — resource data used by the website.
- [`VIDEO-SOURCES.md`](VIDEO-SOURCES.md) — notes about the curated video links and their official documentation references.
- [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) — approach to access labels and link checks.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to suggest corrections and new resources.

We distinguish free learning, open-source tools, free tiers, free documentation, and paid extras. Provider access and pricing can change, so check the official provider's terms before signing up or provisioning cloud resources. We link to third-party materials rather than copying course content without permission.

## Relationship to Cyber-Threat-Monitor

OpenCyberPath focuses on learning-resource discovery and career roadmaps. Our separate [Cyber-Threat-Monitor](https://github.com/hemanthkadiyala01-sentinel/Cyber-Threat-Monitor) project focuses on security event ingestion, detection, and incident investigation. The two projects have distinct purposes and can link to each other.

## Safety and limitations

Only use systems and labs you own or are authorised to access. Intentionally vulnerable applications must remain isolated. No course, roadmap, lab, certificate, or project guarantees employment. OpenCyberPath is not affiliated with the external providers listed; their names and content belong to their respective owners.

## Contributing

We welcome learners who want to correct resource listings, add official learning links, or improve roadmaps. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) first.

**Learn openly. Practise responsibly. Help the next learner.**
