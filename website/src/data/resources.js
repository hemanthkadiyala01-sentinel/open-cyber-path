export const resources = [
  {
    id: 'wazuh-getting-started', name: 'Wazuh documentation', provider: 'Wazuh', category: 'SOC & SIEM', kind: 'Open source', level: 'Beginner',
    description: 'Learn endpoint monitoring, agents, security events, rules, and alerts from the official project guides.',
    skills: ['SIEM', 'Endpoint monitoring', 'Detection'], url: 'https://documentation.wazuh.com/current/getting-started/index.html',
    account: 'No account for docs', note: 'Running the complete stack needs suitable hardware. Prefer current documentation over old installation videos.', image: '/images/learning/soc-siem.svg', icon: 'radar'
  },
  {
    id: 'splunk-free-courses', name: 'Splunk free courses', provider: 'Splunk', category: 'SOC & SIEM', kind: 'Free learning', level: 'Beginner',
    description: 'Build familiarity with event searches, fields, dashboards, and the basics of Splunk.',
    skills: ['Log analysis', 'SPL', 'Dashboards'], url: 'https://www.splunk.com/en_us/training/free-courses/overview.html',
    account: 'Account may be needed', note: 'Learning content and product or lab access may have different conditions.', image: '/images/learning/detection-engineering.svg', icon: 'chart'
  },
  {
    id: 'microsoft-learn', name: 'Microsoft Learn: Sentinel and KQL', provider: 'Microsoft', category: 'SOC & SIEM', kind: 'Free learning', level: 'Intermediate',
    description: 'Study cloud security, Microsoft Sentinel, KQL, and investigation workflows with official learning modules.',
    skills: ['Sentinel', 'KQL', 'Cloud security'], url: 'https://learn.microsoft.com/en-us/training/paths/sc-200-utilize-kql-for-azure-sentinel/',
    account: 'Some modules may need sign-in', note: 'Documentation is free; cloud exercises can incur charges. Check pricing before creating resources.', image: '/images/learning/cloud-security.svg', icon: 'search'
  },
  {
    id: 'microsoft-threat-hunting', name: 'Microsoft threat hunting overview', provider: 'Microsoft Learn', category: 'Threat Hunting', kind: 'Free documentation', level: 'Intermediate',
    description: 'Learn the stages of threat hunting and how queries help investigate telemetry in a defensive workflow.',
    skills: ['Threat hunting', 'KQL', 'Investigation'], url: 'https://learn.microsoft.com/en-us/defender-xdr/hunting-overview',
    account: 'No account for docs', note: 'The overview describes Microsoft tools; table names and access depend on the environment.', image: '/images/learning/threat-hunting.svg', icon: 'radar'
  },
  {
    id: 'sigma-rules', name: 'Sigma detection rules', provider: 'SigmaHQ', category: 'Detection Engineering', kind: 'Open source', level: 'Intermediate',
    description: 'Explore portable detection logic and learn how rules map to specific log sources and fields.',
    skills: ['Detection logic', 'Rule review', 'Threat hunting'], url: 'https://github.com/SigmaHQ/sigma',
    account: 'No account to browse', note: 'Review each rule’s log-source requirements, false-positive notes, and licence.', image: '/images/learning/detection-engineering.svg', icon: 'shield-check'
  },
  {
    id: 'mitre-attack', name: 'MITRE ATT&CK knowledge base', provider: 'MITRE', category: 'Security Concepts', kind: 'Free knowledge base', level: 'Beginner → Advanced',
    description: 'Understand adversary behaviours and use the knowledge base to add context to defensive investigations.',
    skills: ['Threat modelling', 'Detection mapping', 'Investigation'], url: 'https://attack.mitre.org/',
    account: 'No account required', note: 'ATT&CK provides a common vocabulary; a technique mapping is not proof that it occurred.', image: '/images/learning/supply-chain.svg', icon: 'network'
  },
  {
    id: 'portswigger-academy', name: 'Web Security Academy', provider: 'PortSwigger', category: 'Bug Bounty', kind: 'Free interactive labs', level: 'Beginner → Advanced',
    description: 'Learn HTTP and common web security concepts through free interactive training labs and guided explanations.',
    skills: ['HTTP', 'Web security', 'Testing methodology'], url: 'https://portswigger.net/web-security',
    account: 'Account may help track progress', note: 'Practise within the intended Academy lab environment and follow its instructions.', image: '/images/learning/bug-bounty.svg', icon: 'bug'
  },
  {
    id: 'owasp-wstg', name: 'OWASP Web Security Testing Guide', provider: 'OWASP', category: 'Bug Bounty', kind: 'Free documentation', level: 'Intermediate → Advanced',
    description: 'Use a structured checklist for web application testing, with objectives and methodology explained by topic.',
    skills: ['Testing methodology', 'Web applications', 'Reporting'], url: 'https://owasp.org/www-project-web-security-testing-guide/',
    account: 'No account for docs', note: 'Use only the parts permitted by the target owner and programme rules. Do not assume all tests are allowed.', image: '/images/learning/web-security.svg', icon: 'clipboard'
  },
  {
    id: 'juice-shop', name: 'OWASP Juice Shop', provider: 'OWASP', category: 'Bug Bounty', kind: 'Open source training app', level: 'Beginner → Advanced',
    description: 'Explore a deliberately vulnerable practice application built for learning web security in a lab.',
    skills: ['Web security', 'App testing', 'Secure coding'], url: 'https://owasp.org/projects/juice-shop',
    account: 'Local setup recommended', note: 'Run in an isolated local lab; never expose an intentionally vulnerable instance to the public internet.', image: '/images/learning/bug-bounty.svg', icon: 'bug'
  },
  {
    id: 'hackerone-scope', name: 'HackerOne: understanding scope', provider: 'HackerOne', category: 'Bug Bounty', kind: 'Free documentation', level: 'Beginner',
    description: 'Understand that program scope specifies the assets and activities a researcher is authorised to test.',
    skills: ['Scope review', 'Research ethics', 'Program rules'], url: 'https://docs.hackerone.com/en/articles/8494552-defining-scope',
    account: 'No account for docs', note: 'Rules vary by programme. Stop and ask the programme team if scope or permission is unclear.', image: '/images/learning/bug-bounty-reporting.svg', icon: 'shield-check'
  },
  {
    id: 'bugcrowd-briefs', name: 'Bugcrowd: review a program brief', provider: 'Bugcrowd', category: 'Bug Bounty', kind: 'Free documentation', level: 'Beginner',
    description: 'Learn how in-scope assets, exclusions, engagement rules, and disclosure requirements appear in program briefs.',
    skills: ['Scope review', 'Report preparation', 'Responsible disclosure'], url: 'https://docs.bugcrowd.com/researchers/engagement-management/details/',
    account: 'No account for docs', note: 'Out-of-scope targets must not be tested. Read the current engagement brief before doing any work.', image: '/images/learning/bug-bounty-reporting.svg', icon: 'clipboard'
  },
  {
    id: 'overthewire', name: 'OverTheWire Bandit', provider: 'OverTheWire', category: 'Foundations', kind: 'Free practice', level: 'Beginner',
    description: 'Practise Linux command-line concepts through a beginner-friendly educational wargame.',
    skills: ['Linux', 'Command line', 'Problem solving'], url: 'https://overthewire.org/wargames/bandit/',
    account: 'Terminal / SSH access', note: 'Follow the game rules and only use the provided practice environment.', image: '/images/learning/command-cheatsheet.svg', icon: 'terminal'
  },
  {
    id: 'tryhackme-free-rooms', name: 'TryHackMe rooms', provider: 'TryHackMe', category: 'Hands-on Labs', kind: 'Free tier', level: 'Beginner → Intermediate',
    description: 'Explore guided exercises across security foundations, blue team, networking, and web topics.',
    skills: ['SOC basics', 'Linux', 'Security tools'], url: 'https://tryhackme.com/r/rooms',
    account: 'Account required', note: 'Only selected content is free; some rooms and features may require payment.', image: '/images/learning/hands-on-lab.svg', icon: 'book-open'
  },
  {
    id: 'pwn-college', name: 'pwn.college learning platform', provider: 'Arizona State University / pwn.college', category: 'Hands-on Labs', kind: 'Free interactive labs', level: 'Beginner → Advanced',
    description: 'A hands-on cybersecurity education platform with structured modules and practical challenges covering low-level computing and security concepts.',
    skills: ['Linux', 'Systems fundamentals', 'Program security', 'Practical challenges'], url: 'https://pwn.college/',
    account: 'Platform account may be needed', note: 'Practice inside the platform’s provided environment and follow its current rules. OpenCyberPath links to the official platform; it does not host or control pwn.college lab sessions.', image: '/images/learning/hands-on-lab.svg', icon: 'terminal'
  },
  {
    id: 'cyberdefenders', name: 'CyberDefenders blue-team labs', provider: 'CyberDefenders', category: 'Threat Hunting', kind: 'Free / varies by lab', level: 'Intermediate → Advanced',
    description: 'Explore defensive investigations, threat hunting, and digital forensics exercises.',
    skills: ['SOC investigations', 'Forensics', 'Threat hunting'], url: 'https://cyberdefenders.org/blue-team-labs/',
    account: 'Varies by lab', note: 'Check access conditions for each individual lab before starting.', image: '/images/learning/digital-forensics.svg', icon: 'radar'
  },
  {
    id: 'windows-security-auditing', name: 'Windows process-creation auditing', provider: 'Microsoft Learn', category: 'Foundations', kind: 'Free documentation', level: 'Intermediate',
    description: 'Understand Windows process-creation auditing concepts and the meaning of event fields.',
    skills: ['Windows logs', 'Event ID 4688', 'Audit policy'], url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/basic-audit-process-creation',
    account: 'No account for docs', note: 'Do not change audit policy on managed devices without permission. Sample events are enough to begin.', image: '/images/learning/windows-telemetry.svg', icon: 'file-text'
  },
  {
    id: 'owasp-top10', name: 'OWASP Top 10', provider: 'OWASP', category: 'Security Concepts', kind: 'Free documentation', level: 'Beginner → Advanced',
    description: 'Learn the major categories of web application security risk and the kinds of controls that reduce them.',
    skills: ['Web fundamentals', 'Risk awareness', 'Secure coding'], url: 'https://owasp.org/www-project-top-ten/',
    account: 'No account for docs', note: 'Use it to build vocabulary, then follow a guided training lab for hands-on learning.', image: '/images/learning/attack-patterns.svg', icon: 'shield-check'
  },
  {
    id: 'cicids2017-labeled-flows', name: 'CIC-IDS2017 labelled network-flow dataset', provider: 'Canadian Institute for Cybersecurity (UNB)', category: 'Detection Engineering', kind: 'Public research dataset', level: 'Intermediate',
    description: 'Explore a published, labelled network-flow benchmark with benign traffic, common attack categories, timestamps, protocols, and flow features.',
    skills: ['Network flows', 'Labels', 'Detection evaluation'], url: 'https://www.unb.ca/cic/datasets/ids-2017.html',
    account: 'Public dataset information page', note: 'The official page describes a five-day testbed capture and large daily packet captures. Start with labelled CSV flow data, cite the dataset, and treat its age and testbed conditions as limitations.', image: '/images/learning/detection-tuning.svg', icon: 'chart'
  },
  {
    id: 'ctu13-labeled-flows', name: 'CTU-13 labelled botnet-flow dataset', provider: 'Stratosphere Laboratory', category: 'Threat Hunting', kind: 'Public research dataset', level: 'Intermediate → Advanced',
    description: 'Study 13 published scenarios with manually labelled botnet, command-and-control, normal, and background network flows.',
    skills: ['NetFlow', 'Traffic analysis', 'Label validation'], url: 'https://www.stratosphereips.org/datasets-ctu13',
    account: 'Public dataset information page', note: 'The full archive is large and the dataset page lists several file types. For beginner analysis, focus on labelled flow files; do not execute supplied binaries or replay unknown traffic. Cite the dataset.', image: '/images/learning/digital-forensics.svg', icon: 'radar'
  },
  {
    id: 'splunk-botsv3-dataset', name: 'Boss of the SOC v3 dataset', provider: 'Splunk (GitHub)', category: 'SOC & SIEM', kind: 'Public scenario dataset', level: 'Intermediate',
    description: 'A security investigation dataset and capture-the-flag style scenario for practising search queries and tracing evidence across event data.',
    skills: ['Event search', 'Investigation', 'Evidence notes'], url: 'https://github.com/splunk/botsv3',
    account: 'Public repository; software setup needed', note: 'This is scenario/CTF data, not live production telemetry. Review the repository requirements and dataset size before downloading.', image: '/images/learning/soc-siem.svg', icon: 'chart'
  },
  {
    id: 'nist-incident-response', name: 'NIST incident response lifecycle resources', provider: 'NIST', category: 'DFIR', kind: 'Free guidance', level: 'Beginner → Advanced',
    description: 'Explore incident-response lifecycle resources and related digital-forensics references from the US National Institute of Standards and Technology.',
    skills: ['Incident response', 'Evidence handling', 'Investigation'], url: 'https://csrc.nist.gov/Projects/incident-response/life-cycle-resources',
    account: 'No account for public pages', note: 'Use this as a reference library, not a substitute for your organisation’s approved incident process.', image: '/images/learning/digital-forensics.svg', icon: 'clipboard'
  },
  {
    id: 'autopsy-forensics', name: 'Autopsy digital forensics platform', provider: 'The Sleuth Kit / Autopsy', category: 'DFIR', kind: 'Open source tool', level: 'Intermediate',
    description: 'Learn what a digital-forensics platform does and explore its official project documentation before using it on prepared training evidence.',
    skills: ['Digital forensics', 'Evidence review', 'Case documentation'], url: 'https://www.autopsy.com/',
    account: 'Local installation may be required', note: 'Use only supplied or authorised evidence images. Preserve originals and follow your lab’s evidence-handling rules.', image: '/images/learning/digital-forensics.svg', icon: 'search'
  },
  {
    id: 'aws-security-learning', name: 'AWS training and security learning', provider: 'Amazon Web Services', category: 'Cloud Security', kind: 'Free learning / access varies', level: 'Beginner → Intermediate',
    description: 'Find provider-led cloud learning by role and topic, including security concepts and cloud responsibility models.',
    skills: ['Cloud fundamentals', 'Identity and access', 'Security controls'], url: 'https://aws.amazon.com/training/',
    account: 'Account may be needed for some features', note: 'Digital courses and hands-on resources can have different terms. Do not create billable resources without checking current pricing.', image: '/images/learning/career-cloud-security.webp', icon: 'network'
  },
  {
    id: 'azure-security-learning', name: 'Microsoft Learn: Azure security training', provider: 'Microsoft Learn', category: 'Cloud Security', kind: 'Free learning', level: 'Beginner → Intermediate',
    description: 'Browse Azure security learning modules covering identity, network protection, monitoring, and cloud security concepts.',
    skills: ['Azure', 'Identity', 'Cloud monitoring'], url: 'https://learn.microsoft.com/en-us/training/browse/?products=azure&subjects=security',
    account: 'Some features may require sign-in', note: 'Read the exercise requirements before provisioning resources; cloud usage can have costs even when learning content is free.', image: '/images/learning/career-cloud-security.webp', icon: 'shield-check'
  },
  {
    id: 'nist-csf-2', name: 'NIST Cybersecurity Framework 2.0', provider: 'NIST', category: 'GRC & Security Fundamentals', kind: 'Free framework', level: 'Beginner → Advanced',
    description: 'Use a widely referenced framework to organise cybersecurity outcomes, risk discussions, profiles, and improvement priorities.',
    skills: ['Risk management', 'Governance', 'Control outcomes'], url: 'https://www.nist.gov/cyberframework',
    account: 'No account for public resources', note: 'A framework mapping is not proof of compliance. State scope, assumptions, and evidence for each control claim.', image: '/images/learning/grc-risk-map.svg', icon: 'file-text'
  },
  {
    id: 'cis-controls', name: 'CIS Critical Security Controls', provider: 'Center for Internet Security', category: 'GRC & Security Fundamentals', kind: 'Free reference / terms vary', level: 'Beginner → Intermediate',
    description: 'Explore prioritised safeguards for reducing common cybersecurity risk and structuring practical improvement work.',
    skills: ['Security controls', 'Risk treatment', 'Improvement planning'], url: 'https://www.cisecurity.org/controls',
    account: 'Download terms may vary', note: 'Use current provider guidance and check current terms. Link a control to evidence; do not claim compliance based on a checklist alone.', image: '/images/learning/grc-risk-map.svg', icon: 'check-circle'
  },
  {
    id: 'nist-digital-evidence', name: 'NIST SP 800-86: forensic techniques in incident response', provider: 'NIST', category: 'DFIR', kind: 'Free guidance', level: 'Beginner → Advanced',
    description: 'Read foundational guidance on integrating computer and network forensic techniques into incident-response work.',
    skills: ['Forensics', 'Evidence handling', 'Incident response'], url: 'https://csrc.nist.gov/pubs/sp/800/86/final',
    account: 'No account for public guidance', note: 'This older publication is foundational guidance, not a complete investigation playbook or legal advice. Check current organisational requirements.', image: '/images/learning/dfir-evidence-timeline.svg', icon: 'clipboard'
  },
  {
    id: 'nist-csf-quickstart', name: 'NIST CSF 2.0 Quick-Start Guides', provider: 'NIST', category: 'GRC & Security Fundamentals', kind: 'Free guidance', level: 'Beginner → Intermediate',
    description: 'Use concise guides to understand how organisations can begin applying Cybersecurity Framework 2.0 to their situation.',
    skills: ['Cyber risk', 'Framework adoption', 'Improvement planning'], url: 'https://www.nist.gov/cyberframework/quick-start-guides',
    account: 'No account for public guides', note: 'Choose a guide suited to the organisation and context. Using a framework is not the same as proving compliance.', image: '/images/learning/grc-risk-map.svg', icon: 'book-open'
  },
  {
    id: 'cisa-cyber-essentials', name: 'CISA Cyber Essentials', provider: 'CISA', category: 'GRC & Security Fundamentals', kind: 'Free guidance', level: 'Beginner',
    description: 'A practical introduction for leaders and small organisations to foundational cyber-readiness actions.',
    skills: ['Cyber hygiene', 'MFA', 'Backups', 'Patch management'], url: 'https://www.cisa.gov/sites/default/files/publications/19_1106_cisa_CISA_Cyber_Essentials_S508C_1.pdf',
    account: 'No account for public PDF', note: 'Use it as introductory guidance; adapt actions to current official recommendations and the organisation’s risks.', image: '/images/learning/grc-risk-map.svg', icon: 'shield-check'
  },
];

export const categories = [
  'All resources', 'Foundations', 'SOC & SIEM', 'Threat Hunting', 'Detection Engineering',
  'Bug Bounty', 'Hands-on Labs', 'Security Concepts', 'DFIR', 'Cloud Security', 'GRC & Security Fundamentals'
];
