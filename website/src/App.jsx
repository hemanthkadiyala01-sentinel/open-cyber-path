import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, resources } from './data/resources.js';
import { labs } from './data/labs.js';
import { learningVideos } from './data/learningVideos.js';

const levelRanks = { beginner: 1, intermediate: 2, advanced: 3 };
function matchesLevel(label, selected, allLabel) {
  if (selected === allLabel) return true;
  const normalized = String(label || '').toLowerCase();
  const wanted = selected.toLowerCase();
  if (normalized.includes(wanted)) return true;
  const range = normalized.split('→').map((part) => part.trim());
  if (range.length < 2) return false;
  const selectedRank = levelRanks[wanted];
  const start = levelRanks[range[0]] || 1;
  const end = levelRanks[range[1]] || start;
  return selectedRank >= start && selectedRank <= end;
}

const iconArt = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5V21M8 7h8M8 11h8"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></>,
  'book-open': <><path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 1 2.5 2z"/></>,
  'notebook-pen': <><path d="M4 3h13a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4z"/><path d="M8 3v18M11 8h5M11 12h4"/><path d="m15.5 17.5 4-4 2 2-4 4-2.5.5z"/></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/></>,
  'shield-check': <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
  radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/><path d="m12 12 6-6M12 3v3M21 12h-3"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  bug: <><path d="M8 8 6 6M16 8l2-2M4 13H2M22 13h-2M5 18H3M21 18h-2M12 4V2"/><rect x="7" y="7" width="10" height="14" rx="5"/><path d="M7 12h10M7 16h10"/></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></>,
  network: <><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2 6.2 15.7M13.2 7.2l4.6 8.5M7.5 18h9"/></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 10h8M8 14h8M8 18h5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-7"/><path d="M16 6h4v4"/></>,
  'monitor-check': <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5M8 9l2.3 2.3L15 7"/></>,
  laptop: <><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20l-2-4H4z"/></>,
  sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M2 14h4M10 8h4M18 16h4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></>,
  'external-link': <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  'arrow-right': <><path d="M4 12h15M13 5l7 7-7 7"/></>,
  'arrow-up-right': <><path d="M7 17 17 7M7 7h10v10"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  route: <><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M8.5 16.5 10 14a4 4 0 0 1 3.5-2h1a3 3 0 0 0 3-3V9"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  spark: <><path d="m12 2 1.9 7.1L21 12l-7.1 1.9L12 21l-1.9-7.1L3 12l7.1-2.9z"/><path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8z"/></>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  'alert-triangle': <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4"/></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  graduation: <><path d="m2 10 10-5 10 5-10 5z"/><path d="M6 12v5c3.5 3 8.5 3 12 0v-5M22 10v6"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></>,
  lightbulb: <><path d="M9 18h6M10 22h4M8.2 14.5A6 6 0 1 1 15.8 14.5c-.9.7-1.4 1.5-1.6 2.5h-4.4c-.2-1-.7-1.8-1.6-2.5z"/><path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4"/></>,
};
function Icon({ name = 'spark', size = 20, className = '' }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconArt[name] || iconArt.spark}</svg>;
}

const learningPaths = [
  {
    id: 'foundations', number: '01', title: 'Build the foundation', level: 'Beginner', icon: 'book-open', image: '/images/learning/foundations-network.webp',
    desc: 'Learn networking, Linux, Windows, HTTP, and the language of security before choosing a specialisation.',
    topics: ['Networking and DNS', 'Linux and Windows basics', 'HTTP and logs', 'Command-line confidence'], outcome: 'Explain a basic event and navigate a local learning lab.', target: 'labs'
  },
  {
    id: 'threat-hunting', number: '02', title: 'Think like a threat hunter', level: 'Beginner → Intermediate', icon: 'radar', image: '/images/learning/soc-investigation.webp',
    desc: 'Turn log records into a focused hypothesis, find patterns, test alternative explanations, and document evidence.',
    topics: ['Windows and sign-in events', 'Hypotheses and baselines', 'Timeline building', 'Evidence notes'], outcome: 'Write a small, reproducible hunting report.', target: 'labs'
  },
  {
    id: 'bug-bounty', number: '03', title: 'Explore web security responsibly', level: 'Beginner → Intermediate', icon: 'bug', image: '/images/learning/bug-bounty-research.webp',
    desc: 'Understand HTTP and common web risks while learning scope, safe practice, and clear vulnerability reporting.',
    topics: ['HTTP and access control', 'Official training labs', 'Scope and exclusions', 'Responsible reporting'], outcome: 'Complete a training-lab write-up with evidence and a defensive fix.', target: 'labs'
  },
  {
    id: 'detection', number: '04', title: 'Engineer and validate detections', level: 'Intermediate → Advanced', icon: 'terminal', image: '/images/learning/detection-engineering.svg',
    desc: 'Learn what makes a useful rule, how to test it with labelled samples, and how to explain its limitations.',
    topics: ['Detection logic', 'Synthetic event data', 'False-positive review', 'Precision and recall'], outcome: 'Publish a report with evidence and reproducible metrics.', target: 'labs'
  },
];

