# Open Cyber Path — Learner-first tool catalogue review

**Purpose:** curate the large submitted start.me tool/platform list into a useful, feasible sequence for beginners. The objective is not to maximise the number of links. It is to help learners choose a tool that matches a current learning goal, understand the cost and setup effort, and practise safely.

## How the website now prioritises tools

Each profile shows a suggested learning stage, approximate access/cost model, setup effort, purpose, why it is useful, a realistic defensive example, a first safe task, and the risk of misuse. Cost and availability can change; check the provider's current terms before installing or paying. `Start here` means conceptually accessible, not that the learner must install every tool.

### Start here — low setup and strong foundations

| Tool or resource | Why it is a good first choice | First task idea | Source |
|---|---|---|---|
| Python | Useful for reading and summarising sample logs | Summarise a synthetic CSV | [Python downloads](https://www.python.org/downloads/) |
| Visual Studio Code | One editor for notes, JSON, Python, and Git projects | Read a provided JSON event | [Official download](https://code.visualstudio.com/Download) |
| GitHub | Build a portfolio and show reproducible project work | Write a README for a fictional lab; do not commit secrets | [GitHub Skills](https://skills.github.com/) |
| Wireshark | Understand network protocols visually | Open a provider-supplied sample capture | [User guide](https://www.wireshark.org/docs/wsug_html/) |
| CyberChef | Inspect and transform sample text without writing code | Transform a fictional encoded string | [Official project](https://github.com/gchq/CyberChef) |
| MITRE ATT&CK | Learn the language used to describe observed adversary behaviour | Map a fictional alert and list what is still unknown | [Getting started](https://attack.mitre.org/resources/) |
| Microsoft Sysmon | See which endpoint events are useful to an investigator | Read a synthetic process event | [Microsoft documentation](https://learn.microsoft.com/sysinternals/downloads/sysmon) |
| crt.sh | Learn certificate-transparency and passive domain inventory | Review a domain you own or a designated training domain | [Search](https://crt.sh/) |
| Internet Archive Wayback Machine | Compare public site snapshots over time | Compare capture dates for a training website | [Archive](https://archive.org/web/) |
| Have I Been Pwned | Learn personal breach awareness and recovery practices | Check only your own email or a fictional training address; never submit a password | [Official service](https://haveibeenpwned.com/) |

### Next step — once networking, HTTP, and logs make sense

| Tool or resource | Learner value | Main caution | Source |
|---|---|---|---|
| Wazuh | Connect endpoint logs, alerts, and SIEM workflows | A full deployment uses several components and collects sensitive telemetry | [Getting started](https://documentation.wazuh.com/current/getting-started/index.html) |
| Sigma rules | Learn how detection logic is described and shared | A copied rule may produce false positives or miss the intended data source | [Rule repository](https://github.com/SigmaHQ/sigma) |
| Suricata | Learn network intrusion detection using sample PCAPs and alerts | Do not connect experimental prevention/inline configurations to production traffic | [Documentation](https://docs.suricata.io/en/latest/) |
| osquery | Learn structured endpoint questions and inventory | Query only authorised endpoints and fields | [Official site](https://osquery.io/) |
| OWASP ZAP | Inspect and test owned web applications | Use a local intentionally vulnerable training application or explicit scope | [Getting started](https://www.zaproxy.org/getting-started/) |
| Burp Suite Community Edition | Understand browser-to-server HTTP requests and responses | Use the official training labs or your own local app | [Community Edition](https://portswigger.net/burp/communitydownload) · [Academy](https://portswigger.net/web-security) |
| Autopsy | Learn evidence handling and disk-image investigation | Work on supplied evidence copies; preserve provenance | [Official site](https://www.autopsy.com/) |
| VirusTotal | Add reputation context to a known public indicator | Do not submit confidential files, private URLs, or organisation data; submissions may be shared with partners | [How it works](https://docs.virustotal.com/docs/how-it-works) |
| AbuseIPDB | Add a second signal to a fictional or authorised IP alert | Community reputation is not proof of malicious behaviour | [Official service](https://www.abuseipdb.com/) |
| AlienVault Open Threat Exchange (OTX) | Explore shared threat-intelligence indicators | Check freshness and corroborate every indicator with local evidence | [OTX](https://otx.alienvault.com/) |
| OSINT Framework | Learn how public-source research tasks are categorised | It is a directory; linked services vary in quality, terms, and privacy impact | [Framework](https://osintframework.com/) |

### Specialist — use after the concepts and safe lab habits are established

| Tool or resource | Why it is later-stage | Access/setup consideration | Source |
|---|---|---|---|
| Nmap | Useful for authorised service inventory and validation | Restrict scanning to owned or explicitly approved systems | [Official guide](https://nmap.org/book/man-book.html) |
| Zeek | Produces rich structured network monitoring logs | Linux and log-analysis foundations help | [Documentation](https://docs.zeek.org/en/current/about/what.html) |
| Security Onion | Combines several SOC visibility and investigation capabilities | Higher resource needs; do not deploy sensors without approval | [Documentation](https://docs.securityonion.net/en/2.4/) |
| Volatility 3 | Memory artefact analysis | Requires a suitable memory image and more DFIR knowledge | [Stable docs](https://volatility3.readthedocs.io/en/stable/) |
| The Sleuth Kit | File-system and disk-image forensics | Requires careful evidence-copy and chain-of-custody habits | [Official download](https://www.sleuthkit.org/sleuthkit/download.php) |
| Eric Zimmerman’s Windows forensic tools | More detailed analysis of Windows artefacts | Windows-focused and requires artefact interpretation skills | [Official tool index](https://ericzimmerman.github.io/) |
| Ghidra | Reverse-engineering compiled programs | Advanced; begin with harmless course-provided binaries and do not run unknown files | [Official repository](https://github.com/NationalSecurityAgency/ghidra) |
| Metasploit Framework | Controlled validation of known vulnerabilities in lab targets | Highest operational risk among this catalogue; no public/school/workplace targets without explicit written scope | [Getting started](https://docs.rapid7.com/metasploit/getting-started/) |
| Shodan | Understand internet-exposed service information for defensive exposure review | Index data can expose systems; do not probe or attempt access to discovered devices | [Official site](https://www.shodan.io/) |
| GreyNoise | Contextualise broad internet-scanning activity | Free access and lookup limits vary; reputation is only one evidence source | [Documentation](https://docs.greynoise.io/) |
| Prowler | Assess cloud configuration and posture | Use a dedicated test account and least-privilege/read-only scope | [Open-source project](https://github.com/prowler-cloud/prowler) |
| Grafana + Prometheus | Understand telemetry dashboards and service baselines | Useful adjacent skills, not required to begin cybersecurity | [Grafana tutorials](https://grafana.com/tutorials/) · [Prometheus overview](https://prometheus.io/docs/introduction/overview/) |

## Training platforms in the website

The page links to purpose-built practice resources rather than asking a learner to test arbitrary internet targets:

- [TryHackMe](https://tryhackme.com/) — guided learning and labs; free/paid offerings may vary.
- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/) — free, beginner-oriented Linux command-line game.
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — free web-security practice labs.
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop) — intentionally insecure training application; use a local or designated demo instance.
- [CyberDefenders](https://cyberdefenders.org/blue-team-labs/) — Blue Team investigation challenges; access models vary.
- [Blue Team Labs Online](https://blueteamlabs.online/) — guided defensive investigation exercises; check current access options.
- [Hack The Box Academy](https://academy.hackthebox.com/) — structured training modules; free/paid access varies.
- [Wireshark User Guide](https://www.wireshark.org/docs/wsug_html/) and [MITRE ATT&CK](https://attack.mitre.org/) — free reference material.

## Other items from the submitted list: what we did not promote to the beginner catalogue

The two excluded groups at issue are people-search services and breach-data services; people-search, reverse-face-search, and credential-dump tools are not appropriate default recommendations for beginner learners.

This is a deliberate curation decision, not a claim that every omitted product is illegitimate.

- **People-finder, reverse-face-search, and broad social-profile aggregation services** were not placed in a beginner hacking-tool list. They can enable tracking, doxxing, or invasive profiling. Teach consent, privacy, and self-auditing instead.
- **Breach-data search and credential-dump services** were excluded from learner-facing links. Beginners should learn breach response through official notifications, their own accounts, and defender-focused reports—not by searching leaked private records.
- **“Burner/OPSEC tools” were not labelled hacking tools.** Privacy systems and encrypted communications have legitimate uses, but they do not make unlawful activity safe or lawful. Personal account security deserves a separate, carefully framed lesson.
- **Commercial enterprise platforms** such as paid cloud-security, SIEM, forensic, and training suites can be mentioned in a later comparison lesson. They should not be mandatory for a free-first beginner path; licensing, trials, and terms change.
- **Generic domains, duplicates, marketing sites, stale-looking names, and misspelled URLs** were not imported automatically from the list. Canonical provider pages are used where a tool is included. Examples of link normalisation include the correct Have I Been Pwned spelling, the official Shodan site, the Volatility 3 project, Eric Zimmerman’s tools page, and SigmaHQ's GitHub resources.
- **General business, news, coding, and observability services** were not all treated as security tools. Python, VS Code, GitHub, and Grafana/Prometheus were retained where they provide a clear skill-building use; alternatives such as GitLab, Kaggle, Sentry, Datadog, Dynatrace, and New Relic can be added in a separate developer/operations resource section later.
- **Live malware samples and malware repositories** are not part of the beginner click-through catalog. Start with reports, hashes, synthetic data, and instructor-provided safe samples; never download or execute unknown samples on a personal device.

## Public advisories and incident-reading sources

These are added as a separate reading area, not as tools to run against a target:

| Source | Learner use | Caution | Link |
|---|---|---|---|
| CISA Cybersecurity Advisories | Learn the problem, affected products, and recommended defensive action from public advisories | Do not treat an advisory as proof that your own device is affected without checking the affected version and configuration | [Official advisories](https://www.cisa.gov/news-events/cybersecurity-advisories) |
| The DFIR Report | Read incident timelines and learn how multiple evidence sources are correlated | Detailed reports are intermediate reading; do not imitate an intrusion | [Public reports](https://thedfirreport.com/) |
| ThreatFox | Learn what an IOC feed is and how it may enrich a defensive investigation | Indicators expire and need corroboration; the guide does not recommend downloading malware samples | [IOC platform](https://threatfox.abuse.ch/) |
| SANS Internet Storm Center | Read short security diaries and incident observations | Reports are leads for learning; verify technical claims against primary sources | [Internet Storm Center](https://isc.sans.edu/) |
| Cisco Talos Intelligence | Learn to read vulnerability research and mitigation summaries | Focus on the reported vulnerability, affected versions, and vendor advisories—not on reproducing attacks | [Threat research](https://talosintelligence.com/) |

## Suggested learner sequence

1. Learn networks, HTTP, Windows/Linux basics, and safe use of data.
2. Start with Python, VS Code, GitHub, sample logs, Wireshark, CyberChef, and MITRE ATT&CK.
3. Practise only on the training platforms above; produce short evidence-based reports.
4. Choose a direction: Blue Team/SOC, AppSec, DFIR, Threat Hunting, Cloud Security, or GRC.
5. Add the next tool only when a project needs it. For every exercise, save the question, data source, observed evidence, conclusion, uncertainty, and defensive recommendation.

**Scope reminder:** all technical testing must remain in owned systems, purpose-built practice labs, or a scope explicitly authorised by the system owner. No tool list replaces permission, legal review, provider terms, or basic privacy protection.

## Reference checks

The catalogue's purpose and source links were aligned with provider documentation, including [Wazuh getting started](https://documentation.wazuh.com/current/getting-started/index.html), [SigmaHQ's detection-rule repository](https://github.com/SigmaHQ/sigma), [Volatility 3 documentation](https://volatility3.readthedocs.io/en/stable/), [OWASP Juice Shop](https://owasp.org/projects/juice-shop), [CyberDefenders Blue Team labs](https://cyberdefenders.org/blue-team-labs/), [OverTheWire Bandit](https://overthewire.org/wargames/bandit/), and [VirusTotal's explanation of sharing analysis results](https://docs.virustotal.com/docs/how-it-works). External links may change; check the linked provider's current documentation and policies before use.
