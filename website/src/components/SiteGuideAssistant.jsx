// OCP site-guide assistant improvements v2: intent handling, topic relevance, explicit source disclosure.
import { useEffect, useMemo, useRef, useState } from 'react';
import { resources } from '../data/resources.js';
import { labs } from '../data/labs.js';
import { careerPaths } from '../data/careerPaths.js';
import { certifications } from '../data/certifications.js';
import { learningVideos } from '../data/learningVideos.js';
import './SiteGuideAssistant.css';

const ROUTES = [
  { page: 'home', label: 'Home', terms: ['home', 'homepage', 'start'] },
  { page: 'learning-studio', label: 'My Learning Studio', terms: ['learning studio', 'my learning', 'study plan', 'weekly plan', 'next lesson', 'learning dashboard', 'personalised learning', 'personalized learning'] },
  { page: 'discover', label: 'Discover', terms: ['discover', 'discovery', 'latest', 'news', 'cyberpulse', 'videos', 'video', 'public posts'] },
  { page: 'resources', label: 'Resources', terms: ['resource', 'resources', 'documentation', 'website', 'open source', 'repository', 'github'] },
  { page: 'roadmap', label: 'Learning paths', terms: ['roadmap', 'learning path', 'career path', 'path', 'curriculum'] },
  { page: 'certifications', label: 'Certifications', terms: ['certification', 'certifications', 'certificate', 'exam', 'certs'] },
  { page: 'labs', label: 'Labs & challenges', terms: ['lab', 'labs', 'challenge', 'challenges', 'ctf', 'practice', 'practice target'] },
  { page: 'tools', label: 'Tools & case studies', terms: ['tools', 'tool', 'case study', 'movie', 'software supply chain'] },
  { page: 'career-hub', label: 'Career hub', terms: ['career', 'careers', 'job role', 'job roles', 'skills', 'resume', 'portfolio'] },
  { page: 'job-hub', label: 'Jobs & applications', terms: ['job', 'jobs', 'internship', 'internships', 'intern', 'vacancy', 'vacancies', 'application tracker', 'apply'] },
  { page: 'systems-academy', label: 'Operating systems & networks', terms: ['linux', 'windows', 'operating systems', 'networking', 'network fundamentals'] },
  { page: 'concepts', label: 'Security basics', terms: ['basics', 'fundamentals', 'explain', 'concept', 'concepts'] },
];

const QUICK_PROMPTS = [
  { label: 'Latest security updates', query: 'latest cybersecurity news and advisories', icon: '◷' },
  { label: 'Find videos', query: 'latest cybersecurity learning videos', icon: '▷' },
  { label: 'Jobs & internships', query: 'cybersecurity jobs and internships', icon: '↗' },
  { label: 'Find a lab', query: 'beginner cybersecurity labs and challenges', icon: '⌘' },
];

const STOP_WORDS = new Set(['a','an','and','are','as','at','be','by','can','could','do','for','from','get','give','help','i','in','is','it','me','my','of','on','or','please','show','site','the','this','to','want','what','where','with','you','your','find','need','latest','new','current','information','about','learn','search','some','good','best']);
const TYPE_LABEL = {
  resource: 'Resource', lab: 'Lab', path: 'Learning path', certification: 'Certification', video: 'Video',
  news: 'News / advisory', repository: 'Public GitHub project', job: 'Job', internship: 'Internship', event: 'CTF / event', education: 'University / institute',
  community: 'Public discussion', learning: 'Learning material',
};

