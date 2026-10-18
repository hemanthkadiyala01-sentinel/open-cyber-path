# Digital Forensics & Incident Response (DFIR) roadmap

**Purpose:** Preserve evidence context, construct timelines, correlate host and identity events, and write a defensible incident report.

**Prerequisites:** Basic file handling and operating-system concepts. The starter route uses supplied synthetic records; forensic software is optional.

## Modules

1. **Scope before touching evidence** — define authority, purpose, exclusions, time window, and source types. Use only supplied or explicitly authorised evidence.
2. **Preserve provenance and integrity** — record evidence ID, source, collector, received time, handling notes, and hashes where appropriate. Keep original material intact and analyse a working copy.
3. **Normalise and correlate time** — record UTC/time-zone assumptions; correlate records by timestamp, host, user, process, and source reference without assuming a match proves causation.
4. **Reason through an incident** — separate observed facts, hypotheses, and unknowns. Understand triage, containment considerations, escalation, recovery, and the limits of supplied evidence.
5. **Write the forensic report** — document scope, methods, source references, timeline, findings, limitations, and recommended next checks; redact secrets and personal data.

## Capstone

Complete the DFIR Evidence Register & Timeline workbook using fictional records. Deliver an evidence register, timestamped timeline, fact/hypothesis/unknowns table, and concise report that another learner can reproduce.

## Suggested resources and practice

- [NIST incident response lifecycle resources](https://csrc.nist.gov/Projects/incident-response/life-cycle-resources)
- [Autopsy digital forensics platform](https://www.autopsy.com/)
- [CyberDefenders blue-team labs](https://cyberdefenders.org/blue-team-labs/)
- OpenCyberPath: DFIR evidence register and timeline; Windows process-event triage; DNS timeline.

**Safety and evidence:** This is an educational workflow, not professional advice or a legal chain-of-custody certification. Do not inspect another person's device or data without explicit authority.
