import { useMemo, useState } from 'react';
import {
  certificationHubNotes,
  certificationTracks,
  certifications,
  freeLearningOptions,
} from '../data/certifications.js';
import CareerPathAdvisor from './CareerPathAdvisor.jsx';
import './CertificationsHub.css';

const PLAN_STORAGE_KEY = 'opencyberpath-certification-study-plans-v1';

const CREDENTIAL_BADGE_IMAGES = {
  'isc2-cc': 'https://images.credly.com/images/2030e43f-8003-4d4b-9630-847add403c87/image.png',
  'cisco-ccna-cybersecurity': 'https://images.credly.com/images/99c33c3f-ab7e-46dc-9490-01837434c649/blob',
  'cisco-ccst-cybersecurity': 'https://images.credly.com/images/fb647b84-b5ee-44fc-979f-24dd67bf6703/image.png',
  'cisco-netacad-intro-cybersecurity-badges': 'https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/I2CS__1_.png',
  'aws-security-specialty': 'https://images.credly.com/images/53acdae5-d69f-4dda-b650-d02ed7a50dd7/image.png',
  'isc2-cissp': 'https://images.credly.com/images/6eeb0a98-33cb-4f72-bfc3-f89d65a3286c/image.png',
  'isc2-ccsp': 'https://images.credly.com/images/38b12225-5b48-44e1-8750-20928cc595ea/image.png',
  'isaca-cisa': 'https://images.credly.com/images/d8b54d17-692a-4151-8e2e-e3c8c1a89ec1/b415cf50edc1955df11b9046c68b7e2debbd41f1.png',
  'isaca-cism': 'https://images.credly.com/images/d0891dee-6360-496c-9981-40652523b502/dbdea6794f1a6bbcc18d90eea923421aac7df6b5.png',
  'giac-gcih': 'https://images.credly.com/images/c3e2745b-2f30-4e6b-9290-f7557a705181/image.png',
  'ibm-skillsbuild-cybersecurity-fundamentals': 'https://images.credly.com/images/50b96632-6cbb-40b7-ac0e-b83f49ff7f94/image.png',
};

function issuerFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, '');
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return '';
  }
}

