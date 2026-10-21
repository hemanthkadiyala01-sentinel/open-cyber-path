import { useMemo, useState } from 'react';
import BrandIcon from './BrandIcon.jsx';
import './tools-threats.css';

const baseToolCatalog = [
  {
    id: 'wireshark', name: 'Wireshark', family: 'Network analysis', level: 'Beginner → Intermediate', focus: ['Blue Team', 'Foundations'], risk: 'Moderate',
    what: 'A network protocol analyser that lets you inspect packets in a capture file or an authorised network observation point.',
    worth: 'It turns invisible network communication into something you can reason about: DNS lookups, connection setup, protocol errors, and suspicious patterns.',
    example: 'A support team investigates why a company application is slow. An analyst reviews an approved capture and notices repeated connection resets.',
    misuse: 'Captures may expose private messages, session information, internal addresses, or other sensitive metadata. Capturing traffic without permission can violate privacy and policy.',
    get: 'https://www.wireshark.org/download.html', docs: 'https://www.wireshark.org/docs/wsug_html/', practice: 'https://www.wireshark.org/docs/wsug_html_chunked/'
  },
  {
    id: 'nmap', name: 'Nmap', family: 'Asset and service discovery', level: 'Beginner → Intermediate', focus: ['Red Team', 'Blue Team', 'Foundations'], risk: 'Moderate',
    what: 'A network discovery and security-auditing tool that helps authorised teams understand which hosts and services are reachable.',
    worth: 'Security teams need an accurate inventory. You cannot secure an internet-facing service if you do not know that it exists.',
    example: 'An administrator compares an approved inventory with a planned scan of the organisation’s own test subnet to find an undocumented service.',
    misuse: 'Scanning systems outside the approved scope can trigger alarms, disrupt fragile devices, violate service terms, or be treated as reconnaissance.',
    get: 'https://nmap.org/download.html', docs: 'https://nmap.org/book/man-book.html', practice: 'https://nmap.org/book/'
  },
  {
    id: 'zap', name: 'OWASP ZAP', family: 'Web application testing', level: 'Beginner → Intermediate', focus: ['Red Team', 'AppSec'], risk: 'Moderate',
    what: 'An open-source web application security testing proxy that helps learners and defenders examine web requests and look for common weaknesses.',
    worth: 'It helps developers check whether their own application handles input, sessions, and security headers as intended.',
    example: 'A student reviews their local training shop and writes a report explaining a finding, its likely impact, and the defensive fix.',
    misuse: 'Active tests can change records, generate heavy traffic, or expose data. Only test a local practice app or a system whose owner has explicitly approved the test.',
    get: 'https://www.zaproxy.org/download/', docs: 'https://www.zaproxy.org/getting-started/', practice: 'https://owasp.org/projects/juice-shop'
  },
  {
    id: 'burp', name: 'Burp Suite Community Edition', family: 'Web application testing', level: 'Beginner → Intermediate', focus: ['Red Team', 'AppSec'], risk: 'Moderate',
    what: 'A web-security toolkit that lets you inspect and manually review the HTTP requests and responses exchanged by a browser and a web app.',
    worth: 'It makes web concepts such as cookies, parameters, status codes, and access-control checks easier to see and explain.',
    example: 'In a deliberately vulnerable training lab, a learner compares two sample requests and documents whether the server correctly checks which account owns a record.',
    misuse: 'Changing requests against a real service without permission can expose or alter other users’ data. Use the provider’s designated training labs.',
    get: 'https://portswigger.net/burp/communitydownload', docs: 'https://portswigger.net/burp/documentation/desktop/getting-started', practice: 'https://portswigger.net/web-security'
  },
  {
    id: 'metasploit', name: 'Metasploit Framework', family: 'Vulnerability validation', level: 'Advanced / supervised lab', focus: ['Red Team', 'Security testing'], risk: 'High',
    what: 'A modular penetration-testing framework used by authorised testers to validate whether a known weakness is exploitable in a controlled assessment.',
    worth: 'At the right stage, it helps a security team confirm impact and verify whether a patch or mitigation actually closes a risk.',
    example: 'A security team tests a deliberately vulnerable virtual machine isolated from other devices, records the result, then repeats the check after applying a fix.',
    misuse: 'Exploit modules may execute code, create access, change files, or interrupt a service. Never aim them at public, school, family, or workplace systems without explicit written authorisation.',
    get: 'https://www.metasploit.com/download', docs: 'https://docs.rapid7.com/metasploit/getting-started/', practice: 'https://docs.rapid7.com/metasploit/'
  },
  {
    id: 'sysmon', name: 'Microsoft Sysmon', family: 'Endpoint visibility', level: 'Beginner → Intermediate', focus: ['Blue Team', 'DFIR'], risk: 'Low to moderate',
    what: 'A Windows system-monitoring component that writes detailed activity events to the Windows event log.',
    worth: 'Analysts use endpoint evidence to connect a process start, a network connection, and changes on a device during an investigation.',
    example: 'A defensive lab compares a normal application launch with synthetic training events and writes down which fields would help explain the behaviour.',
    misuse: 'Monitoring records can include sensitive system information. Install and configure monitoring only on devices you administer or are authorised to monitor.',
    get: 'https://learn.microsoft.com/sysinternals/downloads/sysmon', docs: 'https://learn.microsoft.com/sysinternals/downloads/sysmon', practice: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/device-management/use-windows-event-forwarding-to-assist-in-intrusion-detection'
  },
  {
    id: 'autopsy', name: 'Autopsy', family: 'Digital forensics', level: 'Intermediate', focus: ['Blue Team', 'DFIR'], risk: 'Low to moderate',
    what: 'A digital-forensics platform that helps investigators examine files and other artefacts from evidence images.',
    worth: 'It teaches evidence handling, timelines, artefact interpretation, and how to write down what was actually observed.',
    example: 'A learner uses a provided training image, builds a timeline of fictional user activity, and records the limits of each conclusion.',
    misuse: 'Opening or copying someone else’s private files without permission can violate privacy and law. Preserve originals and use only supplied or authorised evidence.',
    get: 'https://www.autopsy.com/download/', docs: 'https://www.autopsy.com/support/', practice: 'https://www.autopsy.com/'
  },
  {
    id: 'ghidra', name: 'Ghidra', family: 'Software and malware analysis', level: 'Advanced / guided lab', focus: ['Blue Team', 'DFIR', 'Reverse engineering'], risk: 'Moderate',
    what: 'A software reverse-engineering framework used to inspect compiled programs through disassembly, decompilation, and related analysis views.',
    worth: 'It can help malware analysts and software maintainers understand a suspicious or undocumented program without relying only on what the program claims to do.',
    example: 'A learner analyses a harmless sample program supplied for a course and labels its functions and strings in a short report.',
    misuse: 'Reverse engineering can be misapplied to tamper with software or defeat protections. Work on software you own or are authorised to analyse, and never run unknown files on a personal device.',
    get: 'https://github.com/NationalSecurityAgency/ghidra/releases', docs: 'https://github.com/NationalSecurityAgency/ghidra', practice: 'https://github.com/NationalSecurityAgency/ghidra'
  },
  {
    id: 'zeek', name: 'Zeek', family: 'Network security monitoring', level: 'Intermediate → Advanced', focus: ['Blue Team', 'Threat hunting'], risk: 'Moderate',
    what: 'A passive network traffic analyser that turns observed connections and protocols into useful structured logs.',
    worth: 'It supports threat hunting by helping analysts ask what communicated, when, and which protocol metadata was observed.',
    example: 'A learner uses a pre-generated training log to find repeated DNS requests and checks whether the pattern has a harmless explanation.',
    misuse: 'Network metadata may reveal business activity and user behaviour. Monitoring must respect organisational approval, privacy rules, and retention limits.',
    get: 'https://zeek.org/get-zeek/', docs: 'https://docs.zeek.org/en/current/about/what.html', practice: 'https://docs.zeek.org/en/current/'
  },
  {
    id: 'cyberchef', name: 'CyberChef', family: 'Data inspection', level: 'Beginner → Intermediate', focus: ['Blue Team', 'DFIR', 'Foundations'], risk: 'Low to moderate',
    what: 'A browser-based workbench for transforming, decoding, formatting, and inspecting text or files using connected operations.',
    worth: 'It helps analysts safely understand unfamiliar encodings and normalise data before documenting what it means.',
    example: 'A learner converts a provided example from one text representation to another, then records the result and why decoding alone does not prove malicious intent.',
    misuse: 'Pasting real tokens, passwords, personal data, or company secrets into online tools can disclose them. Use synthetic data or an approved local copy.',
    get: 'https://github.com/gchq/CyberChef', docs: 'https://github.com/gchq/CyberChef', practice: 'https://github.com/gchq/CyberChef'
  },
  {
    id: 'mitre-attack', name: 'MITRE ATT&CK', family: 'Threat knowledge base', level: 'Beginner → Advanced', focus: ['Blue Team', 'Red Team', 'Foundations'], risk: 'Low',
    what: 'A public knowledge base that organises observed adversary behaviour into tactics and techniques.',
    worth: 'It gives defenders and testers a shared vocabulary for describing behaviour, selecting relevant detections, and explaining coverage gaps.',
    example: 'An analyst maps a fictional alert to a possible behaviour, then records what evidence is missing before assigning a technique.',
    misuse: 'A framework is not a checklist that proves a system secure, and describing a technique is not evidence that it occurred. Avoid overclaiming from a single signal.',
    get: 'https://attack.mitre.org/resources/', docs: 'https://attack.mitre.org/resources/', practice: 'https://attack.mitre.org/'
  },
];


