# OpenCyberPath

**Learn · Practise · Grow Together**

OpenCyberPath is an independent, learner-built guide to cybersecurity learning resources. It helps people with limited budgets find trusted documentation, open-source tools, free learning, practice labs, original notes, and career roadmaps without needing a paid course subscription to get started. Learners still need a compatible device and internet access for many resources, and external providers may have account requirements, free-tier limits, or paid extras.

OpenCyberPath is a community learning project, not a paid course provider or placement company. External products, courses, logos, and platforms belong to their respective providers.

## What is available in this cumulative upgrade

- **Resource directory:** searchable cards with topic icons, skill levels, access labels, account notes, caveats, and links to original providers.
- **Eight-pillar cybersecurity domain map:** explore 31 specialisations across offensive security, defence and operations, engineering and architecture, cloud and modern infrastructure, DFIR and investigations, GRC, emerging advanced domains, and physical/human security. Each entry includes a plain-language definition, safe first step, level, and links to the closest current roadmap. This is OpenCyberPath’s navigation taxonomy, not a claim that these are the official (ISC)² CISSP exam domains; the page links to the official outline and names those domains separately. See [`CYBERSECURITY-DOMAIN-MAP.md`](CYBERSECURITY-DOMAIN-MAP.md).
- **Ten career visions:** SOC Analyst / Blue Team; Threat Hunting & Detection Engineering; DFIR; Application Security & Bug Bounty; Cloud Security; GRC; Penetration Testing & Authorized Red Team; Security Engineering, DevSecOps & IAM; Threat Intelligence & Ethical OSINT; and Malware Analysis & Reverse Engineering. Each route has prerequisites, sequenced modules, safe practice, evidence to keep, and a capstone. See [`TEN-CAREER-VISIONS.md`](TEN-CAREER-VISIONS.md).
- **Labs and notes:** downloadable PDF and editable DOCX guides, including dedicated DFIR evidence-timeline, cloud-posture-review, and GRC risk-register workbooks, plus notebook-inspired notes and topic-specific diagrams.
- **Threat-hunting exercises:** fictional sign-in and DNS datasets for hypothesis building, timeline analysis, and evidence-based notes.
- **Bug-bounty foundations:** scope-review and HTTP-observation exercises designed for official training labs or explicitly authorised targets.
- **Command cheatsheet:** safe local-device, networking, log-review, and learning-path quick references.
- **Attack basics:** plain-language explanations of common security patterns, why they occur, everyday examples, and defensive practices.
- **Tools & films:** 33 learner-curated tool/reference profiles with official links, learning stage, cost/access notes, setup effort, first safe tasks, defensive examples, and misuse risks, plus responsible case studies from *Mr. Robot*, *Hackers* (1995), and *Blackhat* (2015), nine safe training/reference links, and a separate five-source public advisory/incident-reading shelf (CISA, The DFIR Report, ThreatFox, SANS Internet Storm Center, and Cisco Talos). No attack commands are embedded in the page.
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

Open the localhost URL printed by Vite. After applying the current cumulative upgrade, test Home, Resources, Paths, all eight visible pillars, all ten career visions and their detail pages, Labs & notes, and Attack basics; check search and filters, capstones, PDF/DOCX/worksheet downloads, and the Resume, Jobs, Application demo, and Tools & films areas. See [`TEN-CAREER-VISIONS.md`](TEN-CAREER-VISIONS.md), [`CYBERSECURITY-DOMAIN-MAP.md`](CYBERSECURITY-DOMAIN-MAP.md), and [`docs/quality-checks.md`](docs/quality-checks.md).

## Roadmaps and resource verification