function issuerInitials(value) {
  return String(value || 'CP')
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function credentialImageError(event, fallbackUrl) {
  const image = event.currentTarget;
  const cardArt = image.closest('.cert-card-art');
  if (image.dataset.fallbackTried !== 'true' && fallbackUrl && image.src !== fallbackUrl) {
    image.dataset.fallbackTried = 'true';
    image.src = fallbackUrl;
    image.classList.remove('is-badge-art');
    image.classList.add('is-issuer-logo');
    image.parentElement?.classList.remove('has-badge-art');
    const badgeCaption = cardArt?.querySelector('.cert-card-art-copy > span');
    const imageCaption = cardArt?.querySelector('.cert-card-art-copy > small');
    if (badgeCaption) badgeCaption.textContent = 'OFFICIAL ISSUER VISUAL';
    if (imageCaption) imageCaption.textContent = 'Provider mark · exam details below';
    return;
  }
  image.style.display = 'none';
  const badgeCaption = cardArt?.querySelector('.cert-card-art-copy > span');
  const imageCaption = cardArt?.querySelector('.cert-card-art-copy > small');
  if (badgeCaption) badgeCaption.textContent = 'ISSUER IMAGE UNAVAILABLE';
  if (imageCaption) imageCaption.textContent = 'Provider name and official page remain available';
}

function readStudyPlans() {
  try {
    if (typeof window === 'undefined') return {};
    const value = JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeStudyPlans(next) {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

function OfficialLink({ href, children, className = '' }) {
  if (!href) return null;
  try {
    if (new URL(href).protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return (
    <a className={`cert-link ${className}`} href={href} target="_blank" rel="noreferrer">
      {children}<span aria-hidden="true"> ↗</span>
    </a>
  );
}

function normaliseCredentialHref(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.href;
  } catch {
    return '';
  }
}

function getCredentialLinkGroups(item) {
  const isCourse = item.costClass === 'course-certificate';
  const candidates = [
    { href: item.officialUrl, label: isCourse ? 'Official course / badge page' : 'Official credential page' },
    { href: item.syllabusUrl, label: isCourse ? 'Course outline / topics' : 'Official syllabus / exam objectives' },
    { href: item.prepUrl, label: 'Official preparation resources' },
  ];
  const groups = new Map();
  for (const candidate of candidates) {
    const key = normaliseCredentialHref(candidate.href);
    if (!key) continue;
    const group = groups.get(key) || { href: candidate.href, labels: [] };
    if (!group.labels.includes(candidate.label)) group.labels.push(candidate.label);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    href: group.href,
    label: group.labels.length === 1 ? group.labels[0] : `${group.labels.join(' · ')} — same destination`,
  }));
}

function Tag({ children, tone = 'default' }) {
  return <span className={`cert-tag cert-tag-${tone}`}>{children}</span>;
}

function CertificationCard({ item, isActive, onSelect }) {
  const badgeImage = CREDENTIAL_BADGE_IMAGES[item.id] || item.badgeImageUrl || '';
  const fallbackImage = issuerFaviconUrl(item.officialUrl);
  const imageSource = badgeImage || fallbackImage;
  const hasBadgeArt = Boolean(badgeImage);
  return (
    <article className={`cert-card${isActive ? ' is-active' : ''}`}>
      <div className={`cert-card-art cert-card-art-${String(item.track).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
        <div className={`cert-card-art-mark${hasBadgeArt ? ' has-badge-art' : ''}`}>
          <span className="cert-card-art-fallback" aria-hidden="true">{issuerInitials(item.issuer)}</span>
          {imageSource && <img
            className={hasBadgeArt ? 'is-badge-art' : 'is-issuer-logo'}
            src={imageSource}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(event) => credentialImageError(event, fallbackImage)}
          />}
        </div>
        <div className="cert-card-art-copy">
          <span>{hasBadgeArt ? 'ISSUER-PUBLISHED BADGE' : 'OFFICIAL ISSUER VISUAL'}</span>
          <strong>{item.track}</strong>
          <small>{hasBadgeArt ? 'Credential artwork' : 'Provider mark · exam details below'}</small>
        </div>
        <span className="cert-card-art-orbit" aria-hidden="true" />
      </div>
      <div className="cert-card-topline">
        <span className="cert-issuer">{item.issuer}</span>
        <span className="cert-code">{item.examCode}</span>
      </div>
      <h3>{item.name}</h3>
      <p className="cert-card-summary">{item.overview}</p>
      <div className="cert-tag-row">
        <Tag tone="track">{item.track}</Tag>
        <Tag tone={item.level.toLowerCase().includes('advanced') ? 'advanced' : 'default'}>{item.level}</Tag>
        <Tag tone={item.costClass === 'course-certificate' ? ( /free/i.test(item.costLabel) ? 'free' : 'course') : 'paid'}>{item.costClass === 'course-certificate' ? ( /free/i.test(item.costLabel) ? 'Free course badge' : (item.credentialType.toLowerCase().includes('badge') ? 'Course badge / achievement' : 'Course completion')) : 'Exam-based'}</Tag>
        {item.hasFreePrep && <Tag tone="free">Free prep available</Tag>}
      </div>
      <p className="cert-cost-line">{item.costLabel}</p>
      <div className="cert-card-actions">
        <button type="button" className="cert-primary-button" onClick={() => onSelect(item.id)} aria-pressed={isActive}>
          {isActive ? 'Viewing details' : 'Syllabus & roadmap'}
        </button>
        <OfficialLink href={item.officialUrl} className="cert-card-official">Official page</OfficialLink>
      </div>
    </article>
  );
}

function CertificationDetail({ item, progress, onTogglePlan, onToggleStep, onClearProgress, onOpenCareerPath }) {
  const completed = progress?.completedSteps || [];
  const isPlanned = Boolean(progress?.planned);
  const completedCount = item.roadmap.filter((_, index) => completed.includes(index)).length;

  return (
    <section className="cert-detail" id="certification-detail" aria-labelledby="cert-detail-title">
      <div className="cert-detail-header">
        <div>
          <div className="cert-eyebrow">CERTIFICATION PROFILE · {item.issuer}</div>
          <h2 id="cert-detail-title">{item.name}</h2>
          <p>{item.overview}</p>
          <div className="cert-tag-row">
            <Tag tone="track">{item.track}</Tag>
            <Tag>{item.level}</Tag>
            <Tag tone="paid">{item.costLabel}</Tag>
          </div>
        </div>
        <div className="cert-detail-actions">
          <button type="button" className={`cert-primary-button${isPlanned ? ' is-saved' : ''}`} onClick={onTogglePlan} aria-pressed={isPlanned}>
            {isPlanned ? '✓ Added to my plan' : '+ Add to my study plan'}
          </button>
          {getCredentialLinkGroups(item).map((link) => (
            <OfficialLink key={link.href} href={link.href}>{link.label}</OfficialLink>
          ))}
          {onOpenCareerPath && item.careerPathIds?.[0] && <button type="button" className="cert-secondary-button cert-roadmap-link" onClick={() => onOpenCareerPath(item.careerPathIds[0])}>Open matching career roadmap ↗</button>}
        </div>
      </div>

      <div className="cert-detail-grid">
        <div className="cert-info-panel">
          <h3>Exam and eligibility</h3>
          <dl className="cert-facts">
            <div><dt>Credential type</dt><dd>{item.credentialType}</dd></div>
            <div><dt>Exam code / route</dt><dd>{item.examCode}</dd></div>
            <div><dt>Assessment format</dt><dd>{item.format}</dd></div>
            <div><dt>Prerequisites</dt><dd>{item.prerequisites}</dd></div>
            <div><dt>Renewal</dt><dd>{item.renewal}</dd></div>

          </dl>
        </div>
        <div className="cert-info-panel cert-cost-panel">
          <h3>Cost and access</h3>
          <p className="cert-cost-large">{item.costLabel}</p>
          <p>{item.priceNote}</p>
          {item.hasFreePrep && <p className="cert-free-note"><strong>Free prep flag:</strong> the linked provider offers free learning materials. This does not mean the certification exam is free.</p>}
          <p className="cert-small-note">Syllabus record reviewed {item.verifiedOn}. Always follow the issuer's current page for purchase, eligibility and scheduling.</p>
        </div>
      </div>

      <div className="cert-info-panel cert-domains-panel">
        <div className="cert-section-heading">
          <div><span className="cert-eyebrow">WHAT TO STUDY</span><h3>Exam syllabus at a glance</h3></div>
          <span className="cert-domain-count">{item.domains.length} topic areas</span>
        </div>
        <p className="cert-section-intro">This is OpenCyberPath's concise learning summary, not a replacement for the official exam objectives.</p>
        <ol className="cert-domain-list">
          {item.domains.map((domain, index) => <li key={`${item.id}-domain-${index}`}><span className="cert-domain-number">{String(index + 1).padStart(2, '0')}</span><span>{domain}</span></li>)}
        </ol>
      </div>

      <div className="cert-info-panel cert-roadmap-panel">
        <div className="cert-section-heading">
          <div><span className="cert-eyebrow">PERSONAL STUDY PLAN</span><h3>Suggested preparation roadmap</h3></div>
          <div className="cert-progress-copy">{completedCount} of {item.roadmap.length} steps checked</div>
        </div>
        <div className="cert-progress-track" role="progressbar" aria-label={`Completed preparation steps for ${item.name}`} aria-valuemin={0} aria-valuemax={item.roadmap.length} aria-valuenow={completedCount}>
          <span style={{ width: `${(completedCount / item.roadmap.length) * 100}%` }} />
        </div>
        <p className="cert-section-intro">Work at your own pace. The schedule is a starting framework, not a guarantee of exam readiness.</p>
        <ol className="cert-roadmap-list">
          {item.roadmap.map((step, index) => {
            const checked = completed.includes(index);
            return (
              <li key={`${item.id}-step-${index}`} className={checked ? 'is-complete' : ''}>
                <label className="cert-roadmap-check">
                  <input type="checkbox" checked={checked} onChange={() => onToggleStep(index)} aria-label={`Mark preparation step ${index + 1}, ${step.title}, complete`} />
                  <span className="cert-roadmap-step-number">{String(index + 1).padStart(2, '0')}</span>
                </label>
                <div className="cert-roadmap-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.detail}</p>
                  <p className="cert-roadmap-output"><strong>Evidence to create:</strong> {step.output}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="cert-plan-footer">
          <p>Study-plan flags and checked steps are stored locally in this browser/device only. They are not sent to OpenCyberPath.</p>
          <button type="button" className="cert-text-button" onClick={onClearProgress}>Clear this certification's progress</button>
        </div>
      </div>

      {item.updateNote && <aside className="cert-update-note"><strong>Version note:</strong> {item.updateNote}</aside>}
      <div className="cert-detail-footer"><span>Official issuer pages control exam versions, fees, eligibility and renewal.</span>{normaliseCredentialHref(item.syllabusUrl) && normaliseCredentialHref(item.syllabusUrl) !== normaliseCredentialHref(item.officialUrl) && <OfficialLink href={item.syllabusUrl}>Recheck official objectives</OfficialLink>}</div>
    </section>
  );
}

export default function CertificationsHub({ onOpenCareerPath }) {
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('all');
  const [cost, setCost] = useState('all');
  const [level, setLevel] = useState('all');
  const [freeResourceFilter, setFreeResourceFilter] = useState('all');
  const [activeId, setActiveId] = useState('');
  const [studyPlans, setStudyPlans] = useState(readStudyPlans);
  const [planNotice, setPlanNotice] = useState('');

  const visibleCertifications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return certifications.filter((item) => {
      const searchable = [item.name, item.issuer, item.track, item.level, item.examCode, item.overview, item.prerequisites, ...item.domains, ...item.careerPathIds].join(' ').toLowerCase();
      if (term && !searchable.includes(term)) return false;
      if (track !== 'all' && item.track !== track) return false;
      if (cost === 'free-prep' && !item.hasFreePrep) return false;
      if (cost === 'free-credential' && !(item.costClass === 'course-certificate' && /free/i.test(item.costLabel))) return false;
      if (cost === 'paid-exam' && item.costClass !== 'paid-exam') return false;
      if (cost === 'course-certificate' && item.costClass !== 'course-certificate') return false;
      if (level !== 'all' && item.level !== level) return false;
      return true;
    });
  }, [search, track, cost, level]);

  const visibleFreeLearningOptions = useMemo(() => freeResourceFilter === 'all' ? freeLearningOptions : freeLearningOptions.filter((item) => item.category === freeResourceFilter), [freeResourceFilter]);

  const activeCertification = certifications.find((item) => item.id === activeId) || null;
  const activeProgress = activeCertification ? (studyPlans[activeCertification.id] || {}) : {};
  const plannedCount = certifications.filter((item) => studyPlans[item.id]?.planned).length;

  function updateCertificationProgress(certificationId, nextProgress, notice) {
    const next = { ...studyPlans, [certificationId]: nextProgress };
    const saved = writeStudyPlans(next);
    setStudyPlans(next);
    setPlanNotice(saved ? notice : `${notice} Storage is unavailable in this browser; keep a separate copy of your checklist.`);
  }

  function togglePlan() {
    if (!activeCertification) return;
    updateCertificationProgress(activeCertification.id, {
      ...activeProgress,
      planned: !activeProgress.planned,
      completedSteps: activeProgress.completedSteps || [],
    }, activeProgress.planned ? 'Removed from your local study plan.' : 'Added to your local study plan.');
  }

  function toggleStep(index) {
    if (!activeCertification) return;
    const completedSteps = activeProgress.completedSteps || [];
    const nextSteps = completedSteps.includes(index)
      ? completedSteps.filter((step) => step !== index)
      : [...completedSteps, index];
    updateCertificationProgress(activeCertification.id, {
      ...activeProgress,
      completedSteps: nextSteps,
    }, 'Study-plan progress saved locally.');
  }

  function clearProgress() {
    if (!activeCertification) return;
    const next = { ...studyPlans };
    delete next[activeCertification.id];
    const saved = writeStudyPlans(next);
    setStudyPlans(next);
    setPlanNotice(saved ? 'This certification’s local progress was cleared.' : 'Progress cleared for this view; browser storage is unavailable.');
  }

  function openDetails(id) {
    setActiveId(id);
    setPlanNotice('');
    if (typeof window !== 'undefined') {
      window.setTimeout(() => document.getElementById('certification-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  return (
    <section className="section-wrap certifications-section" aria-labelledby="certifications-title">
      <header className="cert-hero">
        <div className="cert-hero-copy">
          <span className="cert-eyebrow"><span className="cert-live-dot" /> CAREER PLANNING · EXAM PREPARATION</span>
          <h1 id="certifications-title">Certifications &amp; <em>exam roadmaps.</em></h1>
          <p>Compare cybersecurity credentials by role, level, access cost and syllabus. Follow the official objectives, build a study plan, and connect each credential to an OpenCyberPath career roadmap.</p>
          <div className="cert-hero-actions">
            <a className="cert-primary-button cert-anchor-button" href="#certification-catalogue">Explore certifications <span aria-hidden="true">↓</span></a>
            <a className="cert-secondary-button" href="#free-learning-options">Start with free learning</a>
          </div>
        </div>
        <div className="cert-hero-metrics" aria-label="Certification hub summary">
          <div><strong>{certifications.length}</strong><span>credentials mapped</span></div>
          <div><strong>{certificationTracks.length - 1}</strong><span>career tracks</span></div>
          <div><strong>{freeLearningOptions.length}</strong><span>free learning links</span></div>
          <p>Real issuer badge artwork where published. Prices, eligibility and exam versions are confirmed on the official provider page.</p>
        </div>
      </header>

      <aside className="cert-important-note" role="note">
        <span className="cert-note-symbol" aria-hidden="true">i</span>
        <div><strong>Free training is not the same as a free professional exam.</strong><p>Many issuers publish free learning or syllabus materials but charge separately for an exam, voucher, labs or renewal. We label course-completion credentials and learning badges separately from exam-based certifications. Prices and eligibility vary; official issuer pages are authoritative.</p></div>
      </aside>

      <CareerPathAdvisor onSelectCertification={openDetails} />


      <section className="cert-updates" aria-labelledby="cert-updates-title">
        <div className="cert-section-heading"><div><span className="cert-eyebrow">SYLLABUS CHANGE WATCH</span><h2 id="cert-updates-title">Check the version that matches your exam date</h2></div><span className="cert-verified-label">Source-linked updates</span></div>
        <div className="cert-update-grid">
          {certificationHubNotes.map((note) => <article key={note.id} className={`cert-update-card cert-update-${note.tone}`}>
            <div className="cert-update-date">{new Date(`${note.date}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</div>
            <h3>{note.title}</h3><p>{note.body}</p>
            <OfficialLink href={note.url}>Issuer notice</OfficialLink>
          </article>)}
        </div>
      </section>

      <section className="cert-free-learning" id="free-learning-options" aria-labelledby="free-learning-title">
        <div className="cert-section-heading"><div><span className="cert-eyebrow">BUILD SKILLS BEFORE PAYING</span><h2 id="free-learning-title">Free courses, badges and hands-on practice</h2><p>{freeLearningOptions.length} curated official or well-established options. Each card labels what is free; a learning badge, completion certificate and proctored professional exam are different outcomes.</p></div><span className="cert-verified-label">Free-first library</span></div>
        <div className="cert-learning-filters" role="group" aria-label="Filter free learning resources">
          <button type="button" className={freeResourceFilter === 'all' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'all'} onClick={() => setFreeResourceFilter('all')}>All resources</button>
          <button type="button" className={freeResourceFilter === 'free-badge' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'free-badge'} onClick={() => setFreeResourceFilter('free-badge')}>Free badges</button>
          <button type="button" className={freeResourceFilter === 'free-course' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'free-course'} onClick={() => setFreeResourceFilter('free-course')}>Free courses</button>
          <button type="button" className={freeResourceFilter === 'official-prep' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'official-prep'} onClick={() => setFreeResourceFilter('official-prep')}>Official exam prep</button>
          <button type="button" className={freeResourceFilter === 'hands-on' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'hands-on'} onClick={() => setFreeResourceFilter('hands-on')}>Hands-on labs</button>
          <button type="button" className={freeResourceFilter === 'freemium' ? 'is-selected' : ''} aria-pressed={freeResourceFilter === 'freemium'} onClick={() => setFreeResourceFilter('freemium')}>Free tiers / freemium</button>
        </div>
        <p className="cert-resource-count" aria-live="polite">Showing <strong>{visibleFreeLearningOptions.length}</strong> of {freeLearningOptions.length} resources</p>
        <div className="cert-learning-grid">
          {visibleFreeLearningOptions.map((offer) => {
            const badgeImage = offer.imageUrl || '';
            const fallbackImage = issuerFaviconUrl(offer.url);
            const imageSource = badgeImage || fallbackImage;
            return <article className={`cert-learning-card cert-learning-${offer.category}`} key={offer.id}>
              <div className="cert-learning-art">
                <span className="cert-learning-art-fallback" aria-hidden="true">{issuerInitials(offer.provider)}</span>
                {imageSource && <img src={imageSource} alt="" aria-hidden="true" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(event) => credentialImageError(event, fallbackImage)} />}
                <span className="cert-learning-art-label">{offer.kindLabel}</span>
              </div>
              <div className="cert-learning-topline"><span>{offer.provider}</span><Tag tone={offer.category === 'free-badge' ? 'course' : offer.category === 'freemium' ? 'default' : 'free'}>{offer.kindLabel}</Tag></div>
              <h3>{offer.name}</h3><p>{offer.details}</p>
              <div className="cert-learning-focus"><strong>Best for</strong><span>{offer.focus}</span></div>
              <OfficialLink href={offer.url}>Open official resource</OfficialLink>
            </article>;
          })}
        </div>
        {visibleFreeLearningOptions.length === 0 && <p className="cert-empty-state">No resources match this category. Choose “All resources” to see the complete library.</p>}
      </section>

      <section className="cert-catalogue" id="certification-catalogue" aria-labelledby="cert-catalogue-title">
        <div className="cert-section-heading"><div><span className="cert-eyebrow">FIND YOUR NEXT CREDENTIAL</span><h2 id="cert-catalogue-title">Certification catalogue</h2><p>Search the name, exam code, provider, career role or syllabus area.</p></div><div className="cert-plan-counter"><strong>{plannedCount}</strong><span>in my local plan</span></div></div>

        <div className="cert-filter-panel">
          <label className="cert-search-field"><span>Search certifications</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. SOC, cloud, OSCP, audit…" aria-label="Search certification name, provider, code or syllabus" /></label>
          <label><span>Career track</span><select value={track} onChange={(event) => setTrack(event.target.value)}>{certificationTracks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label><span>Access type</span><select value={cost} onChange={(event) => setCost(event.target.value)}><option value="all">All access types</option><option value="free-prep">Free study materials available</option><option value="free-credential">Free digital badge / course credential</option><option value="paid-exam">Paid professional exam</option><option value="course-certificate">All course-completion credentials / badges</option></select></label>
          <label><span>Level</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">All levels</option>{[...new Set(certifications.map((item) => item.level))].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>

        <div className="cert-results-bar"><span><strong>{visibleCertifications.length}</strong> matching credentials</span><button type="button" className="cert-text-button" onClick={() => { setSearch(''); setTrack('all'); setCost('all'); setLevel('all'); }}>Reset filters</button></div>

        {visibleCertifications.length > 0 ? <div className="cert-card-grid">
          {visibleCertifications.map((item) => <CertificationCard key={item.id} item={item} isActive={activeId === item.id} onSelect={openDetails} />)}
        </div> : <div className="cert-empty-state"><h3>No matching credentials</h3><p>Try a different provider, role or access filter.</p><button type="button" className="cert-primary-button" onClick={() => { setSearch(''); setTrack('all'); setCost('all'); setLevel('all'); }}>Show all credentials</button></div>}

        {activeCertification && <CertificationDetail
          item={activeCertification}
          progress={activeProgress}
          onTogglePlan={togglePlan}
          onToggleStep={toggleStep}
          onClearProgress={clearProgress}
          onOpenCareerPath={onOpenCareerPath}
        />}
        {planNotice && <p className="cert-plan-notice" role="status">{planNotice}</p>}
      </section>


      <aside className="cert-disclaimer" role="note">
        <h2>Before you pay or book</h2>
        <ul>
          <li>Confirm the current exam code, syllabus effective date, prerequisites, delivery format, time limit and scoring with the issuer.</li>
          <li>Check exam fees, taxes, currency, voucher expiry, retake terms, training package inclusions and renewal requirements for your region.</li>
          <li>Use legitimate practice materials. OpenCyberPath does not host leaked exam questions, guarantee a pass, issue these credentials or promise employment.</li>
          <li>Use approved training labs for hands-on security practice; never test systems without explicit authorisation.</li>
        </ul>
      </aside>
    </section>
  );
}
