import { useEffect, useMemo, useState } from 'react';
import { learningVideos } from '../data/learningVideos.js';
import './InteractiveLabWorkbench.css';

const MISSIONS = [
  {
    id: 'linux-cli', title: 'Linux CLI: orient yourself', topic: 'Linux & CLI', level: 'Beginner', shell: 'bash', time: '10 min',
    objective: 'Identify the training directory and inspect the supplied operating-system and log fixtures.',
    task: 'Read the simulated OS release file. Then try pwd, ls -la, and whoami to explore the fixture environment.',
    hints: [
      'Read the supplied release fixture with cat /etc/os-release.',
      'Compare NAME, ID, and VERSION_ID. These values describe a fictional training image, not the device running your browser.',
    ],
    expectedOutput: 'NAME="OpenCyberPath Training Linux"\nID=ocp-lab\nVERSION_ID="1.0"\nPRETTY_NAME="OpenCyberPath Training Linux 1.0"',
    interpretation: 'The values describe the included training fixture. They do not identify the operating system installed on your computer.',
    selfCheck: 'Can you name the file that supplied these fields and explain why this output is not evidence about the host computer?',
    accepted: ['cat /etc/os-release'], starter: 'pwd',
  },
  {
    id: 'windows-cmd', title: 'Windows CMD: network triage', topic: 'Windows & PowerShell', level: 'Beginner', shell: 'cmd', time: '12 min',
    objective: 'Collect the training host network configuration and explain what a command output can and cannot prove.',
    task: 'Run ipconfig /all in the simulated CMD terminal. Then inspect the DNS example using nslookup training.example.',
    hints: [
      'Run ipconfig /all in this simulated CMD console.',
      'Compare the IPv4 address, default gateway, and DNS server. The 192.0.2.0/24 range is reserved for documentation examples.',
    ],
    expectedOutput: 'IPv4 address: 192.0.2.25\nDefault gateway: 192.0.2.1\nDNS server: 192.0.2.53',
    interpretation: 'These are fictional values returned by the simulator. They are useful for reading a network configuration, but they are not your real adapter settings.',
    selfCheck: 'Can you identify the host address, gateway, and resolver, and state which part of the exercise supplied the values?',
    accepted: ['ipconfig', 'ipconfig /all'], starter: 'ipconfig /all',
  },
  {
    id: 'powershell-events', title: 'PowerShell: find authentication failures', topic: 'Windows & PowerShell', level: 'Beginner', shell: 'powershell', time: '15 min',
    objective: 'Filter a fictional authentication log and separate repeated failures from a confirmed compromise.',
    task: 'Use Select-String to find the word failed in the supplied auth.log. This runs against synthetic content only.',
    hints: [
      'Use Select-String against the supplied auth.log fixture with a failed pattern.',
      'Compare the event timestamps. Repeated failures followed by a success are worth investigating, but do not alone prove an account was compromised.',
    ],
    expectedOutput: 'Two failed sign-ins precede one successful sign-in in the synthetic records.',
    interpretation: 'The sequence is an investigative clue. Check identity, source, surrounding activity, expected user behaviour, and independent evidence before making a conclusion.',
    selfCheck: 'Can you distinguish the observed event sequence from a hypothesis, and name one additional source you would check?',
    accepted: ['select-string -path .\\auth.log -pattern "failed"', 'select-string -path .\\auth.log -pattern failed'], starter: 'Select-String -Path .\\auth.log -Pattern "failed"',
  },
  {
    id: 'dns-hunt', title: 'Linux: build a DNS event clue', topic: 'Networking & DNS', level: 'Intermediate', shell: 'bash', time: '15 min',
    objective: 'Filter fictional DNS events and record one observation that needs more context before it becomes a conclusion.',
    task: 'Search the provided DNS CSV for query events using grep. The records are fabricated for this lesson.',
    hints: [
      'Filter the supplied CSV for rows where the event field is query.',
      'Read the timestamp, host, query name, and result together. Several queries or a successful response are not automatically malicious.',
    ],
    expectedOutput: 'The fixture contains three query rows and one response row for the training.example example.',
    interpretation: 'A query count or a name alone is not a verdict. Look for baseline, process or user context, time pattern, destination reputation from a trusted source, and other corroborating signals.',
    selfCheck: 'Can you quote one row accurately and name the context missing before you could label it suspicious?',
    accepted: ['grep "query" samples/dns-events.csv', "grep 'query' samples/dns-events.csv", 'grep query samples/dns-events.csv'], starter: 'grep "query" samples/dns-events.csv',
  },
  {
    id: 'http-basics', title: 'CMD: read an HTTP exchange', topic: 'HTTP & web security', level: 'Beginner', shell: 'cmd', time: '12 min',
    objective: 'Recognise the status line, headers, and body of a sample HTTP response without contacting a website.',
    task: 'Run the sandbox-only curl example. The response is fixture text and no network connection is made.',
    hints: [
      'Run the supported curl https://training.example/ training command.',
      'Find the status line, a Content-Type header, and the body. training.example is a fixture target here; no internet request is sent.',
    ],
    expectedOutput: 'HTTP/1.1 200 OK\nContent-Type: text/plain; charset=utf-8\n\nHello from the OpenCyberPath HTTP fixture.',
    interpretation: '200 is the example status line, Content-Type describes the response body format, and the text after the blank line is the body. The response is canned training data.',
    selfCheck: 'Can you point to the status, header, and body, and explain why this does not prove that an external site is reachable?',
    accepted: ['curl https://training.example/', 'curl https://training.example'], starter: 'curl https://training.example/',
  },
  {
    id: 'detection-metrics', title: 'PowerShell: evaluate a detection', topic: 'Detection engineering', level: 'Intermediate', shell: 'powershell', time: '18 min',
    objective: 'Inspect a tiny labelled dataset and read the confusion-matrix counts before discussing precision and recall.',
    task: 'Run the sample evaluation script in the simulator. The metrics are calculated from fictional labelled cases.',
    hints: [
      'Run the supported python .\\evaluate.py training command; the simulator returns a fixed evaluation fixture.',
      'Read true positives, false positives, false negatives, and true negatives before interpreting precision and recall.',
    ],
    expectedOutput: 'TP=3\nFP=1\nFN=1\nTN=5\nPrecision=75.0%\nRecall=75.0%',
    interpretation: 'In this tiny labelled fixture, precision reflects the share of predicted positives that are true positives; recall reflects the share of actual positives detected. Small samples do not establish real-world performance.',
    selfCheck: 'Can you explain the difference between a false positive and a false negative, and why more representative test data is needed?',
    accepted: ['python .\\evaluate.py', 'python evaluate.py', '.\\evaluate.py'], starter: 'python .\\evaluate.py',
  },
];

