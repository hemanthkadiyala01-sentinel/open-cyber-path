import { useEffect, useMemo, useState } from 'react';
import './YouTubeLiveLearning.css';

const FEED_URL = `${import.meta.env.BASE_URL || '/'}data/youtube-live-classes.json`;
const STORAGE_KEY = 'opencyberpath-youtube-last-stream-v1';
const LEVELS = [
  { id: 'beginner', label: 'Beginner', terms: ['beginner', 'beginners', 'intro', 'introduction', 'fundamentals', 'basics', '101', 'for beginners', 'starting'] },
  { id: 'intermediate', label: 'Intermediate', terms: ['intermediate', 'hands-on', 'hands on', 'deep dive', 'case study', 'blue team', 'soc analyst', 'siem', 'threat hunting', 'incident response', 'forensics', 'detection engineering'] },
  { id: 'advanced', label: 'Advanced', terms: ['advanced', 'expert', 'research deep dive', 'reverse engineering', 'exploit development', 'advanced forensics'] },
];
const INTENTS = [
  { id: 'foundations', label: 'Cybersecurity foundations', query: 'cybersecurity fundamentals beginner class', terms: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'fundamentals', 'security basics', 'beginner', 'introduction'] },
  { id: 'soc-siem', label: 'SOC, SIEM & blue team', query: 'SOC analyst SIEM blue team live class', terms: ['soc', 'siem', 'blue team', 'security operations', 'sentinel', 'splunk', 'wazuh', 'detection', 'log analysis'] },
  { id: 'networking', label: 'Networking & Wireshark', query: 'networking Wireshark packet analysis live class', terms: ['network', 'networking', 'wireshark', 'packet', 'dns', 'tcp', 'http', 'pcap'] },
  { id: 'incident-response', label: 'Incident response & forensics', query: 'incident response digital forensics live cybersecurity class', terms: ['incident response', 'dfir', 'forensics', 'digital forensics', 'evidence', 'timeline', 'containment'] },
  { id: 'threat-hunting', label: 'Threat hunting & detection', query: 'threat hunting detection engineering live class', terms: ['threat hunting', 'detection engineering', 'threat intelligence', 'sigma', 'yara', 'telemetry', 'hunt'] },
  { id: 'web-app', label: 'Web & application security', query: 'web application security OWASP live class', terms: ['web security', 'application security', 'appsec', 'owasp', 'http', 'api security', 'secure coding'] },
  { id: 'cloud', label: 'Cloud security', query: 'cloud security AWS Azure fundamentals live class', terms: ['cloud security', 'aws', 'azure', 'gcp', 'iam', 'identity', 'cloud'] },
  { id: 'ctf', label: 'Ethical security & CTF learning', query: 'cybersecurity CTF beginner lab walkthrough live class', terms: ['ctf', 'capture the flag', 'ethical hacking', 'authorized lab', 'authorised lab', 'training lab', 'tryhackme', 'hack the box'] },
  { id: 'governance', label: 'GRC, risk & compliance', query: 'cybersecurity governance risk compliance live class', terms: ['grc', 'governance', 'risk', 'compliance', 'iso 27001', 'nist', 'policy', 'audit'] },
];

function getSavedId() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY) || '';
    return /^[A-Za-z0-9_-]{11}$/.test(value) ? value : '';
  } catch { return ''; }
}

function safeYouTubeId(value) {
  return /^[A-Za-z0-9_-]{11}$/.test(String(value || '')) ? String(value) : '';
}

function parseYouTubeId(raw) {
  const input = String(raw || '').trim();
  if (!input) return '';
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  let url;
  try { url = new URL(input.includes('://') ? input : `https://${input}`); } catch { return ''; }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) return '';
  let id = '';
  if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
  else if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
  else {
    const parts = url.pathname.split('/').filter(Boolean);
    if (['live', 'embed', 'shorts', 'v'].includes(parts[0])) id = parts[1] || '';
  }
  return safeYouTubeId(id);
}

