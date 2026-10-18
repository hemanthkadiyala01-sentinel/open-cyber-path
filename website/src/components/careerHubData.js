export const careerDirections = [
  {
    id: 'soc-blue-team', title: 'SOC Analyst / Blue Team', eyebrow: 'DETECT + RESPOND', tone: 'blue', symbol: '◈',
    summary: 'Monitor alerts, interpret logs, investigate suspicious behaviour, and document careful response decisions.',
    roles: ['SOC analyst trainee', 'Security operations intern', 'Junior incident analyst'],
    firstEvidence: 'A triage worksheet built from synthetic logs with a justified conclusion and limitations.', pathId: 'soc-blue-team', action: 'Start SOC / Blue Team path',
  },
  {
    id: 'threat-hunting', title: 'Threat Hunting & Detection Engineering', eyebrow: 'FORM A HYPOTHESIS', tone: 'purple', symbol: '⌁',
    summary: 'Turn suspicious patterns into testable questions and create detections that are evaluated against sample data.',
    roles: ['Detection engineering trainee', 'Threat hunting intern', 'Security validation analyst'],
    firstEvidence: 'A detection hypothesis, synthetic test cases, expected telemetry, and evaluation notes.', pathId: 'threat-hunting-detection-engineering', action: 'Start threat hunting path',
  },
  {
    id: 'dfir', title: 'Digital Forensics & Incident Response', eyebrow: 'PRESERVE EVIDENCE', tone: 'orange', symbol: '⌕',
    summary: 'Preserve provenance, build timelines, record decisions, and explain what the available data can prove.',
    roles: ['DFIR intern', 'Incident response trainee', 'Digital forensics assistant'],
    firstEvidence: 'A timeline and evidence register using fictional records.', pathId: 'digital-forensics-incident-response', action: 'Start DFIR path',
  },
  {
    id: 'appsec', title: 'Application Security & Bug Bounty', eyebrow: 'SECURE SOFTWARE', tone: 'red', symbol: '⌘',
    summary: 'Find and explain software weaknesses using safe training labs, secure design, and responsible reporting.',
    roles: ['AppSec intern', 'Product security trainee', 'Web security tester'],
    firstEvidence: 'A training-lab report with scope, evidence, impact, remediation, and a retest criterion.', pathId: 'application-security-bug-bounty', action: 'Start AppSec path',
  },
  {
    id: 'cloud', title: 'Cloud Security', eyebrow: 'IDENTITY + CONFIGURATION', tone: 'sky', symbol: '☁',
    summary: 'Review identity permissions, public exposure, network boundaries, logging, and recovery in cloud environments.',
    roles: ['Cloud security intern', 'IAM analyst trainee', 'Cloud assurance intern'],
    firstEvidence: 'A fictional cloud posture review with risks, evidence sources, and fixes.', pathId: 'cloud-security', action: 'Start Cloud Security path',
  },
  {
    id: 'grc', title: 'GRC, Risk & Compliance', eyebrow: 'RISK + ASSURANCE', tone: 'amber', symbol: '▤',
    summary: 'Turn risks into controls, owners, evidence requests, and decisions that organisations can explain.',
    roles: ['GRC analyst intern', 'Risk and compliance trainee', 'Security assurance assistant'],
    firstEvidence: 'A risk register for a fictional service, with assumptions and treatment owners.', pathId: 'grc-security-fundamentals', action: 'Start GRC path',
  },
  {
    id: 'pentest-red-team', title: 'Penetration Testing & Red Team', eyebrow: 'TEST WITH PERMISSION', tone: 'red', symbol: '↗',
    summary: 'Assess deliberately vulnerable or explicitly authorised systems, validate minimal evidence, and write useful remediation.',
    roles: ['Junior penetration tester', 'Security assessment intern', 'Red team trainee'],
    firstEvidence: 'A scope-limited lab report and remediation checklist.', pathId: 'penetration-testing-red-team', action: 'Start authorised testing path',
  },
  {
    id: 'security-engineering', title: 'Security Engineering, DevSecOps & IAM', eyebrow: 'BUILD SAFER SYSTEMS', tone: 'sky', symbol: '⌘',
    summary: 'Make secure architecture, least privilege, dependency hygiene, logging, and recovery part of routine engineering.',
    roles: ['Security engineering intern', 'IAM analyst trainee', 'DevSecOps trainee'],
    firstEvidence: 'A fictional architecture diagram, role matrix, and software delivery security checklist.', pathId: 'security-engineering-devsecops-iam', action: 'Start engineering path',
  },
  {
    id: 'threat-intel-osint', title: 'Threat Intelligence & Ethical OSINT', eyebrow: 'VERIFY THE SOURCE', tone: 'cyan', symbol: '◎',
    summary: 'Evaluate public advisories and open sources, track confidence, and produce privacy-respecting intelligence briefs.',
    roles: ['Threat intelligence intern', 'Cyber research assistant', 'Threat monitoring analyst'],
    firstEvidence: 'A cited brief that separates sourced facts, analyst assessment, and unknowns.', pathId: 'threat-intelligence-ethical-osint', action: 'Start intelligence path',
  },
  {
    id: 'malware-analysis', title: 'Malware Analysis & Reverse Engineering', eyebrow: 'ANALYSE SAFELY', tone: 'orange', symbol: '⌬',
    summary: 'Interpret safe sample metadata and published analysis reports, connect behaviour to detections, and state uncertainty.',
    roles: ['Malware analysis trainee', 'Reverse engineering intern', 'Threat research assistant'],
    firstEvidence: 'A defensive analysis report based on supplied metadata and a reputable public report.', pathId: 'malware-analysis-reverse-engineering', action: 'Start malware analysis path',
  },
];

