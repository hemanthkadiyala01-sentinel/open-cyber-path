# OpenCyberPath

**Learn · Practise · Grow Together**

OpenCyberPath is an independent, learner-built guide to cybersecurity learning resources. It helps people with limited budgets find trusted documentation, open-source tools, free learning, practice labs, original notes, and career roadmaps without needing a paid course subscription to get started. Learners still need a compatible device and internet access for many resources, and external providers may have account requirements, free-tier limits, or paid extras.

OpenCyberPath is a community learning project, not a paid course provider or placement company. External products, courses, logos, and platforms belong to their respective providers.

## What is available in v0.5

- **Resource directory:** searchable cards with topic icons, skill levels, access labels, account notes, caveats, and links to original providers.
- **Learning paths:** foundations, threat hunting, bug-bounty foundations, and detection engineering, with practical milestones rather than job promises.
- **Labs and notes:** downloadable PDF and editable DOCX guides, with a notebook-inspired visual treatment and clear topic-specific icons.
- **Threat-hunting exercises:** fictional sign-in and DNS datasets for hypothesis building, timeline analysis, and evidence-based notes.
- **Bug-bounty foundations:** scope-review and HTTP-observation exercises designed for official training labs or explicitly authorised targets.
- **Command cheatsheet:** safe local-device, networking, log-review, and learning-path quick references.
- **Attack basics:** plain-language explanations of common security patterns, why they occur, everyday examples, and defensive practices.
- **Video guide directory:** third-party learning links paired with official provider documentation where possible. Videos can become outdated, so prefer current official documentation for version-specific instructions.
- **Published data sources:** links to CIC-IDS2017, CTU-13, and Splunk BOTS v3 with source context, size/citation caveats, and safe starting points.

## Run the website locally

From the repository root, run:

```powershell
cd website
npm ci
npm run build
npm run dev
```

Open the localhost URL printed by Vite. After applying the current v0.5 overlay, test Home, Resources, Learning paths, Labs & notes, and Attack basics; check search and filters, share action, and at least one PDF, DOCX, and sample-data download. The file-copy steps are in [`WEBSITE-V0.5-UPGRADE-GUIDE.md`](WEBSITE-V0.5-UPGRADE-GUIDE.md), and the data/visual explanation is in [`WEBSITE-V0.5-EVIDENCE-AND-VISUALS.md`](WEBSITE-V0.5-EVIDENCE-AND-VISUALS.md).

## Roadmaps and resource verification

- [`roadmaps/learning-tiers.md`](roadmaps/learning-tiers.md) — staged beginner-to-advanced learning milestones.
- [`roadmaps/threat-hunting.md`](roadmaps/threat-hunting.md) — a defensive hunting path.
- [`roadmaps/bug-bounty-foundations.md`](roadmaps/bug-bounty-foundations.md) — scope-first web security learning and report writing.
- [`data/resources.json`](data/resources.json) — machine-readable resource catalogue snapshot.
- [`website/src/data/resources.js`](website/src/data/resources.js) — resource data used by the website.
- [`VIDEO-SOURCES.md`](VIDEO-SOURCES.md) — notes on video links and official documentation references.
- [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) — access labels and link-verification approach.
- [`PUBLIC-DATA-SOURCES.md`](PUBLIC-DATA-SOURCES.md) — documented sources for larger, externally hosted cybersecurity datasets.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to suggest corrections and new resources.

We distinguish open-source tools, free documentation, free learning, free tiers, and variable or paid access. Provider access and pricing can change, so check the official provider's terms before signing up or provisioning cloud resources. We link to third-party materials rather than republishing course content without permission.

## Relationship to Cyber-Threat-Monitor

OpenCyberPath focuses on learning-resource discovery, original learning aids, and skill roadmaps. Our separate [Cyber-Threat-Monitor](https://github.com/hemanthkadiyala01-sentinel/Cyber-Threat-Monitor) project focuses on security-event ingestion, detection, and incident investigation. They are separate projects with different purposes.

## Safety and limitations

- Bundled threat-hunting and detection datasets are synthetic teaching examples, not real telemetry or evidence of operational detection performance.
- Practise web security only in intentionally provided training labs, local isolated applications, or on assets covered by explicit written authorisation and current program scope. Do not test arbitrary public systems, access other people's data, or continue when permission is unclear.
- The commands and examples are for learning on your own device, supplied sample files, and authorised environments.
- A roadmap, lab, certificate, portfolio, or participation in a bounty program does not guarantee employment, freelance income, or bounty rewards.

## Contributing

We welcome learners who want to correct resource listings, add official learning links, and improve roadmaps or original learning aids. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) before proposing additions. Prefer official provider links, explain access conditions, avoid unverified claims, and record when a resource was checked.

**Learn openly. Practise responsibly. Help the next learner.**


## v0.4 visual direction

The website uses topic-specific visual identities rather than one repeated accent: cobalt foundations, coral SOC & SIEM, cyan threat hunting, violet bug bounty, indigo detection engineering, warm-paper handwritten notes, amber command references, and coral defensive-awareness guides. v0.5 adds concept-specific illustrations, data calculated from included sample CSVs, and links to documented public benchmark datasets. See `WEBSITE-V0.5-UPGRADE-GUIDE.md` and `WEBSITE-V0.5-EVIDENCE-AND-VISUALS.md`.

## v0.5 concept visuals and data evidence

The v0.5 overlay adds concept-specific artwork for the learning paths and a homepage evidence panel. That panel reads the bundled CSV training samples in the browser, displays the actual sample rows and label counts, and recalculates a small detection-rule confusion matrix and common metrics using the same narrow rule as the supplied Python evaluator. The underlying data remains explicitly labelled **synthetic training data**; no live telemetry or real-world performance is claimed. See [`WEBSITE-V0.5-EVIDENCE-AND-VISUALS.md`](WEBSITE-V0.5-EVIDENCE-AND-VISUALS.md) before applying the overlay.
