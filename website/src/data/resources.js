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
  },
  {
    id: 'adv-nist-nice-roles', name: 'NIST NICE Framework: work roles and skills', provider: 'NIST', category: 'Career Resources', kind: 'Free official reference', level: 'Beginner to Advanced',
    description: 'Map cybersecurity tasks, knowledge, skills and work roles to career pathways and learning goals.',
    skills: ['Career planning', 'Work roles', 'Skills mapping'], url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center',
    account: 'No account required', note: 'Free public framework. It is a US-origin framework used more broadly; local job titles and requirements can differ.', image: '/images/learning/hands-on-lab.svg', icon: 'compass'
  },
  {
    id: 'adv-nist-low-cost-learning', name: 'NIST free and low-cost cybersecurity learning list', provider: 'NIST NICE', category: 'Foundations', kind: 'Free resource directory', level: 'Beginner to Advanced',
    description: 'A government-maintained starting point for discovering cybersecurity education and low-cost training providers.',
    skills: ['Learning research', 'Career exploration'], url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/resources/online-learning-content',
    account: 'No account required', note: 'Some listed providers are commercial; confirm current access and terms at the original provider.', image: '/images/learning/hands-on-lab.svg', icon: 'book-open'
  },
  {
    id: 'adv-cisco-skillsforall-cyber-path', name: 'Cisco Skills for All cybersecurity learning', provider: 'Cisco Networking Academy', category: 'Foundations', kind: 'Free training; awards vary by course', level: 'Beginner to Intermediate',
    description: 'Explore self-paced networking and cybersecurity courses and role-oriented learning options.',
    skills: ['Networking', 'Security fundamentals', 'Network defence'], url: 'https://skillsforall.com/',
    account: 'Account may be required', note: 'Course availability, language, badge eligibility and regional offerings can vary. Course completion is not the same as passing a Cisco certification exam.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'adv-linuxjourney', name: 'Linux Journey', provider: 'Community resource', category: 'Networking & Linux', kind: 'Free learning reference', level: 'Beginner to Intermediate',
    description: 'Learn Linux command-line concepts, processes, permissions, filesystems and system administration basics.',
    skills: ['Linux', 'Command line', 'System administration'], url: 'https://linuxjourney.com/',
    account: 'No account required', note: 'Free community learning resource; practise commands in a machine you control.', image: '/images/learning/hands-on-lab.svg', icon: 'terminal'
  },
  {
    id: 'adv-picoctf-picogym', name: 'picoCTF and picoGym', provider: 'Carnegie Mellon University', category: 'Hands-on Labs', kind: 'Free CTF learning', level: 'Beginner to Advanced',
    description: 'Practice computer-security concepts through intentionally designed challenges and a self-paced practice area.',
    skills: ['CTF', 'Cryptography', 'Forensics', 'Web security'], url: 'https://picoctf.org/',
    account: 'Account may be required', note: 'Use the hosted practice environment and follow its terms; not a licence to test other systems.', image: '/images/learning/hands-on-lab.svg', icon: 'terminal'
  },
  {
    id: 'adv-cryptohack', name: 'CryptoHack', provider: 'CryptoHack community', category: 'Cryptography', kind: 'Free interactive challenges', level: 'Beginner to Advanced',
    description: 'Learn applied cryptography through guided explanations and progressively harder challenges.',
    skills: ['Cryptography', 'Python', 'Mathematics'], url: 'https://cryptohack.org/',
    account: 'Account may be required', note: 'Educational puzzle platform. Use only its intended challenges and environments.', image: '/images/learning/hands-on-lab.svg', icon: 'key-round'
  },
  {
    id: 'adv-cryptool', name: 'CrypTool learning resources', provider: 'CrypTool', category: 'Cryptography', kind: 'Free educational tools and materials', level: 'Beginner to Advanced',
    description: 'Explore cryptography concepts, demonstrations and educational exercises.',
    skills: ['Cryptography', 'Encryption', 'Security mathematics'], url: 'https://www.cryptool.org/en/',
    account: 'Usually no account required', note: 'Educational tools are not a substitute for current production cryptographic guidance.', image: '/images/learning/hands-on-lab.svg', icon: 'key-round'
  },
  {
    id: 'adv-cloudflare-learning', name: 'Cloudflare Learning Center', provider: 'Cloudflare', category: 'Foundations', kind: 'Free educational reference', level: 'Beginner to Intermediate',
    description: 'Plain-language explanations of DNS, TLS, DDoS, web performance and common internet-security concepts.',
    skills: ['DNS', 'TLS', 'Web security', 'Networking'], url: 'https://www.cloudflare.com/learning/',
    account: 'No account required', note: 'Free learning articles; some linked product features are commercial.', image: '/images/learning/hands-on-lab.svg', icon: 'globe'
  },
  {
    id: 'adv-mdn-http', name: 'MDN Web Docs: HTTP', provider: 'Mozilla', category: 'Web Security', kind: 'Free technical reference', level: 'Beginner to Advanced',
    description: 'Use authoritative developer documentation to understand HTTP requests, responses, headers, cookies and web platform behaviour.',
    skills: ['HTTP', 'Web development', 'Web security'], url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    account: 'No account required', note: 'Free documentation. Pair it with authorised web-security labs for practical learning.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-nist-csf2', name: 'NIST Cybersecurity Framework 2.0', provider: 'NIST', category: 'Governance & Risk', kind: 'Free official framework', level: 'Intermediate to Advanced',
    description: 'Learn to describe, assess and improve cybersecurity risk management using CSF 2.0 outcomes.',
    skills: ['Risk management', 'Governance', 'Security programme'], url: 'https://www.nist.gov/cyberframework',
    account: 'No account required', note: 'Free framework and supporting resources; implementation tools or consulting may be paid.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-cisa-cpgs', name: 'CISA Cross-Sector Cybersecurity Performance Goals', provider: 'CISA', category: 'Governance & Risk', kind: 'Free official guidance', level: 'Beginner to Advanced',
    description: 'Prioritise practical baseline security improvements for organisations using CISA guidance.',
    skills: ['Cyber hygiene', 'Risk prioritisation', 'Defensive controls'], url: 'https://www.cisa.gov/cross-sector-cybersecurity-performance-goals',
    account: 'No account required', note: 'Free guidance. Adapt recommendations to the organisation, threat model and applicable local requirements.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-cisa-secure-by-design', name: 'CISA Secure by Design', provider: 'CISA', category: 'Security Engineering', kind: 'Free official guidance', level: 'Intermediate to Advanced',
    description: 'Study secure product design, default security, accountability and ways product teams can reduce customer risk.',
    skills: ['Secure development', 'Product security', 'Risk reduction'], url: 'https://www.cisa.gov/securebydesign',
    account: 'No account required', note: 'Free guidance, not a certification.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-mitre-attack-training', name: 'MITRE ATT&CK training collection', provider: 'MITRE', category: 'Threat Hunting', kind: 'Free training and references', level: 'Intermediate to Advanced',
    description: 'Learn ATT&CK fundamentals, adversary emulation, purple teaming, threat hunting and detection engineering.',
    skills: ['MITRE ATT&CK', 'Threat hunting', 'Detection engineering'], url: 'https://attack.mitre.org/resources/learn-more-about-attack/training/',
    account: 'No account required for public materials', note: 'Free public training resources. ATT&CK is a knowledge base, not a complete incident-response methodology by itself.', image: '/images/learning/hands-on-lab.svg', icon: 'target'
  },
  {
    id: 'adv-mitre-cti-training', name: 'MITRE ATT&CK Cyber Threat Intelligence training', provider: 'MITRE', category: 'Threat Intelligence', kind: 'Free modular training', level: 'Intermediate to Advanced',
    description: 'Practice mapping reports and raw data to ATT&CK and deriving defensive recommendations from intelligence.',
    skills: ['Threat intelligence', 'ATT&CK mapping', 'Analytical writing'], url: 'https://attack.mitre.org/resources/training/cti/',
    account: 'No account required', note: 'The training assumes familiarity with core ATT&CK concepts; complete the fundamentals first.', image: '/images/learning/hands-on-lab.svg', icon: 'search'
  },
  {
    id: 'adv-mitre-ics-matrix', name: 'MITRE ATT&CK for ICS', provider: 'MITRE', category: 'OT / ICS Security', kind: 'Free official reference', level: 'Intermediate to Advanced',
    description: 'Understand adversary behaviour patterns relevant to industrial control systems and operational technology.',
    skills: ['ICS security', 'OT defence', 'Threat modelling'], url: 'https://attack.mitre.org/matrices/ics/',
    account: 'No account required', note: 'Reference material only; industrial environments require strict authorisation and safety controls.', image: '/images/learning/hands-on-lab.svg', icon: 'factory'
  },
  {
    id: 'adv-nvd-cve', name: 'NIST National Vulnerability Database', provider: 'NIST', category: 'Threat Intelligence', kind: 'Free public database', level: 'Intermediate to Advanced',
    description: 'Research CVEs, CVSS-related data and vulnerability metadata from a public reference database.',
    skills: ['CVE research', 'Vulnerability management', 'Risk triage'], url: 'https://nvd.nist.gov/',
    account: 'No account required for browsing', note: 'Use the source record and vendor advisory; a CVSS score alone does not determine business risk.', image: '/images/learning/hands-on-lab.svg', icon: 'database'
  },
  {
    id: 'adv-cisa-kev', name: 'CISA Known Exploited Vulnerabilities Catalog', provider: 'CISA', category: 'Threat Intelligence', kind: 'Free official catalogue', level: 'Intermediate to Advanced',
    description: 'Prioritise vulnerabilities known to have been exploited in the wild using a maintained government catalogue.',
    skills: ['Vulnerability prioritisation', 'Patch management', 'Threat intelligence'], url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    account: 'No account required', note: 'Free public data; check the latest entry and due dates rather than relying on a downloaded stale copy.', image: '/images/learning/hands-on-lab.svg', icon: 'database'
  },
  {
    id: 'adv-nice-career-pathways', name: 'NIST cybersecurity career pathway resources', provider: 'NIST NICE', category: 'Career Resources', kind: 'Free career-planning references', level: 'Beginner to Advanced',
    description: 'Explore role pathways, educational options and certification-planning resources mapped to cybersecurity work.',
    skills: ['Career planning', 'Role mapping', 'Skills gaps'], url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/resources/cyber-careers',
    account: 'No account required', note: 'Includes US-focused datasets and tools; do not present them as local salary or vacancy data for other countries.', image: '/images/learning/hands-on-lab.svg', icon: 'compass'
  },
  {
    id: 'adv-owasp-wstg', name: 'OWASP Web Security Testing Guide', provider: 'OWASP', category: 'Web Security', kind: 'Free technical guide', level: 'Intermediate to Advanced',
    description: 'Use a structured testing methodology for web applications, with test areas and reporting guidance.',
    skills: ['Web application security', 'Testing methodology', 'Reporting'], url: 'https://owasp.org/projects/web-security-testing-guide',
    account: 'No account required', note: 'Use only on systems you own or are explicitly authorised to assess.', image: '/images/learning/hands-on-lab.svg', icon: 'bug'
  },
  {
    id: 'adv-owasp-asvs', name: 'OWASP Application Security Verification Standard', provider: 'OWASP', category: 'Web Security', kind: 'Free verification standard', level: 'Intermediate to Advanced',
    description: 'Turn application-security requirements into a structured verification checklist for design, implementation and testing.',
    skills: ['Secure design', 'Verification', 'AppSec'], url: 'https://owasp.org/www-project-application-security-verification-standard/',
    account: 'No account required', note: 'Free standard. Treat the version number as important and verify the current release.', image: '/images/learning/hands-on-lab.svg', icon: 'clipboard-check'
  },
  {
    id: 'adv-owasp-api-top10', name: 'OWASP API Security Top 10', provider: 'OWASP', category: 'Web Security', kind: 'Free official reference', level: 'Intermediate to Advanced',
    description: 'Understand common API security risk categories and use them to guide secure design and authorised testing.',
    skills: ['API security', 'Authentication', 'Access control'], url: 'https://owasp.org/www-project-api-security/',
    account: 'No account required', note: 'Use with the current project material and controlled training APIs.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-owasp-cheatsheets', name: 'OWASP Cheat Sheet Series', provider: 'OWASP', category: 'Security Engineering', kind: 'Free practical reference', level: 'Beginner to Advanced',
    description: 'Find concise implementation-oriented guidance on authentication, sessions, input validation, logging and other security topics.',
    skills: ['Secure coding', 'AppSec', 'Implementation guidance'], url: 'https://cheatsheetseries.owasp.org/',
    account: 'No account required', note: 'Recommendations need context; check the referenced technology and version.', image: '/images/learning/hands-on-lab.svg', icon: 'book-open'
  },
  {
    id: 'adv-owasp-webgoat', name: 'OWASP WebGoat', provider: 'OWASP', category: 'Hands-on Labs', kind: 'Free intentionally vulnerable training app', level: 'Intermediate',
    description: 'Learn web application security in an application designed for security training.',
    skills: ['Web security', 'Secure coding', 'Lab reporting'], url: 'https://owasp.org/www-project-webgoat/',
    account: 'No account required for docs; local setup required for practice', note: 'Run only in an isolated local lab. Never expose a deliberately vulnerable instance to the public internet.', image: '/images/learning/hands-on-lab.svg', icon: 'bug'
  },
  {
    id: 'adv-owasp-crapi', name: 'OWASP crAPI API security lab', provider: 'OWASP', category: 'Hands-on Labs', kind: 'Free open-source local lab', level: 'Intermediate to Advanced',
    description: 'Practice API security concepts using a deliberately vulnerable microservices application designed for education.',
    skills: ['API security', 'Access control', 'Threat modelling'], url: 'https://owasp.org/www-project-crapi/',
    account: 'Local setup required', note: 'Run locally or in a dedicated lab you control and follow the project instructions.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-owasp-samm', name: 'OWASP Software Assurance Maturity Model (SAMM)', provider: 'OWASP', category: 'Security Engineering', kind: 'Free framework', level: 'Intermediate to Advanced',
    description: 'Plan and measure a software security programme across governance, design, implementation, verification and operations.',
    skills: ['Secure SDLC', 'Maturity assessment', 'DevSecOps'], url: 'https://owaspsamm.org/',
    account: 'No account required', note: 'Free model and guidance; implementation services may cost money.', image: '/images/learning/hands-on-lab.svg', icon: 'layers'
  },
  {
    id: 'adv-zap-docs', name: 'OWASP ZAP documentation and getting started', provider: 'OWASP ZAP', category: 'Web Security', kind: 'Free open-source tool documentation', level: 'Beginner to Advanced',
    description: 'Learn how to set up and use a web application security testing proxy in permitted test environments.',
    skills: ['Web security', 'Testing tools', 'Proxy fundamentals'], url: 'https://www.zaproxy.org/docs/',
    account: 'No account required', note: 'Only scan applications you own or have explicit permission to test; follow the tool and target rules.', image: '/images/learning/hands-on-lab.svg', icon: 'bug'
  },
  {
    id: 'adv-codeql-docs', name: 'CodeQL documentation and query learning', provider: 'GitHub', category: 'Security Engineering', kind: 'Free documentation; product access varies', level: 'Intermediate to Advanced',
    description: 'Learn code scanning concepts and how CodeQL queries can identify classes of code vulnerabilities.',
    skills: ['Code review', 'Static analysis', 'Secure software'], url: 'https://codeql.github.com/docs/',
    account: 'GitHub account may be required for some features', note: 'Product availability depends on repository type, plan and current GitHub terms.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-github-actions-hardening', name: 'GitHub Actions security hardening', provider: 'GitHub', category: 'Security Engineering', kind: 'Free official documentation', level: 'Intermediate to Advanced',
    description: 'Harden CI/CD workflows through least privilege, protected secrets, pinned actions and supply-chain-aware practices.',
    skills: ['CI/CD', 'Secrets management', 'Supply-chain security'], url: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions',
    account: 'No account required', note: 'Free documentation. Validate recommendations against the current workflow and organisation policy.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-github-securitylab', name: 'GitHub Security Lab research and training', provider: 'GitHub', category: 'Security Engineering', kind: 'Free research and learning', level: 'Intermediate to Advanced',
    description: 'Explore secure-code research, vulnerability analysis and tutorials from GitHub Security Lab.',
    skills: ['Secure coding', 'Vulnerability research', 'CodeQL'], url: 'https://securitylab.github.com/',
    account: 'No account required', note: 'Research material may assume programming experience; practice only in assigned labs or owned code.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-btlo', name: 'Blue Team Labs Online', provider: 'Blue Team Labs Online', category: 'SOC & SIEM', kind: 'Free / paid access varies by challenge', level: 'Intermediate to Advanced',
    description: 'Practice defensive investigation scenarios and blue-team challenge workflows.',
    skills: ['SOC analysis', 'Incident investigation', 'Digital forensics'], url: 'https://blueteamlabs.online/',
    account: 'Account required', note: 'Free and paid access can differ by challenge and plan; verify before starting.', image: '/images/learning/hands-on-lab.svg', icon: 'shield'
  },
  {
    id: 'adv-splunk-free-courses', name: 'Splunk free training courses', provider: 'Splunk', category: 'SOC & SIEM', kind: 'Free training; certification separate', level: 'Beginner to Advanced',
    description: 'Learn Splunk fundamentals, fields, dashboards, searches and data-analysis concepts through official free courses.',
    skills: ['SIEM', 'Log analysis', 'Search'], url: 'https://www.splunk.com/en_us/training/free-courses/overview.html',
    account: 'Account or registration may be required', note: 'Free learning content does not mean every Splunk product, lab, certification or exam is free.', image: '/images/learning/hands-on-lab.svg', icon: 'activity'
  },
  {
    id: 'adv-microsoft-sentinel-kql', name: 'Microsoft Sentinel KQL learning path', provider: 'Microsoft Learn', category: 'SOC & SIEM', kind: 'Free official training; cloud usage may cost', level: 'Intermediate',
    description: 'Practise Kusto Query Language concepts for Microsoft Sentinel security operations and investigation.',
    skills: ['KQL', 'SIEM', 'Threat hunting'], url: 'https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/',
    account: 'Microsoft account may be required for some exercises', note: 'Training is free; deploying or running Azure resources can incur charges. Review subscription, region and cleanup steps first.', image: '/images/learning/hands-on-lab.svg', icon: 'activity'
  },
  {
    id: 'adv-microsoft-defender-training', name: 'Microsoft Defender security training', provider: 'Microsoft Learn', category: 'SOC & SIEM', kind: 'Free official training; product access varies', level: 'Beginner to Advanced',
    description: 'Explore learning paths for Microsoft Defender XDR, endpoint protection, identity protection and incident investigation.',
    skills: ['Endpoint security', 'XDR', 'Incident response'], url: 'https://learn.microsoft.com/en-us/training/defender/',
    account: 'Microsoft account may be required for some features', note: 'Training and product licences are different; advanced exercises may need an appropriate tenant or licence.', image: '/images/learning/hands-on-lab.svg', icon: 'shield'
  },
  {
    id: 'adv-elastic-security-labs', name: 'Elastic Security Labs research', provider: 'Elastic', category: 'Threat Hunting', kind: 'Free research and technical references', level: 'Intermediate to Advanced',
    description: 'Read threat research, detection analysis and technical investigations that can help analysts understand attacker behaviour.',
    skills: ['Threat research', 'Detection engineering', 'Malware analysis'], url: 'https://www.elastic.co/security-labs',
    account: 'No account required for public research', note: 'Research articles are not a substitute for testing detections against your own representative telemetry.', image: '/images/learning/hands-on-lab.svg', icon: 'search'
  },
  {
    id: 'adv-wazuh-docs', name: 'Wazuh documentation and deployment guides', provider: 'Wazuh', category: 'SOC & SIEM', kind: 'Free open-source documentation', level: 'Beginner to Advanced',
    description: 'Learn endpoint monitoring, alerting, rules, agents and security event collection with an open-source security platform.',
    skills: ['SIEM', 'Endpoint monitoring', 'Detection'], url: 'https://documentation.wazuh.com/current/',
    account: 'No account required for docs', note: 'The software and docs are open source; infrastructure, hosting and operations still require resources.', image: '/images/learning/hands-on-lab.svg', icon: 'server'
  },
  {
    id: 'adv-sigmahq-rules', name: 'Sigma detection rules and specification', provider: 'SigmaHQ', category: 'Threat Hunting', kind: 'Free community rules and specification', level: 'Intermediate to Advanced',
    description: 'Study portable detection logic, threat-hunting rules, compliance rules and detection engineering conventions.',
    skills: ['Sigma', 'SIEM', 'Detection engineering'], url: 'https://github.com/SigmaHQ/sigma',
    account: 'GitHub account optional for browsing', note: 'Review rule metadata, backend compatibility, false positives and repository licence before reusing.', image: '/images/learning/hands-on-lab.svg', icon: 'file-search'
  },
  {
    id: 'adv-yara-rules', name: 'YARA rule collection', provider: 'YARA-Rules community', category: 'Malware Analysis', kind: 'Free community rules; licence applies', level: 'Intermediate to Advanced',
    description: 'Explore rule categories used to help identify patterns in files for defensive malware analysis.',
    skills: ['YARA', 'Malware triage', 'Detection'], url: 'https://github.com/Yara-Rules/rules',
    account: 'GitHub account optional for browsing', note: 'Rules may produce false positives; validate in a controlled lab and comply with the repository licence.', image: '/images/learning/hands-on-lab.svg', icon: 'scan'
  },
  {
    id: 'adv-wireshark-guide', name: 'Wireshark User Guide', provider: 'Wireshark Foundation', category: 'Network Security', kind: 'Free official documentation', level: 'Beginner to Advanced',
    description: 'Learn packet capture concepts, display filters, protocol analysis and troubleshooting with the official guide.',
    skills: ['Packet analysis', 'TCP/IP', 'Network forensics'], url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
    account: 'No account required', note: 'Use captures you own or are authorised to inspect; protect sensitive packet contents.', image: '/images/learning/hands-on-lab.svg', icon: 'network'
  },
  {
    id: 'adv-zeek-docs', name: 'Zeek network security monitoring documentation', provider: 'Zeek Project', category: 'Network Security', kind: 'Free open-source documentation', level: 'Intermediate to Advanced',
    description: 'Learn network security monitoring concepts, logs, scripting and protocol analysis with Zeek.',
    skills: ['NSM', 'Network telemetry', 'Detection'], url: 'https://docs.zeek.org/en/current/',
    account: 'No account required', note: 'Use sample PCAPs or networks you are authorised to monitor.', image: '/images/learning/hands-on-lab.svg', icon: 'network'
  },
  {
    id: 'adv-suricata-docs', name: 'Suricata documentation', provider: 'OISF / Suricata', category: 'Network Security', kind: 'Free open-source documentation', level: 'Intermediate to Advanced',
    description: 'Study network IDS/IPS concepts, rules, alerts and traffic inspection using official Suricata documentation.',
    skills: ['IDS/IPS', 'Network defence', 'Rules'], url: 'https://docs.suricata.io/en/latest/',
    account: 'No account required', note: 'Run detection tests only on systems and datasets you are permitted to use.', image: '/images/learning/hands-on-lab.svg', icon: 'network'
  },
  {
    id: 'adv-securityonion-docs', name: 'Security Onion documentation', provider: 'Security Onion Solutions', category: 'SOC & SIEM', kind: 'Free documentation; deployment resources vary', level: 'Intermediate to Advanced',
    description: 'Learn how a security monitoring platform combines network visibility, detection and investigation workflows.',
    skills: ['SOC', 'Network monitoring', 'Incident investigation'], url: 'https://docs.securityonion.net/en/2.4/',
    account: 'No account required for docs', note: 'Plan VM/storage requirements before deploying. Follow current installation guidance and licence terms.', image: '/images/learning/hands-on-lab.svg', icon: 'server'
  },
  {
    id: 'adv-ocsf-schema', name: 'Open Cybersecurity Schema Framework (OCSF)', provider: 'OCSF community', category: 'Security Engineering', kind: 'Free open schema', level: 'Intermediate to Advanced',
    description: 'Understand a vendor-agnostic event schema used to normalise security telemetry across products and systems.',
    skills: ['Log normalisation', 'Data engineering', 'Security analytics'], url: 'https://schema.ocsf.io/',
    account: 'No account required', note: 'Schema mappings require validation; normalisation does not guarantee that two events have equivalent meaning.', image: '/images/learning/hands-on-lab.svg', icon: 'database'
  },
  {
    id: 'adv-atomic-red-team', name: 'Atomic Red Team testing library', provider: 'Red Canary / Atomic Red Team', category: 'Threat Hunting', kind: 'Free open-source test library', level: 'Advanced',
    description: 'Learn how defenders can validate analytics and controls with small, documented tests in a controlled environment.',
    skills: ['Detection validation', 'Purple teaming', 'ATT&CK mapping'], url: 'https://atomicredteam.io/',
    account: 'No account required for docs', note: 'Run only in isolated test systems with authorisation, a rollback plan and an understanding of each test’s effects.', image: '/images/learning/hands-on-lab.svg', icon: 'flask-conical'
  },
  {
    id: 'adv-malware-traffic-pcaps', name: 'Malware-Traffic-Analysis.net PCAP exercises', provider: 'Malware-Traffic-Analysis.net', category: 'Digital Forensics', kind: 'Free educational PCAPs and walkthroughs', level: 'Intermediate to Advanced',
    description: 'Practice traffic analysis using curated packet captures and educational malware-traffic investigations.',
    skills: ['PCAP analysis', 'Network forensics', 'Incident response'], url: 'https://www.malware-traffic-analysis.net/',
    account: 'No account required for public materials', note: 'Treat samples as potentially malicious; analyse offline in a controlled environment and follow the site’s terms.', image: '/images/learning/hands-on-lab.svg', icon: 'network'
  },
  {
    id: 'adv-remnux-docs', name: 'REMnux malware analysis toolkit documentation', provider: 'REMnux', category: 'Malware Analysis', kind: 'Free toolkit and documentation', level: 'Advanced',
    description: 'Build a malware-analysis environment with curated tools for static analysis, behavioural analysis and network artefact review.',
    skills: ['Malware analysis', 'Reverse engineering', 'Forensics'], url: 'https://docs.remnux.org/',
    account: 'No account required for docs', note: 'Use a dedicated isolated VM; never run unknown samples on a personal or production system.', image: '/images/learning/hands-on-lab.svg', icon: 'terminal'
  },
  {
    id: 'adv-flare-vm', name: 'FLARE-VM malware-analysis environment', provider: 'Mandiant', category: 'Malware Analysis', kind: 'Free open-source setup scripts; environment costs vary', level: 'Advanced',
    description: 'Learn about a Windows-based reverse-engineering and malware-analysis environment for controlled research.',
    skills: ['Windows analysis', 'Reverse engineering', 'Malware triage'], url: 'https://github.com/mandiant/flare-vm',
    account: 'GitHub account optional for browsing', note: 'Install in a dedicated disposable VM and follow the project’s isolation and setup guidance.', image: '/images/learning/hands-on-lab.svg', icon: 'monitor'
  },
  {
    id: 'adv-ghidra-docs', name: 'Ghidra software reverse-engineering documentation', provider: 'Ghidra / NSA', category: 'Malware Analysis', kind: 'Free open-source tool and documentation', level: 'Advanced',
    description: 'Study disassembly, decompilation, binary navigation and software analysis through Ghidra documentation.',
    skills: ['Reverse engineering', 'Binary analysis', 'Code comprehension'], url: 'https://ghidra-sre.org/',
    account: 'No account required for docs', note: 'Use only samples and binaries you have rights to analyse; reverse-engineering activity may be constrained by law or contract.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-volatility3-docs', name: 'Volatility 3 memory forensics documentation', provider: 'Volatility Foundation', category: 'Digital Forensics', kind: 'Free open-source documentation', level: 'Advanced',
    description: 'Learn memory-forensics concepts and how to approach analysis of memory images using the Volatility framework.',
    skills: ['Memory forensics', 'Incident response', 'Windows artefacts'], url: 'https://volatility3.readthedocs.io/en/latest/',
    account: 'No account required', note: 'Practise with supplied or authorised memory images; memory dumps can contain personal and confidential information.', image: '/images/learning/hands-on-lab.svg', icon: 'database'
  },
  {
    id: 'adv-autopsy-docs', name: 'Autopsy digital forensics documentation', provider: 'Autopsy', category: 'Digital Forensics', kind: 'Free tool documentation; services vary', level: 'Intermediate to Advanced',
    description: 'Explore digital investigation workflows and forensic case analysis using Autopsy.',
    skills: ['Digital forensics', 'Evidence review', 'Case documentation'], url: 'https://www.autopsy.com/support/',
    account: 'No account required for docs', note: 'Maintain evidence integrity and legal authority to examine every dataset.', image: '/images/learning/hands-on-lab.svg', icon: 'file-search'
  },
  {
    id: 'adv-velociraptor-docs', name: 'Velociraptor DFIR documentation', provider: 'Velociraptor', category: 'Digital Forensics', kind: 'Free open-source documentation', level: 'Advanced',
    description: 'Learn endpoint visibility, collection and investigation workflows for defensive response.',
    skills: ['DFIR', 'Endpoint investigation', 'Telemetry'], url: 'https://docs.velociraptor.app/',
    account: 'No account required for docs', note: 'Use only on endpoints you own or administer with explicit permission and a privacy-aware collection plan.', image: '/images/learning/hands-on-lab.svg', icon: 'search'
  },
  {
    id: 'adv-misp-book', name: 'MISP threat-intelligence sharing book', provider: 'MISP Project / CIRCL', category: 'Threat Intelligence', kind: 'Free technical documentation', level: 'Intermediate to Advanced',
    description: 'Learn threat-information sharing concepts, event structures, taxonomies and intelligence workflows.',
    skills: ['Threat intelligence', 'Indicators', 'Information sharing'], url: 'https://www.circl.lu/doc/misp/',
    account: 'No account required', note: 'The platform can handle sensitive indicators; follow sharing restrictions, confidence labels and privacy rules.', image: '/images/learning/hands-on-lab.svg', icon: 'share-2'
  },
  {
    id: 'adv-opencti-docs', name: 'OpenCTI documentation', provider: 'OpenCTI', category: 'Threat Intelligence', kind: 'Free docs; hosted or enterprise services may be paid', level: 'Intermediate to Advanced',
    description: 'Learn about structuring, linking and analysing cyber threat intelligence knowledge.',
    skills: ['Threat intelligence', 'STIX', 'Knowledge graph'], url: 'https://docs.opencti.io/latest/',
    account: 'No account required for docs', note: 'Self-hosting requires compute and maintenance; hosted offerings may have separate commercial terms.', image: '/images/learning/hands-on-lab.svg', icon: 'network'
  },
  {
    id: 'adv-threatfox', name: 'ThreatFox malware indicator database', provider: 'abuse.ch', category: 'Threat Intelligence', kind: 'Free public threat-intelligence feed; terms apply', level: 'Intermediate to Advanced',
    description: 'Explore public indicators of compromise and learn how to record source, context and confidence for threat research.',
    skills: ['Indicators', 'Threat intelligence', 'IOC enrichment'], url: 'https://threatfox.abuse.ch/',
    account: 'Account/API token may be required for some features', note: 'Validate freshness and context before taking action; indicators can be incomplete or falsely attributed.', image: '/images/learning/hands-on-lab.svg', icon: 'database'
  },
  {
    id: 'adv-urlscan-docs', name: 'urlscan.io documentation', provider: 'urlscan.io', category: 'Threat Intelligence', kind: 'Free public access; limits and API terms apply', level: 'Intermediate to Advanced',
    description: 'Learn to analyse public web-scan results and understand URL, domain and page metadata.',
    skills: ['URL analysis', 'OSINT', 'Web artefacts'], url: 'https://urlscan.io/docs/',
    account: 'Account may be required for some features', note: 'Uploads can expose URLs and related information publicly depending on scan visibility settings. Do not submit private links or sensitive tokens.', image: '/images/learning/hands-on-lab.svg', icon: 'search'
  },
  {
    id: 'adv-virustotal-docs', name: 'VirusTotal documentation', provider: 'VirusTotal', category: 'Threat Intelligence', kind: 'Free limited access; commercial use/quotas vary', level: 'Intermediate to Advanced',
    description: 'Understand how to interpret multi-engine file, URL, domain and indicator results for defensive triage.',
    skills: ['Threat intelligence', 'IOC triage', 'File analysis'], url: 'https://docs.virustotal.com/reference/overview',
    account: 'Account/API key may be required', note: 'Public submissions and API terms have privacy implications; never upload confidential files without approval.', image: '/images/learning/hands-on-lab.svg', icon: 'shield'
  },
  {
    id: 'adv-nist-ir-80061r3', name: 'NIST incident response recommendations (SP 800-61 Rev. 3)', provider: 'NIST', category: 'Digital Forensics', kind: 'Free official publication', level: 'Intermediate to Advanced',
    description: 'Study incident-response recommendations integrated with cybersecurity risk management and CSF 2.0.',
    skills: ['Incident response', 'Preparation', 'Recovery'], url: 'https://csrc.nist.gov/pubs/sp/800/61/r3/final',
    account: 'No account required', note: 'Free publication. Check publication date and errata before using in policy work.', image: '/images/learning/hands-on-lab.svg', icon: 'file-text'
  },
  {
    id: 'adv-nist-80053', name: 'NIST SP 800-53 security and privacy controls', provider: 'NIST', category: 'Governance & Risk', kind: 'Free official publication', level: 'Advanced',
    description: 'Explore a control catalogue for information systems and organisations.',
    skills: ['Security controls', 'Compliance', 'Risk management'], url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
    account: 'No account required', note: 'Large reference set; use appropriate tailoring and applicable legal/regulatory requirements.', image: '/images/learning/hands-on-lab.svg', icon: 'clipboard-check'
  },
  {
    id: 'adv-cis-controls', name: 'CIS Critical Security Controls', provider: 'Center for Internet Security', category: 'Governance & Risk', kind: 'Free public overview; detailed resources may vary', level: 'Beginner to Advanced',
    description: 'Use prioritised safeguards as a practical baseline for organisational cyber hygiene.',
    skills: ['Controls', 'Hardening', 'Risk assessment'], url: 'https://www.cisecurity.org/controls',
    account: 'No account required for overview', note: 'Check current version and access conditions for benchmarks or related resources.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-csa-ccm', name: 'Cloud Security Alliance Cloud Controls Matrix', provider: 'Cloud Security Alliance', category: 'Cloud Security', kind: 'Free framework; optional paid services vary', level: 'Intermediate to Advanced',
    description: 'Map cloud-security controls, assurance requirements and compliance considerations across cloud environments.',
    skills: ['Cloud governance', 'Compliance', 'Control mapping'], url: 'https://cloudsecurityalliance.org/research/cloud-controls-matrix',
    account: 'No account required for public resources', note: 'The matrix is a framework, not a substitute for the contracts, laws or assurance requirements relevant to an organisation.', image: '/images/learning/hands-on-lab.svg', icon: 'cloud'
  },
  {
    id: 'adv-nist-privacy-framework', name: 'NIST Privacy Framework', provider: 'NIST', category: 'Governance & Risk', kind: 'Free official framework', level: 'Intermediate to Advanced',
    description: 'Learn a risk-based approach to identifying and managing privacy risks alongside cybersecurity work.',
    skills: ['Privacy risk', 'Governance', 'Data lifecycle'], url: 'https://www.nist.gov/privacy-framework',
    account: 'No account required', note: 'Free framework; applicable privacy law differs by jurisdiction.', image: '/images/learning/hands-on-lab.svg', icon: 'lock'
  },
  {
    id: 'adv-aws-security-ramp-up', name: 'AWS Security Learning Plan and Ramp-Up Guide', provider: 'Amazon Web Services', category: 'Cloud Security', kind: 'Free digital courses; live training may be paid', level: 'Beginner to Advanced',
    description: 'Follow AWS-authored learning sequences for IAM, workload protection, monitoring, governance and cloud security.',
    skills: ['AWS security', 'IAM', 'Cloud operations'], url: 'https://aws.amazon.com/training/learn-about/security/',
    account: 'AWS account may be needed for some exercises', note: 'Free digital learning is distinct from paid classroom training, certification exams and usage-based AWS resources.', image: '/images/learning/hands-on-lab.svg', icon: 'cloud'
  },
  {
    id: 'adv-aws-security-pillar', name: 'AWS Well-Architected Security Pillar', provider: 'Amazon Web Services', category: 'Cloud Security', kind: 'Free official technical reference', level: 'Intermediate to Advanced',
    description: 'Review AWS design principles and best practices for identity, detection, infrastructure protection and data protection.',
    skills: ['Cloud architecture', 'IAM', 'Security design'], url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
    account: 'No account required for docs', note: 'Free documentation; implementing examples in a live account may incur charges.', image: '/images/learning/hands-on-lab.svg', icon: 'cloud'
  },
  {
    id: 'adv-microsoft-security-career', name: 'Microsoft Security Engineer learning path', provider: 'Microsoft Learn', category: 'Cloud Security', kind: 'Free official training; exam/product costs separate', level: 'Intermediate to Advanced',
    description: 'Explore a role-oriented learning route across identity, cloud, threat protection and security operations.',
    skills: ['Azure security', 'Identity', 'Security engineering'], url: 'https://learn.microsoft.com/en-us/training/career-paths/security-engineer',
    account: 'Microsoft account may be required for some labs', note: 'Training does not include every exam, lab service or commercial product licence.', image: '/images/learning/hands-on-lab.svg', icon: 'cloud'
  },
  {
    id: 'adv-google-cloud-cyber-cert', name: 'Google Cloud Cybersecurity Certificate', provider: 'Google Cloud / Google Skills', category: 'Cloud Security', kind: 'Paid subscription path; regional rates vary', level: 'Beginner to Intermediate',
    description: 'Learn foundational Google Cloud cybersecurity concepts through a multi-course pathway with labs and assessments.',
    skills: ['Cloud security', 'Google Cloud', 'Security operations'], url: 'https://cloud.google.com/learn/certificates',
    account: 'Google Skills account required', note: 'The listed subscription price and programme availability can change by region; confirm current price and included credential at enrolment.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'adv-kubernetes-security', name: 'Kubernetes security documentation', provider: 'Kubernetes', category: 'Cloud Security', kind: 'Free official documentation', level: 'Intermediate to Advanced',
    description: 'Study cluster security concepts including authentication, authorisation, secrets, workload isolation and policy.',
    skills: ['Kubernetes', 'Container security', 'Cloud-native security'], url: 'https://kubernetes.io/docs/concepts/security/',
    account: 'No account required', note: 'Run practice clusters locally or in authorised accounts; hosted infrastructure may cost money.', image: '/images/learning/hands-on-lab.svg', icon: 'server'
  },
  {
    id: 'adv-slsa-framework', name: 'SLSA software supply-chain security framework', provider: 'SLSA community', category: 'Security Engineering', kind: 'Free open framework', level: 'Intermediate to Advanced',
    description: 'Learn how to improve build integrity and provenance across software supply chains.',
    skills: ['Supply-chain security', 'Build provenance', 'CI/CD'], url: 'https://slsa.dev/',
    account: 'No account required', note: 'A framework and implementation guide, not a certification. Match controls to the actual build system.', image: '/images/learning/hands-on-lab.svg', icon: 'package-check'
  },
  {
    id: 'adv-openssf-scorecard', name: 'OpenSSF Scorecard', provider: 'OpenSSF', category: 'Security Engineering', kind: 'Free open-source tool and documentation', level: 'Intermediate to Advanced',
    description: 'Assess selected open-source project security practices using automated checks and documented criteria.',
    skills: ['Open-source security', 'Supply chain', 'Repository hygiene'], url: 'https://securityscorecards.dev/',
    account: 'No account required', note: 'Scorecards are signals, not definitive security ratings. Check the underlying findings and limitations.', image: '/images/learning/hands-on-lab.svg', icon: 'shield-check'
  },
  {
    id: 'adv-owasp-llm-top10', name: 'OWASP Top 10 for LLM Applications', provider: 'OWASP GenAI Security Project', category: 'AI Security', kind: 'Free technical reference', level: 'Intermediate to Advanced',
    description: 'Study common risk categories in LLM-based applications and use them to plan defensive design and evaluation.',
    skills: ['LLM security', 'Application security', 'Risk assessment'], url: 'https://owasp.org/projects/top-10-for-large-language-model-applications',
    account: 'No account required', note: 'Use as a risk-awareness reference and pair it with safe testing, secure design and current project guidance.', image: '/images/learning/hands-on-lab.svg', icon: 'brain-circuit'
  },
  {
    id: 'adv-mitre-atlas', name: 'MITRE ATLAS AI threat landscape', provider: 'MITRE', category: 'AI Security', kind: 'Free official knowledge base', level: 'Intermediate to Advanced',
    description: 'Explore adversary tactics and techniques relevant to AI-enabled systems and machine-learning security.',
    skills: ['AI security', 'Threat modelling', 'Red/blue team analysis'], url: 'https://atlas.mitre.org/',
    account: 'No account required', note: 'Knowledge base for threat-informed defence; validate context for the specific AI system and deployment.', image: '/images/learning/hands-on-lab.svg', icon: 'brain-circuit'
  },
  {
    id: 'adv-nist-ai-rmf', name: 'NIST AI Risk Management Framework', provider: 'NIST', category: 'AI Security', kind: 'Free official framework', level: 'Intermediate to Advanced',
    description: 'Organise AI risk management activities around governance, mapping, measurement and management.',
    skills: ['AI governance', 'Risk management', 'Model evaluation'], url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    account: 'No account required', note: 'Framework guidance, not a guarantee that an AI system is safe or compliant.', image: '/images/learning/hands-on-lab.svg', icon: 'brain-circuit'
  },
  {
    id: 'adv-cisa-ics-training', name: 'CISA Industrial Control Systems training calendar', provider: 'CISA', category: 'OT / ICS Security', kind: 'Training access varies by course and cohort', level: 'Intermediate to Advanced',
    description: 'Find official ICS cybersecurity training events and self-paced virtual course options.',
    skills: ['ICS security', 'OT incident response', 'Industrial networks'], url: 'https://www.cisa.gov/ics-training-calendar',
    account: 'Registration may be required', note: 'Eligibility and course dates vary. Confirm current registration requirements and lab availability with CISA.', image: '/images/learning/hands-on-lab.svg', icon: 'factory'
  },
  {
    id: 'adv-swayam-nptel', name: 'SWAYAM / NPTEL course directory', provider: 'Government of India / NPTEL', category: 'Certification Prep', kind: 'Free learning; optional proctored exams are paid', level: 'Beginner to Advanced',
    description: 'Find university-level courses, including relevant computing and security subjects, from India’s national online learning initiatives.',
    skills: ['Computer science', 'Cybersecurity foundations', 'University learning'], url: 'https://www.swayam.gov.in/',
    account: 'Account required to enrol', note: 'SWAYAM learning is free; optional certification exams have fees. The NPTEL page currently lists ₹1,000 per course exam; recheck the specific semester before showing a price.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'adv-futureskills-prime', name: 'FutureSkills Prime digital-skills and cybersecurity catalogue', provider: 'FutureSkills Prime', category: 'Certification Prep', kind: 'Free and paid programme terms vary', level: 'Beginner to Advanced',
    description: 'Search India-focused digital-skills, cybersecurity and role-aligned learning programmes.',
    skills: ['Cybersecurity training', 'Digital skills', 'Career planning'], url: 'https://futureskillsprime.in/',
    account: 'Account may be required', note: 'Programme price, subsidy, eligibility and certificate outcomes differ by course; verify each current listing.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'adv-google-cybersecurity-coursera', name: 'Google Cybersecurity Professional Certificate', provider: 'Google / Coursera', category: 'Certification Prep', kind: 'Paid subscription; financial aid/region options vary', level: 'Beginner to Intermediate',
    description: 'Follow a multi-course introductory cybersecurity curriculum with practical tasks and a shareable programme certificate.',
    skills: ['Security operations', 'Linux', 'Python', 'SIEM basics'], url: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    account: 'Coursera account required', note: 'Subscription pricing, trial terms, financial aid and certificate eligibility can vary. This is a course-based professional certificate, not an exam-based vendor certification.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'adv-isc2-cc-path', name: 'ISC2 Certified in Cybersecurity (CC) credential information', provider: 'ISC2', category: 'Certification Prep', kind: 'Official certification; exam and maintenance terms apply', level: 'Beginner',
    description: 'Review the official credential requirements, exam outline and current enrolment options for the CC certification.',
    skills: ['Security fundamentals', 'Access control', 'Network security'], url: 'https://www.isc2.org/certifications/cc',
    account: 'Account required for registration', note: 'Do not label the exam universally free. Check the current exam fee, available promotions, eligibility and annual maintenance fee on the official issuer site.', image: '/images/learning/hands-on-lab.svg', icon: 'award'
  },
  {
    id: 'adv-cisco-ccna-path', name: 'Cisco CCNA official certification path', provider: 'Cisco', category: 'Certification Prep', kind: 'Paid exam; training costs vary', level: 'Intermediate',
    description: 'Review the official CCNA exam outline and training recommendations for networking fundamentals, access, IP connectivity, services and security basics.',
    skills: ['Networking', 'Routing', 'Switching', 'Network security'], url: 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html',
    account: 'Account required for some registrations', note: 'Separate free learning, commercial training and exam voucher costs. Confirm current regional exam price and exam version before purchase.', image: '/images/learning/hands-on-lab.svg', icon: 'award'
  },
  {
    id: 'adv-comptia-securityplus', name: 'CompTIA Security+ certification and exam objectives', provider: 'CompTIA', category: 'Certification Prep', kind: 'Paid certification; training options vary', level: 'Beginner to Intermediate',
    description: 'Use the official objectives to plan study across threats, architecture, operations, programme management and security controls.',
    skills: ['Security fundamentals', 'Certification preparation', 'Risk'], url: 'https://www.comptia.org/certifications/security',
    account: 'Account may be required for registration', note: 'Exam and training costs vary by country, voucher, bundle and promotion; verify current version and regional price.', image: '/images/learning/hands-on-lab.svg', icon: 'award'
  },
  {
    id: 'adv-cyberseek', name: 'CyberSeek workforce and career explorer', provider: 'CyberSeek', category: 'Career Resources', kind: 'Free tool; primarily US labour-market data', level: 'Beginner to Advanced',
    description: 'Explore US cybersecurity job categories, workforce demand and career pathways.',
    skills: ['Career research', 'Workforce data', 'Role exploration'], url: 'https://www.cyberseek.org/',
    account: 'No account required', note: 'The labour-market data is US-focused; do not present it as a local estimate for India or another region.', image: '/images/learning/hands-on-lab.svg', icon: 'chart-no-axes-combined'
  },
  {
    id: 'adv-enisa-skills', name: 'ENISA cybersecurity skills and competence resources', provider: 'ENISA', category: 'Career Resources', kind: 'Free public reference', level: 'Intermediate to Advanced',
    description: 'Explore European cybersecurity skills and role frameworks for comparing capability requirements.',
    skills: ['Skills frameworks', 'European cybersecurity', 'Career mapping'], url: 'https://www.enisa.europa.eu/topics/skills-and-competences',
    account: 'No account required', note: 'European context; compare with local employer requirements and frameworks.', image: '/images/learning/hands-on-lab.svg', icon: 'compass'
  },
  {
    id: 'adv-bellingcat-toolkit', name: 'Bellingcat Online Investigation Toolkit', provider: 'Bellingcat', category: 'Threat Intelligence', kind: 'Free public reference; tool terms vary', level: 'Intermediate to Advanced',
    description: 'Discover open-source investigation tools and methods for documenting online research.',
    skills: ['OSINT', 'Source evaluation', 'Research documentation'], url: 'https://bellingcat.gitbook.io/toolkit',
    account: 'No account required', note: 'Use lawfully available public information; protect privacy, avoid doxxing and respect platform terms.', image: '/images/learning/hands-on-lab.svg', icon: 'search'
  },
  {
    id: 'adv-picoctf-practice', name: 'picoGym practice library', provider: 'Carnegie Mellon University', category: 'Hands-on Labs', kind: 'Free practice challenges', level: 'Beginner to Advanced',
    description: 'Build skills through self-paced security puzzles across multiple topic categories.',
    skills: ['CTF', 'Problem solving', 'Security fundamentals'], url: 'https://play.picoctf.org/practice',
    account: 'Account may be required', note: 'Use the practice service only; do not transfer challenge techniques to systems without permission.', image: '/images/learning/hands-on-lab.svg', icon: 'terminal'
  },
  {
    id: 'adv-cwe-top25', name: 'CWE Top 25 Most Dangerous Software Weaknesses', provider: 'MITRE CWE', category: 'Security Engineering', kind: 'Free official reference', level: 'Intermediate to Advanced',
    description: 'Use a maintained weakness taxonomy to learn common software defect classes and prioritise secure-code review.',
    skills: ['Secure coding', 'Vulnerability taxonomy', 'Code review'], url: 'https://cwe.mitre.org/top25/',
    account: 'No account required', note: 'Check the year/version named on the page; lists change and should not be treated as the only weaknesses to consider.', image: '/images/learning/hands-on-lab.svg', icon: 'code'
  },
  {
    id: 'adv-nist-nice-international', name: 'NIST international cybersecurity workforce resources', provider: 'NIST NICE', category: 'Career Resources', kind: 'Free global workforce reference', level: 'Beginner to Advanced',
    description: 'Compare cybersecurity workforce frameworks and career-planning resources used in different regions.',
    skills: ['International career planning', 'Skills framework'], url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/international-cybersecurity-workforce',
    account: 'No account required', note: 'Frameworks and titles are not identical across countries; local job postings remain essential.', image: '/images/learning/hands-on-lab.svg', icon: 'globe'
  },
  {
    id: 'adv-nist-learner-resources', name: 'NIST NICE learner resources', provider: 'NIST NICE', category: 'Career Resources', kind: 'Free learner resource directory', level: 'Beginner to Advanced',
    description: 'Discover career profiles, work-role videos and learning tools mapped to cybersecurity workforce capabilities.',
    skills: ['Career exploration', 'Work roles', 'Learning planning'], url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/resources/learner-resources',
    account: 'No account required', note: 'Some tools are US-centred and third-party access terms can change.', image: '/images/learning/hands-on-lab.svg', icon: 'graduation-cap'
  },
  {
    id: 'grqz-ssl-imp-tls-fingerprint-research', name: 'TLS Client Fingerprinting Research — ssl_imp', provider: 'grqz · open-source research project', category: 'Network Security', kind: 'Advanced research reference', level: 'Advanced',
    description: 'Study how TLS client handshake characteristics can create observable fingerprints, using a C/OpenSSL research project that imitates a Chrome-like fingerprint. Pair it with defensive research on traffic attribution and the limits of fingerprinting.',
    skills: ['TLS', 'Client fingerprinting', 'Network traffic analysis', 'C/OpenSSL'], url: 'https://github.com/grqz/ssl_imp',
    account: 'No account required to browse', note: 'Use as a research reference for defensive analysis and interoperability experiments on systems you control. It is not permission to evade access controls or disguise abusive traffic; a fingerprint alone is not proof of identity.', image: '/images/learning/detection-tuning.svg', icon: 'network', monogram: 'TLS'
  },
  {
    id: 'stevietv-bearly-secure-go-web-security-lab', name: 'Bearly Secure — Go Web Security Starter Lab', provider: 'StevieTV fork · Boot.dev upstream', category: 'Application Security', kind: 'Intentionally vulnerable training app', level: 'Intermediate',
    description: 'An intentionally vulnerable Go web application with a separate browser-based attacker lab for learning authentication, authorization, injection, session handling, and browser trust boundaries.',
    skills: ['Go', 'Web application security', 'Authentication', 'Authorization', 'Secure coding'], url: 'https://github.com/stevietv/learn-web-security-golang-starter',
    account: 'Local Go environment required', note: 'This repository is a fork of the Boot.dev starter project. Use only in an isolated local training environment; never deploy it publicly or use real accounts, credentials, or customer data. Check the upstream source, licence, and course terms before reuse.', image: '/images/learning/web-security.svg', icon: 'bug', monogram: 'GO', practiceUrl: 'https://github.com/stevietv/learn-web-security-golang-starter'
  },
  {
    id: 'witherornot-warbird-obfuscation-documentation', name: 'Warbird Obfuscation — Windows Reverse Engineering Notes', provider: 'WitherOrNot · community research documentation', category: 'Reverse Engineering', kind: 'Advanced documentation', level: 'Advanced',
    description: 'Community-written documentation about Microsoft Warbird obfuscation, useful as a reference for advanced Windows internals and controlled reverse-engineering study.',
    skills: ['Windows internals', 'Reverse engineering', 'Obfuscation analysis', 'Static analysis'], url: 'https://github.com/WitherOrNot/warbird-docs',
    account: 'No account required to browse', note: 'This is community documentation, not official Microsoft documentation. Corroborate claims and keep practical analysis to harmless sample binaries in a controlled lab. Useful prerequisites include executable-format basics, assembly, debugging, and static-analysis concepts.', image: '/images/learning/career-malware-analysis.webp', icon: 'terminal', monogram: 'WRB'
  },
  {
    id: 'smarttube-supply-chain-disclosure-case-study', name: 'SmartTube Maintainer Disclosure — Supply-Chain Security Case Study', provider: 'SmartTube maintainers · public repository disclosure', category: 'Security Engineering & DevSecOps', kind: 'Public incident case study', level: 'Intermediate → Advanced',
    description: 'Use the public project disclosure as a case study in development-environment security, release integrity, signing-key response, artifact verification, recovery, and user communication.',
    skills: ['Software supply-chain security', 'Code signing', 'Release integrity', 'Incident response'], url: 'https://github.com/yuliskov/SmartTube',
    account: 'No account required to browse', note: 'SmartTube is a media application, not a security tool. Attribute findings to the public disclosure and distinguish confirmed findings from potential impact; do not claim every build was compromised when the source does not establish that. Suggested output: an incident timeline and a release-hardening checklist.', image: '/images/learning/supply-chain.svg', icon: 'shield-check', monogram: 'SC'
  }
];


export const categories = [
  'All resources', 'Foundations', 'SOC & SIEM', 'Threat Hunting', 'Detection Engineering',
  'Bug Bounty', 'Hands-on Labs', 'Security Concepts', 'DFIR', 'Cloud Security', 'GRC & Security Fundamentals', 'Penetration Testing',
  'Network Security',
  'Application Security',
  'Reverse Engineering',
  'Security Engineering & DevSecOps'
];