export const hackerHats = [
  {
    id: 'white', label: 'White hat', short: 'Authorized ethical security work', tone: 'white',
    explanation: 'A common label for people who assess security with permission, defined scope, and responsible reporting.',
    boundary: 'Permission, scope, and applicable rules are required before testing.',
  },
  {
    id: 'black', label: 'Black hat', short: 'Malicious or unauthorized activity', tone: 'black',
    explanation: 'A common label for activity that is intended to harm, steal, extort, or access systems without permission.',
    boundary: 'Open Cyber Path explains the risks and defenses; it does not teach abuse or provide an unauthorized-activity roadmap.',
  },
  {
    id: 'grey', label: 'Grey hat', short: 'An inconsistent, informal label', tone: 'grey',
    explanation: 'Often used for activity that does not fit neatly into white/black descriptions; real-world usage varies.',
    boundary: 'Good intentions do not replace authorization. Do not test first and ask for permission later.',
  },
  {
    id: 'green', label: 'Green hat', short: 'Often used for a beginner', tone: 'green',
    explanation: 'An informal term sometimes used for someone new to security and actively learning.',
    boundary: 'A beginner should practise in local labs, CTFs, and training environments with clear permission.',
  },
  {
    id: 'blue', label: 'Blue hat', short: 'Meaning depends on context', tone: 'blue',
    explanation: 'The term has multiple informal uses and is not a single universally standardized job title.',
    boundary: 'For careers, use the actual responsibilities and role description rather than the hat label alone.',
  },
  {
    id: 'red', label: 'Red hat', short: 'Meaning depends on context', tone: 'red',
    explanation: 'The term is used in different ways in informal discussions; it should not be treated as a universal occupation name.',
    boundary: 'Red Team is a professional security-testing approach, not permission to attack systems.',
  },
];

export const beginnerStages = [
  { id: 'foundations', number: '01', title: 'Build your foundations', period: 'Start here', detail: 'Networking basics, operating systems, HTTP, basic scripting, Git, and security ethics.', proof: 'A clear networking diagram and a short command/reference notebook.' },
  { id: 'choose-role', number: '02', title: 'Choose a role direction', period: 'After the basics', detail: 'Compare the day-to-day work of Red Team, Blue Team, AppSec, DFIR, Cloud, and GRC roles.', proof: 'A one-page role comparison explaining your first choice and a backup choice.' },
  { id: 'guided-practice', number: '03', title: 'Complete guided practice', period: 'Repeat weekly', detail: 'Work through the matching roadmap and use only local, synthetic, or explicitly authorized labs.', proof: 'Notes, command context, screenshots with secrets removed, and a reflection.' },
  { id: 'portfolio', number: '04', title: 'Publish a small portfolio', period: 'As you learn', detail: 'Create two or three carefully documented projects that show your method, not just tool names.', proof: 'A readable GitHub README for each project with scope, steps, findings, limitations, and references.' },
  { id: 'resume-profile', number: '05', title: 'Prepare your application materials', period: 'Before applying', detail: 'Create a truthful ATS-friendly resume, LinkedIn profile, project summaries, and interview notes.', proof: 'A role-tailored resume with specific evidence and no unsupported claims.' },
  { id: 'apply-review', number: '06', title: 'Apply and improve', period: 'A repeatable cycle', detail: 'Search internships and junior roles, verify eligibility on the original site, tailor each application, and review outcomes.', proof: 'An application tracker with the next action for each genuine opportunity.' },
];