// Curated from the submitted tool list. Priority and metadata make the learning
// sequence clear; tools are not presented as a checklist to install all at once.
const additionalTools = [
  {
    id: 'python', name: 'Python', family: 'Programming foundation', level: 'Beginner', focus: ['Foundations', 'Blue Team', 'DFIR'], risk: 'Low',
    what: 'A beginner-friendly programming language used to read data, automate repetitive tasks, and build small analysis scripts.',
    worth: 'Security work often involves logs, CSV files, JSON, and repetitive checks. Basic Python helps a learner understand data rather than copy commands without context.',
    example: 'Use a supplied synthetic login CSV to count failed logins by test account and explain why the count alone does not prove an attack.',
    misuse: 'Scripts can still change or delete data. Start with sample files, keep backups, and do not run code you do not understand on important systems.',
    get: 'https://www.python.org/downloads/', docs: 'https://docs.python.org/3/tutorial/', practice: 'https://www.python.org/about/gettingstarted/'
  },
  {
    id: 'vscode', name: 'Visual Studio Code', family: 'Code editor', level: 'Beginner', focus: ['Foundations', 'Blue Team', 'Cloud & DevSecOps'], risk: 'Low',
    what: 'A code editor for reading and editing scripts, notes, configuration files, JSON, and small projects.',
    worth: 'A single editor helps beginners keep lab notes, learn Python, inspect sample data, and maintain a portfolio.',
    example: 'Open a provided JSON event file, identify the timestamp, host, account, and event type, then write a plain-English note.',
    misuse: 'Extensions and scripts are software too. Install only extensions you need, review publishers, and never paste credentials into a project file.',
    get: 'https://code.visualstudio.com/Download', docs: 'https://code.visualstudio.com/docs', practice: 'https://code.visualstudio.com/docs/getstarted/introvideos'
  },
  {
    id: 'github', name: 'GitHub', family: 'Portfolio and version control', level: 'Beginner', focus: ['Foundations', 'Cloud & DevSecOps'], risk: 'Low to moderate',
    what: 'A platform for version-controlled projects, documentation, collaboration, and a public or private learning portfolio.',
    worth: 'Employers can review how a learner documents a project, explains limits, and improves work over time.',
    example: 'Publish a README for a synthetic-log investigation with the question, steps, findings, limitations, and recommended defence.',
    misuse: 'Public repositories can expose API keys, passwords, personal information, or employer data. Use synthetic examples and secret-scanning guidance; never upload sensitive logs.',
    get: 'https://github.com/', docs: 'https://docs.github.com/en/get-started', practice: 'https://skills.github.com/'
  },
  {
    id: 'wazuh', name: 'Wazuh', family: 'SIEM and endpoint monitoring', level: 'Intermediate', focus: ['Blue Team', 'DFIR'], risk: 'Low to moderate',
    what: 'A free and open-source security platform that collects and analyses endpoint and workload telemetry for detection and monitoring.',
    worth: 'It helps a learner connect endpoint events, detection alerts, and an investigation workflow after learning basic logs first.',
    example: 'In an isolated practice setup, review an example alert and trace it to the source event before deciding whether it needs escalation.',
    misuse: 'Agents and central logging collect sensitive host data. Deploy only to devices you administer, protect the dashboard, and follow retention rules.',
    get: 'https://wazuh.com/', docs: 'https://documentation.wazuh.com/current/getting-started/index.html', practice: 'https://documentation.wazuh.com/current/learning-materials/index.html'
  },
  {
    id: 'sigma', name: 'Sigma detection rules', family: 'Detection engineering', level: 'Beginner → Intermediate', focus: ['Blue Team', 'Threat hunting'], risk: 'Low',
    what: 'A vendor-neutral format for describing detections that can be converted for supported logging and SIEM systems.',
    worth: 'It teaches the logic behind a detection rule and makes rules easier to review, share, test, and document.',
    example: 'Read a published training rule and annotate its data source, match conditions, expected false positives, and required validation.',
    misuse: 'A rule copied without understanding the event fields may miss threats or flood analysts with false positives. Test against labelled sample data before operational use.',
    get: 'https://github.com/SigmaHQ/sigma', docs: 'https://github.com/SigmaHQ/sigma-specification', practice: 'https://github.com/SigmaHQ/sigma/tree/master/rules'
  },
  {
    id: 'suricata', name: 'Suricata', family: 'Network intrusion detection', level: 'Intermediate', focus: ['Blue Team', 'Threat hunting'], risk: 'Moderate',
    what: 'An open-source network threat detection engine that can inspect traffic and generate alerts; deployment mode determines its operational impact.',
    worth: 'It introduces network-based detection and how analysts validate alerts against packet and flow evidence.',
    example: 'Use a supplied PCAP and sample alerts to decide what a rule matched, what evidence supports the alert, and what remains uncertain.',
    misuse: 'Inline prevention configurations can affect live traffic. Start with offline sample captures and do not connect an experimental sensor to a production network.',
    get: 'https://suricata.io/', docs: 'https://docs.suricata.io/en/latest/', practice: 'https://docs.suricata.io/en/latest/quickstart.html'
  },
  {
    id: 'security-onion', name: 'Security Onion', family: 'SOC lab platform', level: 'Advanced / resource-heavy lab', focus: ['Blue Team', 'DFIR', 'Threat hunting'], risk: 'Moderate',
    what: 'A security monitoring platform that combines network and host visibility, detection, log management, and investigation interfaces.',
    worth: 'It can show how several defensive data sources fit together in a SOC-style workflow after the learner knows basic logs and networking.',
    example: 'Use its sample or isolated training environment to follow one alert to related network events and write a short case note.',
    misuse: 'It may consume substantial memory, storage, and network visibility. Do not deploy packet collection or sensors on networks without approval and privacy planning.',
    get: 'https://securityonionsolutions.com/software', docs: 'https://docs.securityonion.net/en/2.4/', practice: 'https://docs.securityonion.net/en/2.4/first-time-users.html'
  },
  {
    id: 'osquery', name: 'osquery', family: 'Endpoint visibility', level: 'Intermediate', focus: ['Blue Team', 'DFIR', 'Foundations'], risk: 'Low to moderate',
    what: 'An endpoint visibility tool that lets analysts query certain operating-system information with a SQL-like interface.',
    worth: 'It helps learners translate an investigation question into a structured query and understand what endpoint state can be observed.',
    example: 'Using a training dataset, identify installed programs or running processes that deserve review and explain why more context is needed.',
    misuse: 'Queries and fleet management can expose sensitive endpoint information. Begin with an isolated test device and only collect authorised fields.',
    get: 'https://osquery.io/', docs: 'https://osquery.readthedocs.io/en/stable/', practice: 'https://osquery.io/schema/'
  },
  {
    id: 'volatility3', name: 'Volatility 3', family: 'Memory forensics', level: 'Advanced / guided lab', focus: ['DFIR', 'Blue Team'], risk: 'Moderate',
    what: 'An open-source framework for examining memory images to understand selected aspects of a system’s state at the time the image was captured.',
    worth: 'It teaches how investigators use memory evidence and how technical conclusions depend on image quality, symbols, and context.',
    example: 'Follow a guided exercise with a course-provided memory image and write down which process or network artefacts are observed, not presumed.',
    misuse: 'Memory images can contain credentials, private messages, and other sensitive data. Use only course-provided or authorised images and store them securely.',
    get: 'https://github.com/volatilityfoundation/volatility3', docs: 'https://volatility3.readthedocs.io/en/stable/', practice: 'https://volatility3.readthedocs.io/en/stable/getting-started-windows-tutorial.html'
  },
  {
    id: 'sleuthkit', name: 'The Sleuth Kit', family: 'Digital forensics', level: 'Intermediate', focus: ['DFIR', 'Blue Team'], risk: 'Low to moderate',
    what: 'A collection of command-line tools and libraries for examining file-system and volume artefacts in forensic investigations.',
    worth: 'It helps learners understand that forensic analysis should preserve the original evidence and document how findings were produced.',
    example: 'Use a training disk image to identify its file-system structure, record hashes as directed by the lab, and explain the evidence-handling steps.',
    misuse: 'Incorrectly handling a real disk can alter evidence or expose private files. Practise on copies and follow a documented chain of custody.',
    get: 'https://www.sleuthkit.org/sleuthkit/download.php', docs: 'https://www.sleuthkit.org/sleuthkit/docs.php', practice: 'https://www.autopsy.com/support/'
  },
  {
    id: 'zimmerman-tools', name: 'Eric Zimmerman’s Windows forensic tools', family: 'Windows artefact analysis', level: 'Intermediate → Advanced', focus: ['DFIR', 'Blue Team'], risk: 'Low to moderate',
    what: 'A collection of utilities used by forensic practitioners to interpret selected Windows artefacts such as registry, event, and execution evidence.',
    worth: 'It gives learners deeper practice reading Windows artefacts after they understand Windows event logs and evidence handling.',
    example: 'In a course exercise, examine a supplied Windows artefact export and produce a timeline with timestamps, sources, and confidence notes.',
    misuse: 'Artefacts can reveal a person’s activity. Use only authorised images and avoid treating an artefact as proof of intent on its own.',
    get: 'https://ericzimmerman.github.io/', docs: 'https://ericzimmerman.github.io/', practice: 'https://ericzimmerman.github.io/'
  },
  {
    id: 'crtsh', name: 'crt.sh', family: 'Passive domain research', level: 'Beginner → Intermediate', focus: ['OSINT & Threat Intel', 'Foundations'], risk: 'Low to moderate',
    what: 'A public certificate-transparency search interface that can show certificates associated with a domain name.',
    worth: 'It helps defenders learn how certificate records can support an approved inventory of domains and subdomains.',
    example: 'Review certificate records for a domain you own or a designated training domain and compare the names to a fictional asset list.',
    misuse: 'Public records can reveal infrastructure details. Do not turn passive research into unsolicited scanning or attempts to access discovered systems.',
    get: 'https://crt.sh/', docs: 'https://certificate.transparency.dev/', practice: 'https://crt.sh/'
  },
  {
    id: 'wayback', name: 'Internet Archive Wayback Machine', family: 'Web history research', level: 'Beginner', focus: ['OSINT & Threat Intel', 'Foundations'], risk: 'Low',
    what: 'A public archive that allows users to view some historical snapshots of web pages.',
    worth: 'It helps defenders and researchers understand public-facing changes over time, such as removed documentation or old site content.',
    example: 'Compare two historical snapshots of your own project’s public landing page and document what changed and when the archive captured it.',
    misuse: 'Archived pages may contain outdated information or personal details. Do not assume an old capture is complete, current, or permission to access a live system.',
    get: 'https://archive.org/web/', docs: 'https://archivesupport.zendesk.com/hc/en-us/articles/360004651732-Using-The-Wayback-Machine', practice: 'https://archive.org/web/'
  },
  {
    id: 'greynoise', name: 'GreyNoise', family: 'Threat-intelligence enrichment', level: 'Intermediate', focus: ['OSINT & Threat Intel', 'Blue Team'], risk: 'Low to moderate',
    what: 'A threat-intelligence service that adds context about internet-wide scanning and background noise observed by its sensors.',
    worth: 'It can help an analyst avoid treating every unsolicited scan as a targeted attack, while still checking their own logs and assets.',
    example: 'Given a fictional alert IP, compare its public context with the alert timestamp, local logs, and known asset details before triage.',
    misuse: 'Third-party reputation data may be incomplete or misclassified. Do not accuse or block users solely from one feed without validation.',
    get: 'https://viz.greynoise.io/', docs: 'https://docs.greynoise.io/', practice: 'https://docs.greynoise.io/docs/using-the-greynoise-community-api'
  },
  {
    id: 'shodan', name: 'Shodan', family: 'Internet-exposure research', level: 'Intermediate / supervised', focus: ['OSINT & Threat Intel', 'Blue Team', 'Cloud & DevSecOps'], risk: 'Moderate to high',
    what: 'A search service that indexes information about internet-connected devices and services visible to its crawlers.',
    worth: 'A defender can use approved exposure research to understand what an organisation may be publishing unintentionally.',
    example: 'Review a provided fictional exposure report and write remediation steps for services that should not be publicly reachable.',
    misuse: 'The index can reveal exposed devices or services. Use only for authorised exposure review; do not probe, log in to, or test discovered devices.',
    get: 'https://www.shodan.io/', docs: 'https://help.shodan.io/', practice: 'https://help.shodan.io/the-basics/what-is-shodan'
  },
  {
    id: 'virustotal', name: 'VirusTotal', family: 'File and URL reputation', level: 'Beginner / lookup only', focus: ['Blue Team', 'DFIR', 'OSINT & Threat Intel'], risk: 'Moderate',
    what: 'A service that aggregates signals from multiple security engines and related analysis sources for submitted or already-known items.',
    worth: 'It teaches indicator enrichment and why detections from multiple providers still need context and validation.',
    example: 'Look up a harmless public training hash or public URL and compare the report with a fictional alert; do not upload private files.',
    misuse: 'Submissions may be shared with examining partners and may expose confidential samples, internal URLs, or sensitive data. Look up known public indicators only for beginner exercises.',
    get: 'https://www.virustotal.com/', docs: 'https://docs.virustotal.com/docs/how-it-works', practice: 'https://docs.virustotal.com/'
  },
  {
    id: 'hibp', name: 'Have I Been Pwned', family: 'Personal account safety', level: 'Beginner', focus: ['Foundations', 'OSINT & Threat Intel'], risk: 'Low to moderate',
    what: 'A service that lets people check whether an email address appears in known breach records and learn about account breach exposure.',
    worth: 'It helps learners understand password reuse, breach notifications, and why a breach check does not mean an account is currently compromised.',
    example: 'Check only your own email address or a clearly fictional training address, then write a response plan: unique password, multifactor authentication, and session review.',
    misuse: 'Do not use it to investigate someone else’s private account. Never enter your password into a breach lookup page; change it through the account’s official site if needed.',
    get: 'https://haveibeenpwned.com/', docs: 'https://haveibeenpwned.com/FAQs', practice: 'https://haveibeenpwned.com/Passwords'
  },
  {
    id: 'prowler', name: 'Prowler', family: 'Cloud security posture', level: 'Intermediate → Advanced', focus: ['Cloud & DevSecOps', 'GRC'], risk: 'Moderate',
    what: 'An open-source cloud security tool that checks configured cloud resources against security controls and standards.',
    worth: 'It connects cloud configuration, least privilege, and compliance findings to practical remediation work.',
    example: 'Review a sample report or run a read-only audit in a dedicated test cloud account, then prioritise findings by risk and exposure.',
    misuse: 'Cloud credentials and permissions are sensitive. Never scan someone else’s account; use a dedicated lab account, least-privilege read-only access, and approved scope.',
    get: 'https://github.com/prowler-cloud/prowler', docs: 'https://docs.prowler.com/', practice: 'https://prowler.com/prowler-oss'
  },
  {
    id: 'grafana-prometheus', name: 'Grafana + Prometheus', family: 'Infrastructure observability', level: 'Intermediate / optional', focus: ['Cloud & DevSecOps', 'Blue Team'], risk: 'Low to moderate',
    what: 'Grafana presents metrics in dashboards, while Prometheus collects and queries time-series metrics from configured systems.',
    worth: 'These are not attack tools, but they help learners understand service health, performance baselines, and signals that may support incident triage.',
    example: 'Use synthetic service metrics to spot an unusual spike in errors or resource use, then compare it with an incident timeline.',
    misuse: 'Dashboards can expose internal infrastructure and credentials if misconfigured. Do not publish dashboards or metrics endpoints with sensitive details.',
    get: 'https://grafana.com/', docs: 'https://prometheus.io/docs/introduction/overview/', practice: 'https://grafana.com/tutorials/'
  },
  {
    id: 'abuseipdb', name: 'AbuseIPDB', family: 'IP reputation lookup', level: 'Intermediate', focus: ['OSINT & Threat Intel', 'Blue Team'], risk: 'Low to moderate',
    what: 'A crowdsourced service for checking reputation reports associated with IP addresses.',
    worth: 'It can provide one signal when investigating an IP found in your own logs, alongside other evidence.',
    example: 'Review a fictional alert IP and compare a reputation score with the event time, traffic pattern, and asset role.',
    misuse: 'Reports can be mistaken or outdated. Do not treat a score as proof of malicious intent or use it to harass a person or organisation.',
    get: 'https://www.abuseipdb.com/', docs: 'https://www.abuseipdb.com/api.html', practice: 'https://www.abuseipdb.com/'
  },
  {
    id: 'otx', name: 'AlienVault Open Threat Exchange (OTX)', family: 'Threat-intelligence feed', level: 'Intermediate', focus: ['OSINT & Threat Intel', 'Blue Team'], risk: 'Low to moderate',
    what: 'A community threat-intelligence platform where researchers share indicators and context about observed threats.',
    worth: 'It teaches how defenders enrich alerts with external context while checking source quality and freshness.',
    example: 'Review a public indicator in a training case, record the feed date and source, and corroborate it with the supplied event evidence.',
    misuse: 'An indicator can be stale, shared in error, or unrelated to a specific event. Never block, accuse, or escalate solely on one unverified indicator.',
    get: 'https://otx.alienvault.com/', docs: 'https://otx.alienvault.com/api', practice: 'https://otx.alienvault.com/'
  },
  {
    id: 'osint-framework', name: 'OSINT Framework', family: 'Research-resource directory', level: 'Beginner / guided use', focus: ['OSINT & Threat Intel', 'Foundations'], risk: 'Low to moderate',
    what: 'A directory that groups public information research resources by topic; it is an index, not a guarantee that each linked service is safe or reliable.',
    worth: 'It teaches learners how to classify public-source research tasks and evaluate sources instead of trusting a single search result.',
    example: 'Research a fictional company domain using public documentation and certificate history; write down each source and distinguish facts from assumptions.',
    misuse: 'Some linked tools may enable invasive people-search or may have different terms and privacy risks. Do not use it to dox, stalk, identify, or profile private people.',
    get: 'https://osintframework.com/', docs: 'https://osintframework.com/', practice: 'https://archive.org/web/'
  },
];

