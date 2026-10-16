export const labs = [
  {
    "id": "soc-notes",
    "title": "Handwritten-style SOC & SIEM notes",
    "level": "Beginner",
    "kind": "Notes",
    "summary": "Notebook-style fundamentals: events vs alerts vs incidents, telemetry flow, key log fields, triage checklist, and detection metrics.",
    "pdf": "notes/handwritten-style-soc-siem-fundamentals.pdf",
    "docx": "notes/handwritten-style-soc-siem-fundamentals.docx",
    "estimated": "20–30 min",
    "skill": "SOC fundamentals"
  },
  {
    "id": "lab-win-event",
    "title": "Lab 01: Windows process-event triage",
    "level": "Beginner",
    "kind": "Lab guide",
    "summary": "Inspect a safe Notepad sample, understand Windows process events, and write an evidence-based triage note.",
    "pdf": "notes/lab-01-windows-process-event-triage.pdf",
    "docx": "notes/lab-01-windows-process-event-triage.docx",
    "dataset": "labs/windows-process-creation-samples.json",
    "estimated": "30–45 min",
    "skill": "Windows event analysis"
  },
  {
    "id": "lab-eval",
    "title": "Lab 02: Detection rule evaluation",
    "level": "Intermediate",
    "kind": "Lab guide",
    "summary": "Classify outcomes, calculate precision/recall, investigate false positives and negatives, and write a reproducible report.",
    "pdf": "notes/lab-02-detection-rule-evaluation.pdf",
    "docx": "notes/lab-02-detection-rule-evaluation.docx",
    "dataset": "labs/detection-evaluation-cases.csv",
    "script": "labs/evaluate-detection-cases.py",
    "estimated": "45–60 min",
    "skill": "Detection engineering"
  },
  {
    "id": "lab-env",
    "title": "Zero-budget lab environment guide",
    "level": "Beginner → Advanced",
    "kind": "Environment guide",
    "summary": "Plan a learning setup from browser-only sample cases to local logs, optional VMs, and a validated Wazuh lab.",
    "pdf": "notes/lab-environment-zero-budget-guide.pdf",
    "docx": "notes/lab-environment-zero-budget-guide.docx",
    "estimated": "15–25 min",
    "skill": "Lab setup & environment skills"
  },
  {
    "id": "lab-detection-tuning",
    "title": "Lab 03: Advanced detection tuning",
    "level": "Advanced",
    "kind": "Advanced lab",
    "summary": "Compare baseline and revised process-name scope, then reason about recall, precision, specificity, and false-positive trade-offs.",
    "pdf": "notes/lab-03-advanced-detection-tuning.pdf",
    "docx": "notes/lab-03-advanced-detection-tuning.docx",
    "dataset": "labs/detection-evaluation-cases.csv",
    "script": "labs/evaluate-detection-cases.py",
    "estimated": "45–60 min",
    "skill": "Detection tuning"
  }
];
