# SOC Analyst roadmap: beginner to job preparation

This is a self-study guide, not a promise of employment. Progress depends on practice, prior knowledge, time, hardware access, and the requirements of specific roles. All core learning should have a zero-cost route wherever practical.

## Stage 1 — Computer and networking foundations

**Learn:** operating-system basics; files, processes, users and permissions; TCP/IP; ports; DNS; HTTP/HTTPS; basic Windows and Linux command line.

**Practise:** explain a DNS lookup, inspect local network settings, navigate Linux directories, and read simple command output.

**Evidence to keep:** concise notes and a small troubleshooting checklist.

## Stage 2 — Logs and telemetry

**Learn:** timestamps and time zones, event IDs, hostnames, users, process names, command lines, authentication logs, and JSON fields.

**Practise:** inspect sample Windows process-creation and authentication events; read Linux authentication logs; identify source, time, subject, action, and outcome.

**Evidence to keep:** an annotated log-analysis report using sample or sanitised data.

## Stage 3 — SIEM concepts

**Learn:** log ingestion, parsing/normalization, search, filters, detection rules, alert severity, dashboards, retention, and the distinction between an event and an alert.

**Practise:** use free official Wazuh documentation and Splunk learning material. Use sample datasets if the full stack is too demanding for your computer.

**Evidence to keep:** saved queries or rule explanations and a diagram of the data flow.

## Stage 4 — Alert triage

For each practice alert, answer:

1. What exactly triggered the rule?
2. Which source event and fields support the alert?
3. What benign explanation could account for the same behaviour?
4. What evidence is missing?
5. What should be checked next, within an authorised environment?
6. What can be concluded, and what remains uncertain?

**Evidence to keep:** one clear triage note per completed case.

## Stage 5 — Detection engineering

**Learn:** detection logic, log-source requirements, Sigma concepts, MITRE ATT&CK mapping, test fixtures, false positives/false negatives, precision and recall.

**Practise:** test each rule against benign, suspicious, edge, and malformed events. Document expected outcomes before interpreting the results. Do not treat a match as proof of malicious intent.

**Evidence to keep:** a rule, its test cases, test output, evaluation summary, limitations, and version history.

## Stage 6 — Incident investigation and reporting

**Learn:** event timelines, alert-to-event traceability, host-based correlation, severity reasoning, evidence preservation, and concise incident communication.

**Practise:** investigate a labelled case from source events through alerts and final disposition using a training dataset or an authorised lab.

**Evidence to keep:** a sanitised report describing scope, evidence, timeline, decision, and remaining unknowns.

## Stage 7 — Portfolio

Aim to publish two or three small, complete projects rather than many unfinished ones. Each project should include setup instructions, sample data or a reproducible test, screenshots where useful, expected results, limitations, and a README a reviewer can follow.

## Stage 8 — Job preparation

- Review actual entry-level job descriptions and map requirements to evidence in your portfolio.
- Practise explaining logs, networking, SIEM concepts, detection logic, false positives, and investigation decisions without memorised scripts.
- Prepare a focused résumé and a short demonstration of one project.
- Apply to suitable roles and internships; learn from interviews and update the roadmap as skill gaps become clear.

## Suggested resource starting points

- [Wazuh Getting Started](https://documentation.wazuh.com/current/getting-started/index.html)
- [Splunk free courses](https://www.splunk.com/en_us/training/free-courses/overview.html)
- [Microsoft Learn](https://learn.microsoft.com/en-us/training/)
- [SigmaHQ rules](https://github.com/SigmaHQ/sigma)
- [MITRE ATT&CK resources](https://attack.mitre.org/resources/)

Check each resource's current access terms and hardware requirements. Cloud exercises may have costs even when learning documentation is free.