const toolMeta = {
  wireshark: { fit: 'Start here', cost: 'Free', setup: 'Desktop app', firstTask: 'Open a supplied capture and identify DNS queries and connection timing.' },
  nmap: { fit: 'Next step', cost: 'Free', setup: 'Desktop / lab host', firstTask: 'Read a sample inventory report and explain what a service listing does not prove.' },
  zap: { fit: 'Next step', cost: 'Free & open-source', setup: 'Desktop app + practice app', firstTask: 'Inspect a request in a local training app and list one defensive improvement.' },
  burp: { fit: 'Next step', cost: 'Free Community edition; paid editions exist', setup: 'Desktop app + lab', firstTask: 'Inspect a provided training request and label its method, path, status, and cookies.' },
  metasploit: { fit: 'Specialist', cost: 'Framework is free; commercial offerings vary', setup: 'Isolated virtual lab', firstTask: 'Read the lab-scope and safety documentation before observing a controlled validation demo.' },
  sysmon: { fit: 'Start here', cost: 'Free', setup: 'Windows test device', firstTask: 'Read a sample process-creation event and identify the time, image, user, and parent process.' },
  autopsy: { fit: 'Next step', cost: 'Free', setup: 'Desktop app + sample evidence', firstTask: 'Create a case using a course-provided evidence image and document the source.' },
  ghidra: { fit: 'Specialist', cost: 'Free & open-source', setup: 'Desktop app + harmless sample', firstTask: 'Inspect strings in a course-provided benign binary; do not execute unknown files.' },
  zeek: { fit: 'Specialist', cost: 'Free & open-source', setup: 'Linux / pre-generated logs', firstTask: 'Inspect sample connection logs and group records by protocol.' },
  cyberchef: { fit: 'Start here', cost: 'Free', setup: 'Browser or local copy', firstTask: 'Transform a fictional encoded string and explain why its meaning needs context.' },
  'mitre-attack': { fit: 'Start here', cost: 'Free reference', setup: 'Browser', firstTask: 'Map one fictional alert to a possible behaviour and list evidence still needed.' },
  python: { fit: 'Start here', cost: 'Free & open-source', setup: 'Desktop install', firstTask: 'Read a synthetic CSV and count events without changing the source file.' },
  vscode: { fit: 'Start here', cost: 'Free', setup: 'Desktop app', firstTask: 'Open a sample JSON log and write a short investigation note in Markdown.' },
  github: { fit: 'Start here', cost: 'Free tier; limits vary', setup: 'Browser account', firstTask: 'Create a README for a fictional lab without committing secrets or personal logs.' },
  wazuh: { fit: 'Next step', cost: 'Free & open-source core', setup: 'VM / moderate resources', firstTask: 'Follow one example alert back to its event source in a guided lab.' },
  sigma: { fit: 'Next step', cost: 'Free & open-source', setup: 'Browser; no install needed to read', firstTask: 'Annotate a public rule’s data source, conditions, and expected false positives.' },
  suricata: { fit: 'Next step', cost: 'Free & open-source', setup: 'Use sample PCAPs first', firstTask: 'Read a supplied alert and correlate it with the corresponding sample packet record.' },
  'security-onion': { fit: 'Specialist', cost: 'Free & open-source', setup: 'Dedicated VM / higher resources', firstTask: 'Study the architecture diagram before installing or connecting any sensor.' },
  osquery: { fit: 'Next step', cost: 'Free & open-source', setup: 'Desktop or isolated test host', firstTask: 'Review a sample query result and identify which authorised endpoint question it answers.' },
  volatility3: { fit: 'Specialist', cost: 'Free & open-source', setup: 'Python environment + memory image', firstTask: 'Read an introductory report from a provided memory image before analysing one yourself.' },
  sleuthkit: { fit: 'Specialist', cost: 'Free & open-source', setup: 'Desktop / evidence image', firstTask: 'Document evidence-image provenance and a simple file-system observation.' },
  'zimmerman-tools': { fit: 'Specialist', cost: 'Free tools; verify current licence', setup: 'Windows / supplied artifacts', firstTask: 'Read a guide to one Windows artifact and identify its time and interpretation limits.' },
  crtsh: { fit: 'Start here', cost: 'Free public lookup', setup: 'Browser', firstTask: 'Review certificate records for your own or a designated training domain.' },
  wayback: { fit: 'Start here', cost: 'Free public archive', setup: 'Browser', firstTask: 'Compare public snapshots of a training page and note the capture dates.' },
  greynoise: { fit: 'Next step', cost: 'Community/free limits; paid tiers vary', setup: 'Browser; account may be needed', firstTask: 'Contextualise a fictional IP alert and note that reputation is not proof.' },
  shodan: { fit: 'Specialist', cost: 'Public search; access limits vary', setup: 'Browser; account may be needed', firstTask: 'Study a fictional exposure report and write remediation advice without probing devices.' },
  virustotal: { fit: 'Next step', cost: 'Free lookups; API tiers vary', setup: 'Browser', firstTask: 'Review an existing public training hash report; never submit private samples.' },
  hibp: { fit: 'Start here', cost: 'Free personal lookup; services vary', setup: 'Browser', firstTask: 'Learn an account recovery checklist and check only your own or fictional address.' },
  prowler: { fit: 'Specialist', cost: 'Open-source CLI; hosted plans vary', setup: 'Cloud test account + setup', firstTask: 'Read a sample posture report and prioritise one misconfiguration by risk.' },
  'grafana-prometheus': { fit: 'Optional adjacent skill', cost: 'Open-source core; hosted plans vary', setup: 'Local services / configuration', firstTask: 'Use synthetic service metrics to write a short availability timeline.' },
  abuseipdb: { fit: 'Next step', cost: 'Limited lookups; paid tiers vary', setup: 'Browser', firstTask: 'Compare a sample reputation entry to independent fictional alert context.' },
  otx: { fit: 'Next step', cost: 'Community service; features may vary', setup: 'Browser', firstTask: 'Record an indicator source and timestamp, then corroborate it with sample evidence.' },
  'osint-framework': { fit: 'Start here', cost: 'Free directory; linked services vary', setup: 'Browser', firstTask: 'Choose a public-domain research task and verify every source before citing it.' },
};