export const jobBoards = [
  {
    id: 'linkedin', name: 'LinkedIn Jobs', category: 'Job platform', tag: 'Internships + entry level',
    description: 'Search roles and use the platform filters for experience, location, date posted, and remote work.',
    url: 'https://in.linkedin.com/jobs/cyber-security-jobs', searchLabel: 'Search this role',
    searchUrl: ({ role, location }) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`,
    warning: 'Some features require an account. Check the employer page before sharing sensitive information.',
  },
  {
    id: 'internshala', name: 'Internshala', category: 'Internships', tag: 'Student opportunities',
    description: 'Browse internship listings and confirm the role, stipend, work mode, and eligibility before applying.',
    url: 'https://internshala.com/internships/cyber-security-internship/', searchLabel: 'Browse cyber internships',
    searchUrl: () => 'https://internshala.com/internships/cyber-security-internship/',
    warning: 'Listing availability and filters change. Never pay a person to secure an interview or offer.',
  },
  {
    id: 'indeed', name: 'Indeed India', category: 'Job platform', tag: 'Internships + junior roles',
    description: 'Search job titles and locations, then verify the company and the original application route.',
    url: 'https://in.indeed.com/', searchLabel: 'Search this role',
    searchUrl: ({ role, location }) => `https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location)}`,
    warning: 'Search results may include duplicated or stale listings; confirm dates and employer details.',
  },
  {
    id: 'naukri', name: 'Naukri', category: 'Job platform', tag: 'India roles',
    description: 'Explore cybersecurity and information-security vacancies across Indian employers.',
    url: 'https://www.naukri.com/cyber-security-jobs', searchLabel: 'Browse cybersecurity jobs',
    searchUrl: () => 'https://www.naukri.com/cyber-security-jobs',
    warning: 'Use official platform pages and verify the employer independently before sharing documents.',
  },
  {
    id: 'wellfound', name: 'Wellfound', category: 'Startup roles', tag: 'Startup opportunities',
    description: 'Explore startup roles where security work may sit within engineering, infrastructure, or compliance teams.',
    url: 'https://wellfound.com/jobs', searchLabel: 'Browse startup roles',
    searchUrl: () => 'https://wellfound.com/jobs',
    warning: 'Not every startup has a dedicated cybersecurity role. Read the requirements carefully.',
  },
  {
    id: 'ncs', name: 'National Career Service', category: 'Government resource', tag: 'Government of India',
    description: 'A Ministry of Labour & Employment employment-service portal. Its services are stated as free of cost.',
    url: 'https://www.ncs.gov.in/', searchLabel: 'Open official portal',
    searchUrl: () => 'https://www.ncs.gov.in/',
    warning: 'NCS warns about impersonation and fraudulent associations. Use its official domain and do not pay job/application/interview fees.',
  },
];

export const roleSearchPresets = [
  { label: 'SOC Analyst Intern', query: 'SOC Analyst Intern' },
  { label: 'Cybersecurity Intern', query: 'Cybersecurity Intern' },
  { label: 'Junior Security Analyst', query: 'Junior Security Analyst' },
  { label: 'Application Security Intern', query: 'Application Security Intern' },
  { label: 'Cloud Security Intern', query: 'Cloud Security Intern' },
  { label: 'GRC Analyst Intern', query: 'GRC Analyst Intern' },
];

export const fictionalVacancy = {
  company: 'Example Secure Systems (fictional)',
  title: 'Security Analyst Intern (Practice Vacancy)',
  description: 'We are looking for a learner who understands networking fundamentals, can read sample logs, documents investigations carefully, communicates uncertainty, and can explain at least one well-documented practice project. Basic Linux or Windows familiarity is useful. This is a fictional vacancy for practising an application workflow.',
  requirements: ['Can explain a basic TCP/IP or HTTP concept', 'Can describe a practice project honestly', 'Can communicate findings and limitations', 'Understands authorization and safe handling of information'],
};


export const employerCareerPages = [
  {
    id: 'cisco', name: 'Cisco Careers', audience: 'Internships + early careers',
    description: 'Browse early-career opportunities and internships; eligibility and openings vary by role and location.',
    url: 'https://careers.cisco.com/india/etr-jobs',
  },
  {
    id: 'microsoft', name: 'Microsoft Careers', audience: 'Students + early in profession',
    description: 'Search early-in-profession opportunities and review the official regional eligibility rules before applying.',
    url: 'https://careers.microsoft.com/v2/global/en/students?submit=Search',
  },
  {
    id: 'amazon', name: 'Amazon University Talent', audience: 'Student + graduate roles',
    description: 'Explore official internship and graduate routes across different teams; not every opportunity is security-specific.',
    url: 'https://www.amazon.jobs/content/en/career-programs/university',
  },
  {
    id: 'ibm', name: 'IBM Careers', audience: 'Job search + experience filters',
    description: 'Search by keyword, location, career area, and experience level using the employer’s official portal.',
    url: 'https://www.ibm.com/in-en/careers/search',
  },
];
