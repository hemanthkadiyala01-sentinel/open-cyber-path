# SOC Analyst / Blue Team roadmap

**Purpose:** Learn to read security telemetry, triage alerts, and communicate an evidence-based defensive decision. This is a self-study path, not a job promise.

**Prerequisites:** No prior cybersecurity job is needed. Begin with basic file handling, networking ideas, and operating-system concepts; the first module includes them.

## Modules

1. **Build just enough foundations** — TCP/IP, DNS, HTTP, ports, users, processes, files, and permissions. Practise explaining one DNS lookup and labelling a sample event.
2. **Read security telemetry** — timestamps, hostnames, users, process names, outcomes, event sources, and the difference between an event, alert, and incident. Annotate fictional process and sign-in records.
3. **Learn a SIEM workflow** — ingestion, parsing, searching, filtering, rules, dashboards, alert grouping, and source-event traceability. Use official Wazuh documentation or free Splunk learning content; a full SIEM installation is optional.
4. **Triage with competing hypotheses** — identify the rule trigger, find source evidence, list plausible benign explanations, and name evidence gaps. Write a clear triage note.
5. **Communicate the outcome** — build a timeline, explain severity and escalation, sanitise sensitive information, and create a reproducible handoff.

## Capstone

Investigate a fictional endpoint alert using the supplied training data. Submit annotated fields, a UTC timeline, the evidence references, a reasoned disposition, unknowns, and safe next checks.

## Suggested resources and practice

- [Wazuh getting started](https://documentation.wazuh.com/current/getting-started/index.html)
- [Splunk free courses](https://www.splunk.com/en_us/training/free-courses/overview.html)
- [Microsoft Learn: Sentinel and KQL](https://learn.microsoft.com/en-us/training/paths/sc-200-utilize-kql-for-azure-sentinel/)
- OpenCyberPath: SOC & SIEM fundamentals notebook; Windows process-event triage; detection evaluation; zero-budget environment guide.

**Evidence standard:** Include setup, sample-data source, steps, results, limitations, and what you actually understand. Do not present synthetic data as real telemetry or claim a job outcome.
