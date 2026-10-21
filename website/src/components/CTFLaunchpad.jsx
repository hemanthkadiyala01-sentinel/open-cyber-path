import { useEffect, useMemo, useState } from 'react';
import './CTFLaunchpad.css'; // ctf-launchpad-v1

const STORAGE_KEY = 'opencyberpath.ctf-launchpad.v1';
const LAST_CHECKED = '20 Oct 2026';

const RESOURCES = [
  {
    id: 'picogym', name: 'picoCTF / CyLab Security Academy', level: 'Beginner', domain: 'Mixed foundations', access: 'Free learning', time: '15–45 min sessions',
    summary: 'Student-friendly, self-paced cybersecurity puzzles and past challenges. The provider is transitioning its platform branding, so follow the current official sign-in guidance.',
    next: 'Start with the primer and introductory practice before entering timed competitions.',
    url: 'https://picoctf.org/get_started.html', source: 'Carnegie Mellon University', mode: 'Hosted training',
  },
  {
    id: 'bandit', name: 'OverTheWire: Bandit', level: 'Beginner', domain: 'Linux & command line', access: 'Free wargame', time: '10–30 min per level',
    summary: 'A level-based introduction to shell navigation, file inspection, permissions, and basic command-line habits in a designated training environment.',
    next: 'Read each level prompt carefully and keep a short note explaining the command and why it worked.',
    url: 'https://overthewire.org/wargames/bandit/', source: 'OverTheWire', mode: 'Provider-hosted wargame',
  },
  {
    id: 'cryptohack', name: 'CryptoHack', level: 'Beginner', domain: 'Cryptography', access: 'Free puzzles', time: '10–40 min per puzzle',
    summary: 'Interactive puzzles introduce encoding, XOR, modular arithmetic, and modern cryptography. Account requirements can affect saved progress.',
    next: 'Begin with Introduction and General, then record the reasoning—not just the final flag.',
    url: 'https://cryptohack.org/', source: 'CryptoHack', mode: 'Hosted practice',
  },
  {
    id: 'portswigger', name: 'Web Security Academy', level: 'Intermediate', domain: 'Web application security', access: 'Free interactive labs', time: '20–60 min per lab',
    summary: 'Free, interactive web-security lessons with purpose-built training labs across topics such as access control, injection, APIs, and newer web attack classes.',
    next: 'Start with apprentice-level material and write down the defensive control that prevents the issue.',
    url: 'https://portswigger.net/web-security', source: 'PortSwigger', mode: 'Provider-hosted lab',
  },
  {
    id: 'juiceshop', name: 'OWASP Juice Shop', level: 'Intermediate', domain: 'Web application security', access: 'Open-source / local', time: '30–90 min sessions',
    summary: 'A deliberately insecure open-source application created for security training and CTF-style practice. Run your own local instance or use a provider-designated training environment.',
    next: 'Choose one lesson, reproduce it only in your own training instance, then document a fix and a regression test.',
    url: 'https://owasp.org/projects/juice-shop', source: 'OWASP Foundation', mode: 'Self-hosted training app',
  },
  {
    id: 'pwncollege', name: 'pwn.college Dojos', level: 'Advanced', domain: 'Systems & program security', access: 'Free educational platform', time: '45–120 min sessions',
    summary: 'Structured hands-on modules for Linux, computing, program security, and more advanced CTF-style concepts. Work entirely inside its intended training environment.',
    next: 'Complete the Getting Started and Linux basics material before moving into the core systems tracks.',
    url: 'https://pwn.college/dojos', source: 'Arizona State University team', mode: 'Hosted training sandbox',
  },
];

