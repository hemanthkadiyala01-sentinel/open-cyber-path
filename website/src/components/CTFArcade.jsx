import { useEffect, useMemo, useState } from 'react';
import './CTFArcade.css';
import CTFLaunchpad from './CTFLaunchpad.jsx'; // ctf-launchpad-v1

const STORAGE_KEY = 'opencyberpath.ctf-arcade.v1';

const CHALLENGES = [
  {
    id: 'auth-trail', number: '01', title: 'Auth Trail', difficulty: 'Beginner', domain: 'Log analysis', time: '15–25 min',
    brief: 'A training workstation has repeated sign-in failures followed by a success. Reconstruct the sequence and avoid turning a clue into an accusation.',
    objective: 'Use grep and wc to count the failed events, then correlate the source address and successful event before submitting the flag.',
    files: {
      'README.txt': 'OPEN CYBERPATH TRAINING FIXTURE\nAll records are fictional. Read-only simulator; no host logs are accessed.\nTask: count failed events in auth.log, correlate source and success, then submit the derived flag.\nUseful commands: ls -la, cat, grep, wc -l, sort, head, tail, submit.',
      'auth.log': '2026-10-18T09:10:01Z host=LAB-WS-02 user=trainee.alex src=203.0.113.42 event=login result=failed\n2026-10-18T09:10:08Z host=LAB-WS-02 user=trainee.alex src=203.0.113.42 event=login result=failed\n2026-10-18T09:10:15Z host=LAB-WS-02 user=trainee.alex src=203.0.113.42 event=login result=failed\n2026-10-18T09:10:20Z host=LAB-WS-02 user=trainee.alex src=203.0.113.42 event=login result=success\n2026-10-18T09:12:11Z host=LAB-WS-02 user=trainee.sam src=203.0.113.19 event=login result=failed\n2026-10-18T09:12:40Z host=LAB-WS-02 user=trainee.sam src=203.0.113.19 event=login result=failed\n2026-10-18T09:13:02Z host=LAB-WS-02 user=trainee.sam src=203.0.113.19 event=login result=failed',
      'analyst-notes.txt': 'Baseline: trainee.alex normally signs in from the training LAN. This fixture does not include MFA, device posture, or user confirmation. Do not claim account takeover from these lines alone.',
    },
    flag: 'OCP{three_failures_one_source}',
    hints: ['Start by listing the files, then inspect the README before analysing the logs.', 'Try: grep failed auth.log followed by wc -l. The answer is a count, not an attribution.', 'Three failed events for trainee.alex share one source and are followed by success; submit OCP{three_failures_one_source}.'],
    lesson: 'A clustered pattern is worth investigating. Correlate MFA, device, expected user activity, and nearby events before concluding compromise.',
  },
  {
    id: 'web-trace', number: '02', title: 'Web Trace', difficulty: 'Intermediate', domain: 'Web logs', time: '20–30 min',
    brief: 'A fictional web service shows repeated malformed requests from a documentation-only source address. Separate routine traffic from a path-probing pattern.',
    objective: 'Filter the 404 events, identify the repeated source address, then submit the derived flag. Do not attempt the paths against any real website.',
    files: {
      'README.txt': 'WEB TRACE CASE\nFictional nginx-style access records only. No requests are sent.\nFocus: use grep to filter status codes and inspect client addresses.\nThe fixture contains benign requests as well as a short probe-like sequence.',
      'access.log': '10.4.0.8 - - [18/Oct/2026:10:00:01 +0000] "GET /docs HTTP/1.1" 200 931\n10.4.0.8 - - [18/Oct/2026:10:00:04 +0000] "GET /assets/site.css HTTP/1.1" 200 541\n198.51.100.77 - - [18/Oct/2026:10:02:11 +0000] "GET /.env HTTP/1.1" 404 162\n198.51.100.77 - - [18/Oct/2026:10:02:12 +0000] "GET /backup.zip HTTP/1.1" 404 162\n198.51.100.77 - - [18/Oct/2026:10:02:13 +0000] "GET /admin-old HTTP/1.1" 404 162\n10.4.0.8 - - [18/Oct/2026:10:02:40 +0000] "GET /help HTTP/1.1" 200 1100\n198.51.100.77 - - [18/Oct/2026:10:03:01 +0000] "GET /robots.txt HTTP/1.1" 200 98\n10.4.0.8 - - [18/Oct/2026:10:03:21 +0000] "GET /login HTTP/1.1" 200 1200',
      'service-notes.txt': 'Expected public paths: /docs, /help, /login, /robots.txt. The IP ranges in this dataset are reserved for documentation examples. A 404 does not by itself demonstrate a successful exploit.',
    },
    flag: 'OCP{probe_then_404}',
    hints: ['Use grep to isolate 404 rows in access.log.', 'Compare the client field across the three consecutive 404s; the request source is the same.', 'Three path probes returned 404 and no successful access is shown. Submit OCP{probe_then_404}.'],
    lesson: 'Repeated probing is a signal for investigation, not proof of compromise. Check surrounding traffic, server-side outcomes, and baseline behaviour.',
  },
  {
    id: 'dns-trail', number: '03', title: 'DNS Trail', difficulty: 'Intermediate', domain: 'Network telemetry', time: '20–30 min',
    brief: 'A training endpoint produces unusual subdomain-like queries, repeated answers and one NXDOMAIN response. Assess what the evidence supports.',
    objective: 'Filter the unusual training.invalid rows and compare results. The flag describes the safest interpretation, not a malware verdict.',
    files: {
      'README.txt': 'DNS TRAIL CASE\nOnly synthetic records are included. Names use documentation-only domains.\nTry grep metrics-check dns.log, wc -l dns.log after filtering, and sort dns.log.',
      'dns.log': '2026-10-18T10:42:02Z client=LAB-WS-02 query=portal.training.example result=192.0.2.18 ttl=300\n2026-10-18T10:42:06Z client=LAB-WS-02 query=a81c.metrics-check.training.invalid result=198.51.100.77 ttl=30\n2026-10-18T10:42:09Z client=LAB-WS-02 query=b193.metrics-check.training.invalid result=198.51.100.77 ttl=30\n2026-10-18T10:42:12Z client=LAB-WS-02 query=c504.metrics-check.training.invalid result=NXDOMAIN ttl=-\n2026-10-18T10:43:05Z client=LAB-WS-03 query=updates.training.example result=192.0.2.55 ttl=1800\n2026-10-18T10:44:18Z client=LAB-WS-02 query=portal.training.example result=192.0.2.18 ttl=300',
      'resolver-notes.txt': 'No process telemetry or resolver reputation data is supplied. Correlate the DNS sequence with client process, DNS baseline, resolver context and known business use before making a verdict.',
    },
    flag: 'OCP{correlate_not_conclude}',
    hints: ['Filter dns.log for metrics-check to focus on the unusual group.', 'Notice the repeated answer and short TTL, plus one NXDOMAIN. The fixture has no process context.', 'The signal warrants correlation, not a verdict. Submit OCP{correlate_not_conclude}.'],
    lesson: 'DNS observations gain meaning from client, resolver, process and baseline context. Short TTL or NXDOMAIN alone is not proof of malicious intent.',
  },
  {
    id: 'integrity-check', number: '04', title: 'Integrity Check', difficulty: 'Intermediate', domain: 'File integrity', time: '20–30 min',
    brief: 'A fictional release pipeline reports one digest mismatch. Find the changed artefact, inspect the release notes and recommend the next validation step.',
    objective: 'Inspect the expected and observed digests. The simulator provides illustrative values only; no real file is read or hashed.',
    files: {
      'README.txt': 'INTEGRITY CHECK CASE\nAll filenames and digest strings are training fixtures.\nCompare manifest.expected with manifest.observed. You may use cat, grep, diff-fixture, or sha256sum. The sha256sum command returns canned training output only.',
      'manifest.expected': 'ui.bundle  8f14e45fceea167a5a36dedd4bea2543\napi-client  c9f0f895fb98ab9159f51fd0297e236d\nworker     45c48cce2e2d7fbdea1afc51c7c6ad26',
      'manifest.observed': 'ui.bundle  8f14e45fceea167a5a36dedd4bea2543\napi-client  6512bd43d9caa6e02c990b0a82652dca\nworker     45c48cce2e2d7fbdea1afc51c7c6ad26',
      'release-notes.txt': 'A mismatch can result from a legitimate rebuild, stale manifest, corruption or unauthorised change. Validate artifact provenance, build ID, signer and reproducible build output before declaring compromise.',
    },
    flag: 'OCP{manifest_mismatch}',
    hints: ['Read manifest.expected and manifest.observed side by side.', 'Only api-client differs in the supplied values.', 'A mismatch is an investigation trigger, not proof of tampering. Submit OCP{manifest_mismatch}.'],
    lesson: 'Validate provenance, signer, build ID and reproducibility. A hash mismatch indicates difference, not why the difference occurred.',
  },
];

