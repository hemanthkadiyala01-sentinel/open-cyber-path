import { useEffect, useMemo, useState } from 'react';
import './YouTubeLiveLearning.css';

const LOCAL_FEED_URL = `${import.meta.env.BASE_URL || '/'}data/youtube-live-classes.json`;
const REMOTE_FEED_URL = 'https://raw.githubusercontent.com/hemanthkadiyala01-sentinel/open-cyber-path/main/website/public/data/youtube-live-classes.json';

async function fetchLiveFeed() {
  const candidates = [
    { url: REMOTE_FEED_URL, source: 'online GitHub snapshot' },
    { url: LOCAL_FEED_URL, source: 'bundled offline snapshot' },
  ];
  let lastError = null;
  for (const candidate of candidates) {
    try {
      const separator = candidate.url.includes('?') ? '&' : '?';
      const response = await fetch(`${candidate.url}${separator}ocp_refresh=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.results)) throw new Error('Feed format is not recognised');
      return { payload, source: candidate.source };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No live-class feed source is available');
}
const STORAGE_KEY = 'opencyberpath-youtube-last-stream-v1';
const LEVELS = [
  { id: 'beginner', label: 'Beginner', terms: ['beginner', 'beginners', 'intro', 'introduction', 'fundamentals', 'basics', '101', 'for beginners', 'starting'] },
  { id: 'intermediate', label: 'Intermediate', terms: ['intermediate', 'hands-on', 'hands on', 'deep dive', 'case study', 'blue team', 'soc analyst', 'siem', 'threat hunting', 'incident response', 'forensics', 'detection engineering'] },
  { id: 'advanced', label: 'Advanced', terms: ['advanced', 'expert', 'research deep dive', 'reverse engineering', 'exploit development', 'advanced forensics'] },
];
const INTENTS = [
  { id: 'foundations', label: 'Cybersecurity foundations & awareness', query: 'cybersecurity basics', terms: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'fundamentals', 'security basics', 'beginner', 'introduction', 'awareness'] },
  { id: 'programming-linux', label: 'Linux, Windows & programming basics', query: 'Linux Windows security fundamentals', terms: ['linux', 'windows', 'bash', 'powershell', 'python', 'scripting', 'hardening', 'system administration'] },
  { id: 'networking', label: 'Networking, DNS & Wireshark', query: 'network security Wireshark packet analysis', terms: ['network', 'networking', 'wireshark', 'packet', 'dns', 'tcp', 'http', 'pcap', 'firewall'] },
  { id: 'ethical-hacking', label: 'Ethical hacking & authorised testing', query: 'ethical hacking authorised lab', terms: ['ethical hacking', 'authorized testing', 'authorised testing', 'penetration testing', 'red team', 'purple team', 'security lab'] },
  { id: 'pentest-labs', label: 'Penetration-testing education & lab demos', query: 'penetration testing authorised training lab', terms: ['penetration testing', 'pentest', 'training lab', 'authorized lab', 'authorised lab', 'web assessment'] },
  { id: 'bug-bounty', label: 'Bug bounty & responsible disclosure', query: 'bug bounty responsible disclosure', terms: ['bug bounty', 'responsible disclosure', 'vulnerability disclosure', 'hackerone', 'bugcrowd', 'reporting'] },
  { id: 'web-app', label: 'Web & application security', query: 'web application security OWASP', terms: ['web security', 'application security', 'appsec', 'owasp', 'secure coding', 'authentication', 'authorization'] },
  { id: 'api-security', label: 'API security', query: 'API security defensive testing', terms: ['api security', 'api testing', 'oauth', 'jwt', 'web api', 'rate limiting'] },
  { id: 'ctf', label: 'CTFs & authorised practice labs', query: 'cybersecurity CTF training lab', terms: ['ctf', 'capture the flag', 'authorized lab', 'authorised lab', 'training lab', 'tryhackme', 'hack the box'] },
  { id: 'soc-siem', label: 'SOC, SIEM & blue team', query: 'SOC SIEM blue team security operations', terms: ['soc', 'siem', 'blue team', 'security operations', 'sentinel', 'splunk', 'wazuh', 'detection', 'log analysis'] },
  { id: 'threat-hunting', label: 'Threat hunting & detection engineering', query: 'threat hunting detection engineering', terms: ['threat hunting', 'detection engineering', 'threat intelligence', 'sigma', 'yara', 'telemetry', 'hunt'] },
  { id: 'incident-response', label: 'Incident response & digital forensics', query: 'incident response digital forensics cybersecurity', terms: ['incident response', 'dfir', 'forensics', 'digital forensics', 'evidence', 'timeline', 'containment'] },
  { id: 'malware-analysis', label: 'Defensive malware analysis & reverse engineering', query: 'defensive malware analysis research lab', terms: ['malware analysis', 'malware research', 'reverse engineering', 'static analysis', 'dynamic analysis', 'sandbox'] },
  { id: 'threat-intel', label: 'Threat intelligence & security research', query: 'threat intelligence security research', terms: ['threat intelligence', 'osint', 'security research', 'ioc', 'threat report', 'campaign analysis'] },
  { id: 'cloud', label: 'Cloud, identity & container security', query: 'cloud security identity container security', terms: ['cloud security', 'aws', 'azure', 'gcp', 'iam', 'identity', 'container', 'kubernetes'] },
  { id: 'devsecops', label: 'Secure coding & DevSecOps', query: 'secure coding DevSecOps software security', terms: ['secure coding', 'devsecops', 'sast', 'dast', 'supply chain', 'dependency security'] },
  { id: 'cryptography', label: 'Cryptography & privacy', query: 'cryptography privacy engineering cybersecurity', terms: ['cryptography', 'encryption', 'privacy', 'key management', 'data privacy'] },
  { id: 'ai-security', label: 'AI & machine-learning security', query: 'AI LLM machine learning security', terms: ['ai security', 'llm security', 'prompt injection', 'machine learning security', 'model security'] },
  { id: 'mobile-iot', label: 'Mobile, IoT & operational technology security', query: 'mobile IoT OT security', terms: ['mobile security', 'android security', 'ios security', 'iot security', 'ot security', 'industrial control'] },
  { id: 'governance', label: 'GRC, risk & compliance', query: 'cybersecurity governance risk compliance', terms: ['grc', 'governance', 'risk', 'compliance', 'iso 27001', 'nist', 'policy', 'audit'] },
  { id: 'career', label: 'Cybersecurity careers & certifications', query: 'cybersecurity career certification live session', terms: ['career', 'certification', 'certifications', 'career path', 'interview', 'exam'] },
];
// OCP-CYBER-LIVE-TOPICS-EXPANSION-V1

const SEARCH_LANGUAGES = [
  { id: 'all', label: 'All three languages', querySuffix: '' },
  { id: 'en', label: 'English', querySuffix: 'English' },
  { id: 'hi', label: 'Hindi', querySuffix: 'Hindi हिंदी हिन्दी' },
  { id: 'te', label: 'Telugu', querySuffix: 'Telugu తెలుగు' },
];

function discoveryLanguageIds(video) {
  const values = Array.isArray(video.discoveryLanguages)
    ? video.discoveryLanguages
    : (video.discoveryLanguage ? [video.discoveryLanguage] : []);
  return [...new Set(values.filter((value) => ['en', 'hi', 'te'].includes(value)))];
}

function languageLabel(languageId) {
  return SEARCH_LANGUAGES.find((item) => item.id === languageId)?.label || languageId;
}

function playerEmbedUrl(videoId, requestEnglishCaptions) {
  const params = new URLSearchParams({ rel: '0', playsinline: '1', hl: 'en' });
  if (requestEnglishCaptions) {
    params.set('cc_load_policy', '1');
    params.set('cc_lang_pref', 'en');
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function watchUrl(videoId, requestEnglishCaptions) {
  const params = new URLSearchParams();
  if (requestEnglishCaptions) {
    params.set('cc_load_policy', '1');
    params.set('cc_lang_pref', 'en');
    params.set('hl', 'en');
  }
  const suffix = params.toString();
  return `https://www.youtube.com/watch?v=${videoId}${suffix ? `&${suffix}` : ''}`;
}

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
  // YouTube's Live search token is nested-encoded in its results URL.
  // Keep the %25 sequence so the YouTube search page applies the Live filter.
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleaned)}&sp=EgJAAQ%253D%253D`;
}

// OCP-LIVE-SEARCH-FALLBACK-FIX-V1
const DIRECT_TOPIC_SEARCH_TERMS = {
  foundations: 'cybersecurity basics',
  'programming-linux': 'Linux Windows security basics',
  networking: 'network security Wireshark',
  'ethical-hacking': 'ethical hacking authorised lab',
  'pentest-labs': 'penetration testing authorised training lab',
  'bug-bounty': 'bug bounty responsible disclosure',
  'web-app': 'web application security OWASP',
  'api-security': 'API security defensive testing',
  ctf: 'cybersecurity CTF training lab',
  'soc-siem': 'SOC SIEM blue team',
  'threat-hunting': 'threat hunting detection engineering',
  'incident-response': 'incident response digital forensics',
  'malware-analysis': 'defensive malware analysis lab',
  'threat-intel': 'threat intelligence security research',
  cloud: 'cloud identity container security',
  devsecops: 'secure coding DevSecOps',
  cryptography: 'cryptography privacy security',
  'ai-security': 'AI LLM security',
  'mobile-iot': 'mobile IoT OT security',
  governance: 'cybersecurity risk compliance',
  career: 'cybersecurity career certification',
};

const LANGUAGE_LIVE_SEARCH_QUERIES = {
  en: 'cybersecurity|cyber security|ethical hacking|penetration testing|bug bounty|CTF|capture the flag|infosec|information security|network security|web security|OWASP|cloud security|SOC analyst|SIEM|blue team|red team|purple team|threat hunting|incident response|digital forensics|malware analysis|threat intelligence|secure coding|DevSecOps|cryptography|privacy security|AI security|IoT security|security awareness|Linux security|Windows security|security research',
  hi: 'साइबर सुरक्षा|साइबर सिक्योरिटी|एथिकल हैकिंग|बग बाउंटी|सीटीएफ|नेटवर्क सुरक्षा|वेब सुरक्षा|क्लाउड सुरक्षा|साइबर फॉरेंसिक्स|मैलवेयर विश्लेषण|हिंदी साइबर सुरक्षा|ethical hacking Hindi|penetration testing Hindi|bug bounty Hindi|SOC analyst Hindi|cybersecurity Hindi',
  te: 'సైబర్ సెక్యూరిటీ|సైబర్ భద్రత|ఎథికల్ హ్యాకింగ్|బగ్ బౌంటీ|సీటీఎఫ్|నెట్‌వర్క్ భద్రత|వెబ్ భద్రత|క్లౌడ్ భద్రత|సైబర్ ఫోరెన్సిక్స్|మాల్వేర్ విశ్లేషణ|తెలుగు సైబర్ సెక్యూరిటీ|ethical hacking Telugu|penetration testing Telugu|bug bounty Telugu|SOC analyst Telugu|cybersecurity Telugu',
};

function compactGoalSearchTerms(value) {
  const stopWords = new Set([
    'how', 'what', 'when', 'where', 'why', 'who', 'i', 'want', 'to', 'learn',
    'understand', 'about', 'for', 'the', 'and', 'with', 'can', 'could', 'please',
    'show', 'me', 'teach', 'help', 'from', 'into', 'that', 'this', 'beginner',
    'intermediate', 'advanced', 'class', 'classes', 'live', 'right', 'now',
  ]);
  const words = String(value || '').toLowerCase().match(/[a-z0-9+#.-]{2,}|[\u0900-\u097F]{2,}|[\u0C00-\u0C7F]{2,}/g) || [];
  return [...new Set(words.filter((word) => !stopWords.has(word)))].slice(0, 3).join(' ');
}

function goalLiveSearchQuery(intentId, languageId, customIntent) {
  const customTerms = compactGoalSearchTerms(customIntent);
  const topicTerms = customTerms || DIRECT_TOPIC_SEARCH_TERMS[intentId] || 'cybersecurity';
  const languageTerms = languageId === 'hi' ? 'Hindi हिंदी' : languageId === 'te' ? 'Telugu తెలుగు' : '';
  return [topicTerms, languageTerms].filter(Boolean).join(' ');
}

function languageLiveSearchQuery(languageId) {
  return LANGUAGE_LIVE_SEARCH_QUERIES[languageId] || LANGUAGE_LIVE_SEARCH_QUERIES.en;
}

function lowerText(video) {
  return `${video.title || ''} ${video.description || ''} ${video.channelTitle || ''} ${(video.topics || []).join(' ')}`.toLowerCase();
}


// OCP-STRICT-RESOURCE-RELEVANCE-GATE-V1
// Never display a stream as a match based only on generic words or substring hits.
const STRICT_INTENT_TOPIC_TERMS = {"foundations": ["cybersecurity", "cyber security", "information security", "infosec", "security basics", "security fundamentals"], "programming-linux": ["linux security", "linux hardening", "windows security", "windows hardening", "powershell security", "python for cybersecurity", "cybersecurity scripting"], "networking": ["network security", "wireshark", "packet analysis", "network traffic analysis", "dns security", "firewall security"], "ethical-hacking": ["ethical hacking", "penetration testing", "pen testing", "pentest", "red team", "authorised testing", "authorized testing", "security assessment"], "pentest-labs": ["penetration testing", "pen testing", "pentest", "authorised lab", "authorized lab", "training lab", "web assessment"], "bug-bounty": ["bug bounty", "responsible disclosure", "vulnerability disclosure", "hackerone", "bugcrowd"], "web-app": ["web security", "application security", "appsec", "owasp", "secure coding", "web vulnerability"], "api-security": ["api security", "api penetration testing", "oauth security", "jwt security", "api testing"], "ctf": ["capture the flag", "cybersecurity ctf", "cyber security ctf", "ctf training", "tryhackme", "hack the box", "security challenge lab"], "soc-siem": ["soc analyst", "siem", "blue team", "security operations", "microsoft sentinel", "splunk security", "wazuh", "security event monitoring", "log analysis"], "threat-hunting": ["threat hunting", "detection engineering", "threat intelligence", "sigma rule", "yara rule", "endpoint detection", "mitre attack"], "incident-response": ["incident response", "digital forensics", "computer forensics", "dfir", "forensic investigation"], "malware-analysis": ["malware analysis", "malware reverse engineering", "reverse engineering malware", "static malware analysis", "dynamic malware analysis", "sandbox analysis"], "threat-intel": ["threat intelligence", "osint", "ioc analysis", "threat report", "campaign analysis", "security research"], "cloud": ["cloud security", "aws security", "azure security", "gcp security", "container security", "kubernetes security", "identity and access management", "iam security", "cloud iam", "cspm"], "devsecops": ["devsecops", "secure coding", "sast", "dast", "software supply chain security", "dependency security", "code scanning"], "cryptography": ["cryptography", "encryption", "key management", "cryptographic security", "privacy engineering"], "ai-security": ["ai security", "llm security", "prompt injection", "ai red teaming", "machine learning security", "model security"], "mobile-iot": ["android security", "mobile security", "ios security", "iot security", "operational technology security", "industrial control system security"], "governance": ["grc", "cybersecurity governance", "risk compliance", "iso 27001", "nist security", "security audit"], "career": ["cybersecurity career", "security certification", "soc analyst career", "cybersecurity interview", "cybersecurity certification"], "foundations-awareness": ["cybersecurity", "cyber security", "information security", "infosec", "security basics"]};
const LEARNING_SIGNAL_RE = /\b(class|course|tutorial|training|workshop|webinar|lab|walkthrough|lesson|lecture|bootcamp|explained|fundamentals|basics|beginners?|guide|demo|demonstration|hands[ -]?on|learning|teaching|teach|session|academy|masterclass|deep dive|crash course|how to|step[ -]by[ -]step|practical|seminar)\b/i;

function containsWholePhrase(text, phrase) {
  const escaped = String(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text);
}

function isRelevantLearningVideo(video, intent) {
  const title = String(video?.title || '').trim().toLowerCase();
  const details = `${title} ${String(video?.description || '')}`.toLowerCase();
  const terms = STRICT_INTENT_TOPIC_TERMS[intent?.id] || [];
  const topicInTitle = terms.some((term) => containsWholePhrase(title, term));
  const instructionalContext = LEARNING_SIGNAL_RE.test(details);
  return topicInTitle && instructionalContext;
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
  const [feedSource, setFeedSource] = useState('bundled offline snapshot');
  const [loading, setLoading] = useState(true);
  const [levelId, setLevelId] = useState('beginner');
  const [intentId, setIntentId] = useState('foundations');
  const [languageId, setLanguageId] = useState('all');
  const [englishCaptions, setEnglishCaptions] = useState(false);
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
        const latest = await fetchLiveFeed();
        if (active) {
          setFeed(latest.payload);
          setFeedSource(latest.source);
          setFeedError('');
        }
      } catch {
        if (active) setFeedError('The online index and bundled snapshot could not be loaded. Use one of the direct worldwide YouTube Live searches below.');
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
      .filter((video) => safeYouTubeId(video.videoId) && video.url && /^https:\/\/www\.youtube\.com\//.test(video.url) && (languageId === 'all' || discoveryLanguageIds(video).includes(languageId)) && isRelevantLearningVideo(video, intent))
      .map((video) => ({ ...video, relevance: scoreVideo(video, levelId, intent, customIntent) }))
      .sort((a, b) => b.relevance.score - a.relevance.score || (Number(b.concurrentViewers) || 0) - (Number(a.concurrentViewers) || 0) || String(b.liveStartedAt || '').localeCompare(String(a.liveStartedAt || '')));
  }, [feed, levelId, intent, customIntent, languageId]);

  const selectedLanguage = SEARCH_LANGUAGES.find((item) => item.id === languageId) || SEARCH_LANGUAGES[0];
  const liveSearchQuery = goalLiveSearchQuery(intentId, selectedLanguage.id, customIntent);
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
        <p>Choose your level and topic. OpenCyberPath only shows indexed streams that match the selected security topic and include an instructional signal. External YouTube search can still show sponsored or unrelated results; those results are not verified by this site.</p>
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
        <label className="yt-filter-field"><span>Preferred class language</span><select value={languageId} onChange={(event) => setLanguageId(event.target.value)}>{SEARCH_LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="yt-filter-field yt-custom-intent"><span>Describe your goal (optional)</span><input value={customIntent} onChange={(event) => setCustomIntent(event.target.value.slice(0, 120))} placeholder="e.g. understand SIEM alerts, DNS, or incident timelines" maxLength={120} /></label>
      </div>
      <p className="yt-language-note">Worldwide discovery rotates English, Hindi, and Telugu searches. A language tag records which search found a class; it does not verify the speaker’s language.</p>
      <div className="yt-live-summary" aria-live="polite">
        <div><span className="yt-live-dot" /><strong>{rankedVideos.length > 0 && feedStatus !== 'stale' ? `${rankedVideos.length} matching ${rankedVideos.length === 1 ? 'class' : 'classes'} in the current live index` : 'Find live classes for your goal'}</strong><span className="yt-summary-subtext">Filtered for {levelId} · {intent.label} · {selectedLanguage.label}</span></div>
        <a href={liveSearchUrl(liveSearchQuery)} target="_blank" rel="noreferrer">Search this goal on YouTube ↗</a>
      </div>

      {loading && !feed && <div className="yt-feed-state" role="status"><span className="yt-state-spinner" /> Loading the latest saved live-class index…</div>}
      {feedError && <div className="yt-feed-state is-warning" role="status">{feedError}</div>}
      {!loading && feedStatus === 'not-configured' && <div className="yt-feed-state is-warning"><strong>Automatic live indexing needs setup.</strong><span>The schedule is included, but it needs the repository’s YOUTUBE_API_KEY Actions secret and YouTube Data API v3 enabled. The direct YouTube live search above works without this site-side index.</span></div>}
      {!loading && feedStatus === 'error' && <div className="yt-feed-state is-warning"><strong>The most recent scheduled search failed.</strong><span>{feed?.note || 'Try the direct YouTube live search to check currently available classes.'}</span></div>}
      {!loading && feedStatus === 'stale' && <div className="yt-feed-state is-warning"><strong>Showing the last successful snapshot.</strong><span>The last refresh failed. Confirm the live badge on YouTube before joining.</span></div>}
      {/* OCP-LIVE-DISCOVERY-EMPTY-STATE-V1 */}
      {!loading && (rankedVideos.length === 0 || feedStatus === 'stale') && <div className="yt-feed-state"><strong>Let's find a class that's live right now.</strong><span>The saved index has no verified match for these filters right now. That does not mean there are no cybersecurity classes live worldwide. Use the live-only searches below, then confirm the LIVE badge and topic on YouTube before joining.</span><a className="yt-action-primary" href={liveSearchUrl(liveSearchQuery)} target="_blank" rel="noreferrer">Search current live classes on YouTube ↗</a>
        <div className="yt-live-fallback-links" aria-label="Search worldwide live classes by language">
          {SEARCH_LANGUAGES.filter((language) => language.id !== 'all').map((language) => <a key={language.id} href={liveSearchUrl(languageLiveSearchQuery(language.id))} target="_blank" rel="noreferrer">{language.label} live classes ↗</a>)}
          <a href="https://infosecstreamers.com/" className="yt-action-secondary" target="_blank" rel="noreferrer">Browse live InfoSec streams ↗ <span>(not all are classes)</span></a>
        </div></div>}
      {snapshotIsOld && rankedVideos.length > 0 && feedStatus !== 'stale' && <p className="yt-stale-note">The saved snapshot is over 90 minutes old. The scheduled job may be delayed; use the direct YouTube search to confirm current availability.</p>}

      {rankedVideos.length > 0 && feedStatus !== 'stale' && <div className="yt-live-grid">
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
            <div className="yt-live-language-badges" aria-label="Language search matches">{discoveryLanguageIds(video).map((code) => <span key={code}>{languageLabel(code)} search</span>)}</div>
            <p className="yt-live-meta"><span>{levelSignal(video, levelId)}</span>{video.snapshotTopic && <span>{video.snapshotTopic}</span>}{video.lastSeenAt && <span>Seen {formatElapsed(video.lastSeenAt)}</span>}</p>
            <div className="yt-live-card-actions">
              <button className="yt-action-primary" type="button" onClick={() => { setSelectedVideoId(video.videoId); setManualInput(video.videoId); setManualError(''); }}>Watch here</button>
              <a className="yt-action-secondary" href={video.url} target="_blank" rel="noreferrer">YouTube ↗</a>
            </div>
          </div>
        </article>)}
      </div>}

      <footer className="yt-feed-footnote">
        <span>{feed?.generatedAt ? `Snapshot last changed: ${formatTimestamp(feed.generatedAt)}` : 'No successful live-class snapshot has been published yet.'}</span>
        <span>Feed source: {feedSource}. Automation checks approximately every 30 minutes when GitHub Actions and the YouTube API are available. Search is not exhaustive; direct language searches are provided when the snapshot is empty.</span>
      </footer>
    </section>

    {selectedVideoId && <section className="yt-selected-player" aria-labelledby="yt-player-title" id="yt-selected-player">
      <div className="yt-panel-heading"><div><span className="yt-learning-kicker">CURRENT SESSION</span><h2 id="yt-player-title">Watch your selected class</h2></div><button className="yt-action-secondary" type="button" onClick={clearPlayer}>Close player</button></div>
      <div className="yt-caption-controls">
        <button className="yt-action-secondary yt-caption-toggle" type="button" aria-pressed={englishCaptions} onClick={() => setEnglishCaptions((value) => !value)}>{englishCaptions ? 'English captions requested ✓' : 'Request English captions'}</button>
        <p>When enabled, OpenCyberPath asks YouTube’s player to display English captions if an English caption track or supported translation is available. This does not create subtitles for streams with no available captions. For other languages, open YouTube and check Settings → Subtitles/CC → Auto-translate → English if offered.</p>
      </div>
      {isNative ? <div className="yt-player-empty"><h3>Open this class in YouTube</h3><p>For best compatibility in the Android app, open the original live stream in YouTube. The English-caption preference is added to the link when supported.</p><a className="yt-action-primary" href={watchUrl(selectedVideoId, englishCaptions)} target="_blank" rel="noreferrer">Open stream ↗</a></div> : <div className="yt-player-frame"><iframe title="Selected live cybersecurity class" src={playerEmbedUrl(selectedVideoId, englishCaptions)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
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