const DOMAINS = ['All topics', ...new Set(RESOURCES.map((resource) => resource.domain))];
const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];
const TEMPLATE = `# CTF / Practice Write-up\n\n## Challenge and source\nName:\nProvider / URL:\nDate attempted:\nDifficulty:\n\n## Objective\nWhat was the challenge asking me to establish?\n\n## Evidence and method\n- Evidence file / page / line reference:\n- Commands or tools used inside the authorised training environment:\n- What I observed:\n\n## Reasoning\nWhat does the evidence support? What are alternative explanations?\n\n## Flag or result\nRecord the result only where the challenge rules permit public disclosure.\n\n## Defensive lesson / remediation\nHow could the weakness be prevented, detected, or tested for?\n\n## Limitations and next check\nWhat could this evidence not prove? What would I check next?\n\n## Sources and attribution\nLink to original provider material. Respect its terms and any no-write-up policy.`;

function readLocal() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      planned: Array.isArray(raw.planned) ? raw.planned.filter((id) => RESOURCES.some((resource) => resource.id === id)) : [],
      completed: Array.isArray(raw.completed) ? raw.completed.filter((id) => RESOURCES.some((resource) => resource.id === id)) : [],
      writeup: typeof raw.writeup === 'string' ? raw.writeup.slice(0, 24000) : TEMPLATE,
    };
  } catch {
    return { planned: [], completed: [], writeup: TEMPLATE };
  }
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CTFLaunchpad() {
  const [saved] = useState(readLocal);
  const [planned, setPlanned] = useState(saved.planned);
  const [completed, setCompleted] = useState(saved.completed);
  const [writeup, setWriteup] = useState(saved.writeup);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [domain, setDomain] = useState('All topics');
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => RESOURCES.filter((resource) => {
    const haystack = `${resource.name} ${resource.domain} ${resource.summary} ${resource.source} ${resource.next}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (level === 'All levels' || resource.level === level)
      && (domain === 'All topics' || resource.domain === domain);
  }), [query, level, domain]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, planned, completed, writeup, savedAt: new Date().toISOString() }));
      setNotice('Your plan and write-up are saved locally in this browser profile.');
    } catch {
      setNotice('Local storage is unavailable. Export your plan or write-up to keep a copy.');
    }
  }, [planned, completed, writeup]);

  function toggleId(list, setter, id) {
    setter((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function exportPlan() {
    downloadFile('opencyberpath-ctf-learning-plan.json', JSON.stringify({
      product: 'OpenCyberPath CTF Launchpad', version: 1,
      planned: RESOURCES.filter((resource) => planned.includes(resource.id)).map(({ id, name, level, domain, url }) => ({ id, name, level, domain, url })),
      completed: RESOURCES.filter((resource) => completed.includes(resource.id)).map(({ id, name, level, domain, url }) => ({ id, name, level, domain, url })),
      exportedAt: new Date().toISOString(),
    }, null, 2), 'application/json;charset=utf-8');
    setNotice('Learning plan exported as JSON. It contains provider links and your local checkmarks.');
  }

  function exportWriteup() {
    downloadFile('opencyberpath-ctf-writeup-template.md', writeup, 'text/markdown;charset=utf-8');
    setNotice('Write-up exported as Markdown. Review the event rules before sharing it.');
  }

  return <section className="ctf-launchpad" id="ctf-launchpad" aria-labelledby="ctf-launchpad-title">
    <div className="ctf-launchpad-heading">
      <div>
        <span className="ctf-launchpad-kicker">CTF LAUNCHPAD · CURATED TRAINING</span>
        <h2 id="ctf-launchpad-title">Go beyond the arcade.<br /><em>Choose your next training ground.</em></h2>
        <p>A curated route through free practice, hosted training and local open-source challenges. Access labels are guidance, not a promise that every feature or competition is free or available to everyone.</p>
      </div>
      <div className="ctf-launchpad-count"><b>{RESOURCES.length}</b><span>curated platforms</span><small>{planned.length} planned · {completed.length} tried</small></div>
    </div>

    <div className="ctf-launchpad-event">
      <div className="ctf-launchpad-event-icon" aria-hidden="true">↗</div>
      <div className="ctf-launchpad-event-copy">
        <span className="ctf-launchpad-kicker">CURRENT EVENTS · OFFICIAL CALENDAR</span>
        <h3>Find upcoming online CTFs</h3>
        <p>Open CTFtime's live event calendar for current dates, online filters and participation restrictions. We link to the original calendar rather than mirroring its event database, so you can see its latest changes and eligibility notes directly.</p>
        <small>Always confirm time zone, age/eligibility rules, team restrictions, event scope and organizer instructions before registering.</small>
      </div>
      <a href="https://ctftime.org/event/list/upcoming/" target="_blank" rel="noreferrer" className="ctf-launchpad-event-link">Open live calendar ↗</a>
    </div>

    <div className="ctf-launchpad-controls">
      <label><span>Search resources</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Linux, web, crypto, forensics…" /></label>
      <label><span>Level</span><select value={level} onChange={(event) => setLevel(event.target.value)}>{LEVELS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Topic</span><select value={domain} onChange={(event) => setDomain(event.target.value)}>{DOMAINS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="ctf-launchpad-controls-actions"><span>Showing <b>{visible.length}</b> of {RESOURCES.length}</span><button type="button" onClick={exportPlan}>Export plan JSON</button></div>
    </div>

    <div className="ctf-launchpad-grid">
      {visible.map((resource) => {
        const isPlanned = planned.includes(resource.id);
        const isDone = completed.includes(resource.id);
        return <article className={`ctf-resource-card ctf-resource-${resource.id}`} key={resource.id}>
          <div className="ctf-resource-top"><span className="ctf-resource-level">{resource.level}</span><span className="ctf-resource-domain">{resource.domain}</span></div>
          <h3>{resource.name}</h3>
          <p>{resource.summary}</p>
          <div className="ctf-resource-meta"><span>{resource.access}</span><span>{resource.time}</span></div>
          <div className="ctf-resource-next"><b>Suggested next step</b><p>{resource.next}</p></div>
          <div className="ctf-resource-source">Source: {resource.source} <span>· Checked {LAST_CHECKED}</span></div>
          <div className="ctf-resource-actions"><a href={resource.url} target="_blank" rel="noreferrer">Open original ↗</a><button type="button" className={isPlanned ? 'is-selected' : ''} onClick={() => toggleId(planned, setPlanned, resource.id)}>{isPlanned ? 'In my plan ✓' : 'Add to plan +'}</button></div>
          <label className="ctf-resource-complete"><input type="checkbox" checked={isDone} onChange={() => toggleId(completed, setCompleted, resource.id)} /> <span>I've tried this resource</span></label>
        </article>;
      })}
      {visible.length === 0 && <div className="ctf-launchpad-empty"><h3>No matching training links</h3><p>Try another topic or reset the filters.</p><button type="button" onClick={() => { setQuery(''); setLevel('All levels'); setDomain('All topics'); }}>Reset filters</button></div>}
    </div>

    <div className="ctf-launchpad-writeup">
      <div className="ctf-launchpad-writeup-head"><div><span className="ctf-launchpad-kicker">PORTFOLIO EVIDENCE · WRITE-UP TEMPLATE</span><h3>Explain how you solved it.</h3><p>Write-ups should distinguish observations from inference, identify sources, describe limitations, and explain the defensive lesson. Some competitions prohibit public write-ups while active—check their rules.</p></div><span className="ctf-launchpad-writeup-badge">Local only</span></div>
      <textarea aria-label="CTF write-up template" value={writeup} maxLength={24000} onChange={(event) => setWriteup(event.target.value)} rows={12} />
      <div className="ctf-launchpad-writeup-actions"><span>{writeup.length}/24000 characters · saved locally</span><button type="button" onClick={exportWriteup}>Export write-up (.md)</button><button type="button" onClick={() => setWriteup(TEMPLATE)}>Restore blank template</button></div>
      <p className="ctf-launchpad-local-state" role="status">{notice}</p>
    </div>

    <div className="ctf-launchpad-safety"><b>Training boundary:</b> use the external provider's intended lab or your own local installation. Never test random public systems, use event infrastructure outside the event scope, or publish flags/write-ups when the rules prohibit it. Provider terms, account requirements, and eligibility can change; verify them on the original site.</div>
  </section>;
}