const toolCatalog = [...baseToolCatalog, ...additionalTools].map((tool) => ({
  ...tool,
  fit: toolMeta[tool.id]?.fit ?? 'Optional adjacent skill',
  cost: toolMeta[tool.id]?.cost ?? 'Check current provider terms',
  setup: toolMeta[tool.id]?.setup ?? 'Check current documentation',
  firstTask: toolMeta[tool.id]?.firstTask ?? 'Read the official guide and start with provided sample data in an authorised lab.',
}));

const filmCases = [
  {
    title: 'Mr. Robot', type: 'TV series', lens: 'Social engineering · identity · endpoint evidence',
    synopsis: 'The story follows compromises that combine people, access, and technical weaknesses rather than depending on a magic terminal.',
    realism: 'The show is known for consulting cybersecurity experts, but each episode still compresses time and simplifies uncertainty for storytelling.',
    lesson: 'Defence must include identity protection, physical access controls, endpoint logs, backups, and incident coordination—not only a firewall.',
    exercise: 'Fictional exercise: you see an unusual login followed by an unexpected process launch. List the evidence you need before deciding whether the account is compromised.',
    source: 'https://www.wired.com/2016/07/real-hackers-behind-mr-robot-get-right/', sourceLabel: 'WIRED: technical advisors behind Mr. Robot'
  },
  {
    title: 'Hackers (1995)', type: 'Film', lens: 'Weak passwords · legacy systems · connected infrastructure',
    synopsis: 'The plot explores unauthorised access and risks to connected systems. Its visual computer sequences are deliberately stylised.',
    realism: 'A specialist review notes that some themes—exposed services, weak credentials, and poorly secured building systems—remain meaningful, while the on-screen visuals exaggerate how access looks.',
    lesson: 'Old devices and building technology can create real risk when they remain connected, unpatched, or poorly segmented.',
    exercise: 'Fictional exercise: a building controller is discovered on an approved asset inventory. Create a risk note covering business impact, isolation, ownership, and a safe remediation plan.',
    source: 'https://www.pentestpartners.com/security-blog/movie-breakdown-hackers-1995/', sourceLabel: 'Pen Test Partners: movie breakdown'
  },
  {
    title: 'Blackhat (2015)', type: 'Film', lens: 'Malware · infrastructure impact · digital investigation',
    synopsis: 'An international cybercrime investigation links technical compromise to consequences beyond a single computer.',
    realism: 'The film uses real cybersecurity concepts, but it condenses investigations and heightens how quickly one person can discover causes and connect evidence.',
    lesson: 'Serious incidents involve multiple systems, incomplete logs, competing hypotheses, evidence preservation, coordination, and uncertainty about attribution.',
    exercise: 'Fictional exercise: a company reports a service outage and suspicious network traffic. Write the first five evidence-preservation and containment questions an incident team should ask.',
    source: 'https://arstechnica.com/information-technology/2015/01/as-movies-go-hacking-in-blackhat-strives-for-realism-but-still-feels-forced/', sourceLabel: 'Ars Technica: Blackhat and realism'
  },
];

