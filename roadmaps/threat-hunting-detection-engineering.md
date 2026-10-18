# Threat Hunting & Detection Engineering roadmap

**Purpose:** Turn a question about suspicious activity into a testable hunting hypothesis, then create and evaluate a narrow detection. This path combines the previous threat-hunting and detection-engineering content to remove overlap.

**Prerequisites:** Basic network concepts, timestamps, log fields, and command-line familiarity. If those are unfamiliar, start with the relevant foundations modules inside the SOC path.

## Modules

1. **Define the hunt** — write a falsifiable question, possible benign explanations, time window, and required fields. Treat MITRE ATT&CK as a vocabulary, not proof that a technique occurred.
2. **Check data coverage** — map the hypothesis to available event sources and fields. Record missing telemetry, time-zone uncertainty, and data-quality gaps.
3. **Build a timeline and query** — filter, group, correlate, compare with a baseline, and test alternate explanations using the included synthetic sign-in and DNS CSVs.
4. **Write a narrow detection** — specify log-source requirements, fields, match logic, expected positive/negative cases, and tuning risks. Learn Sigma concepts and platform-specific query differences.
5. **Evaluate and tune** — calculate TP, FP, TN, FN, precision, recall, specificity, and F1. Explain how ambiguous labels, small samples, class imbalance, and overfitting limit conclusions.

## Capstone

Publish a hunting report and versioned detection rule with the hypothesis, required telemetry, reproducible query or filtering steps, test cases, confusion matrix, metrics, false-positive review, and explicit limitations.

## Suggested resources and practice

- [MITRE ATT&CK threat-hunting training](https://attack.mitre.org/resources/learn-more-about-attack/training/threat-hunting/)
- [MITRE ATT&CK detection-engineering training](https://attack.mitre.org/resources/learn-more-about-attack/training/detection-engineering/)
- [Sigma rule repository](https://github.com/SigmaHQ/sigma)
- [Microsoft threat-hunting overview](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview)
- OpenCyberPath: synthetic sign-in hunt, DNS timeline, detection evaluation, advanced detection tuning.

**Evidence standard:** Metrics describe the labelled test set only. Never report the included tiny synthetic score as real-world detection performance.
