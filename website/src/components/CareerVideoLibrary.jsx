import { useMemo, useState } from 'react';
import { learningVideos } from '../data/learningVideos.js';
import ResourceHealthStatus from './ResourceHealthStatus.jsx';
import './CareerVideoLibrary.css';

function careerActionLabel(kind) {
  if (kind === 'interactive-lab') return 'Open practice lab';
  if (kind === 'reference') return 'Read official reference';
  if (kind === 'tutorial-hub') return 'Open tutorial hub';
  if (kind === 'video-course') return 'Open video course';
  if (kind === 'video-series') return 'Open video series';
  return 'Watch video';
}
function careerResourceKind(kind) {
  if (kind === 'interactive-lab') return 'INTERACTIVE PRACTICE LAB';
  if (kind === 'reference') return 'OFFICIAL REFERENCE';
  if (kind === 'tutorial-hub') return 'TUTORIAL HUB';
  if (kind === 'video-course') return 'VIDEO COURSE LISTING';
  if (kind === 'video-series') return 'VIDEO SERIES';
  return 'PROVIDER-HOSTED VIDEO';
}
function careerResourceDescription(kind) {
  if (kind === 'interactive-lab') return 'This is an interactive practice activity, not a video. Open the provider page to start the dedicated training instance; stay within that lab scope.';
  if (kind === 'reference') return 'This is an official written reference, not a video. Open it to check the current definitions and defensive recommendations.';
  if (kind === 'tutorial-hub') return 'This is a provider tutorial hub, not one single video. Open it to choose the relevant guide or practice exercise.';
  if (kind === 'video-course') return 'This provider page indexes a video course. Open it in a new tab to launch the original video and verify its current availability.';
  if (kind === 'video-series') return 'This is a provider-hosted video series. Open it in a new tab to select the episode you want to watch.';
  return 'This video is hosted by the original publisher and cannot be embedded here. Open it in a new tab to watch it.';
}

export default function CareerVideoLibrary({ pathId, pathTitle }) {
  const videos = useMemo(() => learningVideos.filter((video) => (video.careerPathIds || []).includes(pathId)), [pathId]);
  const [activeId, setActiveId] = useState('');
  const active = videos.find((video) => video.id === activeId) || videos[0];
  if (!videos.length) return <section className="career-video-library"><p>Videos for this path are being curated. Browse the complete Labs video library in the meantime.</p></section>;
  const playable = active?.youtubeId || active?.embedUrl;
  const playerUrl = active?.youtubeId ? `https://www.youtube-nocookie.com/embed/${active.youtubeId}` : active?.embedUrl;
  return <section className="career-video-library" aria-labelledby="career-video-title">
    <div className="career-video-heading"><div><span className="section-kicker">WATCH · READ · PRACTISE</span><h2 id="career-video-title">Lessons and practice for <em>{pathTitle}.</em></h2><p>Each lesson is selected for this route and paired with a reference or practice idea. Follow the source publisher’s current material, especially for product-version details.</p></div><div className="career-video-count"><b>{videos.length}</b><span>matched resources</span></div></div>
    <div className="career-video-layout">
      <div className="career-video-playlist" role="list" aria-label="Career path video lessons">
        {videos.map((video, index) => <button type="button" role="listitem" key={video.id} className={`career-video-pick ${active.id === video.id ? 'is-active' : ''}`} onClick={() => setActiveId(video.id)}>
          <span className="career-video-index">{String(index + 1).padStart(2, '0')}</span><span className="career-video-pick-copy"><b>{video.title}</b><small>{video.topic} · {video.level} · {video.creator}</small></span><span className="career-video-open-mark">{active.id === video.id ? '●' : '↗'}</span>
        </button>)}
      </div>
      <article className="career-video-feature">
        <div className="career-video-frame">
          {playable ? <iframe src={playerUrl} title={active.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="career-video-external-player"><span>{careerResourceKind(active.contentKind)}</span><b>{active.title}</b><p>{careerResourceDescription(active.contentKind)}</p><a href={active.url} target="_blank" rel="noreferrer">{careerActionLabel(active.contentKind)} ↗</a></div>}
        </div>
        <div className="career-video-feature-copy"><span className="career-video-topic-label">{active.topic.toUpperCase()} · {active.level.toUpperCase()}</span><h3>{active.title}</h3><p>{active.note}</p><ResourceHealthStatus url={active.url} /><div className="career-video-links"><a href={active.url} target="_blank" rel="noreferrer">{careerActionLabel(active.contentKind)} ↗</a>{active.officialDocs && <a className="career-video-docs" href={active.officialDocs} target="_blank" rel="noreferrer">Reference documentation ↗</a>}</div></div>
      </article>
    </div>
    <p className="career-video-footnote">OpenCyberPath links to original publishers and does not rehost their videos. Some lessons may be older or require an account; each card notes important limitations where known.</p>
  </section>;
}