const VIDEOS = learningVideos.map((video) => ({
  ...video,
  docs: video.officialDocs || video.docs || '',
  type: video.type || 'Curated video',
}));

const REAL_LABS = [
  { title: 'Killercoda', type: 'Real browser terminal', topic: 'Linux, containers, networking', detail: 'Launch disposable interactive Linux or technology scenarios in the browser. This opens the provider environment, not this site simulator.', url: 'https://killercoda.com/', access: 'Free scenarios; limits may apply' },
  { title: 'pwn.college Dojo', type: 'Browser terminal, IDE, and Linux desktop', topic: 'Linux command line, systems fundamentals, security challenges', detail: 'The provider offers terminal and desktop-based exercises in its own controlled environment. Follow its onboarding and challenge rules.', url: 'https://pwn.college/welcome/', access: 'Educational platform; sign-in may be needed' },
  { title: 'Hack The Box Academy', type: 'Guided paths with target instances', topic: 'Pen testing, web security, SOC, Linux, networking', detail: 'Structured skill and job-role paths include interactive assessments. Some modules require platform credits or a subscription.', url: 'https://academy.hackthebox.com/catalogue/paths', access: 'Tiered access; review each module before starting' },
  { title: 'PortSwigger Web Security Academy', type: 'Interactive web labs', topic: 'HTTP, authentication, access control, web vulnerabilities', detail: 'Purpose-built online training labs with learning material and progress tracking.', url: 'https://portswigger.net/web-security', access: 'Free interactive labs' },
  { title: 'CyberDefenders', type: 'Blue-team investigation lab', topic: 'SOC, DFIR, threat hunting, forensic artefacts', detail: 'Work through security investigation scenarios using a hosted cyber range when available.', url: 'https://cyberdefenders.org/blue-team-labs/', access: 'Free and paid access varies by lab' },
  { title: 'OverTheWire Bandit', type: 'SSH command-line wargame', topic: 'Linux CLI, files, permissions, text processing', detail: 'Practise shell skills against the provider’s intentionally designed educational levels.', url: 'https://overthewire.org/wargames/bandit/', access: 'Free; SSH client required' },
  { title: 'TryHackMe rooms', type: 'Guided security rooms', topic: 'Foundations, networking, defensive security, web topics', detail: 'Guided tasks and hands-on rooms; the exact available rooms and access conditions vary.', url: 'https://tryhackme.com/r/rooms', access: 'Account required; free and paid content' },
  { title: 'OWASP Juice Shop', type: 'Local vulnerable practice app', topic: 'Web application security and secure coding', detail: 'An intentionally vulnerable training application. Follow the official setup guidance and keep your instance local or isolated.', url: 'https://owasp.org/www-project-juice-shop/', access: 'Open source; local setup required' },
  { title: 'CyLab Security Academy', type: 'University learning and challenge platform', topic: 'Foundations, CTF-style practice, security concepts', detail: 'Carnegie Mellon University’s free learning platform, which replaced the picoCTF site branding in 2026. Check the current login and platform guidance.', url: 'https://www.picoctf.org/', access: 'Free learning platform; current rollout may vary' },
];

const FIXTURES = {
  os: 'NAME="OpenCyberPath Training Linux"\nID=ocp-lab\nVERSION_ID="1.0"\nPRETTY_NAME="OpenCyberPath Training Linux 1.0"',
  dns: 'timestamp,host,event,query,result\n2026-01-12T09:00:02Z,LAB-WS01,query,training.example,NOERROR\n2026-01-12T09:00:07Z,LAB-WS01,query,updates.example,NOERROR\n2026-01-12T09:01:13Z,LAB-WS02,query,training.example,NOERROR\n2026-01-12T09:04:22Z,LAB-WS01,response,training.example,192.0.2.25',
  auth: '2026-01-12T09:10:01Z LAB-WS01 user=student result=failed source=192.0.2.10\n2026-01-12T09:10:08Z LAB-WS01 user=student result=failed source=192.0.2.10\n2026-01-12T09:10:20Z LAB-WS01 user=student result=success source=192.0.2.10\n2026-01-12T09:12:45Z LAB-WS02 user=analyst result=success source=192.0.2.30',
  events: '[\n  { "event_id": 4688, "host": "LAB-WS01", "process": "notepad.exe", "user": "student", "label": "benign-training" },\n  { "event_id": 4625, "host": "LAB-WS01", "event": "failed sign-in", "user": "student", "label": "investigate" },\n  { "event_id": 4624, "host": "LAB-WS01", "event": "successful sign-in", "user": "student", "label": "context-required" }\n]',
};

