// Small set of lab cards shown on the home page. Full catalogue is loaded on demand on labs and path-detail routes.
export const homeFeaturedLabs = [
{
    id: 'lab-threat-hunt', title: 'Lab 04: Threat hunting with synthetic sign-in events', level: 'Intermediate', kind: 'Threat hunting lab', category: 'Threat Hunting', icon: 'radar',
    summary: 'Use a supplied CSV to explore a login hypothesis, compare repeated failures with a baseline, and separate signals from conclusions.',
    pdf: 'notes/threat-hunting-notebook-guide.pdf', docx: 'notes/threat-hunting-notebook-guide.docx',
    dataset: 'labs/threat-hunt-auth-dns-samples.csv', image: '/images/learning/threat-hunting.svg', estimated: '35–50 min', skill: 'Threat hunting', tags: ['Synthetic data', 'Hypotheses', 'Logs']
  },
{
    id: 'lab-bugbounty', title: 'Lab 06: Bug bounty foundations and scope review', level: 'Beginner', kind: 'Web security lab guide', category: 'Bug Bounty', icon: 'bug',
    summary: 'Learn scope-first research, inspect a provided training lab, and prepare a concise report without touching unauthorised systems.',
    pdf: 'notes/bug-bounty-scope-and-reporting.pdf', docx: 'notes/bug-bounty-scope-and-reporting.docx',
    worksheet: 'labs/bug-bounty-scope-worksheet.csv', image: '/images/learning/bug-bounty.svg', estimated: '40–60 min', skill: 'Authorised web testing', tags: ['Scope', 'Evidence', 'Reporting']
  },
{
    id: 'lab-cheatsheet', title: 'Cybersecurity command cheatsheet', level: 'Beginner → Intermediate', kind: 'Printable quick reference', category: 'Cheat Sheets', icon: 'terminal',
    summary: 'Quick examples for PowerShell, Linux, local networking, log triage, hunting questions, and program-scope checks.',
    pdf: 'notes/cybersecurity-command-cheatsheet.pdf', docx: 'notes/cybersecurity-command-cheatsheet.docx',
    image: '/images/learning/command-cheatsheet.svg', estimated: '10–20 min', skill: 'Command-line confidence', tags: ['PowerShell', 'Linux', 'Networking']
  },
{
    id: 'lab-attack-patterns', title: 'Common attack patterns: beginner to advanced', level: 'Beginner → Advanced', kind: 'Handwritten-script reference notes', category: 'Attack Basics', icon: 'shield-check',
    summary: 'A 15-page connected-cursive notebook with attack-story, phishing, web-request, evidence-correlation, and defense-layer diagrams; plain-English attack patterns; synthetic examples; defensive signals; mitigations; safe exercises; and answer checks.',
    pdf: 'notes/common-attack-patterns-beginner-guide.pdf', docx: 'notes/common-attack-patterns-beginner-guide.docx',
    image: '/images/learning/attack-patterns.svg', estimated: '120–150 min', skill: 'Attack-pattern recognition and defensive analysis', tags: ['Handwritten script', 'Beginner', 'Intermediate', 'Advanced', 'Attack types', 'Examples', 'Defenses']
  }
];