const HELP = 'Supported fixture commands:\n  help                 show this help\n  pwd                  show the simulated working directory\n  ls -la                list supplied case files\n  cat <file>            read a supplied file\n  grep [-i] <text> <file>   filter a supplied file\n  grep <text>           filter piped output\n  head [-n N] <file>    show the first lines\n  tail [-n N] <file>    show the last lines\n  wc -l [file]          count lines\n  sort [file]           sort lines\n  uniq -c               count adjacent duplicate lines\n  sha256sum <file>      show canned fixture hash\n  submit OCP{...}       check the current challenge flag\n  clear                 clear the visible terminal\nPipes supported: grep "failed" auth.log | wc -l\nCommands run against fictional in-browser fixtures only.';

function readProgress() {
  if (typeof window === 'undefined') return { completed: [], notes: {} };
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return { completed: Array.isArray(raw.completed) ? raw.completed.filter((id) => CHALLENGES.some((item) => item.id === id)) : [], notes: raw.notes && typeof raw.notes === 'object' ? raw.notes : {} };
  } catch { return { completed: [], notes: {} }; }
}
function tokenize(command) {
  return [...String(command).matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}
function fileText(mission, name) {
  const wanted = String(name || '').replace(/^\.\//, '').toLowerCase();
  const entry = Object.entries(mission.files).find(([key]) => key.toLowerCase() === wanted);
  return entry ? entry[1] : null;
}
function fixtureHash(name) {
  const canned = {
    'readme.txt': 'SHA256  TRAINING-FIXTURE-READ-ME-0001',
    'auth.log': 'SHA256  TRAINING-FIXTURE-AUTH-1D8A',
    'access.log': 'SHA256  TRAINING-FIXTURE-WEB-7B21',
    'dns.log': 'SHA256  TRAINING-FIXTURE-DNS-4A92',
    'manifest.expected': 'SHA256  TRAINING-FIXTURE-MANIFEST-EXPECTED-55C1',
    'manifest.observed': 'SHA256  TRAINING-FIXTURE-MANIFEST-OBSERVED-883D',
  };
  return canned[String(name || '').toLowerCase()] || 'SHA256  TRAINING-FIXTURE-OTHER-0000';
}
function runSingle(command, mission, pipedLines = null) {
  const parts = tokenize(command);
  if (!parts.length) return { text: '', lines: pipedLines };
  const op = parts[0].toLowerCase();
  const sourceText = (name) => fileText(mission, name);
  const sourceLines = (name) => {
    const value = sourceText(name);
    return value == null ? null : value.split('\n');
  };
  if (op === 'help') return { text: HELP, lines: HELP.split('\n') };
  if (op === 'pwd') return { text: '/training/' + mission.id, lines: ['/training/' + mission.id] };
  if (op === 'ls') {
    const lines = Object.keys(mission.files).slice().sort().map((name) => `-rw-r--r--  ${String(mission.files[name].split('\n').length).padStart(3, ' ')} lines  ${name}`);
    return { text: lines.join('\n'), lines };
  }
  if (op === 'clear') return { text: '__CLEAR__', lines: [] };
  if (op === 'submit') {
    const submitted = parts.slice(1).join(' ').trim();
    return submitted.toLowerCase() === mission.flag.toLowerCase()
      ? { text: `FLAG ACCEPTED: ${mission.flag}\nChallenge completed. Read the explanation below and document your evidence.`, lines: [], complete: true }
      : { text: 'Flag not accepted. Revisit the fixture evidence and try again. No real system was contacted.', lines: [] };
  }
  if (op === 'grep') {
    let args = parts.slice(1); let ignoreCase = false;
    if (args[0] === '-i') { ignoreCase = true; args = args.slice(1); }
    let filename = null;
    if (args.length >= 2 && fileText(mission, args[args.length - 1]) !== null) filename = args.pop();
    const pattern = args.join(' ');
    if (!pattern) return { text: 'Usage: grep [-i] <text> [file]', lines: [] };
    let lines = filename ? sourceLines(filename) : pipedLines;
    if (!lines) return { text: filename ? `Fixture file not found: ${filename}` : 'grep needs a filename or piped output. Type help.', lines: [] };
    lines = lines.filter((line) => ignoreCase ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern));
    return { text: lines.length ? lines.join('\n') : '(no matching fixture lines)', lines };
  }
  if (op === 'cat' || op === 'less' || op === 'more') {
    const names = parts.slice(1);
    if (!names.length) return { text: 'Usage: cat <file>', lines: [] };
    const output = [];
    for (const name of names) {
      const lines = sourceLines(name);
      if (!lines) output.push(`Fixture file not found: ${name}`); else output.push(...(names.length > 1 ? [`--- ${name} ---`, ...lines] : lines));
    }
    return { text: output.join('\n'), lines: output };
  }
  if (op === 'head' || op === 'tail') {
    const args = parts.slice(1); let count = 10;
    if (args[0] === '-n' && /^\d+$/.test(args[1] || '')) { count = Math.min(100, Number(args[1])); args.splice(0, 2); }
    const data = args[0] ? sourceLines(args[0]) : pipedLines;
    if (!data) return { text: args[0] ? `Fixture file not found: ${args[0]}` : `Usage: ${op} [-n N] <file>`, lines: [] };
    const lines = op === 'head' ? data.slice(0, count) : data.slice(-count);
    return { text: lines.join('\n'), lines };
  }
  if (op === 'wc') {
    const args = parts.slice(1); const filename = args[args.length - 1] && fileText(mission, args[args.length - 1]) !== null ? args[args.length - 1] : null;
    const data = filename ? sourceLines(filename) : pipedLines;
    if (!data) return { text: 'Usage: wc -l [file] (or pipe lines into wc -l)', lines: [] };
    const text = `${data.length} lines${filename ? ` ${filename}` : ''}`;
    return { text, lines: [text] };
  }
  if (op === 'sort') {
    const filename = parts[1] && fileText(mission, parts[1]) !== null ? parts[1] : null;
    const data = filename ? sourceLines(filename) : pipedLines;
    if (!data) return { text: 'Usage: sort [file] (or pipe lines into sort)', lines: [] };
    const lines = data.slice().sort((a, b) => a.localeCompare(b));
    return { text: lines.join('\n'), lines };
  }
  if (op === 'uniq' && parts[1] === '-c') {
    if (!pipedLines) return { text: 'Usage: sort <file> | uniq -c', lines: [] };
    const counts = [];
    for (const line of pipedLines) {
      const last = counts[counts.length - 1];
      if (last && last.line === line) last.count += 1; else counts.push({ line, count: 1 });
    }
    const lines = counts.map((item) => `${String(item.count).padStart(5, ' ')} ${item.line}`);
    return { text: lines.join('\n'), lines };
  }
  if (op === 'sha256sum') {
    const name = parts[1];
    if (!name || fileText(mission, name) === null) return { text: `Fixture file not found: ${name || '(missing filename)'}`, lines: [] };
    const text = `${fixtureHash(name)}  ${name}\nIllustrative value only; no real hash was calculated.`;
    return { text, lines: text.split('\n') };
  }
  if (op === 'file') {
    const name = parts[1];
    if (!name || fileText(mission, name) === null) return { text: `Fixture file not found: ${name || '(missing filename)'}`, lines: [] };
    const text = `${name}: OpenCyberPath fictional text fixture; not a host file`;
    return { text, lines: [text] };
  }
  if (op === 'diff-fixture') {
    if (mission.id !== 'integrity-check') return { text: 'This fixture command is not enabled for the current case.', lines: [] };
    const a = sourceLines('manifest.expected'); const b = sourceLines('manifest.observed');
    const lines = a.map((line, i) => line === b[i] ? `  ${line}` : `! expected: ${line}\n! observed: ${b[i]}`).flat();
    return { text: lines.join('\n'), lines };
  }
  return { text: `Command not available in this training shell: ${command}\nNo command was executed on the device. Type help for supported fixture commands.`, lines: [] };
}
function runFixtureCommand(rawCommand, mission) {
  const raw = String(rawCommand || '').trim();
  if (!raw) return { text: '', complete: false };
  if (raw.length > 240) return { text: 'Command exceeds the 240-character training limit.', complete: false };
  const stages = raw.split('|').map((part) => part.trim());
  if (stages.length > 3 || stages.some((stage) => !stage)) return { text: 'Only simple pipelines of up to three supported commands are allowed. Type help.', complete: false };
  let previous = null; let last = { text: '', lines: [] }; let submitted = false;
  for (const stage of stages) {
    last = runSingle(stage, mission, previous);
    if (last.complete) submitted = true;
    if (last.text === '__CLEAR__') return { text: '__CLEAR__', complete: false };
    previous = last.lines || [];
  }
  return { text: last.text, complete: submitted };
}

function TerminalMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3" width="19" height="18" rx="3"/><path d="m6.5 8 3.2 3-3.2 3M12.5 14h5"/></svg>;
}

