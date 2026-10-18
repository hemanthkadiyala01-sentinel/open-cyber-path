// OpenCyberPath's learner-oriented map of eight broad cybersecurity pillars.
// These are practical career-exploration categories, not the verbatim ISC2 CISSP exam domains.
export const cybersecurityPillars = [
  {
    id: 'offensive-security', number: '01', title: 'Offensive Security & Hacking', shortTitle: 'Offensive Security', icon: 'bug', tone: 'violet', level: 'Foundations → Advanced',
    summary: 'Learn how authorised security testers find weaknesses so owners can fix them. Testing scope and written permission come before tools.',
    specializations: [
      { name: 'Penetration Testing', description: 'A scoped assessment of networks, web apps, mobile apps, or APIs to identify and explain security weaknesses.', firstStep: 'Learn networking, HTTP, authentication, and responsible reporting; practise only in an intentionally vulnerable lab or a system you own.' },
      { name: 'Red Teaming', description: 'A planned, authorised simulation of realistic adversary behaviour that evaluates people, processes, and technical detections.', firstStep: 'Start with threat modelling, rules of engagement, logging, and how defenders measure whether an exercise was detected.' },
      { name: 'Bug Bounty Hunting', description: 'Finding and responsibly reporting eligible vulnerabilities under a program owner’s published rules.', firstStep: 'Read the program scope and exclusions first; learn web fundamentals and begin in training labs before considering any live program.' },
      { name: 'Exploit Development', description: 'Studying how software flaws can be reproduced in a controlled research environment and how mitigations or patches change the outcome.', firstStep: 'Build programming, memory-safety, operating-system, and debugging foundations; use toy programs and dedicated research labs only.' },
      { name: 'Social Engineering', description: 'Studying how impersonation and manipulation influence decisions, so organisations can prevent phishing, vishing, and unsafe physical-access practices.', firstStep: 'Learn to recognise warning signs and design consent-based awareness exercises. Never impersonate real people or copy credentials without explicit authorisation.' },
    ],
    relatedPathIds: ['penetration-testing-red-team', 'application-security-bug-bounty'], relatedPathNote: 'Use the authorised Penetration Testing & Red Team route for assessment methods and AppSec for application-focused review.'
  },
  {
    id: 'defensive-security', number: '02', title: 'Defensive Security & Operations', shortTitle: 'Blue Team & Operations', icon: 'shield-check', tone: 'mint', level: 'Beginner → Advanced',
    summary: 'Monitor systems, understand alerts, investigate suspicious patterns, and help organisations detect and respond to incidents.',
    specializations: [
      { name: 'Security Operations Center (SOC) Operations', description: 'Reviewing security alerts, checking evidence, documenting decisions, and escalating cases appropriately.', firstStep: 'Learn basic networking and operating systems, then work through the included synthetic event-triage lab.' },
      { name: 'SIEM & Log Management', description: 'Collecting, normalising, searching, and correlating logs from endpoints, networks, applications, and cloud services.', firstStep: 'Learn common log fields and timestamps before exploring Wazuh or provider-led beginner training.' },
      { name: 'Incident Response (IR)', description: 'Coordinating preparation, analysis, containment, recovery, and lessons learned after a security incident.', firstStep: 'Study incident-response stages and practise a tabletop exercise using a fictional event timeline.' },
      { name: 'Threat Hunting', description: 'Proactively investigating data for signs of suspicious activity that may not have triggered an alert.', firstStep: 'Begin with one clear hypothesis and the supplied synthetic sign-in or DNS records; record both supporting and contradicting evidence.' },
      { name: 'Threat Intelligence', description: 'Evaluating reports, tactics, indicators, and confidence to help defenders make better-informed decisions.', firstStep: 'Read a public advisory and distinguish observed facts, assessment, time range, and limitations.' },
    ],
    relatedPathIds: ['soc-blue-team', 'threat-hunting-detection-engineering', 'digital-forensics-incident-response', 'threat-intelligence-ethical-osint'], relatedPathNote: 'These routes cover monitoring, detection, incident investigations, and source-led threat context.'
  },
  {
    id: 'engineering-architecture', number: '03', title: 'Engineering & Architecture', shortTitle: 'Security Engineering', icon: 'network', tone: 'sky', level: 'Foundations → Advanced',
    summary: 'Design and build systems where security controls are part of the architecture, software, identities, and everyday operations.',
    specializations: [
      { name: 'Security Architecture', description: 'Designing secure system boundaries, trust relationships, controls, and resilience into a system.', firstStep: 'Draw a small web application architecture and label data flows, trust boundaries, and likely failure points.' },
      { name: 'Application Security (AppSec)', description: 'Finding and preventing software weaknesses through design review, secure coding, and application security testing.', firstStep: 'Learn HTTP and input handling; use OWASP learning material and a local intentionally vulnerable app.' },
      { name: 'Cryptography & Encryption', description: 'Using cryptographic methods correctly to protect confidentiality, integrity, identity, and data exchange.', firstStep: 'Learn hashing versus encryption, symmetric versus public-key cryptography, and why custom crypto is usually a bad idea.' },
      { name: 'Identity and Access Management (IAM)', description: 'Controlling who or what can access systems, data, and services through identities, roles, authentication, and authorisation.', firstStep: 'Practise least-privilege role design on a fictional team and explain multifactor authentication and single sign-on.' },
      { name: 'Endpoint Security', description: 'Protecting laptops, workstations, servers, and other endpoints with secure configuration, monitoring, and endpoint controls.', firstStep: 'Review baseline updates, firewall, account permissions, and built-in security logs on your own test device.' },
    ],
    relatedPathIds: ['application-security-bug-bounty', 'security-engineering-devsecops-iam', 'cloud-security', 'soc-blue-team'], relatedPathNote: 'AppSec, Security Engineering, Cloud, and SOC cover secure code, identity, architecture, and operational evidence.'
  },
  {
    id: 'cloud-modern-infrastructure', number: '04', title: 'Cloud & Modern Infrastructure Security', shortTitle: 'Cloud & Infrastructure', icon: 'globe', tone: 'blue', level: 'Beginner → Advanced',
    summary: 'Protect cloud accounts, configuration, software delivery, containers, connected devices, and industrial systems.',
    specializations: [
      { name: 'Cloud Security Posture Management (CSPM)', description: 'Finding and prioritising risky cloud configurations, permissions, and exposure across services such as AWS, Azure, and Google Cloud.', firstStep: 'Start with a fictional cloud diagram and provider security checklists; verify whether any lab may create billable resources.' },
      { name: 'DevSecOps', description: 'Adding security checks, dependency review, secrets handling, and safer defaults to the software delivery lifecycle.', firstStep: 'Learn Git and basic CI concepts, then review a toy repository for exposed secrets and outdated dependencies without publishing secrets.' },
      { name: 'Container & Kubernetes Security', description: 'Reducing risk in container images, orchestration configuration, identity, network policies, and runtime behaviour.', firstStep: 'Understand containers and least privilege first; begin with static configuration review or an isolated local lab.' },
      { name: 'IoT & Operational Technology (OT) Security', description: 'Protecting connected devices and industrial environments where uptime, safety, and legacy systems all matter.', firstStep: 'Study device inventory, network segmentation, safe change control, and passive monitoring; never experiment on real industrial equipment.' },
    ],
    relatedPathIds: ['cloud-security', 'security-engineering-devsecops-iam', 'soc-blue-team', 'grc-security-fundamentals'], relatedPathNote: 'Cloud Security is the direct route; Security Engineering, SOC, and GRC add architecture, monitoring, and risk context.'
  },
  {
    id: 'dfir-cyber-investigation', number: '05', title: 'Cyber Detectives & Law (DFIR)', shortTitle: 'Forensics & Investigation', icon: 'clipboard', tone: 'coral', level: 'Beginner → Specialist',
    summary: 'Preserve digital evidence, reconstruct timelines, analyse suspicious files safely, and support lawful, well-documented investigations.',
    specializations: [
      { name: 'Digital Forensics', description: 'Collecting and analysing digital evidence while preserving provenance, integrity, and a reproducible record of actions.', firstStep: 'Learn file systems, hashes, timestamps, evidence logs, and chain-of-custody concepts using provided sample files.' },
      { name: 'Malware Analysis', description: 'Studying suspicious software to understand its behaviour and indicators without exposing a normal device to risk.', firstStep: 'Begin with reports, static sample metadata, and safe training datasets; do not download or execute unknown samples on a daily-use computer.' },
      { name: 'Cyber Crime Investigation', description: 'Using authorised digital evidence and documented methods to support organisational, legal, or law-enforcement investigations.', firstStep: 'Study evidence handling, privacy, jurisdiction, and careful reporting; real cases require appropriate legal authority and trained supervision.' },
    ],
    relatedPathIds: ['digital-forensics-incident-response', 'malware-analysis-reverse-engineering', 'soc-blue-team'], relatedPathNote: 'DFIR covers evidence and response; Malware Analysis adds safe file/report interpretation, while SOC explains the telemetry.'
  },
  {
    id: 'grc-risk-compliance', number: '06', title: 'Governance, Risk & Compliance (GRC)', shortTitle: 'Risk & Compliance', icon: 'file-text', tone: 'gold', level: 'Beginner → Advanced',
    summary: 'Help teams understand risk, choose controls, protect information, and demonstrate that obligations and policies are being followed.',
    specializations: [
      { name: 'Cyber Risk Assessment', description: 'Identifying assets, threats, weaknesses, likelihood, impact, and practical risk-treatment options.', firstStep: 'Use the included risk-register starter to assess a fictional small business and clearly state assumptions.' },
      { name: 'Compliance Auditing', description: 'Checking evidence against defined requirements or frameworks such as ISO 27001, SOC 2, GDPR, or HIPAA where relevant.', firstStep: 'Learn the purpose and scope of a framework; practise mapping a fictional control to evidence without claiming certification.' },
      { name: 'Third-Party Risk Management (TPRM)', description: 'Reviewing the security and resilience risks associated with suppliers, vendors, and service providers.', firstStep: 'Create a simple vendor questionnaire for a fictional service and identify which answers need evidence or follow-up.' },
    ],
    relatedPathIds: ['grc-security-fundamentals', 'cloud-security', 'security-engineering-devsecops-iam'], relatedPathNote: 'GRC is the direct route; Cloud and Security Engineering provide examples of configuration, ownership, and control evidence.'
  },
  {
    id: 'emerging-advanced-domains', number: '07', title: 'Emerging & Advanced Domains', shortTitle: 'Emerging Domains', icon: 'spark', tone: 'violet', level: 'Intermediate → Specialist',
    summary: 'Explore specialised areas that benefit from strong foundations in computing, security engineering, mathematics, or software development.',
    specializations: [
      { name: 'AI & Machine Learning Security', description: 'Assessing risks such as prompt injection, data poisoning, model misuse, sensitive-data exposure, and unsafe AI integrations.', firstStep: 'Learn AI system basics and threat modelling; begin with a toy application and focus on safeguards, logging, and data minimisation.' },
      { name: 'Quantum Cryptography', description: 'Studying quantum-related security concepts and the migration toward cryptographic methods designed to resist future quantum attacks.', firstStep: 'Learn public-key cryptography and why post-quantum cryptography migration matters; keep the distinction between quantum cryptography and post-quantum algorithms clear.' },
      { name: 'Blockchain & Smart Contract Auditing', description: 'Reviewing contract logic, access controls, transaction assumptions, and software risks in blockchain applications.', firstStep: 'Learn programming and contract lifecycle basics, then use a local test chain or deliberately vulnerable educational exercises.' },
    ],
    relatedPathIds: ['application-security-bug-bounty', 'cloud-security', 'security-engineering-devsecops-iam', 'malware-analysis-reverse-engineering', 'threat-intelligence-ethical-osint'], relatedPathNote: 'These advanced fields build on software, cloud, data, research, and detection fundamentals; specialise after the foundations.'
  },
  {
    id: 'physical-human-security', number: '08', title: 'Physical & Human Security', shortTitle: 'People, Privacy & Physical', icon: 'users', tone: 'mint', level: 'Beginner → Advanced',
    summary: 'Protect the people, facilities, and personal information that technology depends on, using respectful and proportionate safeguards.',
    specializations: [
      { name: 'Data Privacy Management', description: 'Managing personal information responsibly, including access, retention, data minimisation, transparency, and appropriate deletion.', firstStep: 'Map a fictional service’s personal-data flow and list what it needs, who can access it, and when it should be deleted.' },
      { name: 'Security Awareness Training', description: 'Helping people recognise risks and build safe habits through accessible training and consent-based exercises.', firstStep: 'Create a short phishing-awareness lesson that teaches verification and reporting; do not collect real passwords or target people without approval.' },
      { name: 'Physical Security Integration', description: 'Coordinating building, device, visitor, environmental, and data-centre controls with digital security processes.', firstStep: 'Use a fictional server-room checklist covering access records, visitor handling, power/environmental controls, and incident escalation.' },
    ],
    relatedPathIds: ['grc-security-fundamentals', 'soc-blue-team', 'digital-forensics-incident-response', 'threat-intelligence-ethical-osint'], relatedPathNote: 'GRC supports policy and privacy, SOC covers monitoring, DFIR handles evidence, and ethical intelligence teaches respectful source use.'
  },
];

// This is ISC2's current CISSP exam-domain list, shown separately to prevent confusion
// between the official certification framework and OpenCyberPath's broader career map.
export const isc2CisspDomains = [
  'Security and Risk Management',
  'Asset Security',
  'Security Architecture and Engineering',
  'Communication and Network Security',
  'Identity and Access Management (IAM)',
  'Security Assessment and Testing',
  'Security Operations',
  'Software Development Security',
];
