import { useMemo, useState } from 'react';
import BrandIcon from './BrandIcon.jsx';
import { careerPathLabMap } from '../data/careerPathLabs.js';
import { buildResourceReportUrl } from '../utils/resourceFeedback.js';
import ResourceHealthStatus from './ResourceHealthStatus.jsx';
import './CareerPathLabDirectory.css';

const formats = ['All formats'];
const toneNames = ['cyan', 'violet', 'amber', 'mint', 'blue', 'rose'];

export default function CareerPathLabDirectory({ path }) {
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('All formats');
  const [tier, setTier] = useState('All practice levels');
  const items = careerPathLabMap[path?.id] || [];
  const options = useMemo(() => ['All formats', ...new Set(items.map((item) => item.format))], [items]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const searchable = [item.title, item.provider, item.module, item.objective, item.format, item.access].join(' ').toLowerCase();
      return (!q || searchable.includes(q))
        && (format === 'All formats' || item.format === format)
        && (tier === 'All practice levels' || item.tier === tier);
    });
  }, [items, query, format, tier]);

  if (!items.length) return null;

  return <section className="career-external-labs" aria-labelledby="career-external-labs-title">
    <div className="career-external-labs-heading">
      <div>
        <div className="section-kicker">PATH REQUIREMENTS · EXTERNAL PRACTICE</div>
        <h2 id="career-external-labs-title">Real exercises for <em>this career path.</em></h2>
        <p>These resources map to the modules above. Start with a Core exercise, then choose extensions for deeper practice. Provider access, account rules, and free tiers can change.</p>
      </div>
      <div className="career-external-labs-count"><strong>{items.length}</strong><span>matched resources</span><small>Direct task links where available</small></div>
    </div>

    <div className="career-external-labs-note">
      <span className="career-external-labs-note-mark" aria-hidden="true">i</span>
      <p><b>Before launching:</b> “Hosted browser VM” means the provider supplies an isolated environment; “simulator” means a model of a tool or device; “dataset” and “self-hosted” entries need local tools or a controlled setup. A catalogue link is labelled as such when the provider does not expose a stable direct URL for an individual exercise. Only work inside the assigned lab scope.</p>
    </div>

    <div className="career-external-labs-controls">
      <label className="career-external-labs-search"><span>Search path labs</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, module, provider..." /></label>
      <label><span>Environment</span><select value={format} onChange={(event) => setFormat(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label><span>Practice level</span><select value={tier} onChange={(event) => setTier(event.target.value)}><option>All practice levels</option><option>Core</option><option>Extension</option></select></label>
    </div>

    <div className="career-external-labs-result">Showing <b>{visible.length}</b> of {items.length} path-matched resources.</div>
    <div className="career-external-labs-grid">
      {visible.map((item, index) => <article key={item.id} className={`career-external-lab-card career-external-lab-${toneNames[index % toneNames.length]}`}>
        <div className="career-external-lab-top"><span className="career-external-lab-format">{item.format}</span><span className={`career-external-lab-tier ${item.tier === 'Core' ? 'is-core' : ''}`}>{item.tier === 'Core' ? 'CORE PRACTICE' : 'EXTENSION'}</span></div>
        <div className="career-external-lab-provider"><BrandIcon name={item.provider} url={item.url} size={27} /><span>{item.provider}</span></div>
        <h3>{item.displayTitle || item.title}</h3>
        <p className="career-external-lab-objective">{item.objective}</p>
        <div className="career-external-lab-module"><small>PATH MODULE</small><strong>{item.module}</strong></div>
        <p className="career-external-lab-access"><strong>Access:</strong> {item.access}</p>
        <ResourceHealthStatus url={item.url} />
        <a className="career-external-lab-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.linkLabel}<span aria-hidden="true">↗</span></a>
        <a className="career-external-lab-report" href={buildResourceReportUrl({ id: item.id, title: item.displayTitle || item.title, provider: item.provider, url: item.url, type: item.format })} target="_blank" rel="noopener noreferrer">Report a link or access problem ↗</a>
      </article>)}
    </div>
    {visible.length === 0 && <div className="career-external-labs-empty"><b>No matching exercises.</b><p>Clear the search or choose “All formats” to see the full path list.</p><button type="button" onClick={() => { setQuery(''); setFormat('All formats'); setTier('All practice levels'); }}>Reset filters</button></div>}
    <p className="career-external-labs-footnote">Path mapping is a learning recommendation, not a certification requirement. A hosted VM is not guaranteed to be free or available indefinitely; review the provider’s current access terms before starting.</p>
  </section>;
}
