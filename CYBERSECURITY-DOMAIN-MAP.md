# OpenCyberPath: Eight-Pillar Cybersecurity Domain Map

## Purpose

This is OpenCyberPath's learner-oriented career-exploration taxonomy. It groups the broad field into eight pillars and 31 specialisations so beginners can explore areas, understand what each one covers, and choose a realistic next learning step.

**Framework note:** These eight pillars are not a verbatim copy of the (ISC)² CISSP Common Body of Knowledge or its eight current CISSP exam domains. The official CISSP exam outline currently lists: Security and Risk Management; Asset Security; Security Architecture and Engineering; Communication and Network Security; Identity and Access Management (IAM); Security Assessment and Testing; Security Operations; and Software Development Security. Check the [official (ISC)² CISSP exam outline](https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline) for current exam information. The OpenCyberPath pillars are intended to make career discovery easier, not to claim official endorsement or exam alignment.

## The eight pillars

1. **Offensive Security & Hacking** — Penetration Testing (network, web application, mobile application, and API); Red Teaming; Bug Bounty Hunting; Exploit Development; Social Engineering. All interactive testing is limited to systems owned by the learner or explicitly covered by written permission and scope. Social-engineering material is framed as detection, consent-based awareness, and authorised assessment—not credential collection or impersonation of real people.
2. **Defensive Security & Operations** — SOC Operations; SIEM & Log Management; Incident Response; Threat Hunting; Threat Intelligence. Learners start from synthetic telemetry, official documentation, and evidence-based triage.
3. **Engineering & Architecture** — Security Architecture; Application Security; Cryptography & Encryption; Identity and Access Management; Endpoint Security. Learners start with diagrams, design reviews, safe local settings, and deliberately vulnerable training applications.
4. **Cloud & Modern Infrastructure Security** — Cloud Security Posture Management; DevSecOps; Container & Kubernetes Security; IoT & Operational Technology Security. Provider labs may create costs; learners must check billing, permissions, and safe boundaries before provisioning resources. Real industrial/OT equipment is not a practice target.
5. **Cyber Detectives & Law (DFIR)** — Digital Forensics; Malware Analysis; Cyber Crime Investigation. Evidence integrity, authorised access, safe sample handling, privacy, and legal process are central.
6. **Governance, Risk & Compliance (GRC)** — Cyber Risk Assessment; Compliance Auditing; Third-Party Risk Management. Framework examples include ISO 27001, SOC 2, GDPR, and HIPAA where relevant; inclusion does not imply one framework applies to every organisation or jurisdiction.
7. **Emerging & Advanced Domains** — AI & Machine Learning Security; Quantum and Post-Quantum Cryptography; Blockchain & Smart Contract Auditing. These are specialist subjects best approached after suitable software, systems, mathematics, or security foundations.
8. **Physical & Human Security** — Data Privacy Management; Security Awareness Training; Physical Security Integration. Learning examples use fictional scenarios, proportionate controls, privacy-aware handling, and consent-based training.

## The eight pillars and the ten career visions

The website's Paths page deliberately shows all **eight pillars in a visible at-a-glance grid** before the detailed expandable specialisation list. Each pillar card opens the related definitions and safe first steps. Under that grid, a separate section shows **ten career visions** as structured, selectable roadmaps.

The ten visions are: SOC Analyst / Blue Team; Threat Hunting & Detection Engineering; Digital Forensics & Incident Response (DFIR); Application Security & Bug Bounty; Cloud Security; GRC & Security Fundamentals; Penetration Testing & Authorized Red Team; Security Engineering, DevSecOps & IAM; Threat Intelligence & Ethical OSINT; and Malware Analysis & Reverse Engineering.

A pillar is a broad area; a career vision is a sequenced training route. They are not one-to-one, and a pillar card linking to the nearest route does not imply that every specialisation already has its own dedicated course. Quantum-related security, physical/OT security, exploit development, and smart-contract auditing are currently exploration topics rather than fully built independent curricula.

## Implementation and checks

- UI data: `website/src/data/cybersecurityDomains.js`
- Paths page: `website/src/App.jsx`
- Styling: `website/src/styles.css`
- Quality checks: `scripts/quality_checks.py`
- Tests: `tests/test_quality_checks.py`

The structural quality checks verify eight pillar IDs, all 31 specialisations, the separately represented official CISSP domain names, non-empty first steps, and links to existing learning paths. They do not establish external-source availability or replace browser testing.