const attackPatterns = [
  { icon: 'mail', title: 'Phishing & social engineering', short: 'Messages that impersonate a trusted service and try to rush a person into clicking or sharing information.', cause: 'Urgency, impersonation, and hard-to-verify sender details.', example: 'A fake delivery notice points to an unfamiliar sign-in page.', defend: 'Use the official app/site, verify unexpected requests another way, and enable MFA or passkeys.', image: '/images/learning/attack-patterns.svg' },
  { icon: 'lock', title: 'Password reuse', short: 'A password exposed on one site is tried on another account.', cause: 'People reuse passwords and services can suffer breaches.', example: 'A password used on a low-risk forum is reused on an email account.', defend: 'Use unique passwords, a password manager, and MFA/passkeys.', image: '/images/learning/identity-passwords.svg' },
  { icon: 'code', title: 'Injection flaws', short: 'An application treats input like part of a command or query rather than ordinary data.', cause: 'Unsafe query construction and poor separation of code from data.', example: 'A search form behaves unexpectedly because input is concatenated into a database query.', defend: 'Use parameterized queries, safe output handling, least privilege, and tests.', image: '/images/learning/web-security.svg' },
  { icon: 'code', title: 'Cross-site scripting (XSS)', short: 'A page handles untrusted content unsafely, so a browser may interpret it as active page content.', cause: 'Unsafe HTML insertion or missing context-aware output encoding.', example: 'A comment appears as markup instead of being displayed as plain text.', defend: 'Use safe templating and context-aware output encoding; treat security headers as defence in depth.', image: '/images/learning/web-security.svg' },
  { icon: 'shield-check', title: 'Misconfiguration & exposed data', short: 'A service or storage location permits more access than the owner intended.', cause: 'Default settings, broad permissions, or forgotten resources.', example: 'A project backup is placed in a shared location anyone with the link can read.', defend: 'Use least privilege, private-by-default storage, inventory, and configuration reviews.', image: '/images/learning/cloud-security.svg' },
  { icon: 'shield-check', title: 'Malware & ransomware', short: 'Unwanted software may steal information, disrupt systems, or make data unavailable.', cause: 'Unsafe downloads, exploited weaknesses, stolen credentials, or excessive permissions.', example: 'An unexpected attachment causes a workstation to behave abnormally.', defend: 'Patch systems, limit privileges, use endpoint protection, and maintain tested backups.', image: '/images/learning/digital-forensics.svg' },
  { icon: 'network', title: 'Supply-chain compromise', short: 'A trusted dependency, update path, or supplier is misused to affect downstream users.', cause: 'Projects rely on many packages, build systems, and external services.', example: 'A project receives an unexpected dependency version with suspicious changes.', defend: 'Review and pin dependencies, monitor advisories, restrict build permissions, and track components.', image: '/images/learning/supply-chain.svg' },
];

// Original, action-oriented learner encouragement written for OpenCyberPath.
// These are not quotations attributed to external people.
const gratitudeQuotes = [
  { id: 'stuck', number: '01', label: 'WHEN YOU FEEL STUCK', icon: 'target', tone: 'coral', quote: 'Stuck does not mean incapable. It means you have reached the edge of what you know. Turn the problem into one small question, test one idea, and keep moving.', nextStep: 'Write down one question you can answer next.' },
  { id: 'starting', number: '02', label: 'STARTING FROM ZERO', icon: 'route', tone: 'blue', quote: 'You do not need a perfect setup or a paid course to begin. Start with one trusted resource, one safe lab, and the curiosity to ask why.', nextStep: 'Choose one beginner resource and spend 20 focused minutes with it.' },
  { id: 'lab', number: '03', label: 'WHEN A LAB DOESN’T WORK', icon: 'terminal', tone: 'violet', quote: 'A failed test is feedback—not a verdict on your ability. Read the error, change one thing at a time, and learn what the result tells you.', nextStep: 'Explain the error in your own words before trying again.' },
  { id: 'portfolio', number: '04', label: 'BUILDING YOUR PORTFOLIO', icon: 'chart', tone: 'amber', quote: 'A small project you can explain is stronger than a giant project you barely understand. Show your evidence, decisions, limits, and what you learned.', nextStep: 'Document one finding, screenshot, or lesson from today.' },
  { id: 'comparison', number: '05', label: 'WHEN OTHERS SEEM AHEAD', icon: 'spark', tone: 'teal', quote: 'Do not compare your first chapter to someone else’s tenth year. Measure progress by what you can explain today that confused you yesterday.', nextStep: 'Write down one thing you understand now that was confusing last week.' },
  { id: 'gratitude', number: '06', label: 'PASS THE KNOWLEDGE ON', icon: 'users', tone: 'gold', quote: 'When a tutorial, tool, or kind answer helps you, acknowledge the people behind it. Credit the source, respect its terms, then make the path clearer for the next learner.', nextStep: 'Share one useful resource and credit the person or project behind it.' },
];