function normalise(value) {
  return String(value || '').toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokensOf(value) {
  return [...new Set(normalise(value).split(' ').filter((word) => word.length > 1 && !STOP_WORDS.has(word)))];
}
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeHtmlEntities(value) {
  let text = String(value || '');
  // Decode common feed encodings twice so encoded brackets are also normalized.
  for (let pass = 0; pass < 2; pass += 1) {
    text = text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, entity) => {
      if (entity[0] === '#') {
        const codePoint = entity[1].toLowerCase() === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
        if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return whole;
        try { return String.fromCodePoint(codePoint); } catch { return whole; }
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? whole;
    });
  }
  return text;
}
function cleanDisplayText(value, max = 240) {
  const text = decodeHtmlEntities(value)
    // Feed titles sometimes contain Markdown links; keep meaningful link text, not raw URLs.
    .replace(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi, (_all, label) => /^https?:\/\//i.test(String(label).trim()) ? ' ' : ` ${label} `)
    .replace(/https?:\/\/[^\s)\]]+/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[\s,;–—-]*\(?(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+[A-Z][a-z]{2}\s+\d{1,2}(?:st|nd|rd|th)?\)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function resultUrl(item) {
  const recordUrl = validHttpUrl(item?.url);
  const rawTitle = decodeHtmlEntities(item?.title || item?.name || '');
  const embedded = [...rawTitle.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi)]
    .map((match) => validHttpUrl(match[1]))
    .find(Boolean);
  if (!recordUrl) return embedded || '';
  if (embedded) {
    try {
      const record = new URL(recordUrl);
      const link = new URL(embedded);
      const feedLike = /(?:\/rss(?:\/|$)|\/feed(?:\/|$)|\/atom(?:\/|$)|\.rss$)/i.test(record.pathname);
      // Only prefer an embedded article link over an RSS endpoint when both stay on the same host.
      if (feedLike && record.hostname.toLowerCase() === link.hostname.toLowerCase()) return link.href;
    } catch { /* Keep the validated record URL. */ }
  }
  return recordUrl;
}
function hasCorruptedHeadline(value) {
  const raw = decodeHtmlEntities(value);
  return /\[(?:phone|email|name|address|number|identifier|value)\s+redacted\]|\[\s*redacted\s*\]|\ufffd|&#(?:x[0-9a-f]+|\d+);/i.test(raw);
}
function cleanTitle(value) {
  const title = cleanDisplayText(value, 220);
  return title && !hasCorruptedHeadline(title) ? title : '';
}
function cleanSummary(value, max = 240) {
  const text = cleanDisplayText(value, max);
  return text.replace(/\[(?:phone|email|name|address|number|identifier|value)\s+redacted\]/gi, '[redacted detail]');
}
function validHttpUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function scoreRecord(record, query) {
  const tokens = tokensOf(query);
  if (!tokens.length) return 0;
  const title = normalise(record.title || record.name || '');
  const provider = normalise(record.provider || record.source || '');
  const body = normalise([record.summary, record.description, record.note, record.topic, record.category, record.kind,
    record.language, ...(Array.isArray(record.skills) ? record.skills : []), ...(Array.isArray(record.topics) ? record.topics : []), ...(Array.isArray(record.tags) ? record.tags : [])].flat().join(' '));
  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 5;
    if (provider.includes(token)) score += 2;
    if (body.includes(token)) score += 1;
  }
  const queryNorm = normalise(query);
  if (queryNorm.length > 3 && title.includes(queryNorm)) score += 6;
  return score;
}
function dateMillis(value) {
  const dt = value ? new Date(value).getTime() : 0;
  return Number.isFinite(dt) ? dt : 0;
}
function publicationTimeValue(item) {
  // Do not confuse last-seen/updated timestamps with publication dates.
  return dateMillis(item.publishedAt || item.published_at || item.pubDate || item.published || item.datePublished);
}
function timeValue(item) {
  return publicationTimeValue(item) || dateMillis(item.updatedAt || item.lastSeenAt || item.firstSeenAt);
}
function compareFreshness(a, b) {
  const aTime = publicationTimeValue(a);
  const bTime = publicationTimeValue(b);
  if (aTime && !bTime) return -1;
  if (bTime && !aTime) return 1;
  return bTime - aTime;
}
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
function resultDateLabel(item, latestMode = false) {
  const eventDate = item.kind === 'event' ? (item.startAt || item.eventStart || item.eventDate || item.startDate || item.date || item.publishedAt) : null;
  if (eventDate) {
    const formatted = formatDate(eventDate);
    if (formatted) return `Event date ${formatted}`;
  }
  const published = publicationTimeValue(item);
  if (!published) return latestMode ? 'Publication date unknown' : '';
  const dateText = formatDate(published);
  if (!dateText) return latestMode ? 'Publication date unknown' : '';
  const ageDays = (Date.now() - published) / 86400000;
  if (ageDays < -1) return `Future publication date — verify · ${dateText}`;
  if (ageDays > 180) return `Older material · Published ${dateText}`;
  return `Published ${dateText}`;
}
function asksForLatest(query) {
  return /\b(latest|newest|recent|today|this week|this month|breaking|up to date)\b/.test(normalise(query));
}
function queryRoute(query) {
  const q = normalise(query);
  const explicit = /^(?:open|go(?: to)?|take me|navigate|bring me|show me|please open|switch to)\b/.test(q);
  if (!explicit) return null;
  const matches = [];
  for (const route of ROUTES) {
    for (const term of route.terms) {
      if (q.includes(normalise(term))) matches.push({ route, term: normalise(term) });
    }
  }
  matches.sort((a, b) => b.term.length - a.term.length || a.route.label.length - b.route.label.length);
  return matches[0]?.route || null;
}
function inferredFilter(query) {
  const q = normalise(query);
  if (/\bjobs?\b.*\bintern(?:ship|ships)\b|\bintern(?:ship|ships)\b.*\bjobs?\b/.test(q)) return 'job';
  if (/internship|interns|student programme|graduate programme/.test(q)) return 'internship';
  if (/job opening|job listing|job search|find (?:me )?(?:a )?job|\bjobs\b|vacanc|apply for|employment|hiring/.test(q)) return 'job';
  if (/university|universities|institute|college|admission|scholarship|degree programme|course provider/.test(q)) return 'education';
  if (/latest news|news|advisory|advisories|cve-|vulnerability alert|security incident/.test(q)) return 'news';
  if (/youtube|video|playlist|lecture|tutorial video/.test(q)) return 'video';
  if (/github|repository|repositories|open source project|source code/.test(q)) return 'repository';
  if (/ctf|competition|challenge event|hackathon|event/.test(q)) return 'event';
  if (/reddit|linkedin|twitter|\bx\b|instagram|community post|discussion/.test(q)) return 'community';
  return '';
}

const CAPABILITY_SUGGESTIONS = [
  { label: 'Find learning resources', query: 'cybersecurity learning resources' },
  { label: 'Latest security news', query: 'latest cybersecurity news and advisories' },
  { label: 'Videos and tutorials', query: 'latest cybersecurity learning videos' },
  { label: 'Jobs and internships', query: 'cybersecurity jobs and internships' },
  { label: 'CTF challenges', query: 'upcoming cybersecurity CTF challenges' },
  { label: 'Certifications', query: 'open certifications section' },
];

function isCapabilitiesQuestion(query) {
  const q = normalise(query);
  return /^(?:what can (?:you|u) do(?: for me)?|what do you do|how can (?:you|u) help(?: me)?|what can i ask(?: you)?|what are you able to do|what do you help with|help me get started)$/.test(q);
}

function isSimpleGreeting(query) {
  return /^(?:hi|hello|hey|yo|good morning|good afternoon|good evening)(?: there| bro| bunny)?$/.test(normalise(query));
}

const TOPIC_RULES = [
  {
    id: 'wireless-security',
    test: /\bwi-?fi\b|wireless|802\.11|\bwpa[23]\b|\bwep\b/,
    direct: /\bwi-?fi\b|wireless|802\.11|\bwpa[23]\b|\bwep\b/,
    related: /router security|wireless lan|access point security|802\.1x|eap|wireless audit|wireless monitoring|wireless intrusion detection|network security policy/,
    sourceQuery: 'Wi-Fi wireless security WPA2 WPA3 authorized lab fundamentals',
    label: 'Wi-Fi security',
  },
  {
    id: 'bug-bounty',
    test: /bug bounty|responsible disclosure|vulnerability disclosure|bounty program|hackerone|bugcrowd/,
    direct: /bug bounty|responsible disclosure|vulnerability disclosure|bounty program|hackerone|bugcrowd|intigriti/,
    related: /responsible disclosure|scoped testing|web application security testing|application security testing|vulnerability disclosure|security testing methodology|owasp web security testing guide/,
    sourceQuery: 'bug bounty authorized program scope responsible disclosure learning',
    label: 'bug bounty',
  },
  {
    id: 'dark-web',
    test: /dark web|darknet|tor browser|onion service|onion routing/,
    direct: /dark web|darknet|tor browser|onion service|onion routing/,
    related: /darknet research|onion service research|privacy threat model|online anonymity|cybercrime investigation|digital forensics|dark web threat intelligence|incident response/,
    sourceQuery: 'dark web legal research privacy safety risks official educational resources',
    label: 'dark-web research',
  },
  {
    id: 'mobile-security',
    test: /phone hacking|mobile hacking|android hacking|iphone hacking|mobile security|android security|ios security|mobile application security|mobile app security/,
    direct: /phone hacking|mobile hacking|android hacking|iphone hacking|mobile security|android security|ios security|mobile application security|mobile app security|phone security/,
    related: /mobile device security|android security|ios security|mobile application|mobile app|apk analysis|app permissions|mobile forensics|mobile threat defense|owasp mobile|masvs|emulator|android studio|ios simulator/,
    sourceQuery: 'Android iOS mobile application security authorized testing emulator defensive learning',
    label: 'mobile security',
  },
  {
    id: 'cybersecurity-law',
    test: /cyber(?:\s*security)?\s+laws?|cybercrime laws?|digital laws?|cyber law|data protection laws?|privacy laws?|security legislation|cybersecurity regulation|information technology act|\bit act\b|\bdpdp act\b|\bgdpr\b|privacy framework|cybersecurity framework|nist privacy framework/,
    direct: /cyber(?:\s*security)?\s+laws?|cybercrime laws?|digital laws?|cyber law|data protection laws?|privacy laws?|security legislation|cybersecurity regulation|information technology act|\bit act\b|\bdpdp act\b|\bgdpr\b|legal framework|privacy framework|cybersecurity framework|nist privacy framework/,
    related: /data protection|privacy regulation|legislation|regulatory compliance|digital rights|information technology act|\bgdpr\b|\bdpdp\b|compliance framework|legal framework|cybercrime laws?|privacy policy|data privacy laws?|privacy framework|cybersecurity framework|voluntary standard/,
    sourceQuery: 'cybersecurity laws legal framework data protection regulation official government sources',
    frameworkQuery: 'NIST Privacy Framework cybersecurity privacy risk official',
    label: 'cybersecurity laws and regulation',
  },
];

