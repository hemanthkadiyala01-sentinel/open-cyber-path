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
    skills: ['Windows logs', 'Event ID 4688', 'Audit policy'], url: 'https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-Audit#detailedtracking_auditprocesscreation',
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
  {
    id: 'advanced-wireshark-packet-analysis',
    name: 'Wireshark: Advanced Packet Analysis',
    provider: 'Wireshark',
    category: 'Threat Hunting',
    kind: 'Free documentation & sample captures',
    level: 'Intermediate → Advanced',
    description: 'Study packet dissection, display filters, protocol behavior, and evidence-led troubleshooting using official documentation and sample captures.',
    skills: ['Packet analysis', 'Network protocols', 'Traffic investigation'],
    url: 'https://www.wireshark.org/resources',
    account: 'No account for public documentation',
    note: 'Start with published sample captures or traffic from an authorized lab. Packet captures can contain sensitive information; handle and share them carefully.',
    image: '/images/learning/digital-forensics.svg',
    icon: 'search',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-zeek-network-monitoring',
    name: 'Zeek Network Monitoring Tutorial',
    provider: 'Zeek',
    category: 'Threat Hunting',
    kind: 'Open-source tool & tutorial',
    level: 'Intermediate → Advanced',
    description: 'Learn how network traffic analysis produces structured logs and how analysts can interpret connection and protocol activity.',
    skills: ['Network monitoring', 'Log analysis', 'Threat hunting'],
    url: 'https://docs.zeek.org/en/current/tutorial/index.html',
    account: 'No account for public documentation; local setup needed for full practice',
    note: 'Begin with the documented sample capture. Monitor only networks and traffic you are authorized to inspect.',
    image: '/images/learning/detection-tuning.svg',
    icon: 'radar',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-atomic-red-team',
    name: 'Atomic Red Team: Detection Validation',
    provider: 'Red Canary',
    category: 'Detection Engineering',
    kind: 'Open-source test library',
    level: 'Advanced',
    description: 'Study structured security-control tests and learn how defenders assess whether their telemetry and detections capture expected activity.',
    skills: ['Detection validation', 'Telemetry analysis', 'MITRE ATT&CK mapping'],
    url: 'https://www.atomicredteam.io/docs/atomic-red-team',
    account: 'No account required to read the public documentation',
    note: 'Execute tests only with explicit permission on a dedicated test machine. Some tests change system state; understand prerequisites and cleanup steps first.',
    image: '/images/learning/detection-tuning.svg',
    icon: 'shield-check',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-nmap-network-auditing',
    name: 'Nmap: Network Discovery & Auditing Guide',
    provider: 'Nmap',
    category: 'Foundations',
    kind: 'Open-source tool & free guide',
    level: 'Intermediate → Advanced',
    description: 'Build deeper understanding of network inventory, service discovery, scan interpretation, and security-auditing methodology.',
    skills: ['Network discovery', 'Service inventory', 'Audit methodology'],
    url: 'https://nmap.org/book/',
    account: 'No account required to read the guide',
    note: 'Practise against your own lab systems or targets covered by explicit authorization. Understand the assessment scope before running scans.',
    image: '/images/learning/command-cheatsheet.svg',
    icon: 'network',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-ghidra-reverse-engineering',
    name: 'Ghidra: Software Reverse Engineering',
    provider: 'National Security Agency',
    category: 'DFIR',
    kind: 'Open-source reverse-engineering framework',
    level: 'Advanced',
    description: 'Explore disassembly, decompilation, program structure, and static analysis using the official Ghidra project.',
    skills: ['Reverse engineering', 'Static analysis', 'Program understanding'],
    url: 'https://github.com/NationalSecurityAgency/ghidra',
    account: 'No account required to browse the repository; local installation is needed for practical use',
    note: 'Start with benign sample programs or intentionally prepared training binaries. Use a controlled lab when examining untrusted files.',
    image: '/images/learning/digital-forensics.svg',
    icon: 'search',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-remnux-malware-analysis',
    name: 'REMnux: Malware Analysis Toolkit',
    provider: 'REMnux',
    category: 'DFIR',
    kind: 'Open-source analysis toolkit',
    level: 'Advanced',
    description: 'Explore a Linux toolkit for examining suspicious files, analyzing static properties, and investigating malware-related artifacts.',
    skills: ['Malware analysis', 'Static triage', 'Forensic investigation'],
    url: 'https://docs.remnux.org/',
    account: 'No account for public documentation; virtual-machine resources may be required',
    note: 'Use an isolated analysis environment and authorized training samples. Do not execute unknown files on your everyday computer.',
    image: '/images/learning/digital-forensics.svg',
    icon: 'shield-check',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-owasp-asvs',
    name: 'OWASP Application Security Verification Standard',
    provider: 'OWASP',
    category: 'Security Concepts',
    kind: 'Free security verification standard',
    level: 'Intermediate → Advanced',
    description: 'Use structured security requirements to evaluate application controls and understand what evidence supports a security review.',
    skills: ['Application security', 'Security requirements', 'Verification methodology'],
    url: 'https://owasp.org/projects/asvs',
    account: 'No account required for public project documentation',
    note: 'Choose and record the standard version used for an assessment. Apply verification requirements to applications you own or are authorized to assess.',
    image: '/images/learning/web-security.svg',
    icon: 'clipboard',
    lastVerified: '2026-10-18'
  },
  {
    id: 'advanced-cis-benchmarks',
    name: 'CIS Benchmarks: Secure Configuration Hardening',
    provider: 'Center for Internet Security',
    category: 'GRC & Security Fundamentals',
    kind: 'Free guidance; access terms vary',
    level: 'Intermediate → Advanced',
    description: 'Study structured configuration recommendations for operating systems, servers, cloud platforms, and other technologies.',
    skills: ['Configuration hardening', 'Security baselines', 'Control validation'], url: 'https://www.cisecurity.org/cis-benchmarks',
    account: 'Download and membership requirements vary by resource', note: 'Use benchmarks to assess an authorized environment. Test changes before applying them to production and plan rollback for configuration changes.',
    image: '/images/learning/grc-risk-map.svg', icon: 'shield-check',
    lastVerified: '2026-10-18'
  },
  {
    id: 'owasp-zap',
    name: 'OWASP ZAP',
    provider: 'OWASP',
    category: 'Penetration Testing',
    kind: 'Open source tool',
    level: 'Beginner → Intermediate',
    description: 'Learn to intercept, spider, and scan web applications with OWASP ZAP\u2019s guided automated and manual testing workflows in a lab you control.',
    skills: ['Web security', 'Vulnerability scanning', 'Intercepting proxy'], url: 'https://github.com/zaproxy/zaproxy',
    account: 'Local installation recommended', note: 'Configure scan scope to targets you own or are authorised to test. Scanning can be disruptive; use ZAP against intentionally vulnerable lab applications only.',
    image: '/images/learning/web-security.svg', icon: 'bug', monogram: 'ZAP', practiceUrl: 'https://www.zaproxy.org/docs/'
  },
  {
    id: 'ffuf',
    name: 'ffuf',
    provider: 'ffuf',
    category: 'Penetration Testing',
    kind: 'Open source CLI tool',
    level: 'Intermediate',
    description: 'Practise web fuzzing for directories, virtual hosts, and parameters with ffuf, starting from a local target you own.',
    skills: ['Fuzzing', 'Web applications', 'Command line'], url: 'https://github.com/ffuf/ffuf',
    account: 'Local installation needed', note: 'Fuzzing generates many requests and can disrupt a target. Run it only against local lab instances you control.',
    image: '/images/learning/command-cheatsheet.svg', icon: 'terminal', monogram: 'FF', practiceUrl: 'https://github.com/ffuf/ffuf#readme'
  },
  {
    id: 'nuclei',
    name: 'Nuclei',
    provider: 'ProjectDiscovery',
    category: 'Penetration Testing',
    kind: 'Open source scanner',
    level: 'Intermediate',
    description: 'Run community-maintained vulnerability templates against lab targets and learn how scanner findings map to real weaknesses.',
    skills: ['Vulnerability scanning', 'Templates', 'Web security'], url: 'https://github.com/projectdiscovery/nuclei',
    account: 'Local installation needed', note: 'Template-based scanning can be disruptive. Restrict scans to authorised lab targets and review templates before running them.',
    image: '/images/learning/detection-engineering.svg', icon: 'bug', monogram: 'NU', practiceUrl: 'https://nuclei.projectdiscovery.io/'
  },
  {
    id: 'sqlmap',
    name: 'SQLMap',
    provider: 'SQLMap project',
    category: 'Penetration Testing',
    kind: 'Open source tool',
    level: 'Intermediate → Advanced',
    description: 'Study SQL injection detection and safe testing approaches with SQLMap against intentionally vulnerable databases in a lab.',
    skills: ['SQL injection', 'Database security', 'Testing methodology'], url: 'https://github.com/sqlmapproject/sqlmap',
    account: 'Local installation needed', note: 'Injection testing can alter or damage data. Use it only on deliberately vulnerable databases you own or on assigned lab targets.',
    image: '/images/learning/web-security.svg', icon: 'code', monogram: 'SM', practiceUrl: 'https://sqlmap.org/'
  },
  {
    id: 'gobuster',
    name: 'Gobuster',
    provider: 'Gobuster',
    category: 'Penetration Testing',
    kind: 'Open source CLI tool',
    level: 'Intermediate',
    description: 'Learn directory and DNS enumeration with Gobuster, beginning with local lab applications you are authorised to scan.',
    skills: ['Enumeration', 'Command line', 'Web applications'], url: 'https://github.com/OJ/gobuster',
    account: 'Local installation needed', note: 'Directory enumeration produces many requests. Confine it to local lab applications and respect rate limits.',
    image: '/images/learning/command-cheatsheet.svg', icon: 'terminal', monogram: 'GB', practiceUrl: 'https://github.com/OJ/gobuster#readme'
  },
  {
    id: 'subfinder',
    name: 'Subfinder',
    provider: 'ProjectDiscovery',
    category: 'Penetration Testing',
    kind: 'Open source tool',
    level: 'Intermediate',
    description: 'Practise passive subdomain discovery with Subfinder against domains you own or assigned lab targets.',
    skills: ['Subdomain enumeration', 'Reconnaissance', 'Network fundamentals'], url: 'https://github.com/projectdiscovery/subfinder',
    account: 'Local installation needed', note: 'Enumerate only domains you own or targets assigned by a training provider. Public sources still return data about real domains, so stay within the agreed scope.',
    image: '/images/learning/command-cheatsheet.svg', icon: 'network', monogram: 'SF', practiceUrl: 'https://docs.projectdiscovery.io/opensource/subfinder/overview'
  },
  {
    id: 'metasploit-framework',
    name: 'Metasploit Framework',
    provider: 'Rapid7',
    category: 'Penetration Testing',
    kind: 'Open source framework',
    level: 'Advanced',
    description: 'Explore the Metasploit Framework\u2019s modules and workflows in an isolated lab, focused on authorised testing and detection validation.',
    skills: ['Exploitation concepts', 'Lab safety', 'Authorised testing'], url: 'https://github.com/rapid7/metasploit-framework',
    account: 'Local installation needed', note: 'Metasploit includes exploitation modules that change system state. Use it only in an isolated lab with explicit authorisation, and never against systems you do not own.',
    image: '/images/learning/attack-patterns.svg', icon: 'bug', monogram: 'MSF', practiceUrl: 'https://docs.metasploit.com/'
  },
  {
    id: 'dvwa',
    name: 'DVWA',
    provider: 'DVWA',
    category: 'Penetration Testing',
    kind: 'Open source training app',
    level: 'Beginner → Intermediate',
    description: 'Learn web application testing in Damn Vulnerable Web Application, a deliberately vulnerable PHP/MySQL lab you run locally.',
    skills: ['Web security', 'App testing', 'Lab setup'], url: 'https://github.com/digininja/DVWA',
    account: 'Local setup recommended', note: 'DVWA is intentionally vulnerable. Run it locally and isolated from your network; never expose it to the public internet.',
    image: '/images/learning/hands-on-lab.svg', icon: 'bug', monogram: 'DVW', practiceUrl: 'https://github.com/digininja/DVWA#readme'
  },
  {
    id: 'owasp-crapi',
    name: 'OWASP crAPI',
    provider: 'OWASP',
    category: 'Penetration Testing',
    kind: 'Open source training app',
    level: 'Intermediate',
    description: 'Study API security testing with OWASP crAPI, an intentionally vulnerable API covering the OWASP API Security Top 10.',
    skills: ['API security', 'Web security', 'Testing methodology'], url: 'https://github.com/OWASP/crAPI',
    account: 'Local setup recommended', note: 'crAPI is deliberately vulnerable. Run it in a local isolated lab and do not expose it to the internet or test it against other APIs.',
    image: '/images/learning/web-security.svg', icon: 'code', monogram: 'CR', practiceUrl: 'https://owasp.org/www-project-crapi/'
  },
  {
    id: 'mitmproxy',
    name: 'mitmproxy',
    provider: 'mitmproxy',
    category: 'Penetration Testing',
    kind: 'Open source proxy',
    level: 'Intermediate → Advanced',
    description: 'Learn to intercept, inspect, and replay HTTP/HTTPS traffic with mitmproxy on traffic from your own lab devices.',
    skills: ['Traffic interception', 'HTTP', 'Network fundamentals'], url: 'https://github.com/mitmproxy/mitmproxy',
    account: 'Local installation needed', note: 'An intercepting proxy reads and can modify traffic. Use it only on devices and lab traffic you control; capturing other people\u2019s traffic without consent is unauthorised.',
    image: '/images/learning/command-cheatsheet.svg', icon: 'network', monogram: 'MP', practiceUrl: 'https://docs.mitmproxy.org/'
  }
];


export const categories = [
  'All resources', 'Foundations', 'SOC & SIEM', 'Threat Hunting', 'Detection Engineering',
  'Bug Bounty', 'Hands-on Labs', 'Security Concepts', 'DFIR', 'Cloud Security', 'GRC & Security Fundamentals', 'Penetration Testing'
];