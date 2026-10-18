# OpenCyberPath — Tools, Threats & Movie Case Studies

## Purpose
This learning area teaches tool literacy: what a security tool is for, why professionals learn it, how its output supports a decision, where to find the official project or documentation, and how misuse can affect people. It intentionally does not publish attack commands or instructions for targeting real systems.

## Rules for every learner
1. Use only systems you own, a purpose-built training environment, or systems covered by explicit permission and scope.
2. Read the tool's official documentation and current terms before installing or using it.
3. Keep practice data synthetic. Do not paste passwords, tokens, private traffic, customer records, or other sensitive data into online tools.
4. A scan or alert is evidence to review, not proof that a crime or compromise happened.
5. Write down scope, the question, evidence, limits, conclusion, and defensive next step. Stop if a task leaves the authorised scope.

## Tool directory

| Tool / reference | What it does | Why it is worth learning | Example defensive use | Where to get it / learn |
|---|---|---|---|---|
| Wireshark | Analyses captured network packets and protocols | Makes DNS, connection setup, and protocol failures visible | Review an approved sample capture to understand an application error | [Download](https://www.wireshark.org/download.html) · [User guide](https://www.wireshark.org/docs/wsug_html/) |
| Nmap | Network discovery and security auditing | Helps maintain an accurate inventory of hosts and exposed services | Compare an authorised test subnet to an approved asset inventory | [Download](https://nmap.org/download.html) · [Official guide](https://nmap.org/book/man-book.html) |
| OWASP ZAP | Web application testing proxy and scanner | Helps evaluate a learner's own application and understand HTTP behaviour | Review a deliberately vulnerable local training app and document a fix | [Download](https://www.zaproxy.org/download/) · [Getting started](https://www.zaproxy.org/getting-started/) |
| Burp Suite Community Edition | Inspects and manually reviews web requests and responses | Teaches cookies, parameters, sessions, status codes, and access control | Compare requests within PortSwigger's designated training labs | [Official download](https://portswigger.net/burp/communitydownload) · [Web Security Academy](https://portswigger.net/web-security) |
| Metasploit Framework | Modular platform for authorised vulnerability validation and penetration testing | Helps later-stage learners understand how a known vulnerability is tested and how remediation is verified | Validate a fix against an isolated, intentionally vulnerable virtual machine | [Official project](https://www.metasploit.com/download) · [Documentation](https://docs.rapid7.com/metasploit/getting-started/) |
| Microsoft Sysmon | Adds detailed Windows activity events to Event Viewer and collection pipelines | Builds understanding of process, network, and file activity used in investigations | Compare synthetic process events and write an evidence-based triage note | [Microsoft download and docs](https://learn.microsoft.com/sysinternals/downloads/sysmon) |
| Autopsy | Examines digital evidence images and artefacts | Teaches evidence handling, timelines, and investigative documentation | Analyse a course-provided evidence image without changing the original | [Official site and downloads](https://www.autopsy.com/) |
| Ghidra | Reverse-engineers compiled software with disassembly and decompilation | Helps advanced learners understand unfamiliar programs and suspicious binaries | Analyse a harmless training binary supplied by a course | [Official repository/releases](https://github.com/NationalSecurityAgency/ghidra) |
| Zeek | Converts observed network activity into structured security-monitoring logs | Supports network investigations and behaviour-based hunting | Search pre-generated DNS and connection logs for patterns that need follow-up | [Official documentation](https://docs.zeek.org/en/current/about/what.html) |
| CyberChef | Transforms and inspects text/data in a browser-based workbench | Helps analysts understand encodings and normalise sample data | Decode fictional training strings, then explain what the output does and does not prove | [Official project](https://github.com/gchq/CyberChef) |
| MITRE ATT&CK | Knowledge base of observed adversary tactics and techniques | Gives defenders and testers a shared vocabulary for describing behaviour | Map a fictional alert to a candidate technique and list the evidence still needed | [Getting started](https://attack.mitre.org/resources/) |

### Risk language

“Risk of misuse” describes what could happen when a tool is used irresponsibly; it is not a ranking of tools as good or bad. Even a network analyser can expose private traffic, and a web scanner can alter data or disrupt a fragile service. Exploitation frameworks carry higher operational risk because their modules may execute code or change a target system. Context, scope, permissions, configuration, and skill all matter.

## Movie case studies

These are short educational interpretations of fictional works. They are not scene transcripts or how-to instructions.

### Mr. Robot — social engineering, identity, and multi-stage compromise

The series often frames technical compromise as a chain involving people, identity, access, and system weaknesses. It has been noted for the involvement of technical advisers, but television still compresses timelines and simplifies uncertainty.

**Defensive question:** An unusual login is followed by an unexpected process. What identity, endpoint, network, and change-management evidence would you collect before deciding whether an account was compromised?

**Learning point:** No single alert tells the whole story. Correlate evidence, protect identity, preserve logs, and record alternative explanations.

Reference: [WIRED — How the real hackers behind Mr. Robot get it right](https://www.wired.com/2016/07/real-hackers-behind-mr-robot-get-right/).

### Hackers (1995) — weak passwords, legacy services, and connected infrastructure

The film uses highly stylised computer visuals. Its themes can prompt useful discussion about weak credentials, forgotten services, and connected building systems, but its visual depiction of access is not a realistic representation of normal computer work.

**Defensive question:** An approved asset inventory reveals an old building controller on a network. How would you identify its owner, assess business impact, limit unnecessary exposure, and plan a safe update or isolation?

**Learning point:** Old or specialised systems may remain in service long after their original security assumptions have become unsafe.

Reference: [Pen Test Partners — Movie breakdown: Hackers (1995)](https://www.pentestpartners.com/security-blog/movie-breakdown-hackers-1995/).

### Blackhat (2015) — malware, infrastructure impact, and investigation

The film links a cybercrime investigation to effects beyond an individual workstation. Real investigations usually require evidence preservation, log analysis, several competing hypotheses, coordination, and careful treatment of uncertain attribution; films necessarily compress these processes.

**Defensive question:** A company reports an outage and suspicious traffic. What must be preserved first, which service owners should be contacted, and how can responders limit further impact without destroying evidence?

**Learning point:** Cyber incidents can affect availability, money, privacy, safety, and public trust. Technical investigation is only one part of the response.

Reference: [Ars Technica — Blackhat and hacking realism](https://arstechnica.com/information-technology/2015/01/as-movies-go-hacking-in-blackhat-strives-for-realism-but-still-feels-forced/).

## Safe places for practice

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — guided web-security learning in designated practice labs.
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop) — an intentionally insecure training application built for security education.
- [Wireshark User Guide](https://www.wireshark.org/docs/wsug_html/) — protocol analysis documentation.
- [MITRE ATT&CK](https://attack.mitre.org/) — reference material for understanding observed attacker behaviour and defensive coverage.

Before installing a tool, check the official source, platform support, permissions, licensing, and current documentation. For beginners, prefer supplied datasets or isolated labs over scanning or testing live systems. The learning goal is to understand and reduce risk, not to imitate fictional criminals.


## Expanded learner-first catalogue

The website tool catalogue has been expanded beyond the original 11 core tool/reference cards. It now includes 33 curated profiles with a suggested learning stage, approximate cost/access model, setup effort, a first safe task, official project/documentation links, and a misuse-risk note. Search and filters let a learner avoid browsing every tool at once. A separate public reading shelf links to CISA Cybersecurity Advisories, The DFIR Report, ThreatFox, SANS Internet Storm Center, and Cisco Talos; it is framed for contextual reading and defensive analysis, not reproducing intrusions.

Additional selections from the submitted list include Python, Visual Studio Code, GitHub, Wazuh, Sigma detection rules, Suricata, Security Onion, osquery, Volatility 3, The Sleuth Kit, Eric Zimmerman’s Windows forensic tools, crt.sh, the Wayback Machine, GreyNoise, Shodan, VirusTotal, Have I Been Pwned, Prowler, Grafana/Prometheus, AbuseIPDB, AlienVault OTX, and OSINT Framework.

The page also includes a separate public-advisory/incident-reading area (CISA advisories, The DFIR Report, ThreatFox, SANS Internet Storm Center, and Cisco Talos Intelligence). These are reading references, not operational hacking tools. See [`TOOLS-CATALOGUE-CURATION.md`](TOOLS-CATALOGUE-CURATION.md) for the full selection rationale, the beginner-to-specialist ordering, official source links, and the categories intentionally not promoted into a beginner hacking-tool list. It explains why people-search/reverse-face-search sites, breach-data services, raw malware repositories, typo-prone or generic domains, and an “OPSEC/burner tool” framing were not imported automatically.

## What illegal misuse can do

Depending on the target and actions, misuse may expose private messages, photos or credentials; enable identity theft or fraud; change or destroy records; interrupt a business or public service; or create safety risks for organisations that depend on connected systems. It can also lead to disciplinary action, civil claims, or criminal investigation depending on the facts and jurisdiction. Never assume that curiosity, an available tool, or a public-facing system grants permission.

## Reference links verified while preparing this guide

- [Nmap official guide](https://nmap.org/book/man-book.html)
- [Wireshark User Guide](https://www.wireshark.org/docs/wsug_html/)
- [OWASP ZAP Getting Started](https://www.zaproxy.org/getting-started/)
- [PortSwigger Burp Suite getting started](https://portswigger.net/burp/documentation/desktop/getting-started)
- [Rapid7 Metasploit documentation](https://docs.rapid7.com/metasploit/getting-started/)
- [Microsoft Sysmon documentation](https://learn.microsoft.com/sysinternals/downloads/sysmon)
- [Autopsy](https://www.autopsy.com/)
- [Ghidra official repository](https://github.com/NationalSecurityAgency/ghidra)
- [Zeek: what it is](https://docs.zeek.org/en/current/about/what.html)
- [MITRE ATT&CK getting started](https://attack.mitre.org/resources/)
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop)