function detectTopic(query) {
  const q = normalise(query);
  return TOPIC_RULES.find((topic) => topic.test.test(q)) || null;
}

function topicMatch(item, topic) {
  if (!topic) return 'none';
  const searchable = normalise([
    item.title, item.name, item.summary, item.description, item.note, item.category,
    item.provider, item.source, item.kind, ...(Array.isArray(item.skills) ? item.skills : []),
    ...(Array.isArray(item.topics) ? item.topics : []), ...(Array.isArray(item.tags) ? item.tags : []),
  ].flat().join(' '));
  if (topic.direct.test(searchable)) return 'exact';
  if (topic.related.test(searchable)) return 'related';
  return 'none';
}
function isFrameworkIntent(query) {
  return /\b(frameworks?|standards?|guidelines?|best practices?|privacy risk framework)\b/.test(normalise(query));
}
const JURISDICTION_PATTERNS = [
  { id: 'uk', label: 'United Kingdom', test: /\bunited kingdom\b|\buk\b|\bbritain\b|\benglish law\b|\buk gdpr\b/ },
  { id: 'india', label: 'India', test: /\bindia\b|\bindian\b|\bmeity\b|\bindia code\b|\bdpdp\b|\binformation technology act\b|\bit act\b/ },
  { id: 'eu', label: 'European Union', test: /\beuropean union\b|\beu law\b|\beu regulations?\b|\bthe eu\b|\bgdpr\b/ },
  { id: 'us', label: 'United States', test: /\bunited states\b|\busa\b|\bu\.?s\.?\b|\bfederal law\b|\bamerican law\b/ },
  { id: 'australia', label: 'Australia', test: /\baustralia\b|\baustralian\b/ },
  { id: 'singapore', label: 'Singapore', test: /\bsingapore\b/ },
  { id: 'canada', label: 'Canada', test: /\bcanada\b|\bcanadian\b/ },
  { id: 'new-zealand', label: 'New Zealand', test: /\bnew zealand\b/ },
  { id: 'germany', label: 'Germany', test: /\bgermany\b|\bgerman\b/ },
  { id: 'france', label: 'France', test: /\bfrance\b|\bfrench\b/ },
  { id: 'japan', label: 'Japan', test: /\bjapan\b|\bjapanese\b/ },
  { id: 'philippines', label: 'Philippines', test: /\bphilippines\b|\bphilippine\b/ },
  { id: 'brazil', label: 'Brazil', test: /\bbrazil\b|\bbrazilian\b/ },
];
function detectJurisdiction(query) {
  const q = normalise(query);
  return JURISDICTION_PATTERNS.find((entry) => entry.test.test(q)) || null;
}
function isFrameworkRecord(item) {
  const title = normalise(item.title || item.name || '');
  return /\bframework\b|\bstandard\b|\bguideline\b|\bbest practices?\b/.test(title);
}
function isLegislationRecord(item) {
  const title = normalise(item.title || item.name || '');
  return /\b(act|law|laws|legislation|regulation|regulations|directive|statute|bill|code)\b/.test(title) || /\bgdpr\b|\bdpdp act\b/.test(title);
}
function officialLegalHostMatches(host, jurisdiction) {
  const hosts = {
    india: /(?:^|\.)indiacode\.nic\.in$|(?:^|\.)meity\.gov\.in$|(?:^|\.)cert-in\.org\.in$|(?:^|\.)pib\.gov\.in$|(?:^|\.)egazette\.nic\.in$/,
    eu: /(?:^|\.)eur-lex\.europa\.eu$|(?:^|\.)edpb\.europa\.eu$|(?:^|\.)europa\.eu$|(?:^|\.)ec\.europa\.eu$/,
    uk: /(?:^|\.)legislation\.gov\.uk$|(?:^|\.)ico\.org\.uk$|(?:^|\.)gov\.uk$/,
    us: /(?:^|\.)congress\.gov$|(?:^|\.)cisa\.gov$|(?:^|\.)ftc\.gov$|(?:^|\.)govinfo\.gov$|(?:^|\.)federalregister\.gov$|(?:^|\.)justice\.gov$/,
    australia: /(?:^|\.)legislation\.gov\.au$|(?:^|\.)oaic\.gov\.au$|(?:^|\.)cyber\.gov\.au$/,
    singapore: /(?:^|\.)sso\.agc\.gov\.sg$|(?:^|\.)pdpc\.gov\.sg$|(?:^|\.)csa\.gov\.sg$/,
    canada: /(?:^|\.)laws-lois\.justice\.gc\.ca$|(?:^|\.)priv\.gc\.ca$/,
    'new-zealand': /(?:^|\.)legislation\.govt\.nz$|(?:^|\.)privacy\.org\.nz$/,
    germany: /(?:^|\.)gesetze-im-internet\.de$|(?:^|\.)bfdi\.bund\.de$/,
    france: /(?:^|\.)legifrance\.gouv\.fr$|(?:^|\.)cnil\.fr$/,
    japan: /(?:^|\.)elaws\.e-gov\.go\.jp$|(?:^|\.)ppc\.go\.jp$/,
    philippines: /(?:^|\.)officialgazette\.gov\.ph$|(?:^|\.)privacy\.gov\.ph$/,
    brazil: /(?:^|\.)planalto\.gov\.br$|(?:^|\.)gov\.br$/,
  };
  return Boolean(host && hosts[jurisdiction?.id]?.test(host));
}
function itemMatchesJurisdiction(item, jurisdiction) {
  if (!jurisdiction) return false;
  const text = normalise([item.title, item.name, item.summary, item.description, item.note, item.category, item.provider, item.source, item.url].join(' '));
  const url = validHttpUrl(item.url);
  let host = '';
  try { host = url ? new URL(url).hostname.toLowerCase() : ''; } catch { host = ''; }
  const rules = {
    india: /\bindia\b|\bindian\b|\bdpdp\b|\bindia code\b|\bmeity\b|\bcert-in\b/.test(text) || /(?:^|\.)indiacode\.nic\.in$|(?:^|\.)meity\.gov\.in$|(?:^|\.)cert-in\.org\.in$|(?:^|\.)pib\.gov\.in$/.test(host),
    eu: /\beuropean union\b|\beu law\b|\bgdpr\b/.test(text) || /(?:^|\.)eur-lex\.europa\.eu$|(?:^|\.)edpb\.europa\.eu$|(?:^|\.)europa\.eu$/.test(host),
    uk: /\bunited kingdom\b|\buk gdpr\b|\bbritish law\b/.test(text) || /(?:^|\.)legislation\.gov\.uk$|(?:^|\.)ico\.org\.uk$/.test(host),
    us: /\bunited states\b|\bus federal\b|\bfederal law\b/.test(text) || /(?:^|\.)congress\.gov$|(?:^|\.)cisa\.gov$|(?:^|\.)ftc\.gov$|(?:^|\.)govinfo\.gov$/.test(host),
    australia: /\baustralia\b|\baustralian\b/.test(text) || /(?:^|\.)legislation\.gov\.au$|(?:^|\.)oaic\.gov\.au$|(?:^|\.)cyber\.gov\.au$/.test(host),
    singapore: /\bsingapore\b|\bpdpa\b/.test(text) || /(?:^|\.)sso\.agc\.gov\.sg$|(?:^|\.)pdpc\.gov\.sg$|(?:^|\.)csa\.gov\.sg$/.test(host),
    canada: /\bcanada\b|\bcanadian\b/.test(text) || /(?:^|\.)laws-lois\.justice\.gc\.ca$|(?:^|\.)priv\.gc\.ca$/.test(host),
    'new-zealand': /\bnew zealand\b/.test(text) || /(?:^|\.)legislation\.govt\.nz$|(?:^|\.)privacy\.org\.nz$/.test(host),
    germany: /\bgermany\b|\bgerman\b/.test(text) || /(?:^|\.)gesetze-im-internet\.de$|(?:^|\.)bfdi\.bund\.de$/.test(host),
    france: /\bfrance\b|\bfrench\b/.test(text) || /(?:^|\.)legifrance\.gouv\.fr$|(?:^|\.)cnil\.fr$/.test(host),
    japan: /\bjapan\b|\bjapanese\b/.test(text) || /(?:^|\.)elaws\.e-gov\.go\.jp$|(?:^|\.)ppc\.go\.jp$/.test(host),
    philippines: /\bphilippines\b|\bphilippine\b/.test(text) || /(?:^|\.)officialgazette\.gov\.ph$|(?:^|\.)privacy\.gov\.ph$/.test(host),
    brazil: /\bbrazil\b|\bbrazilian\b/.test(text) || /(?:^|\.)planalto\.gov\.br$|(?:^|\.)gov\.br$/.test(host),
  };
  return Boolean(rules[jurisdiction.id]) && officialLegalHostMatches(host, jurisdiction);
}
function legalOfficialLinks(jurisdiction, query) {
  const q = encodeURIComponent(`${query} official legislation data protection cybersecurity`);
  const google = (domain) => `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${query} cybersecurity data protection law`)}`;
  const links = {
    india: [
      { label: 'India Code — Digital Personal Data Protection Act, 2023', url: 'https://www.indiacode.nic.in/indiacode/handle/123456789/22037?view_type=browse' },
      { label: 'MeitY — Digital Personal Data Protection Rules, 2025', url: 'https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025' },
      { label: 'MeitY — Acts and policies', url: 'https://www.meity.gov.in/documents/act-and-policies' },
    ],
    eu: [
      { label: 'EUR-Lex — EU law', url: `https://eur-lex.europa.eu/search.html?text=${q}` },
      { label: 'European Data Protection Board', url: 'https://www.edpb.europa.eu/' },
    ],
    us: [
      { label: 'Congress.gov — legislation', url: `https://www.congress.gov/search?q=${q}` },
      { label: 'CISA — cybersecurity guidance', url: 'https://www.cisa.gov/' },
      { label: 'FTC — privacy and consumer protection', url: 'https://www.ftc.gov/legal-library' },
    ],
    uk: [
      { label: 'Legislation.gov.uk', url: 'https://www.legislation.gov.uk/' },
      { label: 'ICO — data protection guidance', url: 'https://ico.org.uk/for-organisations/' },
    ],
    australia: [
      { label: 'Federal Register of Legislation', url: 'https://www.legislation.gov.au/' },
      { label: 'OAIC — privacy guidance', url: 'https://www.oaic.gov.au/privacy' },
    ],
    singapore: [
      { label: 'Singapore Statutes Online', url: 'https://sso.agc.gov.sg/' },
      { label: 'Personal Data Protection Commission', url: 'https://www.pdpc.gov.sg/' },
      { label: 'Cyber Security Agency of Singapore', url: 'https://www.csa.gov.sg/' },
    ],
    canada: [
      { label: 'Justice Laws Website', url: 'https://laws-lois.justice.gc.ca/' },
      { label: 'Office of the Privacy Commissioner', url: 'https://www.priv.gc.ca/' },
    ],
    'new-zealand': [
      { label: 'New Zealand Legislation', url: 'https://www.legislation.govt.nz/' },
      { label: 'Office of the Privacy Commissioner', url: 'https://www.privacy.org.nz/' },
    ],
    germany: [
      { label: 'Laws on the Federal Ministry of Justice portal', url: 'https://www.gesetze-im-internet.de/' },
      { label: 'Federal Commissioner for Data Protection', url: 'https://www.bfdi.bund.de/' },
    ],
    france: [
      { label: 'Légifrance — official legal texts', url: 'https://www.legifrance.gouv.fr/' },
      { label: 'CNIL — data protection authority', url: 'https://www.cnil.fr/' },
    ],
    japan: [
      { label: 'e-Gov legal search', url: 'https://elaws.e-gov.go.jp/' },
      { label: 'Personal Information Protection Commission', url: 'https://www.ppc.go.jp/' },
    ],
    philippines: [
      { label: 'Official Gazette', url: 'https://www.officialgazette.gov.ph/' },
      { label: 'National Privacy Commission', url: 'https://privacy.gov.ph/' },
    ],
    brazil: [
      { label: 'Presidency legislation portal', url: 'https://www.planalto.gov.br/' },
      { label: 'Federal Government portal', url: 'https://www.gov.br/' },
    ],
  };
  return links[jurisdiction?.id] || [{ label: `Search official ${jurisdiction?.label || 'government'} sources`, url: google('gov') }];
}
const LAW_JURISDICTION_SUGGESTIONS = [
  { label: 'India', query: 'cybersecurity laws and data protection in India' },
  { label: 'European Union', query: 'cybersecurity laws and data protection in the European Union' },
  { label: 'United States', query: 'cybersecurity laws and data protection in the United States' },
  { label: 'United Kingdom', query: 'cybersecurity laws and data protection in the United Kingdom' },
];
function providerSearchQuery(query, filter = '', topic = null) {
  if (topic?.sourceQuery) return topic.sourceQuery;
  let cleaned = normalise(query)
    .replace(/\b(?:please|find|show|search|look|looking|give|tell|need|want|could|would|can|me|my|the|some|for|about|from|with|and|or|latest|newest|recent|current|today|now|up to date|this week|this month)\b/g, ' ')
    .replace(/\b(?:cyber\s+security)\b/g, 'cybersecurity')
    .replace(/\b(?:videos?|video tutorials?|tutorials?|news|advisories?|articles?|resources?|learning materials?|repositories?|repos|open source projects?|public posts?|discussions?|jobs?|internships?|interns?|vacancies|openings?|events?|challenges?|ctfs?)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,?!;:]+$/g, '')
    .trim();
  if (!cleaned) {
    if (filter === 'video') return 'cybersecurity';
    if (filter === 'news') return 'cybersecurity';
    if (filter === 'job' || filter === 'internship') return 'cybersecurity';
    if (filter === 'repository') return 'cybersecurity';
    if (filter === 'community') return 'cybersecurity';
    return 'cybersecurity learning';
  }
  return cleaned;
}