const TRAINING_TARGETS = new Set([
  'training.example', 'localhost', '127.0.0.1', '192.0.2.25', '192.0.2.0/24',
  '198.51.100.25', '198.51.100.0/24', '203.0.113.25', '203.0.113.0/24',
  'test.local', 'target.lab', 'owasp-juice-shop.local',
]);
const TRAINING_REPOSITORIES = [
  'https://github.com/owasp/juice-shop.git',
  'https://github.com/sigmahq/sigma.git',
  'https://github.com/mitre-attack/attack-stix-data.git',
];
function normalizeCommand(value) { return String(value || '').trim().replace(/\s+/g, ' '); }
function normalizeTarget(value) {
  return String(value || '').trim().replace(/^https?:\/\//i, '').split(/[/?#]/, 1)[0].replace(/[.,]$/, '').toLowerCase();
}
function isTrainingTarget(value) {
  const target = normalizeTarget(value);
  if (TRAINING_TARGETS.has(target)) return true;
  if (/^(?:192\.0\.2|198\.51\.100|203\.0\.113)\.\d{1,3}$/.test(target)) return true;
  if (/^[a-z0-9.-]+\.(?:example|test|invalid|localhost|lab)$/.test(target)) return true;
  return false;
}
function findNetworkTarget(raw) {
  const candidates = normalizeCommand(raw).split(/\s+/).filter((part) => {
    const token = part.replace(/^[\"']|[\"']$/g, '').replace(/[;,]$/, '');
    return /^https?:\/\//i.test(token) || /^(?:localhost|[a-z0-9.-]+\.[a-z]{2,}|127(?:\.\d{1,3}){3}|(?:192\.0\.2|198\.51\.100|203\.0\.113)\.\d{1,3}(?:\/\d{1,2})?)$/i.test(token);
  });
  return candidates.length ? candidates[candidates.length - 1].replace(/^[\"']|[\"']$/g, '').replace(/[;,]$/, '') : '';
}
function inspectCommandSafety(raw) {
  const cmd = normalizeCommand(raw);
  const lower = cmd.toLowerCase();
  const destructive = [
    /\brm\s+-rf\b/i, /\bformat(?:\.com)?\s+[a-z]:/i, /\bdiskpart\b.*\bclean\b/i,
    /\bmkfs(?:\.|\s)/i, /\bshutdown(?:\.exe)?\b/i, /\bstop-computer\b/i,
    /\brestart-computer\b/i, /\bremove-item\b.*(?:-recurse|-force)/i,
    /\bdel(?:ete)?\s+\/s\s+\/q\b/i, /\b(?:useradd|adduser|new-localuser)\b/i,
    /\bnet\s+user\b.*\/(?:add|delete)/i,
  ];
  const credentialOrPayload = [
    /\bmimikatz\b/i, /\bsekurlsa\b/i, /\bprocdump\b.*\blsass\b/i,
    /\b(?:invoke-expression|iex)\b/i, /\b-encodedcommand\b/i,
    /\b(?:curl|wget|invoke-webrequest)\b[^\n|]*\|\s*(?:bash|sh|pwsh|powershell|iex)\b/i,
    /\b(?:nc|netcat|socat)\b[^\n]*(?:-e\s|exec:)/i,
    /\b(?:reverse[- ]shell|credential dump|password spray)\b/i,
  ];
  if (destructive.some((pattern) => pattern.test(cmd))) {
    return 'SAFETY CHECK: This action could change, delete, or disrupt a real system. The browser console only supports non-destructive training fixtures, so the command was blocked and nothing was executed.';
  }
  if (credentialOrPayload.some((pattern) => pattern.test(cmd))) {
    return 'SAFETY CHECK: This action is not available in the simulated console. Use the lesson fixtures and defensive analysis exercises instead. Nothing was executed.';
  }
  if (/^nmap\b/i.test(cmd)) {
    const target = findNetworkTarget(cmd);
    if (!isTrainingTarget(target)) {
      return 'SCOPE CHECK: Scanning is available for designated training targets only (for example training.example, localhost, or the documentation-only 192.0.2.0/24 range). Choose a lab target; no packets were sent.';
    }
  }
  if (/^git\s+clone\b/i.test(cmd)) {
    const allowed = TRAINING_REPOSITORIES.some((repo) => lower.includes(repo) || lower.includes(repo.replace(/\.git$/i, '')));
    if (!allowed) return 'SCOPE CHECK: This console simulates cloning only for its allowlisted training repositories. Choose the OWASP Juice Shop, SigmaHQ, or MITRE ATT&CK sample repository. No network request or file clone occurred.';
  }
  const networkCommand = /^(?:ping|tracert|traceroute|nslookup|dig|curl|wget|invoke-webrequest|resolve-dnsname|test-connection)\b/i.test(cmd);
  if (networkCommand) {
    const targetToken = findNetworkTarget(cmd);
    if (targetToken && !isTrainingTarget(targetToken)) {
      return 'SCOPE CHECK: Network examples run against fictional training fixtures only. Use a lab hostname or reserved documentation IP; no network request was sent.';
    }
  }
  return '';
}
function simScan(raw) {
  const target = findNetworkTarget(raw) || 'training.example';
  return `OpenCyberPath Scan Console 7.95 (SIMULATED)\nTarget: ${target}\nHost appears up (fixture result; no packets sent).\n\nPORT    STATE  SERVICE  NOTE\n22/tcp  open   ssh      training fixture\n80/tcp  open   http     documentation-only example service\n443/tcp open   https    documentation-only example service\n\nThis is prewritten practice output. No host was contacted.`;
}
function simClone(raw) {
  const repository = TRAINING_REPOSITORIES.find((repo) => raw.toLowerCase().includes(repo) || raw.toLowerCase().includes(repo.replace(/\.git$/i, '')));
  const folder = repository ? repository.split('/').pop().replace(/\.git$/i, '') : 'training-repository';
  return `Cloning into '${folder}'...\nremote: Enumerating fictional training objects: 24, done.\nReceiving objects: 100% (24/24), done.\n\nSIMULATION ONLY: the repository was not downloaded and no network request was made. Open the original project page to inspect its real source.`;
}
function simNetworkOutput(cmd, shell) {
  const target = findNetworkTarget(cmd) || 'training.example';
  if (/^(?:nslookup|dig|resolve-dnsname)\b/.test(cmd)) return `Server:  resolver.training.example\nAddress: 192.0.2.53\n\nName: ${target}\nAddress: 192.0.2.25\n\nSynthetic DNS fixture; no DNS query was sent.`;
  if (/^(?:ping|test-connection)\b/.test(cmd)) return `Target: ${target}\nReplies: 1 simulated response\nAddress: 192.0.2.25\nLatency: <1 ms (fixture)\n\nNo packets were sent.`;
  if (/^(?:tracert|traceroute)\b/.test(cmd)) return `Tracing route to ${target} over a fictional training path\n  1   <1 ms   192.0.2.1    Training gateway\n  2    1 ms   192.0.2.25   Training target\n\nSimulated route only; no packets were sent.`;
  if (/^(?:curl|wget|invoke-webrequest)\b/.test(cmd)) return 'HTTP/1.1 200 OK\nContent-Type: text/plain; charset=utf-8\nCache-Control: no-store\n\nHello from the OpenCyberPath HTTP fixture.\n\nNo request was sent to the internet.';
  return '';
}
function fixtureFile(name) {
  const file = String(name || '').replace(/^['"]|['"]$/g, '').replace(/\\/g, '/').toLowerCase();
  if (file.endsWith('/etc/os-release')) return FIXTURES.os;
  if (file.endsWith('samples/dns-events.csv') || file.endsWith('dns-events.csv')) return FIXTURES.dns;
  if (file.endsWith('auth.log')) return FIXTURES.auth;
  if (file.endsWith('sample-events.json') || file.endsWith('events.json')) return FIXTURES.events;
  if (file.endsWith('readme.txt') || file.endsWith('readme.md')) return 'OpenCyberPath safe training sandbox. All files and identities shown here are fictional fixtures.\nTry help to see supported fixture commands.';
  if (file.endsWith('detection-cases.csv') || file.endsWith('detection-evaluation-cases.csv')) return 'case_id,label,rule_match\nDE-01,suspicious,yes\nDE-02,benign,no\nDE-03,suspicious,yes\nDE-04,benign,yes\nDE-05,benign,no\nDE-06,suspicious,no\n';
  if (file.endsWith('evaluate.py')) return '# Fictional teaching script; it is displayed, never executed.\n# Review the labelled cases and compute precision/recall in the worksheet.\n';
  return null;
}
const WORKBENCH_STORAGE_KEY = 'open-cyber-path-workbench-progress-v1';
const WORKBENCH_SHELLS = ['bash', 'cmd', 'powershell'];

function readSavedWorkbenchState() {
  const empty = { activeMission: MISSIONS[0].id, shell: MISSIONS[0].shell, finished: {}, notesByMission: {} };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);
    if (!raw) return empty;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return empty;
    const knownMissions = new Set(MISSIONS.map((mission) => mission.id));
    const finished = {};
    if (saved.finished && typeof saved.finished === 'object') {
      for (const [id, done] of Object.entries(saved.finished)) {
        if (knownMissions.has(id) && done === true) finished[id] = true;
      }
    }
    const notesByMission = {};
    if (saved.notesByMission && typeof saved.notesByMission === 'object') {
      for (const [id, note] of Object.entries(saved.notesByMission)) {
        if (knownMissions.has(id) && typeof note === 'string') notesByMission[id] = note.slice(0, 20000);
      }
    }
    const activeMission = knownMissions.has(saved.activeMission) ? saved.activeMission : empty.activeMission;
    const mission = MISSIONS.find((item) => item.id === activeMission) || MISSIONS[0];
    const shell = WORKBENCH_SHELLS.includes(saved.shell) ? saved.shell : mission.shell;
    return { activeMission, shell, finished, notesByMission };
  } catch {
    return empty;
  }
}
function simulate(command, shell) {
  const raw = normalizeCommand(command);
  const cmd = raw.toLowerCase();
  if (!raw) return '';
  if (['clear', 'cls', 'clear-host'].includes(cmd)) return '__CLEAR__';
  if (/^git\s+clone\b/i.test(raw)) return simClone(raw);
  if (/^nmap\b/i.test(raw)) return simScan(raw);
  if (/^(?:ping|tracert|traceroute|nslookup|dig|curl|wget|invoke-webrequest|resolve-dnsname|test-connection)\b/i.test(cmd)) return simNetworkOutput(cmd, shell);
  if (/^(?:git\s+status|git\s+log|git\s+diff(?:\s+--stat)?)\b/i.test(cmd)) {
    if (/^git\s+status/.test(cmd)) return 'On branch training-lab\nChanges not staged for commit: (fictional fixture)\n  modified: detection-rule.yml\nUntracked files: sample-notes.txt\n\nTraining-only repository state.';
    if (/^git\s+log/.test(cmd)) return 'commit 3f01a5c (HEAD -> training-lab) Improve fixture documentation\ncommit 7ac1e82 Add sample detection cases\ncommit 1e0aa11 Initial lab files\n\nFictional repository history.';
    return ' detection-rule.yml | 8 +++++---\n sample-notes.txt   | 4 ++++\n 2 files changed, 9 insertions(+), 3 deletions(-)\n\nIllustrative diff summary only.';
  }
  if (cmd === 'help' || cmd === 'help.exe' || cmd === 'get-help' || cmd === 'get-command') {
    return shell === 'bash'
      ? 'Linux fixture commands: pwd, whoami, id, hostname, uname -a, date, ls -la, find samples, cat <fixture>, head/tail <fixture>, grep <pattern> <fixture>, wc -l <fixture>, cut -d, -f1 <fixture>, sort <fixture>, sha256sum <fixture>, file <fixture>, ip addr, ip route, ss -tuln, ping/nslookup/dig/curl training.example, nmap <training-target>, git status/log/clone <allowlisted repo>, python evaluate.py, sudo -l, help, clear'
      : shell === 'cmd'
        ? 'CMD fixture commands: dir, type <fixture>, whoami, hostname, ver, systeminfo, ipconfig /all, arp -a, route print, netstat -ano, tasklist, findstr <pattern> <fixture>, ping/nslookup/tracert training.example, nmap <training-target>, curl https://training.example/, git status/log/clone <allowlisted repo>, python evaluate.py, help, cls'
        : 'PowerShell fixture commands: Get-Location, Get-ChildItem, Get-Date, Get-ComputerInfo, Get-Content <fixture>, Select-String <pattern> <fixture>, Get-WinEvent -LogName Security, Get-NetIPConfiguration, Get-NetRoute, Get-NetTCPConnection, Resolve-DnsName/Test-Connection training.example, Get-Process, Get-Service, Get-FileHash <fixture>, Get-Command, Get-Help, Get-History, Measure-Object, ConvertFrom-Json, nmap <training-target>, git status/log/clone <allowlisted repo>, python evaluate.py, Clear-Host';
  }
  if (shell === 'bash') {
    if (cmd === 'pwd') return '/home/student/training';
    if (cmd === 'whoami') return 'student';
    if (cmd === 'id') return 'uid=1000(student) gid=1000(student) groups=1000(student),100(users)';
    if (cmd === 'hostname') return 'ocp-training-linux';
    if (/^uname(?:\s+-a)?$/.test(cmd)) return 'Linux ocp-training-linux 6.8.0-ocp #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux (fictional fixture)';
    if (cmd === 'date') return 'Mon Jan 12 09:30:00 UTC 2026 (fixture timestamp)';
    if (/^ls(?:\s|$)/.test(cmd)) return 'drwxr-xr-x  samples/\n-rw-r--r--  README.txt\n-rw-r--r--  auth.log\n-rw-r--r--  sample-events.json\n-rw-r--r--  detection-cases.csv\n-rw-r--r--  evaluate.py';
    if (cmd === 'sudo -l') return 'User student may run only the lab-approved read-only training commands.\nNo host privileges are available in this simulator.';
    if (/^find\s+samples(?:\s|$)/.test(cmd)) return 'samples/dns-events.csv\nsamples/process-events.json\nsamples/detection-cases.csv';
    const cat = raw.match(/^cat\s+(.+)$/i);
    if (cat) return fixtureFile(cat[1]) ?? `cat: ${cat[1]}: No such fixture file`;
    const headTail = raw.match(/^(head|tail)(?:\s+-n\s+(\d+))?\s+(.+)$/i);
    if (headTail) { const data = fixtureFile(headTail[3]); if (data == null) return `No fixture file: ${headTail[3]}`; const lines = data.split('\n'); const count = Math.min(Number(headTail[2] || 10), 100); return (headTail[1].toLowerCase() === 'head' ? lines.slice(0,count) : lines.slice(-count)).join('\n'); }
    const grep = raw.match(/^grep(?:\s+-i)?\s+(["']?)(.*?)\1\s+(.+)$/i);
    if (grep) { const data = fixtureFile(grep[3]); if (data == null) return `grep: ${grep[3]}: No such fixture file`; const insensitive = /^grep\s+-i/i.test(raw); return data.split('\n').filter((line) => insensitive ? line.toLowerCase().includes(grep[2].toLowerCase()) : line.includes(grep[2])).join('\n') || '(no matching fixture lines)'; }
    const wc = raw.match(/^wc\s+-l\s+(.+)$/i); if (wc) { const data=fixtureFile(wc[1]); return data == null ? `wc: ${wc[1]}: No such fixture file` : `${data.split('\n').length}\t${wc[1]}`; }
    const cut = raw.match(/^cut\s+-d,\s+-f(\d+)\s+(.+)$/i); if (cut) { const data=fixtureFile(cut[2]); if(data==null) return `cut: ${cut[2]}: No such fixture file`; return data.split('\n').map((line)=>line.split(',')[Number(cut[1])-1] ?? '').join('\n'); }
    const sort = raw.match(/^sort\s+(.+)$/i); if (sort) { const data=fixtureFile(sort[1]); return data == null ? `sort: ${sort[1]}: No such fixture file` : data.split('\n').sort().join('\n'); }
    const hash = raw.match(/^sha256sum\s+(.+)$/i); if (hash) { const data=fixtureFile(hash[1]); return data == null ? `sha256sum: ${hash[1]}: No such fixture file` : `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  ${hash[1]} (illustrative fixture hash)`; }
    const file = raw.match(/^file\s+(.+)$/i); if (file) { const data=fixtureFile(file[1]); return data == null ? `file: ${file[1]}: No such fixture file` : `${file[1]}: ${file[1].toLowerCase().endsWith('.csv') ? 'CSV text' : file[1].toLowerCase().endsWith('.json') ? 'JSON text data' : 'UTF-8 text'} (fixture)`; }
    if (cmd === 'ip addr' || cmd === 'ip address') return 'eth0: <UP,LOWER_UP>\n    inet 192.0.2.25/24 scope global eth0\n    inet6 2001:db8::25/64 scope global';
    if (cmd === 'ip route') return 'default via 192.0.2.1 dev eth0\n192.0.2.0/24 dev eth0 proto kernel scope link';
    if (/^ss\s+-/.test(cmd) || cmd === 'ss') return 'Netid State  Local Address:Port Peer Address:Port\ntcp   LISTEN 127.0.0.1:8080 0.0.0.0:*\nudp   UNCONN 0.0.0.0:5353 0.0.0.0:*\nSynthetic socket table.';
    if (/^python\s+(?:\.?\/?evaluate\.py|evaluate\.py)$/.test(cmd)) return 'Synthetic detection evaluation\nTrue positives : 3\nFalse positives: 1\nFalse negatives: 1\nTrue negatives : 5\nPrecision      : 75.0%\nRecall         : 75.0%\n\nFixture metrics only; no Python code was executed.';
    if (cmd === 'ps aux') return 'USER PID %CPU %MEM COMMAND\nstudent 2316 0.1 0.5 /usr/bin/editor (fixture)\nstudent 2410 0.8 2.0 /usr/bin/browser (fixture)';
    if (cmd === 'df -h') return 'Filesystem Size Used Avail Use% Mounted on\ntraining-root 20G 7G 13G 35% /\nFixture storage figures only.';
    if (cmd === 'free -h') return '              total used free shared buff/cache available\nMem:           7.7G 2.4G 3.1G 128M 2.2G 4.9G\nSwap:          2.0G 0B 2.0G\nFictional training values.';
  }
  if (shell === 'cmd') {
    if (cmd === 'whoami') return 'ocp-lab\\student';
    if (cmd === 'hostname') return 'OCP-TRAINING-01';
    if (cmd === 'ver') return 'Microsoft Windows [Version 10.0.22631.XXXX] (fictional fixture)';
    if (cmd === 'systeminfo') return 'Host Name: OCP-TRAINING-01\nOS Name: OpenCyberPath Training Windows\nSystem Type: x64-based PC\nDomain: TRAINING.LAB\n\nSynthetic system details; this device was not queried.';
    if (/^dir(?:\s|$)/.test(cmd)) return ' Directory of C:\\Training\\Sandbox\nREADME.txt\nauth.log\nsample-events.json\ndetection-cases.csv\nevaluate.py';
    const type = raw.match(/^type\s+(.+)$/i); if (type) return fixtureFile(type[1]) ?? `The system cannot find the file specified: ${type[1]}`;
    if (cmd === 'ipconfig' || cmd === 'ipconfig /all') return 'Ethernet adapter Training LAN:\n   IPv4 Address. . . . . . . . . . : 192.0.2.25\n   Subnet Mask . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . : 192.0.2.1\n   DNS Servers . . . . . . . . . . : 192.0.2.53\n\nFixture values only; this is not your computer configuration.';
    if (cmd === 'arp -a') return 'Interface: 192.0.2.25 --- 0x2\n  Internet Address      Physical Address      Type\n  192.0.2.1              02-00-00-00-00-01     dynamic\n  192.0.2.53             02-00-00-00-00-53     dynamic\nSynthetic ARP table.';
    if (cmd === 'route print') return 'IPv4 Route Table (fictional)\nNetwork Destination  Netmask         Gateway      Interface\n0.0.0.0              0.0.0.0         192.0.2.1   192.0.2.25\n192.0.2.0            255.255.255.0   On-link     192.0.2.25';
    if (cmd === 'netstat -ano' || cmd === 'netstat -an' || cmd === 'netstat') return 'Proto  Local Address        Foreign Address      State        PID\nTCP    127.0.0.1:8080       0.0.0.0:0            LISTENING    2316\nTCP    192.0.2.25:51515     192.0.2.80:443       ESTABLISHED  2410\nSynthetic connection table.';
    if (cmd === 'tasklist') return 'Image Name               PID Session Name\nnotepad.exe              2316 Console\nTrainingBrowser.exe      2410 Console\nFictional processes; no local process list was read.';
    if (/^findstr\s+/i.test(raw)) { const m=raw.match(/^findstr\s+(?:\/i\s+)?["']?(.+?)["']?\s+(.+)$/i); if(!m) return 'Usage: findstr <pattern> <fixture-file>'; const data=fixtureFile(m[2]); return data == null ? `findstr: fixture file not found: ${m[2]}` : data.split('\n').filter(line => line.toLowerCase().includes(m[1].toLowerCase())).join('\n') || '(no matching fixture lines)'; }
    if (/^python\s+(?:\.?\\?evaluate\.py|evaluate\.py)$/.test(cmd)) return 'Synthetic detection evaluation\nTP: 3  FP: 1  FN: 1  TN: 5\nPrecision: 75.0%  Recall: 75.0%\n\nFixture metrics only; no code was executed.';
  }
  if (shell === 'powershell') {
    if (cmd === 'get-location' || cmd === 'pwd') return 'Path\n----\nC:\\Training\\Sandbox';
    if (/^(?:get-childitem|gci|dir|ls)(?:\s|$)/.test(cmd)) return 'Mode   LastWriteTime      Length Name\n----   -------------      ------ ----\n-a----  01/12/2026 09:00      420 README.txt\n-a----  01/12/2026 09:00      518 auth.log\n-a----  01/12/2026 09:00      410 sample-events.json\n-a----  01/12/2026 09:00      120 detection-cases.csv\n-a----  01/12/2026 09:00      360 evaluate.py';
    if (cmd === 'get-date') return 'Monday, January 12, 2026 9:30:00 AM (training fixture)';
    if (cmd === 'get-computerinfo') return 'CsName: OCP-TRAINING-01\nWindowsProductName: OpenCyberPath Training Windows\nOsArchitecture: 64-bit\nFixture only; the host computer was not queried.';
    if (/^(?:get-content|gc|type)\s+/i.test(raw)) { const m=raw.match(/^(?:get-content|gc|type)\s+(.+)$/i); return fixtureFile(m[1]) ?? `Get-Content: fixture file not found: ${m[1]}`; }
    if (/^(?:select-string|sls)\s+/i.test(raw)) { const pattern=(raw.match(/-pattern\s+(["']?)(.*?)\1/i)||[])[2]; const path=(raw.match(/-path\s+(["']?)(.*?)\1/i)||[])[2] || raw.split(/\s+/).pop(); const data=fixtureFile(path); if(data==null) return `Select-String: fixture file not found: ${path}`; return data.split('\n').filter(line=>line.toLowerCase().includes(String(pattern||'').toLowerCase())).map(line=>`${path}: ${line}`).join('\n') || '(no matching fixture lines)'; }
    if (/^get-winevent\b/.test(cmd)) return 'TimeCreated          Id  Level       Message\n2026-01-12 09:10:20  4624 Information Successful sign-in (synthetic)\n2026-01-12 09:10:08  4625 Warning     Failed sign-in (synthetic)\n2026-01-12 09:10:01  4625 Warning     Failed sign-in (synthetic)\n\nFixture event records. The real Windows Event Log was not queried.';
    if (cmd.startsWith('get-netipconfiguration')) return 'InterfaceAlias: Training LAN\nIPv4Address: 192.0.2.25\nIPv4DefaultGateway: 192.0.2.1\nDNSServer: 192.0.2.53\nSynthetic configuration only.';
    if (cmd.startsWith('get-netroute')) return 'DestinationPrefix   NextHop       InterfaceAlias\n0.0.0.0/0           192.0.2.1    Training LAN\n192.0.2.0/24        0.0.0.0      Training LAN\nSynthetic route table.';
    if (cmd.startsWith('get-nettcpconnection')) return 'LocalAddress LocalPort RemoteAddress RemotePort State\n127.0.0.1    8080      0.0.0.0       0           Listen\n192.0.2.25   51515     192.0.2.80   443         Established\nFictional connection table.';
    if (cmd.startsWith('get-process')) return 'Handles NPM(K) PM(K) WS(K) CPU(s) Id ProcessName\n   112     8   1210  6200    0.1  2316 notepad\n   185    12   3100 12400    0.8  2410 browser\nFictional training processes; no local processes were inspected.';
    if (cmd.startsWith('get-service')) return 'Status   Name             DisplayName\nRunning  TrainingAgent   OpenCyberPath Training Agent\nRunning  EventFixture    Synthetic Event Service\nFixture services only; no host services were queried.';
    if (/^get-filehash\s+/i.test(raw)) { const m=raw.match(/^get-filehash\s+(.+)$/i); const data=fixtureFile(m[1]); return data==null ? `Get-FileHash: fixture file not found: ${m[1]}` : `Algorithm : SHA256\nHash      : E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855\nPath      : ${m[1]} (illustrative fixture hash)`; }
    if (cmd === 'get-history') return 'Id CommandLine\n-- -----------\n1 Get-Location\n2 Get-ChildItem\nFictional console history.';
    if (cmd === 'measure-object') return 'Count    : 6\nAverage  :\nSum      :\nMaximum  :\nMinimum  :\nFixture pipeline summary.';
    if (/^convertfrom-json\b/.test(cmd)) return 'Parsed 3 fictional JSON event objects. This is a simulated parsing result; no code executed.';
    if (cmd === 'python .\\evaluate.py' || cmd === 'python evaluate.py' || cmd === '.\\evaluate.py') return 'Synthetic detection evaluation\nTrue positives : 3\nFalse positives: 1\nFalse negatives: 1\nTrue negatives : 5\nPrecision      : 75.0%\nRecall         : 75.0%\n\nSmall teaching fixture only; no Python code was executed.';
  }
  return `Command not available in this fixture simulator: ${raw}\nType help to view supported training commands. No command was executed on your computer.`;
}
function TerminalMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3" width="19" height="18" rx="3"/><path d="m6.5 8 3.2 3-3.2 3M12.5 14h5"/></svg>;
}

export default function InteractiveLabWorkbench() {
  const [savedState] = useState(() => readSavedWorkbenchState());
  const initialMission = MISSIONS.find((item) => item.id === savedState.activeMission) || MISSIONS[0];
  const [shell, setShell] = useState(savedState.shell);
  const [activeMission, setActiveMission] = useState(initialMission.id);
  const [input, setInput] = useState(initialMission.starter);
  const [consoleLines, setConsoleLines] = useState([{ kind: 'note', text: 'OpenCyberPath Practice Console v1.1 — expanded simulated fixture environment. Type help to see supported training commands.' }]);
  const [safetyNotice, setSafetyNotice] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [finished, setFinished] = useState(savedState.finished);
  const [notesByMission, setNotesByMission] = useState(savedState.notesByMission);
  const [saveStatus, setSaveStatus] = useState('Checking saved progress...');
  const notes = notesByMission[activeMission] || '';
  const [videoTopic, setVideoTopic] = useState('All concepts');
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);
  const mission = MISSIONS.find((item) => item.id === activeMission) || MISSIONS[0];
  const visibleVideos = useMemo(() => VIDEOS.filter((video) => videoTopic === 'All concepts' || video.topic === videoTopic), [videoTopic]);
  const prompt = shell === 'bash' ? 'student@ocp-lab:~/training$' : shell === 'cmd' ? 'C:\\Training\\Sandbox>' : 'PS C:\\Training\\Sandbox>';

  // Persist only local learning state; never store terminal history or execute commands here.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSavedLearningState = Object.keys(finished).length > 0
      || Object.values(notesByMission).some((note) => typeof note === 'string' && note.trim().length > 0)
      || activeMission !== MISSIONS[0].id
      || shell !== MISSIONS[0].shell;
    if (!hasSavedLearningState) {
      try {
        window.localStorage.removeItem(WORKBENCH_STORAGE_KEY);
        setSaveStatus('No saved progress yet. Learning state stays in this browser.');
      } catch {
        setSaveStatus('Browser storage is unavailable; progress may not persist after reload.');
      }
      return;
    }
    try {
      window.localStorage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify({
        version: 1,
        activeMission,
        shell,
        finished,
        notesByMission,
        savedAt: new Date().toISOString(),
      }));
      setSaveStatus('Progress and evidence notes saved in this browser. No account sync.');
    } catch {
      setSaveStatus('Browser storage is unavailable. Export your evidence notes to keep a copy.');
    }
  }, [activeMission, shell, finished, notesByMission]);

  function clearLocalProgress() {
    const confirmed = typeof window !== 'undefined' && window.confirm('Clear saved mission progress and evidence notes in this browser? This cannot be undone.');
    if (!confirmed) return;
    try { window.localStorage.removeItem(WORKBENCH_STORAGE_KEY); } catch { /* continue with an in-memory reset */ }
    setFinished({});
    setNotesByMission({});
    setActiveMission(MISSIONS[0].id);
    setShell(MISSIONS[0].shell);
    setInput(MISSIONS[0].starter);
    setConsoleLines([{ kind: 'note', text: 'Local learning progress cleared. No provider account or remote data was changed.' }]);
    setSaveStatus('Local progress cleared.');
  }

  function selectMission(next) {
    setActiveMission(next.id);
    setShell(next.shell);
    setInput(next.starter);
    setHintLevel(0);
    setConsoleLines([{ kind: 'note', text: `Mission loaded: ${next.title}. Type help for commands.` }]);
  }

  function runCommand(command = input) {
    const raw = command.trim();
    if (!raw) return;
    const notice = inspectCommandSafety(raw);
    if (notice) {
      setSafetyNotice(notice);
      setConsoleLines((current) => [...current, { kind: 'command', prompt, text: raw }, { kind: 'warning', text: notice }].slice(-48));
      setInput('');
      return;
    }
    setSafetyNotice('');
    const output = simulate(raw, shell);
    if (output === '__CLEAR__') {
      setConsoleLines([]);
      setInput('');
      return;
    }
    setConsoleLines((current) => [...current, { kind: 'command', prompt, text: raw }, { kind: 'output', text: output }].slice(-48));
    const normalized = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (mission.accepted.some((candidate) => candidate.toLowerCase().replace(/\s+/g, ' ').trim() === normalized)) {
      setFinished((current) => ({ ...current, [mission.id]: true }));
    }
    setInput('');
  }

  return <section className="ocp-workbench" aria-labelledby="ocp-workbench-title">
    <div className="ocp-workbench-heading">
      <div><span className="ocp-eyebrow">PRACTISE INSIDE THE LEARNING PATH</span><h2 id="ocp-workbench-title">From reading notes to <em>doing the work.</em></h2><p>Run guided command-line missions, inspect fictional evidence, and follow a concept-specific lesson. Downloads support the lab; the practice is the main event.</p></div>
      <div className="ocp-sim-badge"><span className="ocp-live-dot"/><div><b>Browser simulator</b><small>Fictional fixture data · no host access</small></div></div>
    </div>

    {safetyNotice && <div className="ocp-safety-notice" role="alert" aria-live="assertive"><span className="ocp-safety-notice-icon">!</span><div><b>Training safety / scope notice</b><p>{safetyNotice}</p></div><button type="button" onClick={() => setSafetyNotice('')} aria-label="Dismiss safety notice">Dismiss</button></div>}

    <div className="ocp-mission-layout">
      <aside className="ocp-mission-list" aria-label="Choose a practice mission">
        <div className="ocp-panel-kicker">PICK A MISSION <span>{MISSIONS.filter((item) => finished[item.id]).length}/{MISSIONS.length} complete</span></div>
        {MISSIONS.map((item, index) => <button key={item.id} type="button" className={`ocp-mission-choice ${item.id === mission.id ? 'is-selected' : ''}`} onClick={() => selectMission(item)}>
          <span className="ocp-mission-number">{finished[item.id] ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="ocp-mission-copy"><b>{item.title}</b><small>{item.topic} · {item.time}</small></span><span className="ocp-mission-arrow">›</span>
        </button>)}
        <div className="ocp-mission-footnote">Progress and evidence notes save only in this browser. They are not uploaded or synced to an account.</div>
        <div className="ocp-persistence-controls"><span role="status" aria-live="polite">{saveStatus}</span><button type="button" onClick={clearLocalProgress}>Clear saved progress</button></div>
      </aside>

      <div className="ocp-lab-console-panel">
        <div className="ocp-console-titlebar"><div className="ocp-window-dots"><i/><i/><i/></div><div className="ocp-console-title"><TerminalMark/> <span>OCP TRAINING CONSOLE</span></div><span className="ocp-safe-chip">SIMULATED</span></div>
        <div className="ocp-shell-tabs" role="tablist" aria-label="Choose simulated command shell">
          {[['bash','Linux shell'],['cmd','Windows CMD'],['powershell','PowerShell']].map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={shell === id} className={shell === id ? 'is-active' : ''} onClick={() => { setShell(id); setConsoleLines((current) => [...current, {kind:'note',text:`Switched to ${label}. Available commands are fixture-backed; type help.`}]); setInput(id === 'bash' ? 'pwd' : id === 'cmd' ? 'ipconfig /all' : 'Get-Location'); }}>{label}</button>)}
        </div>
        <div className="ocp-objective"><span className="ocp-objective-icon">◎</span><div><span className="ocp-panel-kicker">CURRENT OBJECTIVE · {mission.level.toUpperCase()}</span><p>{mission.objective}</p><small>{mission.task}</small></div><span className={`ocp-complete-pill ${finished[mission.id] ? 'is-done' : ''}`}>{finished[mission.id] ? 'Completed' : 'In progress'}</span></div>
        <div className="ocp-terminal" role="log" aria-label="Simulated terminal output" aria-live="polite">
          {consoleLines.map((line, index) => line.kind === 'command' ? <div className="ocp-terminal-command" key={`${index}-${line.text}`}><span>{line.prompt}</span> {line.text}</div> : <pre className={`ocp-terminal-${line.kind}`} key={`${index}-${line.text}`}>{line.text}</pre>)}
        </div>
        <form className="ocp-command-form" onSubmit={(event) => { event.preventDefault(); runCommand(); }}><label htmlFor="ocp-command-input"><span>{prompt}</span></label><input id="ocp-command-input" autoComplete="off" spellCheck="false" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a supported training command…"/><button type="submit">Run <span>↵</span></button></form>
        <div className="ocp-console-actions"><button type="button" onClick={() => { setInput('help'); runCommand('help'); }}>Show commands</button><button type="button" onClick={() => { setConsoleLines([{kind:'note',text:'Session reset. No host state was changed.'}]); setSafetyNotice(''); setInput(mission.starter); }}>Reset console</button><span>Enter runs a simulated command · no shell execution</span></div>
        <div className="ocp-quick-commands"><span>TRY NEXT</span>{(shell === 'bash' ? ['pwd','ls -la','cat /etc/os-release','help'] : shell === 'cmd' ? ['dir','ipconfig /all','nslookup training.example','help'] : ['Get-Location','Get-ChildItem','Get-Content .\\sample-events.json','help']).map((command) => <button type="button" key={command} onClick={() => { setInput(command); runCommand(command); }}>{command}</button>)}</div>
      </div>
    </div>


    <section className="ocp-coach-panel" aria-labelledby="ocp-coach-title">
      <div className="ocp-coach-top"><div><span className="ocp-panel-kicker">GUIDED PRACTICE</span><h3 id="ocp-coach-title">Hints and expected evidence</h3><p>Try the exercise first. Reveal one hint at a time, then compare your observation with the expected checkpoint.</p></div><span className="ocp-coach-progress">{hintLevel}/{mission.hints.length} hints</span></div>
      <div className="ocp-coach-hints">{mission.hints.slice(0, hintLevel).map((hint, index) => <div className="ocp-coach-hint" key={`${mission.id}-${index}`}><b>Hint {index + 1}</b><p>{hint}</p></div>)}</div>
      <div className="ocp-coach-actions">{hintLevel < mission.hints.length ? <button type="button" onClick={() => setHintLevel((current) => Math.min(mission.hints.length, current + 1))}>Reveal hint {hintLevel + 1}</button> : <button type="button" onClick={() => setHintLevel(0)}>Hide hints</button>}<span>Hints do not execute commands or contact a target.</span></div>
      <details className="ocp-coach-expected"><summary>Show expected checkpoint and explanation</summary><pre>{mission.expectedOutput}</pre><p>{mission.interpretation}</p><div className="ocp-coach-self-check"><b>Self-check</b><span>{mission.selfCheck}</span></div></details>
    </section>

    <div className="ocp-learning-output-grid">
      <section className="ocp-evidence-card"><div className="ocp-card-heading"><span className="ocp-card-icon">✳</span><div><span className="ocp-panel-kicker">WRITE YOUR FINDING</span><h3>Evidence note</h3></div></div><p>Record the observed fact, the source, and one limitation. Do not turn a single indicator into a conclusion.</p><textarea aria-label="Evidence note for current mission" maxLength={20000} value={notes} onChange={(event) => setNotesByMission((current) => ({ ...current, [activeMission]: event.target.value.slice(0, 20000) }))} placeholder="Observation: …\nEvidence: …\nLimitation / next check: …" rows={4}/><div className="ocp-note-actions"><span>{notes.trim() ? `${notes.trim().split(/\s+/).length} words` : 'This mission note saves locally in this browser.'}</span><button type="button" onClick={() => { const blob = new Blob([`OpenCyberPath Evidence Note\nMission: ${mission.title}\n\n${notes}\n`], {type:'text/plain;charset=utf-8'}); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${mission.id}-evidence-note.txt`; anchor.click(); URL.revokeObjectURL(url); }}>Export note (.txt)</button></div></section>
      <section className="ocp-evidence-card ocp-links-card"><div className="ocp-card-heading"><span className="ocp-card-icon">↗</span><div><span className="ocp-panel-kicker">REAL TRAINING ENVIRONMENTS</span><h3>Launch a hosted lab</h3></div></div><p>These links open genuine provider-managed learning environments. Account, time, and free-access limits depend on the provider.</p><div className="ocp-hosted-link-list">{REAL_LABS.slice(0,4).map((item) => <a key={item.title} href={item.url} target="_blank" rel="noreferrer"><span><b>{item.title}</b><small>{item.type} · {item.access}</small></span><span>↗</span></a>)}</div><details className="ocp-more-hosted"><summary>More real lab environments</summary><div className="ocp-hosted-link-list">{REAL_LABS.slice(4).map((item) => <a key={item.title} href={item.url} target="_blank" rel="noreferrer"><span><b>{item.title}</b><small>{item.type} · {item.access}</small></span><span>↗</span></a>)}</div></details></section>
    </div>

    <section className="ocp-video-school"><div className="ocp-video-heading"><div><span className="ocp-eyebrow">CONCEPT-SPECIFIC VIDEO LESSONS</span><h3>Watch one concept. <em>Practise it next.</em></h3><p>Curated videos are paired with official documentation. Use the documentation for version-specific details.</p></div><label className="ocp-video-filter">Filter lessons<select value={videoTopic} onChange={(event) => setVideoTopic(event.target.value)}><option>All concepts</option>{[...new Set(VIDEOS.map((video) => video.topic))].map((topic) => <option key={topic}>{topic}</option>)}</select></label></div>
      <div className="ocp-video-school-grid"><div className="ocp-video-list">{visibleVideos.map((video) => <button type="button" key={video.id} className={`ocp-video-pick ${activeVideo.id === video.id ? 'is-active' : ''}`} onClick={() => setActiveVideo(video)}><span className="ocp-play-mark">▶</span><span><b>{video.title}</b><small>{video.topic} · {video.level} · {video.creator}</small></span><span>↗</span></button>)}</div><article className="ocp-video-player-card"><div className="ocp-video-frame">{(activeVideo.youtubeId || activeVideo.embedUrl) ? <iframe src={activeVideo.youtubeId ? `https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}` : activeVideo.embedUrl} title={activeVideo.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/> : <div className="ocp-video-external-frame"><span>PROVIDER-HOSTED TRAINING</span><b>{activeVideo.title}</b><p>This lesson opens at the original publisher.</p><a href={activeVideo.url} target="_blank" rel="noreferrer">Open lesson source ↗</a></div>}</div><div className="ocp-video-player-info"><span className="ocp-panel-kicker">{activeVideo.topic.toUpperCase()} · {activeVideo.level.toUpperCase()}</span><h4>{activeVideo.title}</h4><p>{activeVideo.note}</p><div><a href={activeVideo.url} target="_blank" rel="noreferrer">Watch / open source ↗</a>{activeVideo.docs && <a href={activeVideo.docs} target="_blank" rel="noreferrer">Official docs ↗</a>}</div></div></article></div>
    </section>

    <div className="ocp-boundary-note"><b>Safety and technical boundary:</b> the terminal built into OpenCyberPath is a deterministic simulator that returns fictional outputs. It does not execute Bash, CMD, PowerShell, Python, cloning, or network commands on your device. Scanning examples are accepted only for designated training targets and return canned fixture output. Real shell access must come from the linked provider environments or a separately deployed, isolated lab service.</div>
  </section>;
}