- [`roadmaps/learning-tiers.md`](roadmaps/learning-tiers.md) — index of the ten canonical career paths.
- [`roadmaps/soc-blue-team.md`](roadmaps/soc-blue-team.md) — SOC Analyst / Blue Team.
- [`roadmaps/threat-hunting-detection-engineering.md`](roadmaps/threat-hunting-detection-engineering.md) — threat hunting and detection validation.
- [`roadmaps/digital-forensics-incident-response.md`](roadmaps/digital-forensics-incident-response.md) — DFIR evidence and reporting.
- [`roadmaps/application-security-bug-bounty.md`](roadmaps/application-security-bug-bounty.md) — application security and authorised bug-bounty learning.
- [`roadmaps/cloud-security.md`](roadmaps/cloud-security.md) — cloud identity, data, configuration, logging, and recovery.
- [`roadmaps/grc-security-fundamentals.md`](roadmaps/grc-security-fundamentals.md) — risk, control mapping, evidence, and governance.
- [`roadmaps/penetration-testing-red-team.md`](roadmaps/penetration-testing-red-team.md) — authorised testing, scope, findings, and remediation.
- [`roadmaps/security-engineering-devsecops-iam.md`](roadmaps/security-engineering-devsecops-iam.md) — secure design, identity, pipeline controls, and recovery.
- [`roadmaps/threat-intelligence-ethical-osint.md`](roadmaps/threat-intelligence-ethical-osint.md) — ethical public-source research, indicators, and brief writing.
- [`roadmaps/malware-analysis-reverse-engineering.md`](roadmaps/malware-analysis-reverse-engineering.md) — safe static triage and defensive analysis reports.
- [`data/resources.json`](data/resources.json) — machine-readable resource catalogue snapshot.
- [`website/src/data/resources.js`](website/src/data/resources.js) — resource data used by the website.
- [`VIDEO-SOURCES.md`](VIDEO-SOURCES.md) — notes on video links and official documentation references.
- [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) — access labels and link-verification approach.
- [`PUBLIC-DATA-SOURCES.md`](PUBLIC-DATA-SOURCES.md) — documented sources for larger, externally hosted cybersecurity datasets.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to suggest corrections and new resources.

We distinguish open-source tools, free documentation, free learning, free tiers, and variable or paid access. Provider access and pricing can change, so check the official provider's terms before signing up or provisioning cloud resources. We link to third-party materials rather than republishing course content without permission.

## Weekly resource automation

OpenCyberPath can refresh resource-link reachability, discover new material from curated publisher feeds, and review recent YouTube videos every week. See [RESOURCE-AUTOMATION.md](RESOURCE-AUTOMATION.md) for workflow setup, the optional `YOUTUBE_API_KEY` secret, reports, and the boundary between automated discovery and human approval.

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


## v0.6: first six career paths

The first version replaced the old four-card set and generic sample SOC stage list with six canonical role-oriented roadmaps; the cumulative upgrade expands the set to ten. Click **Explore this path** to open a detailed curriculum with prerequisites, learning modules, safe practice, evidence to keep, matched original-provider resources, OpenCyberPath labs, a capstone, and suggested next paths. Generic foundations are included as the starting module in routes that need them rather than represented as a seventh career path.


## v0.7: career-to-application toolkit

The v0.7 cumulative overlay originally kept the six canonical roadmaps; the current cumulative version expands that set to ten and adds a practical route from learning to job applications:

- **Career hub:** ten learner-selectable directions across defensive operations, detection engineering, DFIR, AppSec, cloud, GRC, authorised penetration testing, security engineering/DevSecOps/IAM, ethical OSINT/threat intelligence, and malware analysis; an explainer for white-, black-, grey-, green-, blue-, and red-hat terminology; and a six-stage beginner checklist saved only in the current browser. The hat labels are described as informal and are not presented as six equivalent professions.
- **Resume studio:** edit a beginner resume, preview it, download text/HTML, or print/save as PDF. A small local keyword comparison can help with manual review, but it is not a real ATS and does not predict hiring outcomes. Resume information is kept in browser local storage only when the learner chooses to save it.
- **Jobs hub:** role/location-based outbound searches and links to job platforms and selected employer early-career pages. This is a directory—not a live jobs feed, background-checked vacancy service, or guarantee that a role is open. Always verify the original posting.
- **Application demo and tracker:** practise against a fictional vacancy, use a pre-application checklist, and save personal opportunity notes in this browser. The demo does not send applications or contact employers. The tracker can export a JSON backup.

