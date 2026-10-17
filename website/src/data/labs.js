export const labs = [
  {
    id: 'soc-notes', title: 'SOC & SIEM fundamentals notebook', level: 'Beginner', kind: 'Handwritten-style notes', category: 'Foundations', icon: 'notebook-pen',
    summary: 'A visual notebook for events vs alerts, telemetry flow, key log fields, triage, and detection metrics.',
    pdf: 'notes/handwritten-style-soc-siem-fundamentals.pdf', docx: 'notes/handwritten-style-soc-siem-fundamentals.docx',
    image: '/images/learning/notebook-notes.svg', estimated: '20–30 min', skill: 'SOC fundamentals', tags: ['Notes', 'SOC', 'SIEM']
  },
  {
    id: 'lab-win-event', title: 'Lab 01: Windows process-event triage', level: 'Beginner', kind: 'Guided lab', category: 'Threat Hunting', icon: 'monitor-check',
    summary: 'Read a harmless Notepad sample, understand process-event fields, and write an evidence-based triage note.',
    pdf: 'notes/lab-01-windows-process-event-triage.pdf', docx: 'notes/lab-01-windows-process-event-triage.docx',
    dataset: 'labs/windows-process-creation-samples.json', image: '/images/learning/windows-telemetry.svg', estimated: '30–45 min', skill: 'Windows event analysis', tags: ['Windows', 'Event logs', 'Triage']
  },
  {
    id: 'lab-eval', title: 'Lab 02: Detection rule evaluation', level: 'Intermediate', kind: 'Detection lab', category: 'Detection Engineering', icon: 'chart',
    summary: 'Classify outcomes, calculate precision and recall, and reason about false positives and missed detections.',
    pdf: 'notes/lab-02-detection-rule-evaluation.pdf', docx: 'notes/lab-02-detection-rule-evaluation.docx',
    dataset: 'labs/detection-evaluation-cases.csv', script: 'labs/evaluate-detection-cases.py', image: '/images/learning/detection-engineering.svg', estimated: '45–60 min', skill: 'Detection engineering', tags: ['Metrics', 'Rules', 'CSV']
  },
  {
    id: 'lab-env', title: 'Zero-budget lab environment guide', level: 'Beginner → Advanced', kind: 'Setup guide', category: 'Foundations', icon: 'laptop',
    summary: 'Plan a learning setup from browser-only sample cases to local logs, optional VMs, and a validated SIEM lab.',
    pdf: 'notes/lab-environment-zero-budget-guide.pdf', docx: 'notes/lab-environment-zero-budget-guide.docx',
    image: '/images/learning/cyber-foundations.svg', estimated: '15–25 min', skill: 'Lab setup', tags: ['Setup', 'VMs', 'Free tools']
  },
  {
    id: 'lab-detection-tuning', title: 'Lab 03: Advanced detection tuning', level: 'Advanced', kind: 'Advanced lab', category: 'Detection Engineering', icon: 'sliders',
    summary: 'Compare baseline and revised detection logic, then explain recall, precision, specificity, and false-positive trade-offs.',
    pdf: 'notes/lab-03-advanced-detection-tuning.pdf', docx: 'notes/lab-03-advanced-detection-tuning.docx',
    dataset: 'labs/detection-evaluation-cases.csv', script: 'labs/evaluate-detection-cases.py', image: '/images/learning/detection-tuning.svg', estimated: '45–60 min', skill: 'Detection tuning', tags: ['Detection', 'Evaluation', 'Evidence']
  },
  {
    id: 'lab-threat-hunt', title: 'Lab 04: Threat hunting with synthetic sign-in events', level: 'Intermediate', kind: 'Threat hunting lab', category: 'Threat Hunting', icon: 'radar',
    summary: 'Use a supplied CSV to explore a login hypothesis, compare repeated failures with a baseline, and separate signals from conclusions.',
    pdf: 'notes/threat-hunting-notebook-guide.pdf', docx: 'notes/threat-hunting-notebook-guide.docx',
    dataset: 'labs/threat-hunt-auth-dns-samples.csv', image: '/images/learning/threat-hunting.svg', estimated: '35–50 min', skill: 'Threat hunting', tags: ['Synthetic data', 'Hypotheses', 'Logs']
  },
  {
    id: 'lab-threat-hunt-dns', title: 'Lab 05: Build a DNS timeline', level: 'Intermediate', kind: 'Threat hunting lab', category: 'Threat Hunting', icon: 'radar',
    summary: 'Sort fictional DNS events into a timeline, compare repeated queries with baseline behaviour, and document what the sample cannot prove.',
    pdf: 'notes/threat-hunt-dns-timeline-lab.pdf', docx: 'notes/threat-hunt-dns-timeline-lab.docx',
    dataset: 'labs/threat-hunt-dns-samples.csv', image: '/images/learning/dns-timeline.svg', estimated: '25–40 min', skill: 'DNS timeline analysis', tags: ['Synthetic data', 'DNS', 'Timeline']
  },
  {
    id: 'lab-bugbounty', title: 'Lab 06: Bug bounty foundations and scope review', level: 'Beginner', kind: 'Web security lab guide', category: 'Bug Bounty', icon: 'bug',
    summary: 'Learn scope-first research, inspect a provided training lab, and prepare a concise report without touching unauthorised systems.',
    pdf: 'notes/bug-bounty-scope-and-reporting.pdf', docx: 'notes/bug-bounty-scope-and-reporting.docx',
    worksheet: 'labs/bug-bounty-scope-worksheet.csv', image: '/images/learning/bug-bounty.svg', estimated: '40–60 min', skill: 'Authorised web testing', tags: ['Scope', 'Evidence', 'Reporting']
  },
  {
    id: 'lab-bugbounty-http', title: 'Lab 07: Read an HTTP exchange', level: 'Beginner', kind: 'Web security lab', category: 'Bug Bounty', icon: 'search',
    summary: 'Observe a normal request and response in an official training lab, interpret status codes and safe headers, and complete a non-sensitive worksheet.',
    pdf: 'notes/bug-bounty-http-observation-lab.pdf', docx: 'notes/bug-bounty-http-observation-lab.docx',
    worksheet: 'labs/bug-bounty-http-observation-worksheet.csv', image: '/images/learning/http-exchange.svg', estimated: '30–45 min', skill: 'HTTP fundamentals', tags: ['HTTP', 'Browser tools', 'Scope first']
  },
  {
    id: 'lab-cheatsheet', title: 'Cybersecurity command cheatsheet', level: 'Beginner → Intermediate', kind: 'Printable quick reference', category: 'Cheat Sheets', icon: 'terminal',
    summary: 'Quick examples for PowerShell, Linux, local networking, log triage, hunting questions, and program-scope checks.',
    pdf: 'notes/cybersecurity-command-cheatsheet.pdf', docx: 'notes/cybersecurity-command-cheatsheet.docx',
    image: '/images/learning/command-cheatsheet.svg', estimated: '10–20 min', skill: 'Command-line confidence', tags: ['PowerShell', 'Linux', 'Networking']
  },
  {
    id: 'lab-attack-patterns', title: 'Common attack patterns: a beginner guide', level: 'Beginner', kind: 'Friendly explainer', category: 'Attack Basics', icon: 'shield-check',
    summary: 'Understand common attack patterns in plain language: why they happen, everyday examples, warning signs, and defenses.',
    pdf: 'notes/common-attack-patterns-beginner-guide.pdf', docx: 'notes/common-attack-patterns-beginner-guide.docx',
    image: '/images/learning/attack-patterns.svg', estimated: '25–35 min', skill: 'Security awareness', tags: ['Examples', 'Causes', 'Defenses']
  }
];