function sourceSearchLinks(query, filter = '', topic = null, jurisdiction = detectJurisdiction(query)) {
  if (topic?.id === 'cybersecurity-law') {
    if (isFrameworkIntent(query)) return [
      { label: 'NIST Privacy Framework', url: 'https://www.nist.gov/privacy-framework' },
      { label: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
    ];
    if (jurisdiction) return legalOfficialLinks(jurisdiction, topic.sourceQuery);
    return [];
  }
  const sourceQuery = providerSearchQuery(query, filter, topic);
  const q = encodeURIComponent(sourceQuery);
  const hashtag = normalise(query).replace(/[^a-z0-9]/g, '').slice(0, 50) || 'cybersecurity';
  if (filter === 'video') return [
    { label: 'YouTube newest uploads', url: `https://www.youtube.com/results?search_query=${q}&sp=CAI%3D` },
    { label: 'YouTube live streams', url: `https://www.youtube.com/results?search_query=${q}&sp=EgJAAQ%3D%3D` },
  ];
  if (filter === 'repository') return [
    { label: 'GitHub repositories', url: `https://github.com/search?q=${q}&type=repositories` },
    { label: 'GitHub topics', url: `https://github.com/topics/cybersecurity` },
  ];
  if (filter === 'job' || filter === 'internship') return [
    { label: 'LinkedIn jobs', url: `https://www.linkedin.com/jobs/search/?keywords=${q}` },
    { label: 'Indeed jobs', url: `https://www.indeed.com/jobs?q=${q}` },
    { label: 'Remote OK jobs', url: `https://remoteok.com/remote-jobs.rss` },
    { label: 'Search public listings', url: `https://www.google.com/search?q=${q}%20jobs%20internships` },
  ];
  if (filter === 'event') return [
    { label: 'CTFtime upcoming events', url: 'https://ctftime.org/event/list/upcoming' },
    { label: 'GitHub CTF projects', url: 'https://github.com/topics/ctf' },
  ];
  if (filter === 'news') return [
    { label: 'Google News', url: `https://news.google.com/search?q=${q}` },
    { label: 'CISA advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories' },
    { label: 'CERT-In advisories', url: 'https://www.cert-in.org.in/' },
  ];
  if (filter === 'education') return [
    { label: 'University programmes', url: `https://www.google.com/search?q=${q}%20university%20cybersecurity%20programme` },
    { label: 'Scholarships and admissions', url: `https://www.google.com/search?q=${q}%20cybersecurity%20scholarship%20admission` },
  ];
  if (filter === 'community') return [
    { label: 'Reddit discussions', url: `https://www.reddit.com/search/?q=${q}&sort=new` },
    { label: 'X recent posts', url: `https://x.com/search?q=${q}&f=live` },
    { label: 'LinkedIn posts', url: `https://www.linkedin.com/search/results/content/?keywords=${q}` },
    { label: 'Instagram hashtag', url: `https://www.instagram.com/explore/tags/${hashtag}/` },
  ];
  return [
    { label: 'YouTube', url: `https://www.youtube.com/results?search_query=${q}&sp=CAI%3D` },
    { label: 'GitHub', url: `https://github.com/search?q=${q}&type=repositories` },
    { label: 'Reddit', url: `https://www.reddit.com/search/?q=${q}&sort=new` },
    { label: 'X', url: `https://x.com/search?q=${q}&f=live` },
    { label: 'LinkedIn posts', url: `https://www.linkedin.com/search/results/content/?keywords=${q}` },
    { label: 'News', url: `https://news.google.com/search?q=${q}` },
  ].filter((item) => validHttpUrl(item.url));
}

function buildCatalogueItems() {
  const items = [];
  for (const row of resources || []) items.push({
    id: `resource:${row.id}`, kind: 'resource', title: row.name, summary: row.description, url: row.url, source: row.provider,
    publishedAt: row.updatedAt || null, category: row.category, skills: row.skills, note: row.note, access: row.kind,
    targetPage: 'resources', targetLabel: 'Browse Resources', confidence: 'Existing OpenCyberPath catalogue entry',
  });
  for (const row of labs || []) items.push({
    id: `lab:${row.id}`, kind: 'lab', title: row.title, summary: row.summary || row.description, url: row.url || row.pdf || row.docx,
    source: row.provider || 'OpenCyberPath lab library', category: row.category, skills: row.tags || [row.skill], note: row.note,
    targetPage: 'labs', targetLabel: 'Browse Labs', confidence: 'Existing OpenCyberPath learning lab',
  });
  for (const row of careerPaths || []) items.push({
    id: `path:${row.id}`, kind: 'path', title: row.title, summary: row.desc || row.description || row.summary,
    source: 'OpenCyberPath learning path', category: row.category, skills: row.topics || row.skills || [],
    targetPage: 'roadmap', targetPathId: row.id, targetLabel: 'Open learning path',
  });
  for (const row of certifications || []) items.push({
    id: `certification:${row.id || row.name}`, kind: 'certification', title: row.name || row.title,
    summary: row.description || row.summary || row.note, url: row.officialUrl || row.url,
    source: row.issuer || row.provider || 'Certification issuer', category: row.category, skills: row.skills || [row.level],
    targetPage: 'certifications', targetLabel: 'Browse certifications',
  });
  for (const row of learningVideos || []) items.push({
    id: `video:${row.id || row.title}`, kind: 'video', title: row.title, summary: row.note || row.summary || row.description,
    url: row.url, source: row.creator || row.channel || 'Video publisher', category: row.topic || row.category,
    skills: row.tags || [], targetPage: 'discover', targetLabel: 'Explore discovery', confidence: 'Existing curated video link; open publisher for current context',
  });
  return items.filter((item) => item.title);
}

function routeLabel(page) { return ROUTES.find((item) => item.page === page)?.label || 'Open section'; }

export default function SiteGuideAssistant({
  onOpenPage = () => {},
  onOpenPath = () => {},
  opened: controlledOpened,
  onDismiss = () => {},
  hideLauncher = false,
  panelStyle = undefined,
  onResetPosition = () => {},
}) {
  const [internalOpened, setInternalOpened] = useState(false);
  const opened = typeof controlledOpened === 'boolean' ? controlledOpened : internalOpened;
  const setOpened = (nextValue) => {
    const nextOpened = typeof nextValue === 'function' ? nextValue(opened) : nextValue;
    if (typeof controlledOpened !== 'boolean') setInternalOpened(nextOpened);
    if (!nextOpened) onDismiss();
  };
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [feed, setFeed] = useState([]);
  const [sourceStatus, setSourceStatus] = useState(null);
  const [snapshotNote, setSnapshotNote] = useState('The site guide searches the built-in catalogue and the latest public-source snapshot available to this deployment.');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      fetch('/data/opencyberpath-discovery.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/opencyberpath-automation-status.json', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([data, status]) => {
      if (!live) return;
      setFeed(Array.isArray(data?.items) ? data.items : []);
      setSourceStatus(status || null);
      if (data?.generatedAt) {
        const date = new Date(data.generatedAt);
        setSnapshotNote(`Public-source snapshot last generated ${Number.isNaN(date.getTime()) ? 'at an unknown time' : date.toLocaleString()}. Some providers need approved API credentials; unavailable sources are not treated as empty.`);
      }
    });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!opened) return;
    window.setTimeout(() => inputRef.current?.focus(), 40);
    window.setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 40);
  }, [opened, messages.length]);

  useEffect(() => {
    if (!opened) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpened(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened]);

  const catalogue = useMemo(() => buildCatalogueItems(), []);
  const allItems = useMemo(() => {
    const combined = [...catalogue, ...feed];
    const seen = new Set();
    return combined.filter((item) => {
      const key = item.id || item.url;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [catalogue, feed]);

  const submitQuery = (value = query) => {
    const text = String(value || '').trim();
    if (!text || busy) return;
    setBusy(true);
    setQuery('');
    const route = queryRoute(text);
    const explicitNavigation = /^(?:open|go(?: to)?|take me|navigate|bring me|show me|please open|switch to)\b/.test(normalise(text));
    const capabilities = isCapabilitiesQuestion(text);
    const greeting = isSimpleGreeting(text);
    const filter = inferredFilter(text);
    const topic = detectTopic(text);
    const jurisdiction = detectJurisdiction(text);
    const frameworkIntent = isFrameworkIntent(text);
    const needsLegalJurisdiction = topic?.id === 'cybersecurity-law' && !jurisdiction && !frameworkIntent;
    const latestRequested = asksForLatest(text);
    const filterMatches = (item) => filter === 'job'
      ? ['job', 'internship'].includes(item.kind)
      : filter === 'internship' ? item.kind === 'internship' : !filter || item.kind === filter;

    let matched = [];
    let assistantText = '';
    let suggestions = [];
    let typedLinks = [];

    if (capabilities) {
      assistantText = 'I can help you navigate OpenCyberPath, find relevant public learning resources and videos, discover indexed news and advisories, look for jobs and internships, explore CTFs, labs and certifications, and choose a manageable next learning step. I only show material available to this deployment or links to the original public source; I will label stale or unavailable sources instead of pretending everything is connected. What would you like to do first?';
      suggestions = CAPABILITY_SUGGESTIONS;
    } else if (greeting) {
      assistantText = 'Hey! I’m your OpenCyberPath site guide. I can help you find learning resources, videos, labs, certifications, public security updates and opportunities, or take you to the right section. Pick a starting point below.';
      suggestions = CAPABILITY_SUGGESTIONS.slice(0, 4);
    } else if (route && explicitNavigation) {
      assistantText = `Opening ${route.label}. You can return here any time to search the available catalogue and public-source snapshots.`;
      onOpenPage(route.page);
    } else if (needsLegalJurisdiction) {
      assistantText = 'Cybersecurity and data-protection laws differ by country or region. Which jurisdiction should I use? I will distinguish enacted legislation from regulator guidance and voluntary frameworks rather than present them as interchangeable.';
      suggestions = LAW_JURISDICTION_SUGGESTIONS;
    } else {
      let scored = allItems.filter((item) => cleanTitle(item.title || item.name)).map((item) => {
        const match = topicMatch(item, topic);
        return {
          ...item,
          _topicMatch: match,
          _score: scoreRecord(item, text) + (filterMatches(item) ? (filter ? 8 : 0) : filter ? -3 : 0) + (match === 'exact' ? 12 : match === 'related' ? 2 : 0),
        };
      }).filter((item) => item._score > 0 || item._topicMatch === 'exact');

      if (topic) {
        const isLawTopic = topic.id === 'cybersecurity-law';
        const topical = scored.filter((item) => {
          if (item._topicMatch === 'none' || (filter && !filterMatches(item))) return false;
          if (!isLawTopic) return true;
          if (frameworkIntent) return isFrameworkRecord(item);
          return Boolean(jurisdiction && isLegislationRecord(item) && itemMatchesJurisdiction(item, jurisdiction));
        });
        const exact = topical.filter((item) => item._topicMatch === 'exact');
        const related = topical.filter((item) => item._topicMatch === 'related');
        matched = (exact.length ? exact : related)
          .sort((a, b) => (b._topicMatch === 'exact') - (a._topicMatch === 'exact') || (latestRequested ? compareFreshness(a, b) : 0) || b._score - a._score || timeValue(b) - timeValue(a))
          .slice(0, 5);
        if (isLawTopic && !frameworkIntent) {
          if (matched.length) assistantText = `I found items classified as legislation or legal text for ${jurisdiction.label}. Please verify the current wording and effective date at the official publisher; this is research guidance, not legal advice.`;
          else assistantText = `I couldn't find a jurisdiction-matched legislative entry for ${jurisdiction.label} in the current indexed material. I have linked official legal and regulator portals below instead of presenting a general privacy framework as a law.`;
        } else if (isLawTopic && frameworkIntent && matched.length) {
          assistantText = 'I found privacy or cybersecurity framework material. Frameworks and standards provide guidance; they are not automatically laws or binding regulations.';
        } else if (exact.length) {
          assistantText = `I found results that explicitly mention ${topic.label}. Check each original publisher for publication date, scope and current availability.`;
        } else if (matched.length) {
          assistantText = `I couldn't find an exact ${topic.label} match in the currently indexed material. These broader related resources may help with prerequisites; use the targeted public-source searches below to look for more specific, current material.`;
        } else {
          assistantText = `I couldn't find a strong ${topic.label} match in the indexed material. That does not mean nothing exists—the available snapshot may be incomplete. I’ve added focused searches of original public sources below.`;
        }
      } else if (filter) {
        const typeMatches = scored.filter((item) => filterMatches(item));
        matched = typeMatches
          .sort((a, b) => (latestRequested ? compareFreshness(a, b) : 0) || b._score - a._score || timeValue(b) - timeValue(a))
          .slice(0, 5);
        if (matched.length) assistantText = `Here are the most relevant ${filter === 'job' ? 'jobs and internships' : filter === 'event' ? 'events and challenges' : `${filter} results`} available in the current catalogue and indexed snapshots. Check the original source for freshness, eligibility and terms.`;
        else assistantText = `I couldn't find a matching ${filter} item in the currently indexed material. This is not proof that none exists; source coverage may be incomplete. Try the original public-source searches below.`;
      } else {
        matched = scored.sort((a, b) => (latestRequested ? compareFreshness(a, b) : 0) || b._score - a._score || timeValue(b) - timeValue(a)).slice(0, 5);
        if (matched.length) assistantText = 'I found the closest matches in the OpenCyberPath catalogue and public-source snapshots currently available. Check the original publisher for freshness, access requirements and context.';
        else assistantText = 'I couldn’t find a confident match in the currently indexed material. This does not mean nothing exists: some sources require API access, and the local snapshot may be stale. You can open a section or search original public sources below.';
      }

      if (latestRequested && matched.length) {
        const datedCount = matched.filter((item) => publicationTimeValue(item) > 0).length;
        if (datedCount < matched.length) assistantText += ' Publication dates are missing for some results, so I cannot guarantee those items are the newest. Use the source searches below to verify current posts.';
      }
      typedLinks = sourceSearchLinks(text, filter, topic, jurisdiction);
      const lowerQuery = normalise(text);
      if (/\b(wifi|wi-fi|wireless network)\b/.test(lowerQuery)) assistantText += ' For practical Wi-Fi security exercises, use your own router or an explicitly authorized lab only.';
      if (/\b(bug bounty|penetration test|pentest|vulnerability testing)\b/.test(lowerQuery)) assistantText += ' Only test systems that you own or that are explicitly in an authorized programme scope.';
      if (/\b(dark web|darknet)\b/.test(lowerQuery)) assistantText += ' I can help with public research, legal context and safety risks; avoid illegal marketplaces and unknown downloads.';
      if (/\b(phone hacking|mobile hacking|android hacking)\b/.test(lowerQuery)) assistantText += ' Use an emulator or a device you own for hands-on learning.';
    }

    const nextMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      query: text, text: assistantText, results: matched, suggestions,
      route: route && !explicitNavigation ? route : null,
      latestMode: latestRequested,
      links: typedLinks,
      linksHeading: topic?.id === 'cybersecurity-law' && jurisdiction && !frameworkIntent ? 'Official legal sources' : topic?.id === 'cybersecurity-law' && frameworkIntent ? 'Official framework sources' : 'Search original public sources',
      snapshotNote,
    };
    setMessages((current) => [...current, { id: `user-${nextMessage.id}`, role: 'user', text }, nextMessage]);
    setBusy(false);
  };

  const selectQuick = (prompt) => { setQuery(prompt); submitQuery(prompt); };
  const runRoute = (route) => { onOpenPage(route.page); setOpened(false); };
  const openItem = (item) => {
    if (item.targetPathId) { onOpenPath(item.targetPathId); setOpened(false); return; }
    if (item.targetPage) { onOpenPage(item.targetPage); setOpened(false); return; }
    const href = validHttpUrl(item.url);
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };
  const sourceStatusText = sourceStatus?.status === 'fresh' ? 'Source snapshots are fresh' : sourceStatus?.status === 'partial' ? 'Some sources are unavailable or need access' : sourceStatus ? 'Source coverage is partial or stale' : 'Using indexed site content while live discovery status loads';

  return <div className={hideLauncher ? 'ocp-guide-panel-host' : 'ocp-guide-assistant'}>
    {opened && <section className="ocp-guide-panel" style={panelStyle} role="dialog" aria-modal="false" aria-labelledby="ocp-guide-title" aria-describedby="ocp-guide-description">
      <header className="ocp-guide-head">
        <div className="ocp-guide-avatar" aria-hidden="true">OCP</div>
        <div className="ocp-guide-heading"><h2 id="ocp-guide-title">OpenCyberPath Guide</h2><p id="ocp-guide-description">Search the site · Find public learning · Navigate</p></div>
        <button className="ocp-guide-reset-position" type="button" onClick={onResetPosition} aria-label="Reset assistant position" title="Reset assistant position">Reset</button>
        <button className="ocp-guide-close" type="button" onClick={() => setOpened(false)} aria-label="Close site guide">×</button>
      </header>
      <div className="ocp-guide-status"><span className={`ocp-guide-status-dot ${sourceStatus?.status === 'fresh' ? 'is-fresh' : ''}`} />{sourceStatusText}</div>
      {(sourceStatus?.sources || []).length > 0 && <details className="ocp-guide-source-health ocp-guide-global-health"><summary>Source availability and coverage ({sourceStatus.sources.length})</summary>{sourceStatus.sources.map((item) => <p key={item.id}><b>{item.label}:</b> {item.status} — {item.note}</p>)}</details>}
      <div className="ocp-guide-log" ref={logRef} aria-live="polite">
        {messages.length === 0 && <div className="ocp-guide-welcome"><span className="ocp-guide-kicker">YOUR SITE GUIDE</span><h3>Hey! What are we working on today?</h3><p>Ask for a topic, a learning path, videos, labs, certifications, public research, jobs or internships. I’ll search what this deployment has indexed and show links to original sources.</p><div className="ocp-guide-quick-grid">{QUICK_PROMPTS.map((item) => <button key={item.label} type="button" onClick={() => selectQuick(item.query)}><span>{item.icon}</span>{item.label}<b>↗</b></button>)}</div><p className="ocp-guide-note">{snapshotNote}</p></div>}
        {messages.map((entry) => entry.role === 'user' ? <div className="ocp-guide-user-message" key={entry.id}>{entry.text}</div> : <article className="ocp-guide-answer" key={entry.id}>
          <p>{entry.text}</p>
          {entry.route && <button className="ocp-guide-route" type="button" onClick={() => runRoute(entry.route)}><span>↗</span> Open {entry.route.label}</button>}
          {entry.results?.length > 0 && <div className="ocp-guide-results">{entry.results.map((item) => <div className="ocp-guide-result" key={item.id || item.url}>
            <div className="ocp-guide-result-top"><span>{item._topicMatch === 'related' ? `Related ${TYPE_LABEL[item.kind] || 'source'}` : TYPE_LABEL[item.kind] || 'Public source'}</span>{resultDateLabel(item, entry.latestMode) ? <time dateTime={item.publishedAt || item.published_at || item.pubDate || item.published || item.datePublished || undefined}>{resultDateLabel(item, entry.latestMode)}</time> : null}</div>
            <h4>{cleanTitle(item.title || item.name) || 'Headline unavailable — open the original source for details'}</h4>
            <p>{cleanSummary(item.summary || item.description || item.note || item.confidence || 'Open the original source for details.')}</p>
            <div className="ocp-guide-result-source">{item.source || item.provider || 'OpenCyberPath'}{item.category ? ` · ${item.category}` : ''}</div>
            {item._topicMatch === 'related' && <small className="ocp-guide-related-note">Related topic — this source does not explicitly mention the exact subtopic.</small>}
            <div className="ocp-guide-result-actions">
              {resultUrl(item) && <a href={resultUrl(item)} target="_blank" rel="noreferrer" referrerPolicy="no-referrer">{item.kind === 'video' ? 'Watch video' : item.kind === 'repository' ? 'View repository' : item.kind === 'news' ? 'Read update' : item.kind === 'community' ? 'Open discussion' : item.kind === 'job' ? 'View job' : item.kind === 'internship' ? 'View internship' : item.kind === 'event' ? 'View event' : item.kind === 'certification' ? 'View certification' : item.kind === 'lab' ? 'Open lab' : 'Open resource'} ↗</a>}
              {(item.targetPage || item.targetPathId) && <button type="button" onClick={() => openItem(item)}>{item.targetLabel || 'Open in site'}</button>}
            </div>
            {(item.reviewStatus === 'PUBLIC_SOURCE_CANDIDATE' || item.reviewStatus === 'UNVERIFIED_DISCOVERY' || item.reviewStatus === 'retained-previous-snapshot') && <small className="ocp-guide-candidate-note">Discovery candidate — verify context and freshness at the source.</small>}
          </div>)}</div>}
          {entry.suggestions?.length > 0 && <div className="ocp-guide-suggestions" aria-label="Suggested next actions">{entry.suggestions.map((suggestion) => <button key={suggestion.label} type="button" onClick={() => submitQuery(suggestion.query)}>{suggestion.label}<span>↗</span></button>)}</div>}
          {entry.links?.length > 0 && <div className="ocp-guide-source-links"><span>{entry.linksHeading || 'Search original public sources'}</span><small>{entry.linksHeading === 'Official legal sources' ? 'Official source portals and legal texts. Check commencement dates, amendments and jurisdiction before relying on a provision.' : entry.linksHeading === 'Official framework sources' ? 'Official framework pages from the issuing organizations. Frameworks provide guidance and do not automatically create legal obligations.' : 'These links open the providers’ own search pages; they do not mean every provider is connected to live indexing.'}</small><div>{entry.links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" key={link.label}>{link.label} ↗</a>)}</div></div>}
        </article>)}
      </div>
      <form className="ocp-guide-input-row" onSubmit={(event) => { event.preventDefault(); submitQuery(); }}>
        <label className="ocp-guide-input-wrap"><span className="sr-only">Ask OpenCyberPath</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask for a topic, page, or opportunity…" maxLength={240} /></label>
        <button type="submit" disabled={!query.trim() || busy} aria-label="Search OpenCyberPath">{busy ? '…' : '↑'}</button>
      </form>
      <footer className="ocp-guide-foot">Public sources only · Candidate posts are not endorsements · Authorized learning environments</footer>
    </section>}
    <button className={`ocp-guide-launcher ${opened ? 'is-open' : ''} ${hideLauncher ? 'is-hidden' : ''}`} type="button" aria-expanded={opened} aria-controls="ocp-guide-title" onClick={() => setOpened((value) => !value)}><span className="ocp-guide-launcher-mark">{opened ? '×' : '⌕'}</span><span>{opened ? 'Close guide' : 'Ask OpenCyberPath'}</span></button>
  </div>;
}