function liveSearchUrl(query) {
  const cleaned = String(query || 'cybersecurity').trim() || 'cybersecurity';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleaned)}&sp=EgJAAQ%253D%253D`;
}

function lowerText(video) {
  return `${video.title || ''} ${video.description || ''} ${video.channelTitle || ''} ${(video.topics || []).join(' ')}`.toLowerCase();
}

function scoreVideo(video, levelId, intent, customIntent) {
  const text = lowerText(video);
  let score = 0;
  let topicHits = 0;
  for (const term of intent.terms) {
    if (text.includes(term)) { score += term.includes(' ') ? 4 : 2; topicHits += 1; }
  }
  const level = LEVELS.find((item) => item.id === levelId);
  if (level) {
    const hasLevelSignal = level.terms.some((term) => text.includes(term));
    if (hasLevelSignal) score += 4;
    const contrary = LEVELS.filter((item) => item.id !== levelId).some((item) => item.terms.some((term) => text.includes(term)));
    if (contrary && !hasLevelSignal) score -= 1;
  }
  const customTerms = String(customIntent || '').toLowerCase().match(/[a-z0-9+#.-]{3,}/g) || [];
  let customHits = 0;
  for (const term of new Set(customTerms)) {
    if (text.includes(term)) { score += 3; customHits += 1; }
  }
  if (video.liveStartedAt) score += 1;
  return { score, topicHits, customHits };
}

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatElapsed(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatViewerCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? new Intl.NumberFormat().format(count) : '';
}

function levelSignal(video, selectedLevel) {
  const text = lowerText(video);
  const chosen = LEVELS.find((item) => item.id === selectedLevel);
  if (chosen?.terms.some((term) => text.includes(term))) return `${chosen.label.toLowerCase()} signal in title/details`;
  for (const level of LEVELS) {
    if (level.terms.some((term) => text.includes(term))) return `${level.label.toLowerCase()} signal in title/details`;
  }
  return 'Level not stated by creator';
}

export default function YouTubeLiveLearning() {
  const [feed, setFeed] = useState(null);
  const [feedError, setFeedError] = useState('');
  const [loading, setLoading] = useState(true);
  const [levelId, setLevelId] = useState('beginner');
  const [intentId, setIntentId] = useState('foundations');
  const [customIntent, setCustomIntent] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState(() => getSavedId());
  const [manualInput, setManualInput] = useState(() => getSavedId());
  const [manualError, setManualError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const intent = INTENTS.find((item) => item.id === intentId) || INTENTS[0];
  const isNative = Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());

  useEffect(() => {
    let active = true;
    const loadFeed = async (quiet = false) => {
      if (!quiet && active) setLoading(true);
      try {
        const response = await fetch(FEED_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Live-class feed returned ${response.status}`);
        const payload = await response.json();
        if (!payload || !Array.isArray(payload.results)) throw new Error('Live-class feed format is not recognised');
        if (active) {
          setFeed(payload);
          setFeedError('');
        }
      } catch {
        if (active) setFeedError('The latest saved live-class index could not be loaded. Use the direct YouTube live search below while the index reconnects.');
      } finally {
        if (active && !quiet) setLoading(false);
      }
    };
    void loadFeed(false);
    const interval = window.setInterval(() => { void loadFeed(true); }, 5 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [refreshKey]);

  useEffect(() => {
    try {
      if (selectedVideoId) window.localStorage.setItem(STORAGE_KEY, selectedVideoId);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* The embedded player remains usable if storage is unavailable. */ }
  }, [selectedVideoId]);

  const rankedVideos = useMemo(() => {
    const rows = Array.isArray(feed?.results) ? feed.results : [];
    return rows
      .filter((video) => safeYouTubeId(video.videoId) && video.url && /^https:\/\/www\.youtube\.com\//.test(video.url))
      .map((video) => ({ ...video, relevance: scoreVideo(video, levelId, intent, customIntent) }))
      .sort((a, b) => b.relevance.score - a.relevance.score || (Number(b.concurrentViewers) || 0) - (Number(a.concurrentViewers) || 0) || String(b.liveStartedAt || '').localeCompare(String(a.liveStartedAt || '')));
  }, [feed, levelId, intent, customIntent]);

  const liveSearchQuery = [intent.query, customIntent.trim(), levelId === 'beginner' ? 'beginner friendly' : levelId === 'intermediate' ? 'intermediate' : 'advanced'].filter(Boolean).join(' ');
  const feedStatus = feed?.status || 'unavailable';
  const snapshotAgeMinutes = feed?.generatedAt ? Math.floor((Date.now() - new Date(feed.generatedAt).getTime()) / 60000) : null;
  const snapshotIsOld = Number.isFinite(snapshotAgeMinutes) && snapshotAgeMinutes > 90;

  const reloadIndex = () => {
    setRefreshKey((value) => value + 1);
  };

  const loadSpecificVideo = (event) => {
    event.preventDefault();
    const videoId = parseYouTubeId(manualInput);
    if (!videoId) {
      setManualError('Paste a valid YouTube video/live URL or an 11-character video ID.');
      return;
    }
    setSelectedVideoId(videoId);
    setManualInput(videoId);
    setManualError('');
  };

  const clearPlayer = () => {
    setSelectedVideoId('');
    setManualInput('');
    setManualError('');
  };

  return <section className="yt-learning-page" aria-labelledby="yt-learning-title">
    <header className="yt-learning-hero">
      <div className="yt-learning-hero-copy">
        <span className="yt-learning-kicker"><span className="yt-live-dot" /> LIVE CLASSES · CYBERSECURITY</span>
        <h1 id="yt-learning-title">Find a class that is <em>live right now.</em></h1>
        <p>Choose your current level and what you want to learn. OpenCyberPath ranks active YouTube broadcasts around that goal, with a direct YouTube search for the freshest results.</p>
        <div className="yt-hero-actions">
          <a className="yt-action-primary" href={liveSearchUrl(liveSearchQuery)} target="_blank" rel="noreferrer">Search live on YouTube <span aria-hidden="true">↗</span></a>
          <button className="yt-action-secondary" type="button" onClick={reloadIndex} disabled={loading}>{loading ? 'Loading index…' : 'Reload live index'}</button>
        </div>
      </div>
      <div className="yt-learning-badge"><span aria-hidden="true">▶</span><strong>LIVE NOW</strong><small>YouTube broadcasts</small></div>
    </header>

    <section className="yt-live-finder" aria-labelledby="yt-finder-title">
      <div className="yt-section-head">
        <div><span className="yt-learning-kicker">PERSONALISED DISCOVERY</span><h2 id="yt-finder-title">What are you learning today?</h2></div>
        <p>Topic and level are matching hints from public titles and descriptions, not verified course ratings. Open each stream to confirm its content and that it is still live.</p>
      </div>
      <div className="yt-filter-grid">
        <label className="yt-filter-field"><span>Your level</span><select value={levelId} onChange={(event) => setLevelId(event.target.value)}><option value="beginner">Beginner — start from the basics</option><option value="intermediate">Intermediate — build practical skills</option><option value="advanced">Advanced — deeper technical sessions</option></select></label>
        <label className="yt-filter-field"><span>Topic / intent</span><select value={intentId} onChange={(event) => setIntentId(event.target.value)}>{INTENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="yt-filter-field yt-custom-intent"><span>Describe your goal (optional)</span><input value={customIntent} onChange={(event) => setCustomIntent(event.target.value.slice(0, 120))} placeholder="e.g. understand SIEM alerts, DNS, or incident timelines" maxLength={120} /></label>
      </div>
      <div className="yt-live-summary" aria-live="polite">
        <div><span className="yt-live-dot" /><strong>{rankedVideos.length} live {rankedVideos.length === 1 ? 'class' : 'classes'} in the saved index</strong><span className="yt-summary-subtext">Filtered for {levelId} · {intent.label}</span></div>
        <a href={liveSearchUrl(liveSearchQuery)} target="_blank" rel="noreferrer">Search this goal on YouTube ↗</a>
      </div>

      {loading && !feed && <div className="yt-feed-state" role="status"><span className="yt-state-spinner" /> Loading the latest saved live-class index…</div>}
      {feedError && <div className="yt-feed-state is-warning" role="status">{feedError}</div>}
      {!loading && feedStatus === 'not-configured' && <div className="yt-feed-state is-warning"><strong>Automatic live indexing needs setup.</strong><span>The schedule is included, but it needs the repository’s YOUTUBE_API_KEY Actions secret and YouTube Data API v3 enabled. The direct YouTube live search above works without this site-side index.</span></div>}
      {!loading && feedStatus === 'error' && <div className="yt-feed-state is-warning"><strong>The most recent scheduled search failed.</strong><span>{feed?.note || 'Try the direct YouTube live search to check currently available classes.'}</span></div>}
      {!loading && feedStatus === 'stale' && <div className="yt-feed-state is-warning"><strong>Showing the last successful snapshot.</strong><span>The last refresh failed. Confirm the live badge on YouTube before joining.</span></div>}
      {!loading && feed && rankedVideos.length === 0 && !['not-configured', 'error', 'stale'].includes(feedStatus) && <div className="yt-feed-state"><strong>No matching active streams in the saved snapshot.</strong><span>Live sessions come and go. Use the direct search to query YouTube for the selected topic right now, or try a broader topic.</span><a className="yt-action-primary" href={liveSearchUrl(liveSearchQuery)} target="_blank" rel="noreferrer">Find live classes on YouTube ↗</a></div>}
      {snapshotIsOld && <p className="yt-stale-note">The saved snapshot is over 90 minutes old. The scheduled job may be delayed; use the direct YouTube search to confirm current availability.</p>}

      {rankedVideos.length > 0 && <div className="yt-live-grid">
        {rankedVideos.map((video, index) => <article className={`yt-live-card ${index === 0 ? 'is-top-match' : ''}`} key={video.videoId}>
          <a className="yt-live-thumbnail" href={video.url} target="_blank" rel="noreferrer" aria-label={`Open ${video.title} on YouTube`}>
            <img src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="yt-card-live-pill"><span className="yt-live-dot" /> LIVE NOW</span>
            {Number(video.concurrentViewers) > 0 && <span className="yt-card-viewers">{formatViewerCount(video.concurrentViewers)} watching</span>}
          </a>
          <div className="yt-live-card-body">
            {index === 0 && video.relevance.score > 0 && <span className="yt-match-badge">TOP MATCH FOR YOUR GOAL</span>}
            <h3><a href={video.url} target="_blank" rel="noreferrer">{video.title}</a></h3>
            <p className="yt-live-channel">{video.channelTitle || 'YouTube channel'}{video.liveStartedAt ? ` · Live ${formatElapsed(video.liveStartedAt)}` : ''}</p>
            <p className="yt-live-description">{video.description || 'No description was provided in the live listing.'}</p>
            <div className="yt-live-meta"><span>{levelSignal(video, levelId)}</span>{video.snapshotTopic && <span>{video.snapshotTopic}</span>}</div>
            <div className="yt-live-card-actions">
              <button className="yt-action-primary" type="button" onClick={() => { setSelectedVideoId(video.videoId); setManualInput(video.videoId); setManualError(''); }}>Watch here</button>
              <a className="yt-action-secondary" href={video.url} target="_blank" rel="noreferrer">YouTube ↗</a>
            </div>
          </div>
        </article>)}
      </div>}

      <footer className="yt-feed-footnote">
        <span>{feed?.generatedAt ? `Snapshot last changed: ${formatTimestamp(feed.generatedAt)}` : 'No successful live-class snapshot has been published yet.'}</span>
        <span>Automation checks approximately every 30 minutes when GitHub Actions and the YouTube API are available. A scheduled scan is not a guarantee that every live stream is found.</span>
      </footer>
    </section>

    {selectedVideoId && <section className="yt-selected-player" aria-labelledby="yt-player-title" id="yt-selected-player">
      <div className="yt-panel-heading"><div><span className="yt-learning-kicker">CURRENT SESSION</span><h2 id="yt-player-title">Watch your selected class</h2></div><button className="yt-action-secondary" type="button" onClick={clearPlayer}>Close player</button></div>
      {isNative ? <div className="yt-player-empty"><h3>Open this class in YouTube</h3><p>For the best compatibility in the Android app, open the original live stream in YouTube.</p><a className="yt-action-primary" href={`https://www.youtube.com/watch?v=${selectedVideoId}`} target="_blank" rel="noreferrer">Open stream ↗</a></div> : <div className="yt-player-frame"><iframe title="Selected live cybersecurity class" src={`https://www.youtube-nocookie.com/embed/${selectedVideoId}?rel=0&playsinline=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
      <p className="yt-rights-note">Video playback is served by YouTube. If the creator disables embedding or the broadcast ends, open the original YouTube page to check availability.</p>
    </section>}

    <section className="yt-manual-section" aria-labelledby="yt-manual-title">
      <div className="yt-panel-heading"><div><span className="yt-learning-kicker">DIRECT LINK</span><h2 id="yt-manual-title">Have a class link already?</h2></div><span className="yt-local-badge">Saved only on this device</span></div>
      <form className="yt-stream-form" onSubmit={loadSpecificVideo}>
        <label className="yt-stream-input"><span>YouTube URL or video ID</span><input value={manualInput} onChange={(event) => setManualInput(event.target.value)} placeholder="Paste a youtube.com/live/... link" autoComplete="url" /></label>
        <button className="yt-action-primary" type="submit">Load link <span aria-hidden="true">↗</span></button>
        {selectedVideoId && <button className="yt-action-secondary" type="button" onClick={clearPlayer}>Clear</button>}
      </form>
      {manualError && <p className="yt-input-error" role="alert">{manualError}</p>}
      <p className="yt-rights-note">Use public classes and authorised training demonstrations. The index does not verify the creator’s identity, the quality of instruction, or the safety of every technique shown.</p>
    </section>
  </section>;
}