function slugify(value = '') {
  return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function ExternalLink({ href, children, className = '', title }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer" title={title}>{children}</a>;
}
function publicPath(path) {
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}
function Logo({ onClick }) {
  return <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); onClick('home'); }} aria-label="OpenCyberPath home">
    <span className="brand-mark">O<span><Icon name="arrow-up-right" size={12} /></span></span>
    <span className="brand-name">OpenCyberPath<small>LEARN · PRACTISE · GROW TOGETHER</small></span>
  </a>;
}
function ResourceCard({ resource }) {
  const kind = resource.kind.toLowerCase();
  const accessClass = kind.includes('open source') ? 'open' : kind.includes('tier') || kind.includes('varies') ? 'limited' : kind.includes('dataset') ? 'research' : 'free';
  return <article className={`resource-card resource-${slugify(resource.category)}`}>
    <div className="resource-art"><img src={resource.image || '/images/learning/command-cheatsheet.jpg'} alt="" loading="lazy" /><span className="art-icon"><Icon name={resource.icon || 'book'} size={20} /></span><span className="level-label">{resource.level}</span></div>
    <div className="resource-card-body">
      <div className="card-category">{resource.category}</div><h3>{resource.name}</h3><div className="provider-name">BY {resource.provider.toUpperCase()}</div>
      <p className="card-description">{resource.description}</p>
      <div className="skill-tags">{resource.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="access-line"><span className={`access-badge ${accessClass}`}><Icon name={accessClass === 'open' ? 'check-circle' : accessClass === 'limited' ? 'alert-triangle' : 'book'} size={13} />{resource.kind}</span><span className="account-note">{resource.account}</span></div>
      <p className="resource-note">{resource.note}</p>
      <ExternalLink className="card-link" href={resource.url}>Visit original resource <Icon name="arrow-up-right" size={16} /></ExternalLink>
    </div>
  </article>;
}
function PathCard({ path, onClick }) {
  return <article className={`path-card path-${path.id}`}>
    <div className="path-art"><img src={path.image} alt="" loading="lazy" /><div className="path-art-shade"/><span className="path-icon"><Icon name={path.icon} size={23} /></span><span className="path-number">{path.number} / LEARNING PATH</span></div>
    <div className="path-body"><div className="path-card-top"><span className="level-label">{path.level}</span><Icon name="arrow-up-right" size={18} /></div>
      <h3>{path.title}</h3><p>{path.desc}</p><div className="topic-list">{path.topics.map((topic) => <span key={topic}><Icon name="check-circle" size={14} />{topic}</span>)}</div>
      <div className="path-outcome"><small>YOUR MILESTONE</small><p>{path.outcome}</p></div>
      <button className="button button-card" onClick={() => onClick(path.id)}>Explore this path <Icon name="arrow-right" size={16} /></button>
    </div>
  </article>;
}
function LabCard({ lab, compact = false }) {
  return <article className={`lab-card lab-${slugify(lab.category || 'notes')} lab-item-${slugify(lab.id)} ${compact ? 'lab-card-compact' : ''}`}>
    <div className="lab-art"><img src={lab.image || '/images/learning/handwritten-notes.jpg'} alt="" loading="lazy" /><div className="lab-art-shade"/><span className="lab-icon"><Icon name={lab.icon || 'file-text'} size={23} /></span><span className="lab-kind">{lab.kind}</span></div>
    <div className="lab-body"><div className="lab-card-top"><span className="lab-category">{lab.category || 'Learning notes'}</span><span className="level-label">{lab.level}</span></div>
      <h3>{lab.title}</h3><p className="card-description">{lab.summary}</p>
      <div className="lab-meta"><span><Icon name="clock" size={13} />{lab.estimated}</span><span><Icon name="target" size={13} />{lab.skill}</span></div>
      <div className="lab-tags">{(lab.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="download-row"><a className="download-button primary-download" href={publicPath(lab.pdf)} download><Icon name="download" size={15} />PDF</a><a className="download-button" href={publicPath(lab.docx)} download><Icon name="download" size={15} />DOCX</a></div>
      {(lab.dataset || lab.script || lab.worksheet) && <div className="lab-extra">{lab.dataset && <a href={publicPath(lab.dataset)} download>Sample data <Icon name="arrow-up-right" size={13} /></a>}{lab.script && <a href={publicPath(lab.script)} download>Evaluation script <Icon name="arrow-up-right" size={13} /></a>}{lab.worksheet && <a href={publicPath(lab.worksheet)} download>Scope worksheet <Icon name="arrow-up-right" size={13} /></a>}</div>}
    </div>
  </article>;
}
function PageHeading({ kicker, title, emphasis, description }) {
  return <div className="section-heading"><div><div className="section-kicker">{kicker}</div><h2>{title}<br /><em>{emphasis}</em></h2></div><p>{description}</p></div>;
}

function parseCsvText(text = '') {
  const records = [];
  let fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field); field = '';
    } else if (char === '\n' && !quoted) {
      fields.push(field.replace(/\r$/, ''));
      if (fields.some((value) => value.trim() !== '')) records.push(fields);
      fields = []; field = '';
    } else {
      field += char;
    }
  }
  if (field.length || fields.length) {
    fields.push(field.replace(/\r$/, ''));
    if (fields.some((value) => value.trim() !== '')) records.push(fields);
  }
  if (!records.length) return [];
  const headers = records.shift().map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim());
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()] )));
}