const safeLabs = [
  { name: 'TryHackMe', detail: 'Guided browser-based security learning and authorised lab exercises.', access: 'Free starter content; paid options vary', level: 'Beginner → Advanced', url: 'https://tryhackme.com/' },
  { name: 'OverTheWire: Bandit', detail: 'A beginner wargame for Linux command-line and SSH fundamentals.', access: 'Free', level: 'Beginner', url: 'https://overthewire.org/wargames/bandit/' },
  { name: 'PortSwigger Web Security Academy', detail: 'Guided web-security learning in designated practice labs.', access: 'Free labs', level: 'Beginner → Advanced', url: 'https://portswigger.net/web-security' },
  { name: 'OWASP Juice Shop', detail: 'An intentionally insecure training application for safe security practice.', access: 'Free & open-source', level: 'Beginner with guidance → Advanced', url: 'https://owasp.org/projects/juice-shop' },
  { name: 'CyberDefenders', detail: 'Blue-team investigations across SOC, threat hunting, DFIR, and related topics.', access: 'Free labs; paid products vary', level: 'Beginner → Advanced', url: 'https://cyberdefenders.org/blue-team-labs/' },
  { name: 'Blue Team Labs Online', detail: 'Investigation challenges and practical defensive exercises.', access: 'Free and paid options; check current terms', level: 'Beginner → Advanced', url: 'https://blueteamlabs.online/' },
  { name: 'Hack The Box Academy', detail: 'Structured modules and lab exercises; follow learning paths and scope rules.', access: 'Free and paid modules vary', level: 'Beginner → Advanced', url: 'https://academy.hackthebox.com/' },
  { name: 'Wireshark User Guide', detail: 'Learn packet and protocol analysis using example captures and authorised observations.', access: 'Free documentation', level: 'Beginner → Intermediate', url: 'https://www.wireshark.org/docs/wsug_html/' },
  { name: 'MITRE ATT&CK', detail: 'A reference for understanding observed adversary behaviour and defensive coverage.', access: 'Free reference', level: 'Beginner → Advanced', url: 'https://attack.mitre.org/' },
];


