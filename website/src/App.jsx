import { useMemo, useState } from 'react';
import { categories, resources } from './data/resources.js';

const icons = {
  'SOC & SIEM': '◈',
  'Detection Engineering': '⌘',
  'Hands-on Labs': '◎',
  'Web Security': '⌁',
  'Foundations': '↗',
};

function App() {
  const [page, setPage] = useState('resources');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All resources');
  const [cost, setCost] = useState('All access types');
  const [level, setLevel] = useState('All levels');

  const visibleResources = useMemo(() => resources.filter((r) => {
    const searchable = `${r.name} ${r.provider} ${r.category} ${r.description} ${r.skills.join(' ')}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All resources' || r.category === category;
    const matchesCost = cost === 'All access types' || r.kind.toLowerCase().includes(cost.toLowerCase());
    const matchesLevel = level === 'All levels' || r.level.includes(level);
    return matchesQuery && matchesCategory && matchesCost && matchesLevel;
  }), [query, category, cost, level]);

  const goResources = () => {
    setPage('resources');
    document.getElementById('resource-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => setPage('resources')} aria-label="OpenCyberPath home">
          <span className="brand-mark">O<span>↗</span></span>
          <span className="brand-name">OpenCyberPath<small>LEARN WITHOUT BARRIERS</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <button className={page === 'resources' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('resources')}>Resources</button>
          <button className={page === 'roadmap' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('roadmap')}>Career roadmap</button>
          <a className="nav-github" href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY-BUILT · FREE TO EXPLORE</div>
            <h1>Your cybersecurity<br /><em>journey starts here.</em></h1>
            <p className="hero-copy">Find trusted learning resources, hands-on labs, and career roadmaps from across the web. Spend less time searching. Spend more time learning.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={goResources}>Explore free resources <span>→</span></button>
              <button className="button button-quiet" onClick={() => setPage('roadmap')}>View SOC roadmap <span>↗</span></button>
            </div>
            <div className="hero-note"><span>✳</span> Built by learners, for learners. No paid course required to get started.</div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-large"><div className="orb-inner"><span>OPEN</span><strong>CYBER</strong><span>PATH / 001</span></div></div>
            <div className="float-card float-top"><span className="mini-symbol">⌘</span><span>LEARN<br /><b>Detection</b></span></div>
            <div className="float-card float-bottom"><span className="status-dot"/><span>YOUR NEXT STEP<br /><b>Build a skill</b></span></div>
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          </div>
        </section>

        <section className="value-strip" aria-label="Platform principles">
          <div><span className="value-icon">✳</span><span><b>Free to explore</b><small>Clear access and cost labels</small></span></div>
          <div><span className="value-icon">⌁</span><span><b>Learn by doing</b><small>Courses, labs and projects</small></span></div>
          <div><span className="value-icon">↗</span><span><b>Find your direction</b><small>Roadmaps for real skills</small></span></div>
        </section>

        {page === 'resources' ? (
          <section className="explorer section-wrap" id="resource-explorer">
            <div className="section-heading">
              <div><div className="section-kicker">THE RESOURCE LIBRARY</div><h2>Good resources.<br /><em>All in one place.</em></h2></div>
              <p>Explore official documentation, free learning, open-source tools and practical labs. We link to the original providers and explain access limits.</p>
            </div>

            <div className="search-row">
              <label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills, tools, topics…" aria-label="Search resources" /><kbd>⌘ K</kbd></label>
              <label className="select-wrap"><span className="sr-only">Access type</span><select value={cost} onChange={(e) => setCost(e.target.value)}><option>All access types</option><option>Free</option><option>Open source</option><option>Free tier</option></select></label>
              <label className="select-wrap"><span className="sr-only">Skill level</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            </div>

            <div className="category-row" role="group" aria-label="Filter by category">
              {categories.map((c) => <button key={c} className={category === c ? 'category-chip chosen' : 'category-chip'} onClick={() => setCategory(c)}>{c === 'All resources' ? '✳' : icons[c]} <span>{c}</span></button>)}
            </div>

            <div className="results-caption"><span><b>{visibleResources.length}</b> resources to explore</span><span>External links open the original provider ↗</span></div>
            <div className="resource-grid">
              {visibleResources.map((resource) => <article key={resource.id} className="resource-card">
                <div className="card-top"><span className="provider-mark">{icons[resource.category] || '✳'}</span><span className="level-label">{resource.level}</span></div>
                <div className="card-category">{resource.category}</div>
                <h3>{resource.name}</h3>
                <div className="provider-name">BY {resource.provider.toUpperCase()}</div>
                <p className="card-description">{resource.description}</p>
                <div className="skill-tags">{resource.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
                <div className="access-line"><span className={resource.kind.toLowerCase().includes('open source') ? 'access-badge open' : resource.kind.toLowerCase().includes('free tier') || resource.kind.toLowerCase().includes('varies') ? 'access-badge limited' : 'access-badge'}>{resource.kind}</span><span className="account-note">{resource.account}</span></div>
                <p className="resource-note">{resource.note}</p>
                <a className="card-link" href={resource.url} target="_blank" rel="noreferrer">Explore resource <span>↗</span></a>
              </article>)}
            </div>
            {visibleResources.length === 0 && <div className="empty-state"><span>⌕</span><h3>No matching resources yet</h3><p>Try a different search or remove one of the filters.</p><button className="button button-primary" onClick={() => {setQuery('');setCategory('All resources');setCost('All access types');setLevel('All levels');}}>Clear filters</button></div>}
            <div className="verification-note"><span>ⓘ</span><p><b>Access can change.</b> Some providers offer free tiers alongside paid features. Always check the official provider's current terms before signing up. Last-reviewed dates will be added as this directory grows.</p></div>
          </section>
        ) : (
          <section className="section-wrap roadmap-section">
            <div className="section-heading">
              <div><div className="section-kicker">YOUR FIRST CAREER PATH</div><h2>From beginner to<br /><em>SOC Analyst.</em></h2></div>
              <p>A suggested learning sequence—not a job guarantee. Learn the fundamentals, practise investigations, then build evidence of what you can do.</p>
            </div>
            <div className="roadmap-intro"><span className="roadmap-icon">↗</span><div><b>Keep it practical, keep it free.</b><p>Follow each stage at your own pace. Use free documentation, sample events and local labs before considering paid training.</p></div></div>
            <div className="roadmap-list">
              {[
                ['01','Build foundations','Networking, TCP/IP, DNS, Windows, Linux, processes and permissions.','Learn what normal system activity looks like.'],
                ['02','Understand logs','Windows Event Viewer, Linux authentication logs, timestamps, users, hosts and JSON.','Explain what happened from the event fields.'],
                ['03','Learn SIEM basics','Explore event ingestion, searches, filters, rules, dashboards and alerts with Wazuh or Splunk learning materials.','Find a specific event and explain a detection.'],
                ['04','Practise alert triage','Review source evidence, consider benign explanations, and record what is known versus uncertain.','Write a clear investigation note.'],
                ['05','Test detections','Create rules, use benign and suspicious samples, and evaluate false positives and missed detections.','Publish a reproducible detection report.'],
                ['06','Build a portfolio','Document a lab, evidence, tests, limitations and lessons learned. Compare your skills with real entry-level job descriptions.','Explain your choices in an interview.'],
              ].map((stage) => <article className="roadmap-stage" key={stage[0]}><div className="stage-number">{stage[0]}</div><div className="stage-main"><h3>{stage[1]}</h3><p>{stage[2]}</p><span className="stage-outcome">OUTCOME: {stage[3]}</span></div><span className="stage-arrow">↗</span></article>)}
            </div>
            <div className="roadmap-footer"><span>Remember</span> Completing a roadmap does not guarantee employment. Use it to plan your learning, build practical evidence, and identify your next skill gap.</div>
            <button className="button button-primary" onClick={() => {setPage('resources');setTimeout(() => document.getElementById('resource-explorer')?.scrollIntoView({behavior:'smooth'}), 50);}}>Find resources for your roadmap <span>→</span></button>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top" onClick={() => setPage('resources')}><span className="brand-mark">O<span>↗</span></span><span className="brand-name">OpenCyberPath<small>LEARN WITHOUT BARRIERS</small></span></a>
        <p>A learner-built guide to resources that already exist. Learn openly. Practise responsibly. Help the next learner.</p>
        <a href="https://github.com/hemanthkadiyala01-sentinel/open-cyber-path" target="_blank" rel="noreferrer">Contribute on GitHub ↗</a>
        <div className="copyright">Independent community project · External resources belong to their respective providers.</div>
      </footer>
    </div>
  );
}

export default App;