function evaluateSampleRule(rows) {
  const result = { tp: 0, fp: 0, tn: 0, fn: 0, ambiguous: 0, scored: 0 };
  for (const row of rows) {
    const label = String(row.activity_label || '').trim().toLowerCase();
    const process = String(row.process || '').trim().replace(/\//g, '\\').split('\\').pop().toLowerCase();
    const command = String(row.command_line || '').toLowerCase();
    const predicts = process === 'powershell.exe' && /(?:^|\s)-(?:enc|encodedcommand)(?:\s|$)/.test(command);
    if (label === 'ambiguous') { result.ambiguous += 1; continue; }
    if (!['benign', 'suspicious'].includes(label)) continue;
    result.scored += 1;
    if (label === 'suspicious' && predicts) result.tp += 1;
    else if (label === 'suspicious' && !predicts) result.fn += 1;
    else if (label === 'benign' && predicts) result.fp += 1;
    else result.tn += 1;
  }
  const div = (a, b) => b ? a / b : 0;
  result.accuracy = div(result.tp + result.tn, result.scored);
  result.precision = div(result.tp, result.tp + result.fp);
  result.recall = div(result.tp, result.tp + result.fn);
  result.specificity = div(result.tn, result.tn + result.fp);
  result.f1 = div(2 * result.precision * result.recall, result.precision + result.recall);
  return result;
}

function App() {
  const [page, setPage] = useState('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All resources');
  const [cost, setCost] = useState('All access types');
  const [level, setLevel] = useState('All levels');
  const [labLevel, setLabLevel] = useState('All labs');
  const [labCategory, setLabCategory] = useState('All topics');
  const [videoTopic, setVideoTopic] = useState('All videos');
  const [shareNotice, setShareNotice] = useState('');
  const [copiedGratitudeQuote, setCopiedGratitudeQuote] = useState('');
  const [gratitudeCopyNotice, setGratitudeCopyNotice] = useState('');
  const [huntRows, setHuntRows] = useState([]);
  const [ruleMetrics, setRuleMetrics] = useState(null);
  const [datasetState, setDatasetState] = useState('Loading the included training files…');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPage('resources');
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchCsv = async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
      return parseCsvText(await response.text());
    };
    Promise.all([
      fetchCsv('/labs/threat-hunt-auth-dns-samples.csv'),
      fetchCsv('/labs/detection-evaluation-cases.csv'),
    ]).then(([hunt, detection]) => {
      if (!active) return;
      setHuntRows(hunt);
      setRuleMetrics(evaluateSampleRule(detection));
      setDatasetState('Loaded from included CSV files');
    }).catch(() => {
      if (active) setDatasetState('Sample files could not be loaded. Check the local Vite server and /labs paths.');
    });
    return () => { active = false; };
  }, []);

  const huntSummary = useMemo(() => {
    const labels = { benign: 0, suspicious: 0, ambiguous: 0 };
    for (const row of huntRows) {
      const label = String(row.label || '').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(labels, label)) labels[label] += 1;
    }
    return {
      total: huntRows.length,
      failures: huntRows.filter((row) => row.event_type === 'login' && row.result === 'failure').length,
      successes: huntRows.filter((row) => row.event_type === 'login' && row.result === 'success').length,
      dns: huntRows.filter((row) => row.event_type === 'dns_lookup').length,
      labels,
    };
  }, [huntRows]);

  const visibleResources = useMemo(() => resources.filter((r) => {
    const searchable = `${r.name} ${r.provider} ${r.category} ${r.description} ${r.skills.join(' ')} ${r.note}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All resources' || r.category === category;
    const kind = r.kind.toLowerCase();
    const matchesCost = cost === 'All access types'
      || (cost === 'Free' && kind.includes('free') && !kind.includes('tier') && !kind.includes('varies'))
      || (cost === 'Open source' && kind.includes('open source'))
      || (cost === 'Free tier / varies' && (kind.includes('tier') || kind.includes('varies')));
    return matchesQuery && matchesCategory && matchesCost && matchesLevel(r.level, level, 'All levels');
  }), [query, category, cost, level]);

  const visibleLabs = labs.filter((lab) => matchesLevel(lab.level, labLevel, 'All labs') && (labCategory === 'All topics' || lab.category === labCategory));
  const visibleVideos = learningVideos.filter((video) => videoTopic === 'All videos' || video.topic === videoTopic || video.level === videoTopic);
  const navigate = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearFilters = () => { setQuery(''); setCategory('All resources'); setCost('All access types'); setLevel('All levels'); };
  const openLearningPath = (pathId) => {
    const categoriesByPath = { foundations: 'Foundations', 'threat-hunting': 'Threat Hunting', 'bug-bounty': 'Bug Bounty', detection: 'Detection Engineering' };
    setLabCategory(categoriesByPath[pathId] || 'All topics');
    setLabLevel('All labs');
    navigate('labs');
  };
  const shareSite = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'OpenCyberPath', text: 'Learn cybersecurity with free resources, hands-on labs, and structured learning paths.', url: window.location.origin });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(window.location.origin); setShareNotice('Site link copied. Share it with another learner.'); }
      else setShareNotice(`Share this site: ${window.location.origin}`);
    } catch (err) {
      if (err?.name !== 'AbortError') setShareNotice(`Share this site: ${window.location.origin}`);
    }
  };
  const copyGratitudeQuote = async (quote) => {
    const shareText = `“${quote}”\n— OpenCyberPath (original reflection)`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable');
      await navigator.clipboard.writeText(shareText);
      setCopiedGratitudeQuote(quote);
      setGratitudeCopyNotice('Boost copied. Send it to a learner who needs encouragement.');
    } catch {
      setCopiedGratitudeQuote('');
      setGratitudeCopyNotice('Clipboard access is unavailable here. Select the boost text and copy it manually.');
    }
  };
  const featuredResources = resources.filter((r) => ['portswigger-academy', 'wazuh-getting-started', 'microsoft-threat-hunting', 'mitre-attack'].includes(r.id));
  const featuredLabs = labs.filter((l) => ['lab-threat-hunt', 'lab-bugbounty', 'lab-cheatsheet', 'lab-attack-patterns'].includes(l.id));
  const publicDatasetResources = resources.filter((r) => ['cicids2017-labeled-flows', 'ctu13-labeled-flows', 'splunk-botsv3-dataset'].includes(r.id));

  return <div className="app-shell" id="top">
    <header className="site-header">
      <Logo onClick={navigate} />
      <nav className="nav-links" aria-label="Main navigation">
        {[['home','Home'],['resources','Resources'],['roadmap','Learning paths'],['labs','Labs & notes'],['concepts','Attack basics']].map(([key,label]) => <button key={key} className={`nav-link ${page === key ? 'active' : ''}`} onClick={() => navigate(key)}>{label}</button>)}
      </nav>
      <div className="header-actions"><label className="header-search"><Icon name="search" size={16} /><input value={query} onChange={(e) => { setQuery(e.target.value); if (page !== 'resources') navigate('resources'); }} onFocus={() => { if (page !== 'resources') navigate('resources'); }} placeholder="Search skills, labs, topics…" aria-label="Search resources" /><kbd>Ctrl K</kbd></label><ExternalLink className="github-link" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path"><Icon name="network" size={15} /> GitHub</ExternalLink></div>
    </header>

    <main>
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> OPEN · FREE TO EXPLORE · COMMUNITY BUILT</div>
            <h1>Learn cybersecurity for <em>real skills,</em> real opportunities.</h1>
            <p className="hero-copy">Free learning resources, practical labs, notebook-style notes, and clear learning paths - from first steps to deeper investigation. Learn, practise, build evidence, and help another learner grow.</p>
            <div className="hero-actions"><button className="button button-primary" onClick={() => navigate('roadmap')}>Start learning free <Icon name="arrow-right" size={17} /></button><button className="button button-quiet" onClick={() => navigate('resources')}>Explore resources <Icon name="arrow-up-right" size={16} /></button></div>
            <div className="hero-note"><Icon name="users" size={17} /> No fake ratings or job promises. Start with useful material and build at your own pace.</div>
          </div>
          <div className="hero-visual"><img className="hero-image" src="/images/learning/detection-engineering-lab.webp" alt="Analyst reviewing detection outcomes, event charts, and alert logic" /><div className="hero-image-vignette"/><div className="hero-sticker sticker-top"><Icon name="book-open" size={19} /><span><small>LEARN</small><b>Understand the basics</b></span></div><div className="hero-sticker sticker-bottom"><Icon name="target" size={19} /><span><small>PRACTISE</small><b>Build evidence of skill</b></span></div><div className="hero-quote"><Icon name="spark" size={19} /><p>Learn it.<br />Practise it.<br /><b>Share what you discover.</b></p></div></div>
        </section>
        <section className="principle-strip" aria-label="What learners can expect">
          <div><span className="principle-icon"><Icon name="book-open" /></span><span><b>Free to explore</b><small>Clear access labels and caveats</small></span></div>
          <div><span className="principle-icon"><Icon name="terminal" /></span><span><b>Practice-first</b><small>Samples, worksheets, and labs</small></span></div>
          <div><span className="principle-icon"><Icon name="route" /></span><span><b>Choose your path</b><small>Learn foundations then specialise</small></span></div>
          <div><span className="principle-icon"><Icon name="shield-check" /></span><span><b>Practise responsibly</b><small>Authorised environments only</small></span></div>
        </section>

        <section className="section-wrap home-paths">
          <PageHeading kicker="START WHERE YOU ARE" title="Choose your learning" emphasis="path." description="You do not have to learn everything at once. Pick a direction, follow a sequence, and practise with material that fits your current level." />
          <div className="path-grid">{learningPaths.map((path) => <PathCard key={path.id} path={path} onClick={openLearningPath} />)}</div>
        </section>

        <section className="section-wrap evidence-section">
          <div className="section-heading">
            <div><div className="section-kicker">OPEN DATA · REPRODUCIBLE PRACTICE</div><h2>Look at the evidence.<br /><em>Not a decorative dashboard.</em></h2></div>
            <p>These visuals are calculated from the CSV training files shipped with this project. They are synthetic learning examples, not live telemetry or estimates of real-world attack rates.</p>
          </div>
          <div className="evidence-grid">
            <article className="evidence-panel evidence-hunt">
              <div className="evidence-panel-heading"><span className="evidence-panel-icon"><Icon name="radar" size={22} /></span><div><span className="dataset-kicker">AUTHENTICATION + DNS</span><h3>Investigate the sample records</h3></div><span className={`dataset-status ${datasetState.startsWith('Loaded') ? 'loaded' : ''}`}>{datasetState.startsWith('Loaded') ? 'CSV loaded' : 'Checking files'}</span></div>
              <p className="evidence-lede">Each row below comes from <code>threat-hunt-auth-dns-samples.csv</code>. The summary updates from the file rather than showing made-up totals.</p>
              <div className="evidence-kpis">
                <div><span>Sample rows</span><strong>{huntSummary.total || '—'}</strong></div>
                <div><span>Failed sign-ins</span><strong className="num-fail">{huntSummary.failures || '—'}</strong></div>
                <div><span>Successful sign-ins</span><strong className="num-pass">{huntSummary.successes || '—'}</strong></div>
                <div><span>DNS events</span><strong className="num-dns">{huntSummary.dns || '—'}</strong></div>
              </div>
              <div className="evidence-hunt-layout">
                <div className="evidence-table-wrap">
                  <div className="evidence-subheading"><h4>Event records</h4><span>UTC · first 6 rows</span></div>
                  {huntRows.length ? <table className="evidence-table"><thead><tr><th>Time</th><th>Host</th><th>Event / result</th><th>Label</th></tr></thead><tbody>{huntRows.slice(0, 6).map((row) => <tr key={row.case_id}><td>{(row.timestamp_utc || '').split('T')[1]?.slice(0, 5) || '—'}</td><td>{row.host || '—'}</td><td><b>{row.event_type}</b><small>{row.result}</small></td><td><span className={`signal-label signal-${slugify(row.label)}`}>{row.label}</span></td></tr>)}</tbody></table> : <p className="data-empty">{datasetState}</p>}
                </div>
                <div className="evidence-label-breakdown"><div className="evidence-subheading"><h4>Training labels</h4><span>from CSV</span></div>{Object.entries(huntSummary.labels).map(([label, count]) => <div className={`label-bar-row label-bar-${label}`} key={label}><div><span>{label}</span><b>{count}</b></div><div className="label-bar-track"><span style={{ width: `${huntSummary.total ? (count / huntSummary.total) * 100 : 0}%` }} /></div></div>)}<div className="interpretation-note"><Icon name="lightbulb" size={17} /><p>Repeated failures are a signal to investigate—not proof that an account was compromised. Compare with baseline and surrounding events.</p></div></div>
              </div>
              <div className="evidence-panel-footer"><span><Icon name="shield-check" size={15} /> Synthetic training data · no live accounts or hosts</span><a href="/labs/threat-hunt-auth-dns-samples.csv" download>Download source CSV <Icon name="download" size={14} /></a></div>
            </article>

            <article className="evidence-panel evidence-detection">
              <div className="evidence-panel-heading"><span className="evidence-panel-icon"><Icon name="chart" size={22} /></span><div><span className="dataset-kicker">DETECTION ENGINEERING</span><h3>Evaluate a narrow rule</h3></div><span className={`dataset-status ${ruleMetrics ? 'loaded' : ''}`}>{ruleMetrics ? 'Reproducible' : 'Checking files'}</span></div>
              <p className="evidence-lede">A small rule looks for an encoded-command argument in <code>powershell.exe</code>. The score below is recalculated from the included labelled cases.</p>
              {ruleMetrics ? <>
                <div className="confusion-matrix" aria-label="Confusion matrix from synthetic training cases"><div className="matrix-heading">ACTUAL LABEL × RULE PREDICTION</div><div className="matrix-grid"><div className="matrix-cell matrix-tp"><span>True positives</span><strong>{ruleMetrics.tp}</strong><small>Suspicious + alert</small></div><div className="matrix-cell matrix-fp"><span>False positives</span><strong>{ruleMetrics.fp}</strong><small>Benign + alert</small></div><div className="matrix-cell matrix-fn"><span>False negatives</span><strong>{ruleMetrics.fn}</strong><small>Suspicious + missed</small></div><div className="matrix-cell matrix-tn"><span>True negatives</span><strong>{ruleMetrics.tn}</strong><small>Benign + no alert</small></div></div></div>
                <div className="rate-grid">{[['Accuracy', ruleMetrics.accuracy], ['Precision', ruleMetrics.precision], ['Recall', ruleMetrics.recall], ['Specificity', ruleMetrics.specificity], ['F1', ruleMetrics.f1]].map(([name,value]) => <div className="rate-card" key={name}><span>{name}</span><strong>{(value * 100).toFixed(1)}%</strong><div className="rate-track"><span style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} /></div></div>)}</div>
                <p className="ambiguous-note">{ruleMetrics.scored} cases scored · {ruleMetrics.ambiguous} ambiguous case excluded. These tiny synthetic metrics are for learning only, not real-world performance.</p>
              </> : <p className="data-empty">{datasetState}</p>}
              <div className="evidence-panel-footer"><span><Icon name="file-text" size={15} /> Narrow example rule · context still matters</span><a href="/labs/detection-evaluation-cases.csv" download>Download cases <Icon name="download" size={14} /></a><a href="/labs/evaluate-detection-cases.py" download>Rule script <Icon name="download" size={14} /></a></div>
            </article>
          </div>
        </section>

        <section className="section-wrap public-dataset-section">
          <PageHeading kicker="PUBLISHED RESEARCH DATA" title="Move beyond small samples." emphasis="Learn from cited datasets." description="The dashboard above is intentionally small and synthetic. When you are ready for larger research exercises, start from these original dataset owners and read their documentation before downloading anything." />
          <div className="resource-grid public-dataset-grid">{publicDatasetResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
          <div className="benchmark-schedule">
            <div className="benchmark-schedule-heading"><div><span className="dataset-kicker">PUBLISHED SOURCE METADATA · CIC-IDS2017</span><h3>One real research timeline. Five recorded days.</h3><p>These are the experiment dates and activity categories documented by the dataset publisher—not live internet activity or counts from the local synthetic CSV.</p></div><a href="https://www.unb.ca/cic/datasets/ids-2017.html" target="_blank" rel="noreferrer">Official dataset page <Icon name="arrow-up-right" size={14} /></a></div>
            <div className="benchmark-days">
              <article className="benchmark-day benchmark-baseline"><span>MON · 03 JUL 2017</span><h4>Benign baseline</h4><p>Normal activity</p><small>Reference day</small></article>
              <article className="benchmark-day benchmark-auth"><span>TUE · 04 JUL 2017</span><h4>Authentication attacks</h4><p>FTP and SSH brute force</p><small>Login pattern analysis</small></article>
              <article className="benchmark-day benchmark-volume"><span>WED · 05 JUL 2017</span><h4>Availability + protocol</h4><p>DoS / DDoS and Heartbleed</p><small>Traffic and service context</small></article>
              <article className="benchmark-day benchmark-web"><span>THU · 06 JUL 2017</span><h4>Web + infiltration</h4><p>Brute force, XSS, SQL injection and infiltration</p><small>Application traffic labels</small></article>
              <article className="benchmark-day benchmark-botnet"><span>FRI · 07 JUL 2017</span><h4>Botnet + scanning</h4><p>Botnet activity and port scanning</p><small>Network flow investigation</small></article>
            </div>
          </div>

          <div className="public-data-note"><Icon name="book-open" size={20} /><p><b>Keep the source and limitations beside the chart.</b> Published benchmarks were recorded under particular conditions and may be large or dated; they do not represent all current internet traffic. OpenCyberPath links to the original publishers rather than silently copying data or inventing metrics.</p></div>
        </section>

        <section className="section-wrap home-resources">

          <div className="section-heading section-heading-inline"><div><div className="section-kicker">TRUSTED STARTING POINTS</div><h2>Good places to learn.<br /><em>One clear directory.</em></h2></div><button className="text-button" onClick={() => navigate('resources')}>View all resources <Icon name="arrow-up-right" size={16} /></button></div>
          <p className="section-lede">We link to original docs and training providers. Check their current access conditions before creating accounts or cloud resources.</p>
          <div className="resource-grid home-resource-grid">{featuredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
        </section>

        <section className="section-wrap home-labs">
          <div className="section-heading section-heading-inline"><div><div className="section-kicker">LEARN BY DOING</div><h2>Small steps. <em>Practical skills.</em></h2></div><button className="text-button" onClick={() => navigate('labs')}>Open labs & notes <Icon name="arrow-up-right" size={16} /></button></div>
          <p className="section-lede">Download a guide, try the exercise with the provided sample, then write down what you learned and what remains unknown.</p>
          <div className="lab-grid home-lab-grid">{featuredLabs.map((lab) => <LabCard key={lab.id} lab={lab} compact />)}</div>
        </section>

        <section className="section-wrap attack-preview">
          <PageHeading kicker="SECURITY IN PLAIN LANGUAGE" title="Understand the pattern," emphasis="then the defence." description="Short, friendly explanations help new learners understand why common security problems happen and which controls reduce risk." />
          <div className="attack-grid">{attackPatterns.slice(0,3).map((attack) => <article className={`attack-card attack-${slugify(attack.title)}`} key={attack.title}><div className="attack-card-top"><span className="attack-icon"><Icon name={attack.icon} size={21} /></span><span className="plain-tag">PLAIN-LANGUAGE GUIDE</span></div><h3>{attack.title}</h3><p>{attack.short}</p><div className="attack-example"><b>Example</b><span>{attack.example}</span></div><div className="attack-defense"><Icon name="shield-check" size={16} /><span>{attack.defend}</span></div></article>)}</div>
          <button className="button button-quiet section-cta" onClick={() => navigate('concepts')}>Explore attack basics <Icon name="arrow-right" size={16} /></button>
        </section>

        <section className="section-wrap gratitude-section" id="gratitude" aria-labelledby="gratitude-title">
          <div className="gratitude-heading">
            <div className="gratitude-heading-copy">
              <div className="section-kicker"><Icon name="spark" size={14} /> MOMENTUM · GRATITUDE · GROWTH</div>
              <h2 id="gratitude-title">Keep going.<br /><em>Your next skill starts with one step.</em></h2>
              <p>Cybersecurity is a big field, and nobody masters it in a day. Pick one concept, practise safely, write down what you learned, and return tomorrow. Progress is built—not wished for.</p>
            </div>
            <aside className="gratitude-featured">
              <span className="gratitude-feature-label"><Icon name="target" size={15} /> YOUR REMINDER FOR TODAY</span>
              <span className="gratitude-feature-mark" aria-hidden="true">“</span>
              <blockquote>You do not have to master cybersecurity today. Learn one concept. Practise one safe lab. Write down one thing you discovered. Do it again tomorrow.</blockquote>
              <span className="gratitude-attribution">ONE STEP TODAY. MORE CONFIDENCE TOMORROW.</span>
              <div className="gratitude-feature-actions">
                <button className="button button-primary" type="button" onClick={() => navigate('labs')}>Practise one lab <Icon name="arrow-right" size={15} /></button>
                <button className="button button-quiet" type="button" onClick={() => navigate('roadmap')}>Choose your path <Icon name="route" size={15} /></button>
              </div>
            </aside>
          </div>
          <div className="gratitude-section-intro"><span>YOUR NEXT MOVE</span><p>Choose the reminder you need today. Then do the small action underneath it.</p></div>
          <div className="gratitude-grid">
            {gratitudeQuotes.map((item) => <article className={`gratitude-card gratitude-tone-${item.tone}`} key={item.id}>
              <div className="gratitude-card-head"><span className="gratitude-icon"><Icon name={item.icon} size={20} /></span><span className="gratitude-kind">{item.label}</span><span className="gratitude-index">{item.number}</span></div>
              <blockquote>{item.quote}</blockquote>
              <div className="gratitude-next-step"><span><Icon name="arrow-right" size={12} /> DO THIS NEXT</span><p>{item.nextStep}</p></div>
              <div className="gratitude-card-foot"><span>OPENCYBERPATH ORIGINAL</span><button className="gratitude-copy" type="button" onClick={() => copyGratitudeQuote(item.quote)} aria-label={`Copy encouragement: ${item.label.toLowerCase()}`}><Icon name={copiedGratitudeQuote === item.quote ? 'check-circle' : 'copy'} size={14} />{copiedGratitudeQuote === item.quote ? 'Copied' : 'Share this boost'}</button></div>
            </article>)}
          </div>
          {gratitudeCopyNotice && <p className="gratitude-copy-notice" role="status">{gratitudeCopyNotice}</p>}
          <p className="gratitude-note">Original OpenCyberPath encouragement—not quotes attributed to famous people. Thank the people who help you learn, then pass useful knowledge forward.</p>
        </section>

        <section className="community-band"><div className="community-mark"><Icon name="users" size={31} /></div><div className="community-copy"><div className="section-kicker">BUILT BY LEARNERS, FOR LEARNERS</div><h2>Find something useful.<br /><em>Pass it forward.</em></h2><p>Share a roadmap, a lab, or a resource that helped you. Contributions that improve clarity and accuracy make the whole directory more useful.</p></div><div className="community-actions"><button className="button button-primary" onClick={shareSite}><Icon name="share" size={16} /> Share OpenCyberPath</button><ExternalLink className="button button-quiet" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">Contribute on GitHub <Icon name="arrow-up-right" size={16} /></ExternalLink>{shareNotice && <p className="share-notice" role="status">{shareNotice}</p>}</div></section>
      </>}

      {page === 'resources' && <section className="section-wrap resource-page">
        <PageHeading kicker="THE RESOURCE LIBRARY" title="Good resources." emphasis="All in one place." description="Explore official documentation, free learning, open-source tools, threat-hunting references, and authorised web-security training. We link to the original providers and explain access limits." />
        <div className="search-row"><label className="search-box"><Icon name="search" size={19} /><input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills, tools, topics, providers…" aria-label="Search resources" /><kbd>Ctrl K</kbd></label><label className="select-wrap"><span className="sr-only">Access type</span><select value={cost} onChange={(e) => setCost(e.target.value)}><option>All access types</option><option>Free</option><option>Open source</option><option>Free tier / varies</option></select></label><label className="select-wrap"><span className="sr-only">Skill level</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
        <div className="category-row" role="group" aria-label="Filter by category">{categories.map((c) => <button key={c} className={`category-chip ${category === c ? 'chosen' : ''}`} onClick={() => setCategory(c)}>{c === 'Threat Hunting' ? <Icon name="radar" size={14} /> : c === 'Bug Bounty' ? <Icon name="bug" size={14} /> : c === 'Foundations' ? <Icon name="book-open" size={14} /> : c === 'Security Concepts' ? <Icon name="shield-check" size={14} /> : c === 'Detection Engineering' ? <Icon name="terminal" size={14} /> : c === 'SOC & SIEM' ? <Icon name="chart" size={14} /> : c === 'Hands-on Labs' ? <Icon name="target" size={14} /> : <Icon name="spark" size={14} />}{c}</button>)}</div>
        <div className="results-caption"><span><b>{visibleResources.length}</b> resources to explore</span><span>External links open the original provider <Icon name="arrow-up-right" size={13} /></span></div>
        <div className="resource-grid">{visibleResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
        {visibleResources.length === 0 && <div className="empty-state"><Icon name="search" size={28} /><h3>No matching resources yet</h3><p>Try another topic or remove a filter.</p><button className="button button-primary" onClick={clearFilters}>Clear filters</button></div>}
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>Access can change.</b> Providers may change free tiers, account requirements, lab availability, or terms. Check the original site before signing up; OpenCyberPath does not control external services or promise jobs or bounty rewards.</p></div>
      </section>}

      {page === 'roadmap' && <section className="section-wrap roadmap-section">
        <PageHeading kicker="LEARNING PATHS" title="Choose the next" emphasis="skill to build." description="Start with the path that fits your interests. You can switch directions later; foundations make every specialisation easier." />
        <div className="path-grid roadmap-path-grid">{learningPaths.map((path) => <PathCard key={path.id} path={path} onClick={openLearningPath} />)}</div>
        <div className="section-heading roadmap-detail-heading"><div><div className="section-kicker">A SAMPLE SOC ROADMAP</div><h2>From first concepts<br /><em>to useful evidence.</em></h2></div><p>A suggested sequence, not a job guarantee. Learn one idea, practise it safely, and document the outcome before moving on.</p></div>
        <div className="roadmap-list">{[
          ['01','Build foundations','Networking, DNS, HTTP, Windows, Linux, processes, and permissions.','Explain a core concept in your own words.','book-open'],
          ['02','Read and organise logs','Recognise timestamps, users, hosts, outcomes, and JSON/CSV fields.','Explain what a sample event does and does not prove.','file-text'],
          ['03','Explore a SIEM workflow','Learn event collection, searches, filters, rules, dashboards, and alerts.','Trace a supplied sample from event to finding.','chart'],
          ['04','Practise a hunt','Create a hypothesis, query sample events, compare baseline activity, and note uncertainty.','Write a concise, evidence-based hunting note.','radar'],
          ['05','Evaluate a detection','Review false positives and missed cases, then publish reproducible metrics.','Explain the limits of a rule and its test data.','shield-check'],
          ['06','Document a portfolio project','Show the goal, setup, evidence, tests, result, limitations, and lessons learned.','Demonstrate what you actually built and understood.','terminal'],
        ].map(([number,title,desc,outcome,icon]) => <article className="roadmap-stage" key={number}><span className="stage-icon"><Icon name={icon} size={20} /></span><div className="stage-main"><div className="stage-number">STAGE {number}</div><h3>{title}</h3><p>{desc}</p><span className="stage-outcome"><b>Milestone:</b> {outcome}</span></div><Icon name="arrow-up-right" className="stage-arrow" size={19} /></article>)}</div>
        <div className="roadmap-footer"><Icon name="lightbulb" size={21} /><p><b>Keep the evidence honest.</b> A completed roadmap is not proof of professional experience or a job guarantee. Save your notes, disclose limitations, and share a portfolio that matches what you actually did.</p></div>
        <button className="button button-primary" onClick={() => navigate('labs')}>Choose a lab to practise <Icon name="arrow-right" size={16} /></button>
      </section>}

      {page === 'labs' && <section className="section-wrap labs-section">
        <PageHeading kicker="PRACTISE AT YOUR OWN PACE" title="Notes, labs &" emphasis="field guides." description="Start with a notebook, use supplied sample data, and practise in a local or explicitly authorised training environment. Each guide is available as a PDF and editable DOCX." />
        <div className="notes-banner"><img src="/images/learning/handwritten-notes-study.svg" alt="Notebook-style SOC triage notes with event, context, evidence, and decision steps"/><div className="notes-banner-copy"><div className="section-kicker">NOTEBOOK MODE</div><h3>Notes that feel easier to revise.</h3><p>Handwriting-inspired typeset notes, crisp topic icons, checklists, practice sheets, and quick references. You do not need a full SIEM installation to begin learning.</p></div><span className="notes-format"><Icon name="notebook-pen" size={18} /> PDF + DOCX</span></div>
        <div className="lab-filter-panel"><div><div className="section-kicker">LAB & NOTE LIBRARY</div><p>Filter by experience level or learning topic.</p></div><div className="lab-filter-controls"><label className="select-wrap"><span className="sr-only">Filter labs by topic</span><select value={labCategory} onChange={(e) => setLabCategory(e.target.value)}><option>All topics</option>{[...new Set(labs.map((lab) => lab.category))].map((topic) => <option key={topic}>{topic}</option>)}</select></label><label className="select-wrap"><span className="sr-only">Filter labs by level</span><select value={labLevel} onChange={(e) => setLabLevel(e.target.value)}><option>All labs</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div></div>
        <div className="lab-results-caption">Showing <b>{visibleLabs.length}</b> learning items <span>•</span> every guide has PDF + DOCX</div>
        <div className="lab-grid">{visibleLabs.map((lab) => <LabCard key={lab.id} lab={lab} />)}</div>
        {visibleLabs.length === 0 && <div className="empty-state"><Icon name="search" size={26} /><h3>No labs in this filter</h3><button className="button button-primary" onClick={() => { setLabCategory('All topics'); setLabLevel('All labs'); }}>Show all labs</button></div>}
        <div className="section-heading video-heading"><div><div className="section-kicker">WATCH & LEARN</div><h2>Curated video<br /><em>walkthroughs.</em></h2></div><p>Videos support concepts and demonstrations. Installation details can go out of date, so use current official documentation for version-specific steps.</p></div>
        <div className="video-filter-row"><div className="video-filter-chips">{['All videos','SOC & SIEM','Lab environment','SIEM & cloud','Beginner','Intermediate'].map((item) => <button key={item} className={`category-chip ${videoTopic === item ? 'chosen' : ''}`} onClick={() => setVideoTopic(item)}>{item}</button>)}</div><span className="account-note">Links open on YouTube or official docs</span></div>
        <div className="video-list">{visibleVideos.map((video) => <article className={`video-card video-${slugify(video.topic)} video-level-${slugify(video.level)}`} key={video.id}><div className="video-play"><Icon name="book-open" size={22} /></div><div className="video-content"><div className="video-meta"><span>{video.level}</span><span>{video.creator}</span><span>{video.type}</span></div><h3>{video.title}</h3><p>{video.note}</p><div className="video-actions"><ExternalLink className="card-link" href={video.url}>Watch video <Icon name="arrow-up-right" size={15} /></ExternalLink><ExternalLink className="docs-link" href={video.officialDocs}>Official docs <Icon name="arrow-up-right" size={14} /></ExternalLink></div></div></article>)}{visibleVideos.length === 0 && <div className="empty-state"><h3>No videos match that filter</h3><button className="button button-primary" onClick={() => setVideoTopic('All videos')}>Show all videos</button></div>}</div>
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>Practice safely.</b> Threat-hunting data shipped here is synthetic. Bug-bounty activities must stay inside an explicitly authorised scope or the designated training lab. Do not test random public systems.</p></div>
      </section>}

      {page === 'concepts' && <section className="section-wrap concepts-section">
        <PageHeading kicker="SECURITY IN PLAIN LANGUAGE" title="Understand the cause." emphasis="Learn the defence." description="Security words can sound intimidating. These simple examples explain common patterns, why they happen, what may be observed, and which controls help reduce risk." />
        <div className="concept-intro"><Icon name="book-open" size={24} /><div><b>Think in patterns, not movie scenes.</b><p>Each topic is a starting point for learning. An indicator is not proof by itself; use evidence and authorised practice.</p></div><a className="download-button" href="/notes/common-attack-patterns-beginner-guide.pdf" download><Icon name="download" size={15} /> Full guide</a></div>
        <div className="attack-grid concept-grid">{attackPatterns.map((attack) => <article className={`attack-card attack-${slugify(attack.title)}`} key={attack.title}><div className="attack-illustration"><img src={attack.image} alt="" loading="lazy"/><div className="attack-art-shade"/><span className="attack-icon"><Icon name={attack.icon === 'code' ? 'terminal' : attack.icon} size={22} /></span></div><h3>{attack.title}</h3><p>{attack.short}</p><div className="concept-section"><small>WHY IT HAPPENS</small><p>{attack.cause}</p></div><div className="concept-section"><small>EVERYDAY EXAMPLE</small><p>{attack.example}</p></div><div className="attack-defense"><Icon name="shield-check" size={17} /><span>{attack.defend}</span></div></article>)}</div>
        <div className="verification-note"><Icon name="alert-triangle" size={19} /><p><b>For awareness and defence.</b> These examples are intentionally high level. For hands-on learning, use the official training environments listed in the resource directory and follow their current rules.</p></div>
      </section>}
    </main>

    <footer className="site-footer"><div className="footer-top"><Logo onClick={navigate} /><p>A learner-built guide to resources that already exist. Learn openly. Practise responsibly. Help the next learner.</p><div className="footer-links"><button onClick={() => navigate('resources')}>Resources</button><button onClick={() => navigate('roadmap')}>Learning paths</button><button onClick={() => navigate('labs')}>Labs & notes</button><button onClick={() => navigate('concepts')}>Attack basics</button><ExternalLink href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">Contribute <Icon name="arrow-up-right" size={13} /></ExternalLink></div></div><div className="copyright"><span>Independent community learning project</span><span>External resources belong to their providers · Verify current terms · No job or reward guarantees</span></div></footer>
  </div>;
}

export default App;
