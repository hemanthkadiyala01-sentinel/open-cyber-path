import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, resources } from './data/resources.js';
import { labs } from './data/labs.js';
import { learningVideos } from './data/learningVideos.js';

const categoryIcons = {
  'SOC & SIEM': '◈',
  'Detection Engineering': '⌘',
  'Hands-on Labs': '◎',
  'Web Security': '⌁',
  Foundations: '↗',
};

const levelRanks = { beginner: 1, intermediate: 2, advanced: 3 };
function matchesLevel(label, selected, allLabel) {
  if (selected === allLabel) return true;
  const normalized = label.toLowerCase();
  const wanted = selected.toLowerCase();
  if (normalized.includes(wanted)) return true;
  const range = normalized.split('→').map((part) => part.trim());
  if (range.length < 2) return false;
  const selectedRank = levelRanks[wanted];
  const start = levelRanks[range[0]] || 1;
  const end = levelRanks[range[1]] || start;
  return selectedRank >= start && selectedRank <= end;
}

const learningTiers = [
  {
    id: 'Beginner', number: '01', title: 'Build the foundation',
    description: 'Start with the essentials. No SIEM installation required.',
    topics: ['Networking, DNS and HTTP', 'Windows and Linux basics', 'Events, alerts and incidents', 'Reading JSON and CSV logs'],
    outcome: 'Explain a log record and write a clear first triage note.',
  },
  {
    id: 'Intermediate', number: '02', title: 'Investigate and detect',
    description: 'Practise the daily work of a junior SOC analyst.',
    topics: ['Wazuh or Splunk fundamentals', 'Alert triage and evidence', 'MITRE ATT&CK mapping', 'Rule testing and false positives'],
    outcome: 'Complete an investigation and evaluate a detection rule.',
  },
  {
    id: 'Advanced', number: '03', title: 'Engineer and validate',
    description: 'Move from using rules to engineering and evaluating them.',
    topics: ['Sigma and platform query languages', 'Telemetry quality and normalization', 'Detection evaluation and tuning', 'End-to-end lab validation'],
    outcome: 'Publish a reproducible, evidence-backed detection report.',
  },
];

