import { useEffect, useState } from 'react';
import './YouTubeLiveLearning.css';

const STORAGE_KEY = 'opencyberpath-youtube-last-stream-v1';
const TOPIC_SEARCHES = [
  { title: 'Security briefings & threat trends', description: 'Look for recent talks from recognised security organisations and researchers.', query: 'official cybersecurity security briefing live stream' },
  { title: 'SOC, SIEM & detection engineering', description: 'Build defensive monitoring skills and learn how analysts explain evidence.', query: 'SOC analyst SIEM detection engineering defensive tutorial' },
  { title: 'Incident response & digital forensics', description: 'Learn timelines, evidence preservation, containment, and incident reporting.', query: 'incident response digital forensics educational webinar' },
  { title: 'Networking & packet analysis', description: 'Strengthen the foundations behind logs, DNS, HTTP, and network telemetry.', query: 'networking fundamentals Wireshark packet analysis lesson' },
  { title: 'Safe CTF & lab learning', description: 'Choose legal training environments and authorised practice walkthroughs.', query: 'beginner cybersecurity CTF walkthrough training lab' },
  { title: 'Cloud & application security', description: 'Explore secure configuration, identity, and common application risks.', query: 'cloud security application security educational talk' },
];

function parseYouTubeId(raw) {
  const input = String(raw || '').trim();
  if (!input) return '';
  // Allow an 11-character YouTube video ID, or a standard YouTube URL only.
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
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
}

function getSavedId() {
  try {
    const id = window.localStorage.getItem(STORAGE_KEY) || '';
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch { return ''; }
}

function searchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export default function YouTubeLiveLearning() {
  const [input, setInput] = useState(() => getSavedId());
  const [videoId, setVideoId] = useState(() => getSavedId());
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    try {
      if (videoId) window.localStorage.setItem(STORAGE_KEY, videoId);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* Local persistence is optional. */ }
  }, [videoId]);

  useEffect(() => { setShowChat(false); }, [videoId]);

  const isNative = Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  const hostname = window.location.hostname;
  const isLocalHost = !hostname || ['localhost', '127.0.0.1', '::1'].includes(hostname);
  const isMobileBrowser = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const canEmbedChat = Boolean(videoId && !isNative && !isLocalHost && !isMobileBrowser);
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/live';
  const chatUrl = videoId && canEmbedChat ? `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${encodeURIComponent(hostname)}` : watchUrl;

  const loadStream = (event) => {
    event.preventDefault();
    const id = parseYouTubeId(input);
    if (!id) {
      setError('Paste a standard YouTube video/live URL or an 11-character video ID.');
      setShowChat(false);
      return;
    }
    setVideoId(id);
    setInput(id);
    setError('');
    setShowChat(false);
  };

  const clearStream = () => {
    setVideoId('');
    setInput('');
    setError('');
    setShowChat(false);
  };

  return <section className="yt-learning-page" aria-labelledby="yt-learning-title">
    <div className="yt-learning-hero">
      <div className="yt-learning-hero-copy">
        <span className="yt-learning-kicker">LIVE LEARNING · YOUTUBE</span>
        <h1 id="yt-learning-title">Watch together.<br /><em>Learn in real time.</em></h1>
        <p>Load a public YouTube stream or lesson, watch it in OpenCyberPath, then join the creator's conversation on YouTube. Chat availability is controlled by the creator and YouTube.</p>
      </div>
      <div className="yt-learning-badge"><span aria-hidden="true">▶</span><strong>LEARN LIVE</strong><small>Official YouTube player</small></div>
    </div>

    <section className="yt-stream-panel" aria-label="Load a YouTube stream">
      <div className="yt-panel-heading"><div><span className="yt-learning-kicker">STREAM PLAYER</span><h2>Open a live session or lesson</h2></div><span className="yt-local-badge">Last stream saved on this device</span></div>
      <form className="yt-stream-form" onSubmit={loadStream}>
        <label className="yt-stream-input"><span>YouTube URL or video ID</span><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste a youtube.com/live/... link" autoComplete="url" /></label>
        <button className="yt-action-primary" type="submit">Load video <span aria-hidden="true">↗</span></button>
        {videoId && <button className="yt-action-secondary" type="button" onClick={clearStream}>Clear</button>}
      </form>
      {error && <p className="yt-input-error" role="alert">{error}</p>}
      {videoId ? <div className="yt-player-layout">
        <div className="yt-player-frame"><iframe title="YouTube cybersecurity learning video" src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        <aside className="yt-player-side">
          <span className="yt-learning-kicker">SESSION CONTROLS</span>
          <h3>Keep the learning active</h3>
          <p>Write a question, note a new concept, or pause to try the idea in a permitted lab. A stream being available does not mean every technique shown is suitable for use on real systems.</p>
          <a className="yt-action-primary yt-wide-action" href={watchUrl} target="_blank" rel="noreferrer">Open on YouTube <span aria-hidden="true">↗</span></a>
          {canEmbedChat ? <button type="button" className="yt-action-secondary yt-wide-action" onClick={() => setShowChat((shown) => !shown)}>{showChat ? 'Hide embedded live chat' : 'Show live chat here'}</button> : <a className="yt-action-secondary yt-wide-action" href={watchUrl} target="_blank" rel="noreferrer">Open stream & chat in YouTube</a>}
          <small className="yt-chat-note">Embedded chat is offered only on a supported desktop website with a matching public hostname. On mobile or in the Android app, open YouTube to use its live chat.</small>
        </aside>
        {showChat && canEmbedChat && <div className="yt-live-chat-frame"><div className="yt-chat-heading"><strong>YouTube live chat</strong><a href={chatUrl} target="_blank" rel="noreferrer">Open chat in a new tab ↗</a></div><iframe title="YouTube live chat" src={chatUrl} referrerPolicy="strict-origin-when-cross-origin" /></div>}
      </div> : <div className="yt-player-empty"><div className="yt-play-symbol" aria-hidden="true">▶</div><h3>Your stream appears here</h3><p>Paste a YouTube live URL or video link above. We'll validate the video ID before embedding it.</p><a href="https://www.youtube.com/live" target="_blank" rel="noreferrer">Browse YouTube Live ↗</a></div>}
      <p className="yt-rights-note">The video and chat are served by YouTube; OpenCyberPath does not host their content or collect chat messages. Some videos do not allow embedding, and some live streams have chat disabled or restricted. If embedding fails, open the original YouTube page.</p>
    </section>

    <section className="yt-topic-section" aria-labelledby="yt-topic-title">
      <div className="yt-section-head"><div><span className="yt-learning-kicker">FIND SOMETHING USEFUL</span><h2 id="yt-topic-title">Learning topics to explore</h2></div><p>These links run a fresh YouTube search when opened. They are discovery links, not a claim that every result is current or independently reviewed.</p></div>
      <div className="yt-topic-grid">
        {TOPIC_SEARCHES.map((topic) => <article className="yt-topic-card" key={topic.title}>
          <span className="yt-topic-symbol" aria-hidden="true">▶</span><h3>{topic.title}</h3><p>{topic.description}</p><a href={searchUrl(topic.query)} target="_blank" rel="noreferrer">Find videos & streams <span aria-hidden="true">↗</span></a>
        </article>)}
      </div>
      <div className="yt-practice-note"><strong>Practice safely</strong><p>Use demonstrations to understand ideas, not to test unrelated public systems. Keep hands-on work inside your own lab or a training environment that explicitly authorises the activity. Check the creator, publication date, references and applicable version before relying on a lesson.</p></div>
    </section>
  </section>;
}
