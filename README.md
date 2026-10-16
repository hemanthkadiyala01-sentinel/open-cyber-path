# OpenCyberPath

**Discover your path. Learn for free. Build your future.**

OpenCyberPath is a learner-built, community-curated directory of cybersecurity learning resources, hands-on labs, open-source tools, career roadmaps, and job-preparation guidance.

Our purpose is simple: help people find useful cybersecurity learning opportunities that already exist around the world, understand which ones fit their goals and budget, and follow a clearer path from beginner knowledge to practical skills.

We are learners too. We are building this openly so we can learn, contribute, and help others learn alongside us.

## Our principles

- **Accessible by design:** the core directory and our own beginner learning guidance should not require a paid subscription.
- **Honest about cost:** distinguish free learning, open-source software, free tiers, paid extras, and trials.
- **Link to original sources:** send learners to the official resource owner. Do not copy third-party course material without permission.
- **Practice matters:** connect topics to exercises, labs, projects, and evidence of skills.
- **No job guarantees:** provide roadmaps and preparation guidance, not promises of employment or placement.
- **Community-curated:** welcome corrections and contributions, and record when resource details were last checked.
- **Safe and authorised learning:** recommend defensive practice and labs intentionally designed for security training.

## What you can discover here

### Learning resources
Curated links to official documentation, free learning material, community projects, and selected courses from providers around the world.

### Hands-on labs and practice
Resources for SOC analysis, SIEM, detection engineering, networking, Linux, digital forensics, web security, and other cybersecurity topics. Some platforms have a limited free tier or paid extras; listings should say so clearly.

### Career roadmaps
Structured paths that explain what to learn, in what order, how to practise, what to build, and how to prepare for roles such as:

- SOC Analyst
- Detection Engineer
- Digital Forensics / Incident Response Analyst
- Cloud Security Analyst

### Portfolio and job preparation
Ideas for demonstrable projects, investigation reports, résumé preparation, interview practice, and finding relevant entry-level vacancies.

## Start exploring: initial resources

These are starting points, not endorsements. Check each provider's current terms and access requirements before signing up. The access notes below were checked on **2026-10-16** and may change.

| Resource | Useful for | Access notes | Official link |
| --- | --- | --- | --- |
| Wazuh documentation | SIEM, endpoint monitoring, agents, rules, and alerts | The platform is free and open source; documentation is free. Running the full stack needs suitable computer resources. | [Getting started](https://documentation.wazuh.com/current/getting-started/index.html) |
| Splunk free courses | Log analysis, events, fields, dashboards, and Splunk basics | Free learning content is available. Product, certification, and lab access can have separate conditions. | [Free courses](https://www.splunk.com/en_us/training/free-courses/overview.html) |
| Microsoft Learn | Security, cloud, Microsoft tools, and role-based learning paths | Training content is free. Some optional cloud exercises may require an Azure subscription and could incur charges. | [Training](https://learn.microsoft.com/en-us/training/) |
| SigmaHQ rules | Detection engineering and reusable detection logic | Public community repository. Check the repository and individual rule terms before reusing content. | [Sigma rules](https://github.com/SigmaHQ/sigma) |
| MITRE ATT&CK | Adversary tactics, techniques, and defensive analysis | Public knowledge base and learning reference. | [Get started](https://attack.mitre.org/resources/) |
| PortSwigger Web Security Academy | Web security concepts and interactive labs | Free training and labs are available; use the Academy's intended environments. | [Web Security Academy](https://portswigger.net/web-security) |
| OverTheWire Bandit | Linux command-line and security fundamentals | Educational wargame aimed at beginners; requires terminal/SSH access. | [Bandit](https://overthewire.org/wargames/bandit/) |
| OWASP Juice Shop | Web application security practice | Free, open-source deliberately vulnerable application. Run only in a controlled lab you own or are authorised to use. | [Project page](https://owasp.org/projects/juice-shop) |
| TryHackMe free rooms | Guided hands-on cybersecurity exercises | Selected rooms are free; other rooms, features, paths, or certification options may require payment. Account required to use the platform. | [Free rooms](https://tryhackme.com/free-rooms) |

For a machine-readable starter list, see [`data/resources.json`](data/resources.json). Before adding more entries, read [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md).

## Example roadmap: SOC Analyst

This is a learning sequence, not a guarantee of job readiness by a specific date.

1. **Foundations:** networking, TCP/IP, DNS, Windows and Linux basics, files, processes, permissions, and command-line skills.
2. **Logs and events:** learn Windows Event Viewer, Linux authentication logs, timestamps, users, hosts, processes, and structured data such as JSON.
3. **SIEM basics:** understand ingestion, parsing, searching, filtering, dashboards, alerts, and detection rules. Explore Wazuh and free Splunk learning material.
4. **Alert triage:** review evidence, identify what triggered a rule, consider benign explanations, and document what is known versus unknown.
5. **Detection engineering:** write and test rules, include benign and suspicious cases, measure false positives and false negatives, and document limitations.
6. **Incident investigation:** link events to alerts, create a timeline, record findings, and communicate a clear conclusion.
7. **Portfolio:** publish reproducible labs and reports with sanitised evidence, tests, and honest limitations.
8. **Job preparation:** compare your skills against actual entry-level job descriptions, prepare a résumé, practise technical explanations, and apply to suitable vacancies.

The first detailed roadmap is in [`roadmaps/soc-analyst.md`](roadmaps/soc-analyst.md).

## How we classify resource cost

- **Free learning:** the listed learning content is currently available without payment.
- **Open source:** source code is available under a stated licence; hosting or hardware can still cost money.
- **Free documentation:** documentation is public, while a hosted product, lab, or certification might have a cost.
- **Free tier / limited free access:** some content or usage is free, but limits or paid extras apply.
- **Trial / paid:** access is temporary or requires payment; these are not presented as part of the zero-cost path.

For every resource, we aim to record the official link, topics covered, skill level, prerequisites, account requirements, hardware needs, cost classification, and last-verified date.

## Contributing

We welcome corrections and new resource suggestions from learners. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`RESOURCE_VERIFICATION.md`](RESOURCE_VERIFICATION.md) before submitting additions.

## Project status

OpenCyberPath is at an early stage. This repository begins with the mission, an initial resource list, and a starter SOC Analyst roadmap. The next milestone is a simple searchable website with topic, difficulty, and cost filters. The presence of a link does not mean we have independently tested the provider's platform.

## Relationship to other projects

OpenCyberPath focuses on resource discovery and career-learning roadmaps. Our separate [Cyber-Threat-Monitor](https://github.com/hemanthkadiyala01-sentinel/Cyber-Threat-Monitor) project focuses on security event ingestion, detection, and incident investigation. The projects may link to one another but have distinct purposes.

## Disclaimer

OpenCyberPath is a learner-built community project and is not affiliated with or endorsed by the external providers listed. Provider names and trademarks belong to their respective owners. Follow the terms and rules of every external lab. No resource, roadmap, or project guarantees a job.

---

**Learn openly. Practise responsibly. Help the next learner.**