function ExternalLink({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function App() {
  const [page, setPage] = useState('resources');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All resources');
  const [cost, setCost] = useState('All access types');
  const [level, setLevel] = useState('All levels');
  const [labLevel, setLabLevel] = useState('All labs');
  const [videoTopic, setVideoTopic] = useState('All videos');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (page !== 'resources') setPage('resources');
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [page]);

  const visibleResources = useMemo(() => resources.filter((r) => {
    const searchable = `${r.name} ${r.provider} ${r.category} ${r.description} ${r.skills.join(' ')} ${r.note}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All resources' || r.category === category;
    const kind = r.kind.toLowerCase();
    const matchesCost = cost === 'All access types'
      || (cost === 'Free' && kind.includes('free') && !kind.includes('tier') && !kind.includes('varies'))
      || (cost === 'Open source' && kind.includes('open source'))
      || (cost === 'Free tier' && (kind.includes('free tier') || kind.includes('varies')));
    const matchesLevelValue = matchesLevel(r.level, level, 'All levels');
    return matchesQuery && matchesCategory && matchesCost && matchesLevelValue;
  }), [query, category, cost, level]);

  const visibleLabs = labs.filter((lab) => matchesLevel(lab.level, labLevel, 'All labs'));
  const visibleVideos = learningVideos.filter((video) => videoTopic === 'All videos' || video.topic === videoTopic || video.level === videoTopic);
  const navigate = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearFilters = () => { setQuery(''); setCategory('All resources'); setCost('All access types'); setLevel('All levels'); };

  return (
    <div className="app-shell" id="top">
      <header className="site-header">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigate('resources'); }} aria-label="OpenCyberPath home">
          <span className="brand-mark">O<span>↗</span></span>
          <span className="brand-name">OpenCyberPath<small>LEARN WITHOUT BARRIERS</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <button className={page === 'resources' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('resources')}>Resources</button>
          <button className={page === 'roadmap' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('roadmap')}>Learning paths</button>
          <button className={page === 'labs' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('labs')}>Labs & notes</button>
          <ExternalLink className="nav-github" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">GitHub <span>↗</span></ExternalLink>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY-BUILT · FREE TO EXPLORE</div>
            <h1>Your cybersecurity<br /><em>journey starts here.</em></h1>
            <p className="hero-copy">Find trusted learning resources, hands-on labs, beginner notes, and career roadmaps from across the web. Spend less time searching. Spend more time learning.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => navigate('resources')}>Explore resources <span>→</span></button>
              <button className="button button-quiet" onClick={() => navigate('labs')}>Open free labs & notes <span>↗</span></button>
            </div>
            <div className="hero-note"><span>✳</span> Built by learners, for learners. Start with free resources and local practice.</div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-large"><div className="orb-inner"><span>OPEN</span><strong>CYBER</strong><span>PATH / 002</span></div></div>
            <div className="float-card float-top"><span className="mini-symbol">⌘</span><span>LEARN<br /><b>Detection</b></span></div>
            <div className="float-card float-bottom"><span className="status-dot"/><span>YOUR NEXT STEP<br /><b>Build a skill</b></span></div>
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          </div>
        </section>

        <section className="value-strip" aria-label="Platform principles">
          <div><span className="value-icon">✳</span><span><b>Cost transparency</b><small>Free, open-source and free-tier labels</small></span></div>
          <div><span className="value-icon">⌁</span><span><b>Learn by doing</b><small>Notes, sample cases and labs</small></span></div>
          <div><span className="value-icon">↗</span><span><b>Career direction</b><small>Beginner to advanced paths</small></span></div>
        </section>

        {page === 'resources' && (
          <section className="explorer section-wrap" id="resource-explorer">
            <div className="section-heading">
              <div><div className="section-kicker">THE RESOURCE LIBRARY</div><h2>Good resources.<br /><em>All in one place.</em></h2></div>
              <p>Explore official documentation, free learning, open-source tools and practical labs. We link to original providers and explain access limits.</p>
            </div>
            <div className="search-row">
              <label className="search-box"><span>⌕</span><input ref={searchInputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills, tools, topics…" aria-label="Search resources" /><kbd>Ctrl K</kbd></label>
              <label className="select-wrap"><span className="sr-only">Access type</span><select value={cost} onChange={(e) => setCost(e.target.value)}><option>All access types</option><option>Free</option><option>Open source</option><option>Free tier</option></select></label>
              <label className="select-wrap"><span className="sr-only">Skill level</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            </div>
            <div className="category-row" role="group" aria-label="Filter by category">
              {categories.map((c) => <button key={c} className={category === c ? 'category-chip chosen' : 'category-chip'} onClick={() => setCategory(c)}>{c === 'All resources' ? '✳' : categoryIcons[c] || '✳'} <span>{c}</span></button>)}
            </div>
            <div className="results-caption"><span><b>{visibleResources.length}</b> resources to explore</span><span>External links open the original provider ↗</span></div>
            <div className="resource-grid">
              {visibleResources.map((resource) => <article key={resource.id} className="resource-card">
                <div className="card-top"><span className="provider-mark">{categoryIcons[resource.category] || '✳'}</span><span className="level-label">{resource.level}</span></div>
                <div className="card-category">{resource.category}</div><h3>{resource.name}</h3><div className="provider-name">BY {resource.provider.toUpperCase()}</div>
                <p className="card-description">{resource.description}</p>
                <div className="skill-tags">{resource.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
                <div className="access-line"><span className={resource.kind.toLowerCase().includes('open source') ? 'access-badge open' : resource.kind.toLowerCase().includes('tier') || resource.kind.toLowerCase().includes('varies') ? 'access-badge limited' : 'access-badge'}>{resource.kind}</span><span className="account-note">{resource.account}</span></div>
                <p className="resource-note">{resource.note}</p>
                <ExternalLink className="card-link" href={resource.url}>Explore resource <span>↗</span></ExternalLink>
              </article>)}
            </div>
            {visibleResources.length === 0 && <div className="empty-state"><span>⌕</span><h3>No matching resources yet</h3><p>Try a different search or remove one of the filters.</p><button className="button button-primary" onClick={clearFilters}>Clear filters</button></div>}
            <div className="verification-note"><span>ⓘ</span><p><b>Access can change.</b> Some providers offer free tiers alongside paid features. Always check the official provider's current terms before signing up. We record when resources are reviewed as the directory grows.</p></div>
          </section>
        )}

        {page === 'roadmap' && (
          <section className="section-wrap roadmap-section">
            <div className="section-heading">
              <div><div className="section-kicker">LEARNING TIERS</div><h2>Choose your next<br /><em>learning stage.</em></h2></div>
              <p>Move from foundations to practical investigation and then to detection engineering. Choose based on your skills, not on a job title.</p>
            </div>
            <div className="tier-grid">
              {learningTiers.map((tier) => <article className="tier-card" key={tier.id}>
                <div className="tier-top"><span className="tier-number">{tier.number}</span><span className="tier-pill">{tier.id}</span></div>
                <h3>{tier.title}</h3><p>{tier.description}</p>
                <ul>{tier.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                <div className="tier-outcome"><b>Milestone</b><span>{tier.outcome}</span></div>
                <button className="text-button" onClick={() => navigate('labs')}>Find notes and practice →</button>
              </article>)}
            </div>
            <div className="section-heading roadmap-heading">
              <div><div className="section-kicker">ROLE ROADMAP</div><h2>From beginner to<br /><em>SOC Analyst.</em></h2></div>
              <p>A suggested sequence—not a job guarantee. Learn the fundamentals, practise investigations, then build evidence of what you can do.</p>
            </div>
            <div className="roadmap-intro"><span className="roadmap-icon">↗</span><div><b>Keep it practical, keep it accessible.</b><p>Follow at your own pace. Use free documentation, sample events and local labs before considering paid training.</p></div></div>
            <div className="roadmap-list">
              {[
                ['01','Build foundations','Networking, TCP/IP, DNS, Windows, Linux, processes and permissions.','Explain core concepts and troubleshoot basic issues.'],
                ['02','Understand logs','Windows Event Viewer, Linux authentication logs, timestamps, users, hosts and JSON.','Explain what happened from event fields.'],
                ['03','Learn SIEM basics','Explore event ingestion, searches, filters, rules, dashboards and alerts.','Find an event and explain a detection.'],
                ['04','Practise alert triage','Review source evidence, consider benign explanations, and record knowns versus unknowns.','Write a clear investigation note.'],
                ['05','Test detections','Create rules, use benign and suspicious samples, and evaluate false positives and missed detections.','Publish a reproducible detection report.'],
                ['06','Build a portfolio','Document a lab, evidence, tests, limitations and lessons learned. Compare skills with real entry-level job descriptions.','Explain technical decisions in an interview.'],
              ].map((stage) => <article className="roadmap-stage" key={stage[0]}><div className="stage-number">{stage[0]}</div><div className="stage-main"><h3>{stage[1]}</h3><p>{stage[2]}</p><span className="stage-outcome">MILESTONE: {stage[3]}</span></div><span className="stage-arrow">↗</span></article>)}
            </div>
            <div className="roadmap-footer"><span>Remember</span> Completing a roadmap does not guarantee employment. Use it to plan learning, build practical evidence, and identify the next skill gap.</div>
            <button className="button button-primary" onClick={() => navigate('resources')}>Find resources for your roadmap <span>→</span></button>
          </section>
        )}

        {page === 'labs' && (
          <section className="section-wrap labs-section">
            <div className="section-heading">
              <div><div className="section-kicker">PRACTISE AT YOUR OWN PACE</div><h2>Notes, labs &<br /><em>video guides.</em></h2></div>
              <p>Start with downloadable notes, use safe sample data, then try the linked provider labs. PDFs and DOCX files are original OpenCyberPath learning aids.</p>
            </div>
            <div className="lab-callout"><span className="note-icon">✎</span><div><b>Beginner-friendly notebook notes</b><p>Handwriting-inspired typeset notes, clear checklists, lab worksheets, and printable reference material. You do not need to install a full SIEM to begin learning.</p></div><span className="download-count">PDF + DOCX</span></div>
            <div className="lab-filter-row"><span className="section-kicker">LAB LIBRARY</span><label className="select-wrap"><span className="sr-only">Filter labs by level</span><select value={labLevel} onChange={(e) => setLabLevel(e.target.value)}><option>All labs</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
            <div className="lab-grid">
              {visibleLabs.map((lab) => <article className="lab-card" key={lab.id}>
                <div className="lab-card-top"><span className="lab-type">{lab.kind}</span><span className="level-label">{lab.level}</span></div>
                <h3>{lab.title}</h3><p className="card-description">{lab.summary}</p>
                <div className="lab-meta"><span>◷ {lab.estimated}</span><span>↗ {lab.skill}</span></div>
                <div className="download-row"><a className="download-button primary-download" href={lab.pdf} download><span>⇩</span> PDF notes</a><a className="download-button" href={lab.docx} download><span>⇩</span> DOCX</a></div>
                {(lab.dataset || lab.script) && <div className="lab-extra">{lab.dataset && <a href={lab.dataset} download>Download sample data ↗</a>}{lab.script && <a href={lab.script} download>Download evaluation script ↗</a>}</div>}
              </article>)}
            </div>
            <div className="section-heading video-heading">
              <div><div className="section-kicker">WATCH & LEARN</div><h2>Curated video<br /><em>walkthroughs.</em></h2></div>
              <p>Videos help with concepts and demonstrations. Installation steps can become outdated, so use current official documentation for version-specific instructions.</p>
            </div>
            <div className="video-filter-row"><div className="video-filter-chips">{['All videos','SOC & SIEM','Lab environment','SIEM & cloud','Beginner','Intermediate'].map((item) => <button key={item} className={videoTopic === item ? 'category-chip chosen' : 'category-chip'} onClick={() => setVideoTopic(item)}>{item}</button>)}</div><span className="account-note">Links open on YouTube</span></div>
            <div className="video-list">
              {visibleVideos.map((video) => <article className="video-card" key={video.id}>
                <div className="video-play" aria-hidden="true">▶</div>
                <div className="video-content"><div className="video-meta"><span>{video.level}</span><span>{video.creator}</span><span>{video.type}</span></div><h3>{video.title}</h3><p>{video.note}</p><div className="video-actions"><ExternalLink className="card-link" href={video.url}>Watch video <span>↗</span></ExternalLink><ExternalLink className="docs-link" href={video.officialDocs}>Official docs ↗</ExternalLink></div></div>
              </article>)}
              {visibleVideos.length === 0 && <div className="empty-state"><h3>No videos match that filter</h3><button className="button button-primary" onClick={() => setVideoTopic('All videos')}>Show all videos</button></div>}
            </div>
            <div className="verification-note"><span>ⓘ</span><p><b>Resource and content policy.</b> We link to videos instead of rehosting them. These notes are learning aids, not certification material or job guarantees. Use only systems and training environments you are authorised to access.</p></div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top" onClick={(event) => { event.preventDefault(); navigate('resources'); }}><span className="brand-mark">O<span>↗</span></span><span className="brand-name">OpenCyberPath<small>LEARN WITHOUT BARRIERS</small></span></a>
        <p>A learner-built guide to resources that already exist. Learn openly. Practise responsibly. Help the next learner.</p>
        <ExternalLink href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path">Contribute on GitHub ↗</ExternalLink>
        <div className="copyright">Independent community project · External resources belong to their respective providers.</div>
      </footer>
    </div>
  );
}

export default App;
