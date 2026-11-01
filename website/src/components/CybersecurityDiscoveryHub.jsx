import { useEffect, useMemo, useState } from 'react';
import { resources } from '../data/resources.js';
import { labs } from '../data/labs.js';
import { careerPaths } from '../data/careerPaths.js';
import { certifications } from '../data/certifications.js';
import { learningVideos } from '../data/learningVideos.js';
import './CybersecurityDiscoveryHub.css';

const DOMAINS = [
  {
    id: 'network-security', title: 'Network Security', short: 'NETWORKS', icon: '◈', level: 'Foundations → Advanced',
    description: 'Understand how traffic moves, where network controls sit, and how defenders investigate activity.',
    keywords: ['network security', 'networking', 'tcp/ip', 'dns', 'packet analysis', 'wireshark', 'firewall', 'ids', 'ips', 'routing', 'subnet', 'pcap', 'network monitoring', 'ethernet', 'netflow'],
    youtube: 'network security fundamentals packet analysis firewalls',
    docs: [{ name: 'Wireshark documentation', url: 'https://www.wireshark.org/docs/' }, { name: 'Cloudflare Learning Center: DNS', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' }, { name: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' }],
    firstSteps: ['TCP/IP, ports, routing, DNS and HTTP', 'Packet captures, filters and normal network behaviour', 'Firewalls, segmentation and network telemetry', 'Detection hypotheses, evidence and incident notes'],
    project: 'Investigate a supplied packet capture or synthetic network timeline; document what happened, what the evidence supports, and what remains unknown.',
    adjacent: ['soc-siem', 'threat-intelligence', 'cloud-security'],
  },
  {
    id: 'soc-siem', title: 'SOC & SIEM', short: 'DETECT', icon: '⌁', level: 'Beginner → Advanced',
    description: 'Learn alert triage, logs, correlation, detection engineering, threat hunting, and incident escalation.',
    keywords: ['soc', 'siem', 'security operations', 'logs', 'alert triage', 'wazuh', 'splunk', 'sentinel', 'kql', 'detection engineering', 'sigma', 'threat hunting', 'security monitoring', 'endpoint detection'],
    youtube: 'SOC analyst SIEM alert triage detection engineering',
    docs: [{ name: 'Wazuh getting started', url: 'https://documentation.wazuh.com/current/getting-started/index.html' }, { name: 'Sigma detection rules', url: 'https://github.com/SigmaHQ/sigma' }, { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' }],
    firstSteps: ['Networking, Windows/Linux and timestamps', 'Events vs alerts vs incidents; normalise a log record', 'Triage, correlation, false positives and escalation', 'Write a reproducible investigation and detection rationale'],
    project: 'Triage a synthetic alert set, create an evidence-backed timeline, explain a benign alternative, and document a defensible disposition.',
    adjacent: ['network-security', 'threat-intelligence', 'dfir'],
  },
  {
    id: 'threat-intelligence', title: 'Threat Intelligence & OSINT', short: 'INTELLIGENCE', icon: '⌖', level: 'Beginner → Advanced',
    description: 'Connect public reporting, technical indicators, adversary techniques and evidence-led analysis.',
    keywords: ['threat intelligence', 'osint', 'mitre attack', 'ioc', 'indicators of compromise', 'threat actor', 'attribution', 'cti', 'phishing', 'attack campaign', 'open source intelligence', 'intel analysis'],
    youtube: 'cyber threat intelligence OSINT MITRE ATT&CK analysis',
    docs: [{ name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' }, { name: 'CISA advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories' }, { name: 'FIRST standards and resources', url: 'https://www.first.org/' }],
    firstSteps: ['Separate an observation, an indicator, a hypothesis and a conclusion', 'Evaluate source reliability and timestamp freshness', 'Map behaviour to a framework without treating a mapping as proof', 'Write an intelligence note with confidence and alternative explanations'],
    project: 'Compare two public reports about the same incident and produce a sourced timeline with confirmed facts, assessments and unknowns separated.',
    adjacent: ['soc-siem', 'dfir', 'malware-analysis'],
  },
  {
    id: 'dfir', title: 'DFIR & Incident Response', short: 'INVESTIGATE', icon: '⌕', level: 'Beginner → Advanced',
    description: 'Build evidence-handling discipline, forensic timelines, incident scoping, containment and recovery reasoning.',
    keywords: ['dfir', 'digital forensics', 'incident response', 'forensics', 'memory forensics', 'disk forensics', 'autopsy', 'evidence preservation', 'timeline', 'ransomware response', 'containment', 'recovery'],
    youtube: 'digital forensics incident response DFIR investigation timeline',
    docs: [{ name: 'NIST incident response resources', url: 'https://csrc.nist.gov/projects/incident-response' }, { name: 'Autopsy digital forensics', url: 'https://www.autopsy.com/' }, { name: 'CISA incident response guidance', url: 'https://www.cisa.gov/stopransomware' }],
    firstSteps: ['Evidence integrity, timestamps, hashes and chain of custody', 'Windows/Linux artefacts and event timelines', 'Scope, containment decisions and evidence preservation', 'Write a report that separates facts from interpretation'],
    project: 'Use a supplied forensic training set to construct a timeline, record evidence provenance, and state the limits of your findings.',
    adjacent: ['soc-siem', 'threat-intelligence', 'malware-analysis'],
  },
  {
    id: 'cloud-security', title: 'Cloud Security', short: 'CLOUD', icon: '☁', level: 'Foundations → Advanced',
    description: 'Explore cloud identity, configuration, logging, workloads, network boundaries and shared responsibility.',
    keywords: ['cloud security', 'aws', 'azure', 'gcp', 'iam', 'cloud posture', 'misconfiguration', 'cloud monitoring', 'container security', 'kubernetes', 'sentinel', 'identity access management'],
    youtube: 'cloud security fundamentals AWS Azure GCP IAM misconfiguration',
    docs: [{ name: 'AWS security documentation', url: 'https://docs.aws.amazon.com/security/' }, { name: 'Microsoft cloud security', url: 'https://learn.microsoft.com/en-us/security/' }, { name: 'Google Cloud security', url: 'https://cloud.google.com/security' }],
    firstSteps: ['Cloud service models and shared-responsibility boundaries', 'Identity, roles, least privilege and secure authentication', 'Audit logs, public exposure and configuration hygiene', 'Threat model a small architecture and propose measurable controls'],
    project: 'Review a fictional cloud architecture and document identity risks, exposure paths, evidence sources, and safe corrective controls.',
    adjacent: ['network-security', 'soc-siem', 'security-engineering'],
  },
  {
    id: 'application-security', title: 'Application Security', short: 'APPSEC', icon: '⌘', level: 'Beginner → Advanced',
    description: 'Learn web and API security, secure design, code review, testing methodology and remediation.',
    keywords: ['application security', 'appsec', 'web security', 'api security', 'owasp', 'http', 'secure coding', 'sast', 'dast', 'sql injection', 'xss', 'authentication', 'authorization', 'burp suite'],
    youtube: 'application security OWASP web security API security secure coding',
    docs: [{ name: 'OWASP Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/' }, { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' }, { name: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }],
    firstSteps: ['HTTP requests, sessions, cookies and authentication', 'Trust boundaries, input handling and access control', 'Reproduce issues inside an authorised training lab', 'Explain impact, propose a fix, and retest the intended control'],
    project: 'Complete an authorised training lab and submit a report with reproducible evidence, impact, remediation and a retest result.',
    adjacent: ['penetration-testing', 'cloud-security', 'security-engineering'],
  },
  {
    id: 'penetration-testing', title: 'Penetration Testing', short: 'TEST', icon: '⌁', level: 'Foundations → Advanced',
    description: 'Develop scoped assessment methodology, safe tooling, evidence quality, risk explanation and reporting.',
    keywords: ['penetration testing', 'pentest', 'ethical hacking', 'vulnerability assessment', 'bug bounty', 'burp suite', 'nmap', 'metasploit', 'web testing', 'owasp', 'red team', 'security assessment'],
    youtube: 'ethical penetration testing methodology authorised lab vulnerability assessment',
    docs: [{ name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' }, { name: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/' }, { name: 'NIST SP 800-115', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' }],
    firstSteps: ['Networking, operating systems and HTTP foundations', 'Scope, permissions, exclusions and test impact', 'Practise with intentionally vulnerable applications', 'Produce reproducible findings and verify remediations'],
    project: 'Assess a deliberately vulnerable local application or assigned training target, then write a responsible report and retest the fix.',
    adjacent: ['application-security', 'network-security', 'security-engineering'],
  },
  {
    id: 'malware-analysis', title: 'Malware Analysis & Reverse Engineering', short: 'RESEARCH', icon: '⌬', level: 'Intermediate → Advanced',
    description: 'Study suspicious-file triage, static indicators, behaviour, signatures and isolated analysis practices.',
    keywords: ['malware analysis', 'reverse engineering', 'yara', 'sandbox', 'static analysis', 'dynamic analysis', 'pe files', 'memory analysis', 'threat research', 'disassembly'],
    youtube: 'malware analysis YARA static analysis reverse engineering defensive research',
    docs: [{ name: 'YARA documentation', url: 'https://yara.readthedocs.io/en/stable/' }, { name: 'REMnux toolkit', url: 'https://remnux.org/' }, { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' }],
    firstSteps: ['File metadata, hashes and source provenance', 'Static inspection and safe indicator extraction', 'Understand sandbox limits and isolation requirements', 'Write a behaviour report using known training samples'],
    project: 'Classify a benign or purpose-built training sample, document observed indicators, and state what the evidence cannot establish.',
    adjacent: ['threat-intelligence', 'dfir', 'soc-siem'],
  },
  {
    id: 'security-engineering', title: 'Security Engineering & DevSecOps', short: 'ENGINEERING', icon: '⚙', level: 'Foundations → Advanced',
    description: 'Connect secure architecture, software delivery, automation, detection as code and operational reliability.',
    keywords: ['security engineering', 'devsecops', 'secure development', 'ci/cd', 'supply chain security', 'container', 'kubernetes', 'threat modeling', 'automation', 'iam', 'infrastructure as code'],
    youtube: 'security engineering DevSecOps secure software supply chain threat modeling',
    docs: [{ name: 'NIST Secure Software Development Framework', url: 'https://csrc.nist.gov/Projects/ssdf' }, { name: 'OWASP SAMM', url: 'https://owaspsamm.org/' }, { name: 'Sigstore', url: 'https://www.sigstore.dev/' }],
    firstSteps: ['Trust boundaries and threat modelling', 'Secure coding, secrets handling and dependency hygiene', 'CI checks, signing, provenance and release controls', 'Demonstrate a control with reproducible evidence and limitations'],
    project: 'Review a sample delivery pipeline and propose a small set of security checks with clear success criteria and false-positive considerations.',
    adjacent: ['application-security', 'cloud-security', 'soc-siem'],
  },
  {
    id: 'grc-infosec', title: 'Information Security, GRC & Risk', short: 'GOVERN', icon: '▤', level: 'Beginner → Advanced',
    description: 'Understand security governance, risk, controls, audit evidence, privacy and business impact.',
    keywords: ['information security', 'grc', 'governance', 'risk', 'compliance', 'audit', 'iso 27001', 'nist', 'privacy', 'security policy', 'third party risk', 'business continuity'],
    youtube: 'information security GRC risk assessment ISO 27001 NIST cybersecurity framework',
    docs: [{ name: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' }, { name: 'ISO/IEC 27001 overview', url: 'https://www.iso.org/standard/27001' }, { name: 'CIS Critical Security Controls', url: 'https://www.cisecurity.org/controls' }],
    firstSteps: ['Confidentiality, integrity, availability and business context', 'Risk statements, likelihood, impact and risk treatment', 'Map controls to evidence and owners', 'Write a concise risk register and practical remediation plan'],
    project: 'Create a risk register for a fictional small organisation, supporting each rating with an assumption and a proposed control.',
    adjacent: ['security-engineering', 'cloud-security', 'soc-siem'],
  },
  {
    id: 'identity-security', title: 'Identity & Access Security', short: 'IDENTITY', icon: '◎', level: 'Foundations → Advanced',
    description: 'Explore authentication, authorisation, privileged access, federation, secrets and identity monitoring.',
    keywords: ['identity security', 'iam', 'authentication', 'authorization', 'mfa', 'passkeys', 'privileged access', 'active directory', 'entra id', 'oauth', 'sso', 'credential security'],
    youtube: 'identity access management IAM MFA privilege security fundamentals',
    docs: [{ name: 'CISA identity guidance', url: 'https://www.cisa.gov/resources-tools/resources/identity-and-access-management-recommended-best-practices-administrators' }, { name: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }, { name: 'Microsoft Entra documentation', url: 'https://learn.microsoft.com/en-us/entra/' }],
    firstSteps: ['Authentication vs authorisation and account lifecycle', 'MFA, federation, sessions and least privilege', 'Audit sign-in evidence and investigate anomalies', 'Design access controls and document break-glass limitations'],
    project: 'Audit a fictional access matrix, identify excessive privilege, and recommend least-privilege changes with a test plan.',
    adjacent: ['cloud-security', 'soc-siem', 'security-engineering'],
  },
];

const PROFILE_DEFAULT = {
  level: 'New to this topic', goal: 'Build a career path', depth: 'Deep understanding', hours: '3–5 hours',
  explanation: '', practiceIntent: 'Guided labs and projects',
};

function normalise(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+#./ -]/g, ' ').replace(/\s+/g, ' ').trim();
}
function textOf(item) {
  if (!item) return '';
  return normalise(Object.values(item).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value) => ['string', 'number'].includes(typeof value)).join(' '));
}
function scoreTerms(text, terms = []) {
  const haystack = normalise(text);
  let score = 0;
  for (const raw of terms) {
    const term = normalise(raw);
    if (!term || term.length < 3) continue;
    if (haystack.includes(term)) score += term.includes(' ') ? 3 : 1;
  }
  return score;
}
function ranked(items, domain, query, titleField = 'title') {
  const terms = [...(domain?.keywords || [])];
  const qTerms = normalise(query).split(' ').filter((word) => word.length > 2);
  return items.map((item) => {
    const haystack = textOf(item);
    const qScore = qTerms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    return { item, score: scoreTerms(haystack, terms) + qScore * 2 };
  }).filter((entry) => entry.score > 0 || (!domain && !qTerms.length))
    .sort((a, b) => b.score - a.score || String(a.item[titleField] || a.item.name || '').localeCompare(String(b.item[titleField] || b.item.name || '')))
    .map(({ item }) => item);
}
function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function dateLabel(value) {
  const date = safeDate(value);
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date) : '';
}
function youtubeSearchUrl(query, live = false) {
  const url = new URL('https://www.youtube.com/results');
  url.searchParams.set('search_query', query);
  // YouTube's built-in upload-date and live-stream filters are applied at the source.
  url.searchParams.set('sp', live ? 'EgJAAQ==': 'CAI=');
  return url.toString();
}
function newsDate(item) {
  return item.publishedAt || item.updatedAt || item.firstSeenAt || null;
}
function resourceLevel(level) {
  const text = String(level || '').toLowerCase();
  if (text.includes('advanced')) return 'Advanced';
  if (text.includes('intermediate')) return 'Intermediate';
  return 'Beginner friendly';
}

export default function CybersecurityDiscoveryHub({ onOpenPage = () => {}, onOpenPath = () => {} }) {
  const [query, setQuery] = useState('');
  const [activeDomainId, setActiveDomainId] = useState('network-security');
  const [feed, setFeed] = useState(null);
  const [feedMessage, setFeedMessage] = useState('Loading the latest public-source snapshot…');
  const [youtubeDiscovery, setYoutubeDiscovery] = useState(null);
  const [youtubeDiscoveryMessage, setYoutubeDiscoveryMessage] = useState('Loading recent YouTube discoveries…');
  const [activeDiscoveredVideoId, setActiveDiscoveredVideoId] = useState('');
  const [activePanel, setActivePanel] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileBuilt, setProfileBuilt] = useState(false);
  const [profile, setProfile] = useState(PROFILE_DEFAULT);

  useEffect(() => {
    let active = true;
    fetch('/data/cyberpulse-feed.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Feed request returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setFeed(data);
        setFeedMessage('Connected to the CyberPulse public-source snapshot.');
      })
      .catch(() => {
        if (active) setFeedMessage('The local news snapshot could not be loaded. You can still explore the sources directly.');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/data/youtube-discovery.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Discovery request returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setYoutubeDiscovery(data);
        setYoutubeDiscoveryMessage(data?.refreshNote || data?.note || 'Automated discovery candidates are available.');
      })
      .catch(() => {
        if (active) setYoutubeDiscoveryMessage('Automated discovery snapshot is unavailable. Live YouTube searches still work.');
      });
    return () => { active = false; };
  }, []);

  const activeDomain = DOMAINS.find((domain) => domain.id === activeDomainId) || DOMAINS[0];
  const searchTerm = query.trim() || activeDomain.title;
  const youtubeQuery = query.trim() ? `${query.trim()} cybersecurity` : (activeDomain.youtube || `${activeDomain.title} cybersecurity`);
  const routeSteps = useMemo(() => {
    const steps = [...activeDomain.firstSteps];
    if (profile.level === 'Know the foundations') steps[0] = `Run a short self-check on ${activeDomain.title} foundations, then skip concepts you can already explain clearly.`;
    if (profile.level === 'Practised in a lab') steps[0] = `Validate your current ${activeDomain.title} knowledge against a small evidence-based exercise before filling gaps.`;
    if (profile.level === 'Experienced professional') steps[0] = `Benchmark your current ${activeDomain.title} practice against current documentation, standards, and known limitations.`;
    if (profile.depth === 'Quick overview') steps[3] = `Summarise the key findings and select one next concept to study more deeply: ${activeDomain.title}.`;
    if (profile.depth === 'Advanced research and practice') steps[3] = `Publish a reproducible technical note or capstone with sources, evidence, alternative explanations, and limitations.`;
    return steps;
  }, [activeDomain, profile.level, profile.depth]);
  const filteredDomains = useMemo(() => {
    const term = normalise(query);
    return DOMAINS.filter((domain) => !term || scoreTerms(`${domain.title} ${domain.description} ${domain.keywords.join(' ')}`, term.split(' ')) > 0);
  }, [query]);

  const relatedResources = useMemo(() => ranked(resources, activeDomain, query, 'name').slice(0, 5), [activeDomain, query]);
  const relatedLabs = useMemo(() => ranked(labs, activeDomain, query, 'title').slice(0, 4), [activeDomain, query]);
  const relatedPaths = useMemo(() => ranked(careerPaths, activeDomain, query, 'title').slice(0, 3), [activeDomain, query]);
  const relatedCerts = useMemo(() => ranked(certifications, activeDomain, query, 'name').slice(0, 3), [activeDomain, query]);
  const relatedVideos = useMemo(() => ranked(learningVideos, activeDomain, query, 'title').slice(0, 3), [activeDomain, query]);
  const youtubeCandidates = useMemo(() => {
    const items = Array.isArray(youtubeDiscovery?.items) ? [...youtubeDiscovery.items] : [];
    const term = normalise(query);
    const topical = items.map((item) => ({ item, score: scoreTerms(textOf(item), activeDomain.keywords) + (term ? scoreTerms(textOf(item), term.split(' ')) * 3 : 0) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (safeDate(b.item.publishedAt)?.getTime() || 0) - (safeDate(a.item.publishedAt)?.getTime() || 0))
      .map(({ item }) => item);
    const newest = items.sort((a, b) => (safeDate(b.publishedAt)?.getTime() || 0) - (safeDate(a.publishedAt)?.getTime() || 0));
    return (topical.length ? topical : newest).slice(0, 9);
  }, [youtubeDiscovery, activeDomain, query]);
  const activeDiscoveredVideo = useMemo(() => (youtubeDiscovery?.items || []).find((item) => item.videoId === activeDiscoveredVideoId) || null, [youtubeDiscovery, activeDiscoveredVideoId]);

  const newsItems = useMemo(() => {
    const items = Array.isArray(feed?.items) ? [...feed.items] : [];
    const term = normalise(query);
    const topical = items.map((item) => ({ item, score: scoreTerms(textOf(item), activeDomain.keywords) + (term ? scoreTerms(textOf(item), term.split(' ')) * 3 : 0) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => (safeDate(newsDate(b.item))?.getTime() || 0) - (safeDate(newsDate(a.item))?.getTime() || 0))
      .map(({ item }) => item);
    const sortedAll = items.sort((a, b) => (safeDate(newsDate(b))?.getTime() || 0) - (safeDate(newsDate(a))?.getTime() || 0));
    return (topical.length ? topical : sortedAll).slice(0, 6);
  }, [feed, activeDomain, query]);

  const feedGenerated = dateLabel(feed?.generatedAt);
  const feedStatus = feed?.status === 'fresh' ? 'Fresh snapshot' : feed?.status === 'partial' ? 'Partial source coverage' : feed ? 'Snapshot loaded' : 'Snapshot unavailable';

  const selectDomain = (id) => {
    setActiveDomainId(id);
    setQuery('');
    setProfileBuilt(false);
    setProfileOpen(false);
    setActivePanel('overview');
  };
  const submitProfile = (event) => {
    event.preventDefault();
    setProfileBuilt(true);
    setProfileOpen(false);
    setActivePanel('path');
  };
  const findIncidentTopic = (item) => {
    const text = textOf(item);
    let best = null;
    let bestScore = 0;
    for (const domain of DOMAINS) {
      const score = scoreTerms(text, domain.keywords);
      if (score > bestScore) { best = domain; bestScore = score; }
    }
    if (best && best.id !== activeDomainId) { setActiveDomainId(best.id); setProfileBuilt(false); setProfileOpen(false); }
    setQuery(item.cveId || item.topic || item.title || '');
    setActivePanel('overview');
    document.getElementById('ocp-discovery-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <section className="section-wrap ocp-discovery" aria-labelledby="ocp-discovery-title">
    <header className="ocp-discovery-hero" id="ocp-discovery-top">
      <div className="ocp-discovery-hero-copy">
        <div className="ocp-discovery-eyebrow"><span className="ocp-discovery-live-dot"/> CYBERSECURITY DISCOVERY ENGINE</div>
        <h1 id="ocp-discovery-title">Go beyond the <em>headline.</em><br/>Explore the whole field.</h1>
        <p>Search a subject and follow its connections: knowledge, current reporting, tools, labs, video research, certifications, and career routes—all from original public sources.</p>
        <form className="ocp-discovery-search" onSubmit={(event) => { event.preventDefault(); const term = normalise(query); if (term) { const match = DOMAINS.map((domain) => ({ domain, score: scoreTerms(`${domain.title} ${domain.description} ${domain.keywords.join(' ')}`, term.split(' ')) })).sort((a, b) => b.score - a.score)[0]; if (match?.score > 0 && match.domain.id !== activeDomainId) { setActiveDomainId(match.domain.id); setProfileBuilt(false); setProfileOpen(false); } } setActivePanel('overview'); }}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Network Security, SOC, cloud IAM, DFIR…" aria-label="Search cybersecurity topics and resources" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          <button type="submit">Explore topic <span>↗</span></button>
        </form>
        <div className="ocp-discovery-trustline"><span>◈ Public-source discovery</span><span>↗ Original publisher links</span><span>⌁ Connected learning paths</span></div>
      </div>
      <aside className="ocp-discovery-snapshot" aria-label="CyberPulse feed status">
        <div className="ocp-snapshot-top"><span className="ocp-snapshot-mark">CP</span><span><small>CYBERPULSE</small><b>Threat & news signal</b></span><span className="ocp-snapshot-status"><i/>{feedStatus}</span></div>
        <div className="ocp-snapshot-numbers"><div><b>{Number.isFinite(feed?.itemCount) ? feed.itemCount : (feed?.items?.length || '—')}</b><span>indexed feed items</span></div><div><b>{feed?.successfulSources ?? '—'}<small>/{feed?.sourceCount ?? '—'}</small></b><span>sources working</span></div></div>
        <p>{feedMessage}</p>
        {feedGenerated && <small className="ocp-snapshot-time">Snapshot generated {feedGenerated}. This is source-feed time, not a claim that every listed article was published that day.</small>}
      </aside>
    </header>

    <section className="ocp-discovery-domains" aria-labelledby="ocp-discovery-domains-title">
      <div className="ocp-discovery-section-head"><div><span className="section-kicker">START WITH YOUR INTEREST</span><h2 id="ocp-discovery-domains-title">Pick a domain. <em>See its connections.</em></h2><p>Recommendations stay focused on your selected topic. Adjacent subjects appear when they add real value.</p></div><span className="ocp-discovery-domain-count">{filteredDomains.length} domains</span></div>
      <div className="ocp-discovery-domain-grid">
        {filteredDomains.map((domain, index) => <button key={domain.id} type="button" className={`ocp-discovery-domain-card ${domain.id === activeDomain.id ? 'is-selected' : ''}`} onClick={() => selectDomain(domain.id)} aria-pressed={domain.id === activeDomain.id}>
          <span className="ocp-domain-card-top"><span className="ocp-domain-symbol">{domain.icon}</span><span className="ocp-domain-seq">{String(index + 1).padStart(2, '0')}</span></span>
          <b>{domain.title}</b><p>{domain.description}</p><span className="ocp-domain-card-bottom">Explore domain <span>↗</span></span>
        </button>)}
        {filteredDomains.length === 0 && <div className="ocp-discovery-empty"><b>No exact domain match yet.</b><p>Your search still powers YouTube and public-source discovery. Try a broader phrase or clear the search.</p><button type="button" onClick={() => setQuery('')}>Show all domains</button></div>}
      </div>
    </section>

    <section className="ocp-discovery-current" aria-labelledby="ocp-discovery-current-title">
      <div className="ocp-discovery-current-heading"><div><span className="ocp-discovery-eyebrow"><span className="ocp-discovery-live-dot"/> TOPIC IN FOCUS</span><h2 id="ocp-discovery-current-title">{activeDomain.title}</h2><p>{activeDomain.description}</p></div><button className="ocp-discovery-profile-button" type="button" onClick={() => { setProfileOpen((open) => !open); setActivePanel('path'); }}><span>◎</span> Build my learning route <span>↗</span></button></div>
      <div className="ocp-discovery-topic-chips" aria-label={`Quick searches for ${activeDomain.title}`}>{activeDomain.keywords.slice(0, 7).map((topic) => <button type="button" key={topic} onClick={() => { setQuery(topic); setActivePanel('overview'); }}>{topic}<span>↗</span></button>)}</div>
      <div className="ocp-discovery-tabs" role="group" aria-label="Choose a domain discovery panel">
        {[['overview','Overview'],['videos','Videos & live streams'],['intel','Latest intelligence'],['path','My learning route']].map(([id, label]) => <button key={id} type="button" aria-pressed={activePanel === id} className={activePanel === id ? 'is-active' : ''} onClick={() => setActivePanel(id)}>{label}{id === 'intel' && feed?.items?.length > 0 ? <span>{feed.items.length}</span> : null}</button>)}
      </div>

      {activePanel === 'overview' && <div className="ocp-discovery-overview">
        <div className="ocp-discovery-primary-grid">
          <article className="ocp-discovery-action-card ocp-action-video"><span className="ocp-action-icon">▶</span><span className="ocp-action-kicker">DYNAMIC DISCOVERY</span><h3>Find current videos</h3><p>Search YouTube for this topic and sort by newest uploads. Results come from YouTube at the time you open them—not a fixed video list.</p><a href={youtubeSearchUrl(youtubeQuery)} target="_blank" rel="noreferrer">Explore newest uploads <span>↗</span></a></article>
          <article className="ocp-discovery-action-card ocp-action-live"><span className="ocp-action-icon">◉</span><span className="ocp-action-kicker">LIVE ON YOUTUBE</span><h3>Find streams happening now</h3><p>Open YouTube’s live-filtered search for researchers and creators covering {activeDomain.title}. Membership restrictions remain with the creator.</p><a href={youtubeSearchUrl(youtubeQuery, true)} target="_blank" rel="noreferrer">Find live streams <span>↗</span></a></article>
          <article className="ocp-discovery-action-card ocp-action-intel"><span className="ocp-action-icon">⌁</span><span className="ocp-action-kicker">PUBLIC SECURITY REPORTING</span><h3>Follow the latest signals</h3><p>Explore reports and advisories, then connect them to tools, mitigations and training relevant to this subject.</p><button type="button" onClick={() => setActivePanel('intel')}>Open threat intelligence <span>↗</span></button></article>
        </div>
        <div className="ocp-discovery-grid-two">
          <section className="ocp-discovery-list-panel"><div className="ocp-discovery-list-head"><div><span className="section-kicker">TRUSTED STARTING POINTS</span><h3>Official documentation</h3></div><span>{activeDomain.docs.length} sources</span></div><div className="ocp-discovery-doc-list">{activeDomain.docs.map((doc) => <a key={doc.url} href={doc.url} target="_blank" rel="noreferrer"><span>↗</span><span><b>{doc.name}</b><small>{new URL(doc.url).hostname}</small></span><span className="ocp-discovery-doc-open">Open source</span></a>)}</div></section>
          <section className="ocp-discovery-list-panel"><div className="ocp-discovery-list-head"><div><span className="section-kicker">THE LEARNING STACK</span><h3>What to learn, in order</h3></div><span>4 stages</span></div><ol className="ocp-discovery-stage-list">{activeDomain.firstSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></li>)}</ol></section>
        </div>
        <div className="ocp-discovery-follow-grid">
          <button type="button" onClick={() => onOpenPage('resources')}><span>▤</span><b>Resources & tools</b><small>Compare guides, tools, docs and providers</small><i>Open library ↗</i></button>
          <button type="button" onClick={() => onOpenPage('labs')}><span>⌘</span><b>Labs & practical exercises</b><small>Apply the concepts in training environments</small><i>Explore practice ↗</i></button>
          <button type="button" onClick={() => onOpenPage('certifications')}><span>◇</span><b>Certifications & exams</b><small>Connect skills to current issuer information</small><i>Explore credentials ↗</i></button>
          <button type="button" onClick={() => onOpenPage('roadmap')}><span>⤴</span><b>Career roadmaps</b><small>Move from foundations to demonstrable evidence</small><i>Explore paths ↗</i></button>
        </div>
      </div>}

      {activePanel === 'videos' && <div className="ocp-discovery-panel-body">
        <div className="ocp-discovery-panel-intro"><div><span className="section-kicker">NOT A STATIC PLAYLIST</span><h3>Discover videos from across YouTube</h3><p>Fresh search links and automated public-video candidates help new creators surface without manually adding every video. Discovery candidates are clearly labelled as unverified until someone checks their relevance and quality.</p></div><span className="ocp-live-pulse">LIVE SEARCH</span></div>
        <div className={`ocp-discovery-candidate-status ${youtubeDiscovery?.status === 'stale' ? 'is-stale' : ''}`}><span className="ocp-candidate-status-dot"/><div><b>{youtubeDiscovery?.itemCount ?? 0} recently discovered video candidates</b><p>{youtubeDiscovery?.generatedAt ? `Last successful discovery snapshot: ${dateLabel(youtubeDiscovery.generatedAt)}. ` : ''}{youtubeDiscoveryMessage}</p></div><span className="ocp-unverified-label">AUTOMATED · UNVERIFIED</span></div>
        {activeDiscoveredVideo && <section className="ocp-discovery-candidate-player" id="ocp-discovered-player"><div className="ocp-discovery-candidate-embed"><iframe src={`https://www.youtube-nocookie.com/embed/${activeDiscoveredVideo.videoId}`} title={activeDiscoveredVideo.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="ocp-discovery-candidate-details"><span className="ocp-action-kicker">YOUTUBE EMBED · ORIGINAL CREATOR</span><h4>{activeDiscoveredVideo.title}</h4><p>{activeDiscoveredVideo.summary || 'Open the original video for its full description and context.'}</p><div><span>{activeDiscoveredVideo.channel}</span><span>{dateLabel(activeDiscoveredVideo.publishedAt) || 'Publication date unavailable'}</span></div><a href={activeDiscoveredVideo.url} target="_blank" rel="noreferrer">Open original on YouTube to like, comment, share or join the creator ↗</a></div></section>}
        {youtubeCandidates.length > 0 && <><div className="ocp-discovery-panel-intro ocp-candidate-list-heading"><div><span className="section-kicker">RECENT AUTOMATED DISCOVERIES</span><h3>New videos worth checking</h3><p>Results are candidate leads—not endorsements. Open the video, verify who published it, check its actual content and date, and assess learning value before relying on it.</p></div><span className={`ocp-unverified-label ${youtubeDiscovery?.status === 'stale' ? 'is-stale' : ''}`}>{youtubeDiscovery?.status === 'stale' ? 'LAST SNAPSHOT' : 'UNVERIFIED'}</span></div><div className="ocp-discovery-candidate-grid">{youtubeCandidates.map((item) => <article className={`ocp-discovery-candidate-card ${activeDiscoveredVideoId === item.videoId ? 'is-playing' : ''}`} key={item.id || item.videoId}><button className="ocp-candidate-thumbnail" type="button" onClick={() => setActiveDiscoveredVideoId(item.videoId)} aria-label={`Preview ${item.title} in OpenCyberPath`}><img src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.opacity = '0'; }}/><span>▶</span></button><div className="ocp-candidate-card-copy"><div className="ocp-candidate-card-meta"><span>{item.sourceCategory || 'Cybersecurity'}</span><span>{dateLabel(item.publishedAt) || 'Date unavailable'}</span></div><h4>{item.title}</h4><p>{item.summary || 'Open the original video to review the creator’s description.'}</p><div className="ocp-candidate-channel">{item.channel || 'YouTube creator'} <span>· Candidate, not vetted</span></div><div className="ocp-candidate-card-actions"><button type="button" onClick={() => { setActiveDiscoveredVideoId(item.videoId); setActivePanel('videos'); }}>Preview here</button><a href={item.url} target="_blank" rel="noreferrer">YouTube ↗</a></div></div></article>)}</div></>}
        <div className="ocp-youtube-query-card"><div><span className="ocp-action-kicker">NEWEST UPLOADS</span><h4>{searchTerm} — latest videos</h4><p>Open the YouTube results sorted by upload date.</p></div><a href={youtubeSearchUrl(youtubeQuery)} target="_blank" rel="noreferrer">Search YouTube <span>↗</span></a></div>
        <div className="ocp-youtube-query-card ocp-youtube-live-query"><div><span className="ocp-action-kicker">LIVE STREAM FILTER</span><h4>{searchTerm} — live now</h4><p>Check which matching streams YouTube currently identifies as live.</p></div><a href={youtubeSearchUrl(youtubeQuery, true)} target="_blank" rel="noreferrer">Find live streams <span>↗</span></a></div>
        <div className="ocp-discovery-panel-intro ocp-curated-starters-head"><div><span className="section-kicker">OPTIONAL STARTING MATERIAL</span><h3>Already-curated lessons connected to this topic</h3><p>These are a starting point, not the boundary of our video library. Use fresh YouTube discovery above when you want newer uploads or different creators.</p></div></div>
        {relatedVideos.length ? <div className="ocp-discovery-video-grid">{relatedVideos.map((video) => <article key={video.id} className="ocp-discovery-video-card"><div className="ocp-discovery-video-art"><span>▶</span><small>{resourceLevel(video.level)}</small></div><div><span className="ocp-curated-topic">{video.topic || activeDomain.title}</span><h4>{video.title}</h4><p>{video.creator || 'Original publisher'} · {video.note || 'Review the source and check current context.'}</p><a href={video.url} target="_blank" rel="noreferrer">Open original source ↗</a></div></article>)}</div> : <p className="ocp-discovery-empty">No catalogued starter videos match this exact subject. The dynamic YouTube searches above still work.</p>}
        <p className="ocp-discovery-integrity-note">OpenCyberPath links to original publishers and does not re-upload third-party videos. Some streams may require login, membership or creator-specific access. A live search is not a guarantee that a matching stream is available.</p>
      </div>}

      {activePanel === 'intel' && <div className="ocp-discovery-panel-body">
        <div className="ocp-discovery-panel-intro"><div><span className="section-kicker">CYBERPULSE · NEWS & ADVISORIES</span><h3>Current reporting, connected to learning</h3><p>Headlines and short summaries are surfaced from the repository’s public-source feed snapshot. Open the original source for context. A feed record is a lead, not proof that every claim has been independently verified.</p></div><span className="ocp-live-pulse">{feedStatus.toUpperCase()}</span></div>
        {newsItems.length ? <div className="ocp-discovery-news-grid">{newsItems.map((item) => {
          const published = item.publishedAt || item.updatedAt;
          const seen = item.firstSeenAt;
          return <article className="ocp-discovery-news-card" key={item.id || item.url}>
            <div className="ocp-news-card-top"><span>{item.source || 'Public source'}</span><span className={`ocp-news-type ocp-news-${normalise(item.type).replaceAll(' ', '-')}`}>{item.type === 'official-advisory' ? 'OFFICIAL ADVISORY' : item.type === 'software-advisory' ? 'SOFTWARE ADVISORY' : item.type === 'vulnerability' ? 'VULNERABILITY' : 'REPORT'}</span></div>
            <h4><a href={item.url} target="_blank" rel="noreferrer">{item.title || 'Open source report'} ↗</a></h4>
            <p>{item.summary || 'Open the original source for details, affected versions and recommended mitigations.'}</p>
            <div className="ocp-news-metadata">{item.cveId && <span>{item.cveId}</span>}{published ? <span>Published/updated {dateLabel(published)}</span> : seen ? <span>Seen by feed {dateLabel(seen)} · publication date not supplied</span> : <span>Publication date unavailable</span>}</div>
            <button type="button" onClick={() => findIncidentTopic(item)}>Explore related learning <span>↗</span></button>
          </article>;
        })}</div> : <div className="ocp-discovery-empty"><b>No feed data is currently available.</b><p>{feedMessage}</p><a href="https://www.bleepingcomputer.com/" target="_blank" rel="noreferrer">BleepingComputer ↗</a> <a href="https://thehackernews.com/" target="_blank" rel="noreferrer">The Hacker News ↗</a></div>}
        <div className="ocp-discovery-source-footer"><b>Source status:</b> {feedStatus}{feedGenerated ? ` · snapshot generated ${feedGenerated}` : ''}. The configured feed may be partial; stale items can remain when a source is temporarily unavailable. Estimated financial impacts and attacker attribution should only be displayed when supported by cited reporting.</div>
      </div>}

      {activePanel === 'path' && <div className="ocp-discovery-panel-body">
        {!profileBuilt && !profileOpen && <div className="ocp-discovery-profile-prompt"><div><span className="section-kicker">PERSONALISED, NOT GATEKEPT</span><h3>Build a route for your current level</h3><p>Answer a few questions to set a sensible starting point. Saying “I don’t know yet” is valid. This profile personalises recommendations; it does not restrict access to public learning resources.</p></div><button type="button" onClick={() => setProfileOpen(true)}>Set up my route <span>↗</span></button></div>}
        {profileOpen && <form className="ocp-discovery-profile-form" onSubmit={submitProfile}>
          <div className="ocp-discovery-panel-intro"><div><span className="section-kicker">LEARNING INTAKE</span><h3>Tell us how you want to learn</h3><p>There are no trick answers. The goal is to tailor the route, not judge your worth or infer ability from writing style.</p></div><button type="button" className="ocp-profile-close" onClick={() => setProfileOpen(false)} aria-label="Close profile form">×</button></div>
          <div className="ocp-profile-fields">
            <label>Current experience<select value={profile.level} onChange={(e) => setProfile({ ...profile, level: e.target.value })}><option>New to this topic</option><option>Know the foundations</option><option>Practised in a lab</option><option>Experienced professional</option></select></label>
            <label>Main goal<select value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}><option>Build a career path</option><option>Understand current threats</option><option>Prepare for a certification</option><option>Build practical projects</option><option>Explore out of curiosity</option></select></label>
            <label>Desired depth<select value={profile.depth} onChange={(e) => setProfile({ ...profile, depth: e.target.value })}><option>Quick overview</option><option>Strong foundations</option><option>Deep understanding</option><option>Advanced research and practice</option></select></label>
            <label>Weekly study time<select value={profile.hours} onChange={(e) => setProfile({ ...profile, hours: e.target.value })}><option>Under 2 hours</option><option>3–5 hours</option><option>6–10 hours</option><option>10+ focused hours</option></select></label>
            <label>Preferred practice<select value={profile.practiceIntent} onChange={(e) => setProfile({ ...profile, practiceIntent: e.target.value })}><option>Guided labs and projects</option><option>Reading and videos first</option><option>Research and analysis</option><option>Exam-focused study</option></select></label>
            <label className="ocp-profile-explanation">In your own words, what do you currently understand about {activeDomain.title}? <span>Optional · “I don't know yet” is completely fine.</span><textarea value={profile.explanation} onChange={(e) => setProfile({ ...profile, explanation: e.target.value })} placeholder={`Explain ${activeDomain.title} in your own words, or write “I don't know yet”.`} rows={3} maxLength={700}/></label>
          </div>
          <div className="ocp-profile-safety-note"><span>◇</span><p>Hands-on exercises should stay inside systems you own or environments that expressly authorise the activity. The profile helps select a safe practice route; it does not block access to knowledge.</p></div>
          <div className="ocp-profile-actions"><button className="ocp-discovery-primary-button" type="submit">Build my starting route <span>↗</span></button><button type="button" onClick={() => { setProfile(PROFILE_DEFAULT); setProfileOpen(false); }}>Reset</button></div>
        </form>}
        {profileBuilt && <div className="ocp-discovery-built-route"><div className="ocp-route-ready"><span>✓</span><div><b>Your {activeDomain.title} starting route is ready</b><p>Built around {profile.level.toLowerCase()}, your goal to {profile.goal.toLowerCase()}, {profile.depth.toLowerCase()}, and {profile.hours} per week.</p></div><button type="button" onClick={() => setProfileOpen(true)}>Adjust answers</button></div>
          <div className="ocp-discovery-route-steps">{routeSteps.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{index === 0 ? 'FOUNDATION' : index === 1 ? 'CORE CONCEPTS' : index === 2 ? 'PRACTICE' : 'EVIDENCE & REFLECTION'}</small><b>{step}</b><p>{index === 0 ? 'Begin with the concepts that unlock the rest of the path.' : index === 1 ? 'Use documentation and videos to connect terminology to real systems.' : index === 2 ? `Choose ${profile.practiceIntent.toLowerCase()} at your current level and work only in an authorised environment.` : 'Record what you observed, your reasoning, and what you cannot yet prove.'}</p></div></article>)}</div>
          <div className="ocp-discovery-capstone"><span>CAPSTONE IDEA</span><b>{activeDomain.project}</b><p>Success means you can explain your reasoning and supporting evidence—not merely tick every item.</p></div>
          <div className="ocp-discovery-route-links"><button type="button" onClick={() => onOpenPage('labs')}>Start with labs ↗</button><button type="button" onClick={() => onOpenPage('resources')}>Explore related resources ↗</button><button type="button" onClick={() => onOpenPage('certifications')}>Review certifications ↗</button></div>
        </div>}
        <div className="ocp-discovery-recommendation-columns">
          <section className="ocp-discovery-list-panel"><div className="ocp-discovery-list-head"><div><span className="section-kicker">RELATED OPEN CYBERPATH ROUTES</span><h3>Career paths that overlap</h3></div><span>{relatedPaths.length} matches</span></div>
            {relatedPaths.length ? relatedPaths.map((path) => <article className="ocp-related-path-row" key={path.id}><div><b>{path.shortTitle || path.title}</b><p>{path.desc}</p><small>{path.level} · {path.modules?.length || 0} modules</small></div><button type="button" onClick={() => onOpenPath(path.id)}>Open route ↗</button></article>) : <p className="ocp-discovery-muted">No exact career route matches this search. Open the full roadmap and browse adjacent specialisations.</p>}
          </section>
          <section className="ocp-discovery-list-panel"><div className="ocp-discovery-list-head"><div><span className="section-kicker">MATCHING CERTIFICATION TRACKS</span><h3>Credentials to research</h3></div><span>{relatedCerts.length} matches</span></div>
            {relatedCerts.length ? relatedCerts.map((cert) => <a className="ocp-related-cert-row" key={cert.id} href={cert.officialUrl || cert.url} target="_blank" rel="noreferrer"><span><b>{cert.name}</b><small>{cert.issuer} · {cert.level} · {cert.costLabel}</small></span><span>↗</span></a>) : <p className="ocp-discovery-muted">Review the full certification catalogue for current issuer details, fees and prerequisites.</p>}
            <button className="ocp-discovery-inline-link" type="button" onClick={() => onOpenPage('certifications')}>Browse all certifications ↗</button>
          </section>
        </div>
        <p className="ocp-discovery-disclaimer">A learning profile is a planning aid, not an aptitude diagnosis. Explaining a concept in your own words, showing lab evidence and answering follow-up questions are useful demonstrations of understanding; writing style alone cannot reliably identify whether someone used an AI assistant.</p>
      </div>}
    </section>

    {activePanel === 'overview' && <section className="ocp-discovery-connected" aria-labelledby="ocp-connected-title">
      <div className="ocp-discovery-section-head"><div><span className="section-kicker">CONNECTED TO YOUR DOMAIN</span><h2 id="ocp-connected-title">Your next useful <em>steps.</em></h2><p>Ranked from the current OpenCyberPath catalogues. These are suggestions; open the original provider and verify access and versions.</p></div><span className="ocp-discovery-domain-count">Live from project data</span></div>
      <div className="ocp-discovery-connected-grid">
        <section className="ocp-discovery-connected-panel"><div className="ocp-connected-title"><span>▤</span><div><b>Resources & tools</b><small>{relatedResources.length} connected items</small></div><button type="button" onClick={() => onOpenPage('resources')}>All ↗</button></div>{relatedResources.length ? relatedResources.slice(0, 4).map((resource) => <a className="ocp-mini-resource" href={resource.url} target="_blank" rel="noreferrer" key={resource.id}><span className="ocp-mini-resource-icon">↗</span><span><b>{resource.name}</b><small>{resource.provider} · {resource.category} · {resourceLevel(resource.level)}</small><p>{resource.description}</p></span></a>) : <p className="ocp-discovery-muted">No exact match yet. Broaden the topic or search the full catalogue.</p>}</section>
        <section className="ocp-discovery-connected-panel"><div className="ocp-connected-title"><span>⌘</span><div><b>Labs & exercises</b><small>{relatedLabs.length} connected items</small></div><button type="button" onClick={() => onOpenPage('labs')}>All ↗</button></div>{relatedLabs.length ? relatedLabs.slice(0, 3).map((lab) => <article className="ocp-mini-resource" key={lab.id}><span className="ocp-mini-resource-icon">{lab.kind?.toLowerCase().includes('lab') ? '⌘' : '▤'}</span><span><b>{lab.title}</b><small>{lab.category} · {lab.level} · {lab.estimated || lab.kind}</small><p>{lab.summary}</p></span></article>) : <p className="ocp-discovery-muted">No exact lab match yet. Browse all labs for related training exercises.</p>}</section>
      </div>
      <div className="ocp-discovery-integrity-bar"><span>◈</span><p><b>Evidence over hype.</b> Current reports are source-linked. Resource and video matches are suggestions, not independent verification of every linked claim. Keep incident facts, estimates, speculation, and unknowns separate.</p></div>
    </section>}
  </section>;
}