export default function CTFArcade() {
  const [saved] = useState(() => readProgress());
  const [activeId, setActiveId] = useState(CHALLENGES[0].id);
  const [completed, setCompleted] = useState(saved.completed);
  const [notesByCase, setNotesByCase] = useState(saved.notes);
  const [input, setInput] = useState('help');
  const [lines, setLines] = useState([{ kind: 'note', text: 'OpenCyberPath CTF Arcade — fictional terminal fixture. Type help to begin.' }]);
  const [hintsShown, setHintsShown] = useState({});
  const [notice, setNotice] = useState('');
  const [saveState, setSaveState] = useState('Ready');
  const active = CHALLENGES.find((item) => item.id === activeId) || CHALLENGES[0];
  const notes = notesByCase[activeId] || '';
  const visibleHints = hintsShown[activeId] || 0;
  const progressPercent = Math.round((completed.length / CHALLENGES.length) * 100);
  const fileNames = useMemo(() => Object.keys(active.files).slice().sort(), [active]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed, notes: notesByCase, savedAt: new Date().toISOString() }));
      setSaveState('Progress saved locally in this browser profile.');
    } catch { setSaveState('Browser storage is unavailable; export your record to keep a copy.'); }
  }, [completed, notesByCase]);

  function selectChallenge(challenge) {
    setActiveId(challenge.id);
    setInput('help');
    setLines([{ kind: 'note', text: `Loaded ${challenge.title}. All commands are simulated against supplied evidence.` }]);
    setNotice('');
  }
  function runCommand(command = input) {
    const result = runFixtureCommand(command, active);
    if (!String(command).trim()) return;
    if (result.text === '__CLEAR__') { setLines([]); setInput(''); return; }
    setLines((current) => [...current, { kind: 'command', text: command.trim() }, { kind: result.complete ? 'success' : 'output', text: result.text }].slice(-80));
    if (result.complete) setCompleted((current) => current.includes(active.id) ? current : [...current, active.id]);
    setInput('');
    setNotice('');
  }
  function exportRecord() {
    const record = { product: 'OpenCyberPath CTF Arcade', version: 1, completedChallenges: completed, notes: notesByCase, savedAt: new Date().toISOString(), disclosure: 'Self-reported practice on fictional terminal fixtures; not a credential.' };
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'opencyberpath-ctf-progress.json'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Progress JSON exported. Keep the file somewhere you control.');
  }
  function clearProgress() {
    if (!window.confirm('Clear CTF completion and notes saved in this browser? This cannot be undone.')) return;
    setCompleted([]); setNotesByCase({}); setHintsShown({}); setInput('help'); setLines([{ kind: 'note', text: 'Local CTF progress cleared. No remote account or system was changed.' }]); setNotice('Local progress cleared.');
  }

  return <section className="ctf-arcade section-wrap" aria-labelledby="ctf-arcade-title">
    <div className="ctf-hero">
      <div className="ctf-hero-copy"><span className="ctf-kicker">CTF ARCADE · TERMINAL SKILLS · SAFE BY DESIGN</span><h1 id="ctf-arcade-title">Learn the command line.<br/><em>Earn the evidence.</em></h1><p>Practice file inspection, filtering, counting and evidence correlation in realistic-looking cases. Every result comes from fictional fixture data—this is not a shell on your device.</p><div className="ctf-hero-actions"><button className="ctf-primary" onClick={() => document.getElementById('ctf-terminal')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Open terminal <span>↓</span></button><button className="ctf-secondary" onClick={exportRecord}>Export progress JSON</button><button type="button" className="ctf-secondary" onClick={() => document.getElementById('ctf-launchpad')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Explore CTF resources <span>â†˜</span></button></div></div>
      <div className="ctf-hero-console"><div className="ctf-hero-top"><span><i/><i/><i/></span><b>OCP / TRAINING-SANDBOX</b><small>SIMULATED</small></div><pre><span>$</span> grep "failed" auth.log | wc -l{`\n`}3 lines{`\n`}<span>$</span> grep "success" auth.log{`\n`}09:10:20Z user=trainee.alex result=success{`\n`}<span className="ctf-hero-comment"># observe → verify → explain</span></pre><div className="ctf-hero-foot"><span>{completed.length}/{CHALLENGES.length} challenges completed</span><b>{progressPercent}%</b></div><div className="ctf-progress"><i style={{ width: `${progressPercent}%` }}/></div></div>
    </div>

    <div className="ctf-boundary"><b>Safe CTF boundary</b><span>Commands are interpreted by a small allowlisted simulator and read only the fixture files below. No OS shell, arbitrary code, live target, or network request is invoked.</span></div>

    <div className="ctf-main-grid">
      <aside className="ctf-case-panel"><div className="ctf-panel-heading"><span className="ctf-kicker">CHOOSE A CASE</span><b>{completed.length}/{CHALLENGES.length}</b></div>{CHALLENGES.map((item) => <button type="button" key={item.id} className={`ctf-case-choice ${item.id === active.id ? 'is-active' : ''}`} onClick={() => selectChallenge(item)}><span className="ctf-case-number">{completed.includes(item.id) ? '✓' : item.number}</span><span className="ctf-case-copy"><b>{item.title}</b><small>{item.domain} · {item.time}</small><em>{item.difficulty}</em></span><span className="ctf-chevron">›</span></button>)}<p className="ctf-save-state" role="status">{saveState}</p><button className="ctf-text-button" onClick={clearProgress}>Clear local CTF progress</button></aside>

      <div className="ctf-workspace">
        <div className="ctf-challenge-heading"><div><span className="ctf-kicker">CASE {active.number} · {active.domain.toUpperCase()}</span><h2>{active.title}{completed.includes(active.id) && <span className="ctf-solved">SOLVED</span>}</h2><p>{active.brief}</p></div><span className="ctf-time-pill">{active.difficulty} · {active.time}</span></div>
        <div className="ctf-task"><b>MISSION</b><p>{active.objective}</p><details><summary>Progressive hints ({visibleHints}/{active.hints.length})</summary><div className="ctf-hint-list">{active.hints.slice(0, visibleHints).map((hint, index) => <p key={`${active.id}-${index}`}><b>Hint {index + 1}</b>{hint}</p>)}<button type="button" className="ctf-secondary" onClick={(event) => { event.preventDefault(); setHintsShown((value) => ({ ...value, [active.id]: Math.min(active.hints.length, visibleHints + 1) })); }}>{visibleHints < active.hints.length ? `Reveal hint ${visibleHints + 1}` : 'All hints revealed'}</button></div></details>
        </div>
        <div className="ctf-files-panel"><div><span className="ctf-kicker">FIXTURE FILES</span><span>{fileNames.length} files supplied</span></div>{fileNames.map((name) => <span className="ctf-file-chip" key={name}>{name}</span>)}</div>

        <div className="ctf-terminal" id="ctf-terminal"><div className="ctf-terminal-bar"><div><TerminalMark/><b>OCP TRAINING SHELL</b></div><span>~/training/{active.id}</span><small>NO HOST ACCESS</small></div><div className="ctf-terminal-output" role="log" aria-label="CTF simulated terminal output" aria-live="polite">{lines.map((line, index) => line.kind === 'command' ? <div className="ctf-line-command" key={`${index}-${line.text}`}><span>$</span> {line.text}</div> : <pre key={`${index}-${line.text}`} className={`ctf-line-${line.kind}`}>{line.text}</pre>)}</div><form className="ctf-command-form" onSubmit={(event) => { event.preventDefault(); runCommand(); }}><label htmlFor="ctf-command"><span>$</span></label><input id="ctf-command" value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" spellCheck="false" placeholder="try: ls -la"/><button type="submit">Run <span>↵</span></button></form><div className="ctf-quick-commands"><span>TRY</span>{['ls -la', 'cat README.txt', active.id === 'auth-trail' ? 'grep failed auth.log | wc -l' : active.id === 'web-trace' ? 'grep 404 access.log' : active.id === 'dns-trail' ? 'grep metrics-check dns.log' : 'diff-fixture', 'help'].map((command) => <button type="button" key={command} onClick={() => { setInput(command); runCommand(command); }}>{command}</button>)}</div></div>

        <section className="ctf-post-lab"><div className="ctf-post-lab-heading"><div><span className="ctf-kicker">WRITE THE ANALYSIS</span><h3>Evidence note</h3></div><span>Saved locally</span></div><p>Capture what you observed, which fixture supports it, what remains uncertain, and the next defensive check.</p><textarea value={notes} maxLength={12000} onChange={(event) => setNotesByCase((current) => ({ ...current, [active.id]: event.target.value.slice(0, 12000) }))} placeholder={'Observed fact: ...\nEvidence source: ...\nLimitation: ...\nNext check: ...'} rows={4}/><div className="ctf-note-foot"><span>{notes.length}/12000 characters</span><button type="button" className="ctf-secondary" onClick={exportRecord}>Export progress JSON</button></div><details className="ctf-explanation"><summary>Read the analyst lesson</summary><p>{active.lesson}</p><p><b>Reference flag:</b> {completed.includes(active.id) ? active.flag : 'Hidden until you submit a correct flag.'}</p></details></section>
      </div>
    </div>
    {notice && <div className="ctf-notice" role="status">{notice}</div>}
    <CTFLaunchpad />
    <p className="ctf-disclaimer">CTF progress is stored in this browser profile. Flags measure completion of these specific training fixtures, not independent proof of professional capability or a certification.</p>
  </section>;
}
