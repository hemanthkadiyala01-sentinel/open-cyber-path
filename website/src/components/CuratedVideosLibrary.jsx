import { useMemo, useState } from 'react';
import { learningVideos } from '../data/learningVideos.js';
import ResourceHealthStatus from './ResourceHealthStatus.jsx';
import './CuratedVideosLibrary.css';

function topicLabel(topic) { return String(topic || '').replace(/&/g, '&'); }
function learningActionLabel(kind) {
  if (kind === 'interactive-lab') return 'Open practice lab';
  if (kind === 'reference') return 'Read official reference';
  if (kind === 'tutorial-hub') return 'Open tutorial hub';
  if (kind === 'video-course') return 'Open video course';
  if (kind === 'video-series') return 'Open video series';
  return 'Watch video';
}
export default function CuratedVideosLibrary() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All concepts');
  const [level, setLevel] = useState('All levels');
  const topics = useMemo(() => [...new Set(learningVideos.map((video) => video.topic))].sort(), []);
  const visible = useMemo(() => learningVideos.filter((video) => {
    const haystack = `${video.title} ${video.creator} ${video.topic} ${video.note}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
      (topic === 'All concepts' || video.topic === topic) &&
      (level === 'All levels' || video.level === level);
  }), [query, topic, level]);
  return <section className="ocp-curated-video-library" aria-labelledby="ocp-curated-videos-title">
    <div className="ocp-curated-video-heading">
      <div><span className="section-kicker">CONCEPT-SPECIFIC VIDEO & PRACTICE LIBRARY</span><h2 id="ocp-curated-videos-title">Watch the concept. <em>Then practise it.</em></h2><p>Original video and training resources from established publishers, matched to concepts and career paths. Check the provider's current guidance before following version-specific setup instructions.</p></div>
      <div className="ocp-curated-video-count"><b>{learningVideos.length}</b><span>curated resources</span><small>{topics.length} concept groups</small></div>
    </div>
    <div className="ocp-video-controls">
      <label><span>Search lessons</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concept, tool, or creator…" /></label>
      <label><span>Concept</span><select value={topic} onChange={(event) => setTopic(event.target.value)}><option>All concepts</option>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Level</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <span className="ocp-video-results">Showing <b>{visible.length}</b> learning resources</span>
    </div>
    <div className="ocp-curated-video-grid">
      {visible.map((video) => <article className="ocp-curated-video-card" key={video.id}>
        <div className="ocp-curated-video-art"><span>▶</span><small>{video.level.toUpperCase()}</small></div>
        <div className="ocp-curated-video-content"><span className="ocp-curated-topic">{topicLabel(video.topic)}</span><h3>{video.title}</h3><div className="ocp-curated-video-byline">{video.creator} · {video.type}</div><ResourceHealthStatus url={video.url} /><p>{video.note}</p>
          <div className="ocp-curated-video-actions"><a href={video.url} target="_blank" rel="noreferrer">{learningActionLabel(video.contentKind)} <span>↗</span></a>{video.officialDocs && <a className="ocp-curated-docs" href={video.officialDocs} target="_blank" rel="noreferrer">Reference docs ↗</a>}</div>
        </div>
      </article>)}
      {visible.length === 0 && <div className="ocp-video-no-results"><h3>No matching lessons</h3><p>Try a broader topic or clear the search.</p><button type="button" onClick={() => { setQuery(''); setTopic('All concepts'); setLevel('All levels'); }}>Reset filters</button></div>}
    </div>
    <p className="ocp-video-disclaimer">Availability and access terms belong to the original publisher. Some listed pages are provider-hosted video hubs or course pages rather than a single YouTube clip; they are labelled as such. OpenCyberPath does not mirror or re-upload the videos.</p>
  </section>;
}
