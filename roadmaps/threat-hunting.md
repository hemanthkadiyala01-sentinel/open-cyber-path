# Threat-hunting learning path

A practice-first route from reading logs to documenting a small hunt. Use the bundled synthetic data before connecting any live telemetry.

## Stage 1 — Foundations
- Learn timestamps, time zones, event IDs, user and host fields, DNS, and authentication outcomes.
- Practise reading JSON and CSV rows.
- Evidence: explain five fields from a sample event.

## Stage 2 — Build a question
- Choose a narrow hypothesis, such as repeated sign-in failures followed by success in the training sample.
- State the time window, expected fields, and one benign explanation before searching.

## Stage 3 — Explore the evidence
- Filter the synthetic CSV, sort by time, and compare user/host/source values.
- Separate observations from assumptions and avoid treating a label as proof.

## Stage 4 — Validate
- Check surrounding events and compare against the sample baseline.
- List missing context, confidence, and a safe next check.

## Stage 5 — Write the report
- Question and scope
- Data source / sample filename
- Filters and time window
- Evidence with event IDs and timestamps
- Alternative explanation
- Limitations and next step

## Resources
- [MITRE ATT&CK](https://attack.mitre.org/)
- [Microsoft threat-hunting overview](https://learn.microsoft.com/en-us/defender-xdr/hunting-overview)
- [KQL overview](https://learn.microsoft.com/en-us/kusto/query)

> The included CSV is synthetic teaching data, not operational telemetry or a measure of real-world threat-hunting performance.