Start with [`CAREER-TO-CAREER-TOOLKIT.md`](CAREER-TO-CAREER-TOOLKIT.md) and follow [`APPLY-CAREER-TO-CAREER-TOOLKIT.md`](APPLY-CAREER-TO-CAREER-TOOLKIT.md) to merge the cumulative overlay. After applying, run the checks and follow the manual acceptance checklist; the website build still needs to be verified locally with the project's installed dependencies.

**Privacy and trust:** do not put passwords, OTPs, Aadhaar/PAN numbers, or unnecessary identity details into resume drafts or tracker notes, especially on a shared computer. A completed roadmap or portfolio does not guarantee job placement. Practise offensive security only in authorised environments and within the approved scope.


## Handwritten-script reference notebooks

The Notes, Labs & Field Guides library includes two expanded connected-cursive handwritten-script notebooks: **SOC & SIEM Fundamentals** (13-page reference) and **Common Attack Patterns** (15-page reference). Each moves from beginner to intermediate to advanced, defines terms in plain English, uses fictional examples, includes revision exercises and answer checks, and links to official source material. PDF downloads preserve the ruled-paper/script presentation; editable DOCX files are included. Examples are for defensive learning in synthetic data or expressly authorised labs only.

## Tools, threats, and movie case studies

The website now includes a **Tools & films** learning area with 33 curated tool/reference profiles, searchable and filterable by learner goal, and tagged with learning stage, approximate access/cost, setup effort, and a first safe task. It includes official project/documentation links, defensive examples, misuse risks, and case-study lessons from *Mr. Robot*, *Hackers* (1995), and *Blackhat* (2015). A separate reading shelf links to CISA, The DFIR Report, ThreatFox, SANS Internet Storm Center, and Cisco Talos for public advisories and incident context. The page deliberately provides tool literacy without attack commands. Start from the documentation and purpose-built training areas; never test systems without explicit permission and scope. Start with `TOOLS-THREATS-MOVIE-STUDIES.md`; see `TOOLS-CATALOGUE-CURATION.md` for the tool selection rationale and review of the broader submitted list.


## Current cumulative upgrade: eight pillars, ten career visions, and connected-cursive notes

The Paths page begins with a visible grid of all eight learner-oriented cybersecurity pillars, followed by ten selectable career visions. These pillars are our navigation taxonomy, not a representation of the official (ISC)² CISSP exam domains. The ten routes include the original defensive and cross-functional paths plus Penetration Testing & Authorized Red Team, Security Engineering/DevSecOps/IAM, Threat Intelligence/Ethical OSINT, and Malware Analysis/Reverse Engineering.

The updated SOC/SIEM note is 13 pages and the Common Attack Patterns guide is 15 pages. Both PDFs use an embedded connected-cursive script typeface on ruled notebook paper, with explanatory flowcharts/diagrams, plain-language teaching, staged beginner/intermediate/advanced content, safe fictional examples, revision questions, and answer checks. Editable DOCX files are provided alongside the rendered PDFs. These are typeset script notes, not scans of physically handwritten pages.

## v0.8 visual completeness and learner quotes

The latest visual-refresh overlay gives each of the ten career visions distinct local concept artwork and repairs a malformed cloud-security SVG that had caused multiple cloud-related cards to lose their images. Main artwork now has a local fallback to avoid broken-image icons if an asset fails to load. A high-visibility learner quote and two clear next-step actions appear near the top of Home, while the six original OpenCyberPath encouragement cards use stronger pull-quote treatment and action prompts. The website's notes links now point to the expanded 13-page SOC/SIEM and 15-page attack-pattern notebooks. See [`VISUAL-REFRESH-CHANGELOG.md`](VISUAL-REFRESH-CHANGELOG.md).