const threatReading = [
  { name: 'CISA Cybersecurity Advisories', detail: 'Official public advisories and recommended mitigations for known cybersecurity risks.', access: 'Free public guidance', level: 'Beginner → Intermediate', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories' },
  { name: 'The DFIR Report', detail: 'Detailed post-incident reports that help learners understand evidence, timelines, and attacker behaviour from a defender’s perspective.', access: 'Public reports; services vary', level: 'Intermediate → Advanced', url: 'https://thedfirreport.com/' },
  { name: 'ThreatFox', detail: 'Community-shared indicators that can support threat-intelligence enrichment when checked against local evidence.', access: 'Community resource; usage terms vary', level: 'Intermediate', url: 'https://threatfox.abuse.ch/' },
  { name: 'SANS Internet Storm Center', detail: 'Public diaries and daily summaries that explain current security events and defensive observations.', access: 'Free public reports', level: 'Beginner → Intermediate', url: 'https://isc.sans.edu/' },
  { name: 'Cisco Talos Intelligence', detail: 'Threat research and vulnerability reports that can be used to practise reading advisory details and mitigations.', access: 'Free public reports', level: 'Beginner → Advanced', url: 'https://talosintelligence.com/' },
];

const filters = ['All tools', 'Start here', 'Blue Team', 'Red Team', 'DFIR', 'Foundations', 'OSINT & Threat Intel', 'Cloud & DevSecOps'];
function toolArtwork(tool) {
  const text = `${tool.id || ''} ${tool.name || ''} ${tool.family || ''}`.toLowerCase();
  if (/wireshark/.test(text)) return '/images/opc-visuals/wireshark-ui.webp';
  if (/\bnmap\b|network discovery|asset discovery/.test(text)) return '/images/opc-visuals/network-discovery-ui.webp';
  if (/owasp zap|burp suite|mitmproxy|web application testing|sqlmap|ffuf|gobuster|nuclei|subfinder|dvwa|crapi/.test(text)) return '/images/opc-visuals/web-app-testing-ui.webp';
  if (/autopsy|volatility|sleuth kit|forensic|zimmerman/.test(text)) return '/images/opc-visuals/digital-forensics-ui.webp';
  if (/ghidra|reverse.engineering|malware analysis|disassembler/.test(text)) return '/images/opc-visuals/reverse-engineering-ui.webp';
  if (/metasploit|penetration testing|pentest/.test(text)) return '/images/opc-visuals/pentest-lab.webp';
  if (/defender|edr|xdr|sysmon|osquery/.test(text)) return '/images/opc-visuals/endpoint-defense.webp';
  if (/wazuh|splunk|sentinel|grafana|prometheus|siem|soc|event log/.test(text)) return '/images/opc-visuals/soc-monitoring.webp';
  if (/zeek|network analysis|network monitoring|packet/.test(text)) return '/images/opc-visuals/wireshark-ui.webp';
  if (/cloud|aws|azure|prowler|devsecops|kubernetes/.test(text)) return '/images/opc-visuals/cloud-security.webp';
  if (/cyberchef|crypt|hash|encoding|password/.test(text)) return '/images/opc-visuals/cryptography.webp';
  if (/python|visual studio|vscode|github|codeql|source code|secure code/.test(text)) return '/images/opc-visuals/secure-code.webp';
  if (/greynoise|shodan|virustotal|abuseipdb|otx|osint|crt\.sh|threat intel|mitre attack|breach|pwned/.test(text)) return '/images/opc-visuals/threat-intelligence.webp';
  if (/linux|windows|operating system|kernel/.test(text)) return '/images/opc-visuals/linux-admin.webp';
  if (/endpoint|edr|xdr|host telemetry/.test(text)) return '/images/opc-visuals/endpoint-defense.webp';
  if (/governance|risk|framework|compliance/.test(text)) return '/images/opc-visuals/governance-risk.webp';
  return '/images/opc-visuals/cyber-learning.webp';
}

function filmArtwork(title) {
  const name = String(title || '').toLowerCase();
  if (name.includes('mr. robot')) return '/images/opc-visuals/soc-monitoring.webp';
  if (name.includes('hackers')) return '/images/opc-visuals/network-discovery-ui.webp';
  if (name.includes('blackhat')) return '/images/opc-visuals/reverse-engineering-ui.webp';
  return '/images/opc-visuals/case-study-workstation.webp';
}
function ToolCard({ tool, Icon }) {
  return <article className="tt-tool-card">
    <div className="tt-tool-art"><img src={toolArtwork(tool)} alt={`${tool.name} workspace illustration`} loading="lazy" decoding="async" /><span className="tt-tool-art-shade" aria-hidden="true" /><span className="tt-tool-art-label">{tool.family}</span></div>
    <div className="tt-tool-top"><span className="tt-tool-kind">{tool.family}</span><span className={`tt-risk tt-risk-${tool.risk.toLowerCase().replace(/[^a-z]+/g, '-')}`}>Misuse risk: {tool.risk}</span></div>
    <div className="tt-tool-brand"><BrandIcon id={tool.id} name={tool.name} url={tool.get} size={46} className="tt-brand-icon" /><div className="tt-tool-brand-copy"><h3>{tool.name}</h3><div className="tt-level">{tool.level}</div></div></div>
    <div className="tt-meta-strip"><span className={`tt-fit tt-fit-${tool.fit.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{tool.fit}</span><span>{tool.cost}</span><span>{tool.setup}</span></div>
    <p className="tt-what">{tool.what}</p>
    <div className="tt-info-block"><small>WHY IT IS WORTH LEARNING</small><p>{tool.worth}</p></div>
    <div className="tt-info-block"><small>REAL-WORLD DEFENSIVE EXAMPLE</small><p>{tool.example}</p></div>
    <div className="tt-starter-task"><small>FIRST SAFE TASK</small><p>{tool.firstTask}</p></div>
    <div className="tt-misuse"><Icon name="alert-triangle" size={17}/><div><small>WHAT CAN GO WRONG</small><p>{tool.misuse}</p></div></div>
    <div className="tt-role-tags">{tool.focus.map((item) => <span key={item}>{item}</span>)}</div>
    <div className="tt-links"><a href={tool.get} target="_blank" rel="noreferrer">Official project / lookup <Icon name="arrow-up-right" size={13}/></a><a href={tool.docs} target="_blank" rel="noreferrer">Official documentation <Icon name="arrow-up-right" size={13}/></a><a href={tool.practice} target="_blank" rel="noreferrer">Starter learning resource <Icon name="arrow-up-right" size={13}/></a></div>
  </article>;
}

export function ToolsThreats({ Icon }) {
  const [filter, setFilter] = useState('All tools');
  const [toolQuery, setToolQuery] = useState('');
  const [openFilm, setOpenFilm] = useState('Mr. Robot');
  const visibleTools = useMemo(() => toolCatalog.filter((tool) => {
    if (filter === 'Start here' && !tool.fit.startsWith('Start here')) return false;
    if (filter === 'DFIR' && !(tool.focus.includes('DFIR') || tool.family.toLowerCase().includes('forensics') || tool.family.toLowerCase().includes('malware'))) return false;
    if (filter === 'Foundations' && !tool.focus.includes('Foundations')) return false;
    if (filter === 'Blue Team' && !(tool.focus.includes('Blue Team') || tool.focus.includes('Threat hunting'))) return false;
    if (filter === 'Red Team' && !(tool.focus.includes('Red Team') || tool.focus.includes('AppSec'))) return false;
    if (filter === 'OSINT & Threat Intel' && !tool.focus.includes('OSINT & Threat Intel')) return false;
    if (filter === 'Cloud & DevSecOps' && !tool.focus.includes('Cloud & DevSecOps')) return false;
    if (filter !== 'All tools' && !['Start here', 'DFIR', 'Foundations', 'Blue Team', 'Red Team', 'OSINT & Threat Intel', 'Cloud & DevSecOps'].includes(filter)) return false;
    const haystack = [tool.name, tool.family, tool.level, tool.fit, tool.cost, tool.setup, ...tool.focus].join(' ').toLowerCase();
    return haystack.includes(toolQuery.trim().toLowerCase());
  }), [filter, toolQuery]);

  return <section className="section-wrap tools-threats-page">
    <div className="tt-hero">
      <div className="tt-hero-content"><div className="section-kicker"><Icon name="terminal" size={15}/> TOOL LITERACY · THREAT AWARENESS · MOVIE CASE STUDIES</div>
        <h1>Understand the tools.<br/><em>Understand the consequences.</em></h1>
        <p>Learn what real cybersecurity tools do, why defenders and authorised testers use them, where to find official downloads, and how misuse can harm people and organisations. No attack commands are provided on this page.</p>
        <div className="tt-hero-pills"><span><Icon name="shield-check" size={14}/> Learn legally</span><span><Icon name="book-open" size={14}/> Understand first</span><span><Icon name="flask-conical" size={14}/> Practise in labs</span></div>
      </div>
      <div className="tt-hero-aside"><div className="tt-aside-mark"><Icon name="alert-triangle" size={26}/></div><h3>Permission is the boundary.</h3><p>Use tools only on your own systems, a lab built for practice, or systems covered by explicit permission. “I only wanted to learn” does not replace authorisation.</p></div>
    </div>

    <div className="tt-start-route">
      <div><span className="section-kicker">NEW LEARNER? START WITH FOUR STEPS</span><h2>Learn the basics before installing everything.</h2><p>You do not need every tool. Pick one learning goal, use sample data or a purpose-built lab, and save a short report of what you observed.</p></div>
      <ol><li><b>Foundations</b><span>Python, VS Code, basic networking, and Linux basics.</span></li><li><b>Observe</b><span>Wireshark, CyberChef, and sample Windows events.</span></li><li><b>Investigate</b><span>MITRE ATT&CK, basic SIEM concepts, and guided Blue Team labs.</span></li><li><b>Specialise</b><span>Choose web testing, SOC, DFIR, cloud security, or another track later.</span></li></ol>
    </div>

    <div className="tt-section-title"><div><div className="section-kicker">CURATED BY LEARNING VALUE</div><h2>Pick a tool by <em>the problem you need to understand.</em></h2></div><p>A tool is not a skill by itself. Learn the underlying network, operating-system, web, or forensic concept first; then use the tool to collect evidence and explain a result.</p></div>
    <label className="tt-search-wrap"><span>Search tool, role, setup, or cost</span><input className="tt-search" type="search" value={toolQuery} onChange={(event) => setToolQuery(event.target.value)} placeholder="e.g. SOC, free, browser, DFIR…" /></label>
    <div className="tt-filter-row" role="group" aria-label="Filter security tools">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`category-chip ${filter === item ? 'chosen' : ''}`}>{item}</button>)}<span>{visibleTools.length} of {toolCatalog.length} tools / references</span></div>
    {visibleTools.length ? <div className="tt-tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} Icon={Icon}/>)}</div> : <div className="tt-empty-search"><b>No matching tools found.</b><p>Try a different keyword or choose “All tools”.</p><button className="category-chip" type="button" onClick={() => { setFilter('All tools'); setToolQuery(''); }}>Reset filters</button></div>}

    <div className="tt-danger-panel"><div className="tt-danger-symbol"><Icon name="shield-alert" size={24}/></div><div><div className="section-kicker">REAL-WORLD IMPACT</div><h2>How far can illegal use go?</h2><p>Misuse can range from invading someone’s privacy or locking a personal account to financial loss, leaked company or customer data, prolonged service outages, disruption of hospitals or industrial systems, and evidence that must be investigated by security teams or law enforcement. Impact depends on the target, access, and actions taken; it is not a game score.</p><div className="tt-danger-grid"><div><b>Privacy</b><span>Exposed messages, photos, identity, or credentials</span></div><div><b>Money</b><span>Fraud, recovery costs, business losses, or extortion</span></div><div><b>Availability</b><span>Unavailable systems, lost work, damaged operations</span></div><div><b>Trust & law</b><span>Accountability, disciplinary action, civil claims, or criminal investigation depending on the facts and jurisdiction</span></div></div></div></div>

    <div className="tt-section-title tt-movie-heading"><div><div className="section-kicker">FICTION AS A STARTING POINT, NOT A MANUAL</div><h2>Movie scenes, <em>real lessons.</em></h2></div><p>These are short educational interpretations, not instructions copied from the films. A dramatic scene can help raise a question, but the evidence—not the screenplay—must guide a real investigation.</p></div>
    <div className="tt-film-grid">{filmCases.map((film) => <article className={`tt-film-card ${openFilm === film.title ? 'is-open' : ''}`} key={film.title}>
      <div className="tt-film-art"><img src={filmArtwork(film.title)} alt={`${film.title} case-study illustration`} loading="lazy" decoding="async" /><span className="tt-film-art-shade" aria-hidden="true" /></div>
      <button className="tt-film-toggle" type="button" aria-expanded={openFilm === film.title} onClick={() => setOpenFilm(openFilm === film.title ? '' : film.title)}><span className="tt-film-icon"><Icon name="film" size={22}/></span><span><small>{film.type.toUpperCase()} · CASE STUDY</small><b>{film.title}</b><em>{film.lens}</em></span><Icon name={openFilm === film.title ? 'minus' : 'plus'} size={18}/></button>
      {openFilm === film.title && <div className="tt-film-content"><p>{film.synopsis}</p><div className="tt-info-block"><small>REALITY CHECK</small><p>{film.realism}</p></div><div className="tt-info-block"><small>DEFENSIVE LESSON</small><p>{film.lesson}</p></div><div className="tt-film-exercise"><Icon name="lightbulb" size={17}/><div><small>TRY THIS WITHOUT ATTACKING ANY SYSTEM</small><p>{film.exercise}</p></div></div><a className="tt-source-link" href={film.source} target="_blank" rel="noreferrer">{film.sourceLabel} <Icon name="arrow-up-right" size={13}/></a></div>}
    </article>)}</div>

    <div className="tt-section-title"><div><div className="section-kicker">SAFE PLACE TO LEARN</div><h2>Practise in <em>purpose-built environments.</em></h2></div><p>These references lead to established training material or documentation. Review their current rules before beginning, and keep practice data separate from real accounts and personal information.</p></div>
    <div className="tt-safe-labs">{safeLabs.map((lab) => <a href={lab.url} key={lab.name} target="_blank" rel="noreferrer"><span><b>{lab.name}</b><small className="tt-lab-meta">{lab.level} · {lab.access}</small><small>{lab.detail}</small></span><Icon name="arrow-up-right" size={16}/></a>)}</div>

    <div className="tt-section-title"><div><div className="section-kicker">READ REAL CASES SAFELY</div><h2>Build context from <em>trusted reports.</em></h2></div><p>These are reading and threat-context resources, not instructions to reproduce an intrusion. Start with advisories and summaries; treat indicators as leads that need independent evidence.</p></div>
    <div className="tt-safe-labs">{threatReading.map((source) => <a href={source.url} key={source.name} target="_blank" rel="noreferrer"><span><b>{source.name}</b><small className="tt-lab-meta">{source.level} · {source.access}</small><small>{source.detail}</small></span><Icon name="arrow-up-right" size={16}/></a>)}</div>

    <div className="tt-bottom-note"><Icon name="check-circle" size={20}/><p><b>The learning rule:</b> understand what a tool observes, what its result can and cannot prove, the risk of running it, and the permission required. Keep a short report of your question, evidence, conclusion, uncertainty, and recommended defence. Never use these tools to spy on people, bypass access controls, disrupt services, or access data you are not allowed to see.</p></div>
  </section>;
}
