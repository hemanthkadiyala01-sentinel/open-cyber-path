import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import LiveIncidentOps from './LiveIncidentOps.jsx';
import './CaseLab.css';

const CASE_ID = 'midnight-blizzard-identity-response';
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const BASE_PATH = String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
const CASE_PACK_URL = `${BASE_PATH}cases/midnight-blizzard-investigation-r1.2.0.zip`;
const SOURCE_GROUPS = [
  { id: 'incident-disclosures', title: 'Primary incident disclosures and updates', purpose: 'Use these to establish what the organisation publicly confirmed and how its account changed over time.' },
  { id: 'government-response', title: 'Government response and scope', purpose: 'Understand which actions were directed, whom they applied to, and what was recommended more broadly.' },
  { id: 'technical-response', title: 'Incident-specific technical response guidance', purpose: 'Use the responder guidance to interpret reported identity and OAuth activity and understand detection limits.' },
  { id: 'defender-playbooks', title: 'Defender investigation and detection playbooks', purpose: 'Practise app-consent investigation, permission review, anomaly triage, remediation and validation.' },
  { id: 'threat-intelligence', title: 'Threat actor and technique context', purpose: 'Map reported behaviour to maintained threat-intelligence references without treating a mapping as proof of a specific event.' },
  { id: 'independent-analysis', title: 'Independent reporting, detection analysis and visual explanations', purpose: 'Compare secondary reporting and publisher-hosted diagrams with primary sources; distinguish interpretation from confirmed fact.' },
];
const STAGES = [
  { id: 'brief', number: '01', title: 'Mission brief', short: 'Brief' },
  { id: 'evidence', number: '02', title: 'Evidence room', short: 'Evidence' },
  { id: 'analysis', number: '03', title: 'Analysis', short: 'Analysis' },
  { id: 'response', number: '04', title: 'Response plan', short: 'Response' },
  { id: 'review', number: '05', title: 'Submit & review', short: 'Review' },
];

function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC', timeZoneName: 'short',
  }).format(date);
}

function formatError(body, status) {
  const code = typeof body?.error === 'string' ? body.error : `http_${status}`;
  return ({
    authentication_required: 'Sign in to save a submission.',
    verified_email_required: 'Verify your account email with the identity provider before saving a submission.',
    invalid_or_expired_token: 'Your session may have expired. Sign in again and retry.',
    unsupported_case_revision: 'This case revision is no longer accepted. Reload the case and try again.',
    case_not_found: 'This case is not available in the current API version.',
    case_attempt_required: 'Submit this investigation before opening the after-action guide.',
  })[code] || `The request could not be completed (${code}).`;
}

async function getJson(url, options = {}) {
  const response = await fetch(url, { credentials: 'omit', cache: 'no-store', ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(formatError(body, response.status));
  return body;
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value) {
  return String(value || 'case').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'case';
}

function downloadSubmission(submission, caseItem) {
  const report = {
    title: `OpenCyberPath CaseLab — ${caseItem?.title || submission.caseId}`,
    generatedAt: new Date().toISOString(),
    integrityNotice: 'Training report only. Evidence in this case is synthetic. The rubric is formative and is not an independent certification.',
    caseId: submission.caseId,
    caseRevision: submission.caseRevision,
    attemptNo: submission.attemptNo,
    submittedAt: submission.submittedAt,
    score: submission.score,
    selectedEvidenceReferences: submission.evidenceRefs,
    workingHypothesis: submission.hypothesisId,
    responseActions: submission.responseActions,
    findings: submission.findings,
    validationPlan: submission.validationPlan,
    rubricFeedback: submission.rubricFeedback,
    sources: caseItem?.sources?.map(({ publisher, title, publishedAt, url, sourceType, sourceGroup, supports }) => ({ publisher, title, publishedAt, url, sourceType, sourceGroup, supports })) || [],
  };
  saveBlob(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' }), `opencyberpath-${safeFilename(submission.caseId)}-attempt-${submission.attemptNo || 'latest'}.json`);
}

function downloadEvidencePack(evidencePack, caseItem, format) {
  if (!evidencePack || !caseItem) return;
  const fileBase = `opencyberpath-${safeFilename(caseItem.id)}-evidence-r${safeFilename(caseItem.revision)}`;
  if (format === 'csv') {
    const fields = ['id', 'timestampUtc', 'sourceType', 'eventType', 'principal', 'source', 'result', 'detail', 'classification'];
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const lines = [fields.join(','), ...evidencePack.events.map((event) => fields.map((field) => quote(event[field])).join(','))];
    saveBlob(new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }), `${fileBase}.csv`);
    return;
  }
  const pack = {
    title: caseItem.title,
    caseId: caseItem.id,
    revision: caseItem.revision,
    generatedAt: new Date().toISOString(),
    classification: evidencePack.classification,
    disclaimer: evidencePack.disclaimer,
    instruction: 'Training evidence only. Preserve this file as supplied for reproducibility. Do not interpret synthetic records as telemetry from a real organisation.',
    sources: caseItem.sources.map(({ publisher, title, publishedAt, url, sourceType, sourceGroup, supports }) => ({ publisher, title, publishedAt, url, sourceType, sourceGroup, supports })),
    events: evidencePack.events,
  };
  saveBlob(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json;charset=utf-8' }), `${fileBase}.json`);
}

function toggleValue(value, values, setValues) {
  setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
}

function HintDeck({ hints }) {
  const [openHints, setOpenHints] = useState([]);
  if (!hints?.length) return null;
  return <aside className="caselab-hint-deck" aria-label="Investigation hints">
    <div className="caselab-hint-heading"><span className="caselab-kicker">NEED A NUDGE?</span><span className="caselab-hint-count">{openHints.length}/{hints.length} opened</span></div>
    <div className="caselab-hint-list">
      {hints.map((hint) => <article className="caselab-hint" key={hint.id}>
        <button type="button" className="caselab-hint-trigger" aria-expanded={openHints.includes(hint.id)} onClick={() => setOpenHints((current) => current.includes(hint.id) ? current.filter((id) => id !== hint.id) : [...current, hint.id])}>
          <span>{hint.title}</span><span aria-hidden="true">{openHints.includes(hint.id) ? '−' : '+'}</span>
        </button>
        {openHints.includes(hint.id) && <p>{hint.text}</p>}
      </article>)}
    </div>
  </aside>;
}

function StageHeader({ stage, eyebrow, title, description }) {
  return <div className="caselab-stage-header"><span className="caselab-stage-number">{STAGES[stage].number}</span><div><span className="caselab-kicker">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

export default function CaseLab() {
  const auth = useAuth();
  const [caseItem, setCaseItem] = useState(null);
  const [evidencePack, setEvidencePack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const [maxReachedStage, setMaxReachedStage] = useState(0);
  const [stageError, setStageError] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [debrief, setDebrief] = useState(null);
  const [debriefError, setDebriefError] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [hypothesisId, setHypothesisId] = useState('');
  const [responseActions, setResponseActions] = useState([]);
  const [findings, setFindings] = useState('');
  const [validationPlan, setValidationPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('Your investigation draft remains in this page until you submit.');

  const loadCase = useCallback(async (signal) => {
    if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured in this website build.');
    const [caseResponse, evidenceResponse] = await Promise.all([
      getJson(`${API_BASE}/v1/cases/${CASE_ID}`, { signal }),
      getJson(`${API_BASE}/v1/cases/${CASE_ID}/evidence`, { signal }),
    ]);
    if (!caseResponse?.case || !Array.isArray(evidenceResponse?.evidence?.events)) {
      throw new Error('The CaseLab API returned an unexpected case format.');
    }
    setCaseItem(caseResponse.case);
    setEvidencePack(evidenceResponse.evidence);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    loadCase(controller.signal)
      .catch((error) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'The case could not be loaded.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [loadCase]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || !API_BASE) {
      setSubmissions([]);
      setLatestSubmission(null);
      setDebrief(null);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    async function loadSubmissions() {
      try {
        const token = await auth.getAccessToken();
        const body = await getJson(`${API_BASE}/v1/me/cases`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!active) return;
        const activeRevision = caseItem?.revision;
        const rows = (Array.isArray(body?.submissions) ? body.submissions : []).filter((item) => item.caseId === CASE_ID && (!activeRevision || item.caseRevision === activeRevision));
        setSubmissions(rows);
        setLatestSubmission(rows[0] || null);
        if (rows.length) setNotice(`Loaded ${rows.length} saved attempt${rows.length === 1 ? '' : 's'} for this case.`);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setSaveError(error instanceof Error ? error.message : 'Saved attempts could not be loaded.');
      }
    }
    void loadSubmissions();
    return () => { active = false; controller.abort(); };
  }, [auth.status, caseItem?.revision]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || !latestSubmission?.submissionId || !API_BASE) {
      setDebrief(null);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    async function loadDebrief() {
      try {
        const token = await auth.getAccessToken();
        const body = await getJson(`${API_BASE}/v1/cases/${CASE_ID}/debrief`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: controller.signal,
        });
        if (active) { setDebrief(body?.debrief || null); setDebriefError(''); }
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setDebriefError(error instanceof Error ? error.message : 'The after-action guide could not be loaded.');
      }
    }
    void loadDebrief();
    return () => { active = false; controller.abort(); };
  }, [auth.status, latestSubmission?.submissionId]);

  const events = useMemo(() => [...(evidencePack?.events || [])].sort((a, b) => a.timestampUtc.localeCompare(b.timestampUtc)), [evidencePack]);
  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) => [event.id, event.timestampUtc, event.sourceType, event.eventType, event.principal, event.source, event.result, event.detail]
      .some((value) => String(value || '').toLowerCase().includes(q)));
  }, [events, eventSearch]);
  const selectedEvents = useMemo(() => events.filter((event) => selectedEvidence.includes(event.id)), [events, selectedEvidence]);
  const activeHints = useMemo(() => {
    const all = caseItem?.hints || [];
    if (activeStage === 1) return all.filter((item) => ['triage', 'correlate'].includes(item.stage));
    if (activeStage === 2) return all.filter((item) => ['correlate', 'test-alternatives'].includes(item.stage));
    if (activeStage === 3) return all.filter((item) => item.stage === 'respond');
    return [];
  }, [caseItem, activeStage]);

  function validateStage(stage) {
    if (stage === 1 && selectedEvidence.length < 1) return 'Select at least one evidence record you intend to rely on.';
    if (stage === 2 && (!hypothesisId || findings.trim().length < 40)) return 'Choose a working hypothesis and write at least 40 characters of findings.';
    if (stage === 3 && (responseActions.length < 1 || validationPlan.trim().length < 10)) return 'Select at least one response action and write a validation plan of at least 10 characters.';
    return '';
  }

  function goNext() {
    const problem = validateStage(activeStage);
    if (problem) { setStageError(problem); return; }
    setStageError('');
    const next = Math.min(STAGES.length - 1, activeStage + 1);
    setActiveStage(next);
    setMaxReachedStage((current) => Math.max(current, next));
    document.getElementById('caselab-stage-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goBack() {
    setStageError('');
    setActiveStage((current) => Math.max(0, current - 1));
    document.getElementById('caselab-stage-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function jumpToStage(index) {
    if (index > maxReachedStage) return;
    setStageError('');
    setActiveStage(index);
    document.getElementById('caselab-stage-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submitAttempt() {
    setSaveError('');
    const issue = validateStage(1) || validateStage(2) || validateStage(3);
    if (issue) {
      setSaveError(issue);
      setActiveStage(issue.includes('evidence') ? 1 : issue.includes('hypothesis') || issue.includes('findings') ? 2 : 3);
      return;
    }
    if (auth.status !== 'authenticated') {
      setSaveError(auth.configured ? 'Sign in first to save this attempt to your account.' : 'Account sign-in is not configured in this build. Your work has not been saved.');
      return;
    }
    if (!caseItem || !validationPlan.trim()) {
      setSaveError('Finish the response and validation stage before submitting.');
      return;
    }
    setSaving(true);
    try {
      const token = await auth.getAccessToken();
      const body = await getJson(`${API_BASE}/v1/cases/${CASE_ID}/submissions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseRevision: caseItem.revision,
          evidenceRefs: selectedEvidence,
          hypothesisId,
          responseActions,
          findings,
          validationPlan,
        }),
      });
      const submission = body?.submission;
      if (!submission?.submissionId) throw new Error('The API did not confirm that the attempt was saved.');
      setLatestSubmission(submission);
      setSubmissions((current) => [submission, ...current.filter((item) => item.submissionId !== submission.submissionId)].slice(0, 100));
      setNotice(`Attempt ${submission.attemptNo} saved for this case.`);
      setStageError('');
      setActiveStage(4);
      setMaxReachedStage(4);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The attempt could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="section-wrap caselab-page"><p role="status">Loading investigation briefing and synthetic evidence…</p></section>;

  if (loadError) return <section className="section-wrap caselab-page" aria-labelledby="caselab-title">
    <div className="caselab-hero"><div><span className="caselab-kicker">CASELAB · INVESTIGATE WITH EVIDENCE</span><h1 id="caselab-title">One case. <em>Defensible decisions.</em></h1><p>CaseLab needs the configured OpenCyberPath API to load the mission and synthetic evidence.</p></div></div>
    <div className="caselab-alert" role="alert">{loadError}</div>
    <button type="button" className="caselab-button caselab-button-primary" onClick={() => window.location.reload()}>Retry investigation loading</button>
  </section>;

  const currentStage = STAGES[activeStage];

  return <main className="section-wrap caselab-page caselab-case-experience" aria-labelledby="caselab-title">
    <header className="caselab-hero caselab-hero-case">
      <div className="caselab-hero-copy">
        <span className="caselab-kicker">CASELAB · SOURCE-BACKED INVESTIGATION</span>
        <h1 id="caselab-title">The Unexpected Consent.<br /><em>Build the case from evidence.</em></h1>
        <p>This is a complete investigation mission—not a quiz. Reconstruct the sequence, test competing explanations, choose response actions, and explain how you would prove recovery.</p>
        <div className="caselab-tags"><span>{caseItem.topic}</span><span>{caseItem.difficulty}</span><span>{caseItem.estimatedMinutes} min</span><span>Revision {caseItem.revision}</span><span>20 synthetic records</span></div>
      </div>
      <div className="caselab-hero-art"><img src={`${BASE_PATH}cases/midnight-blizzard-investigation.svg`} alt="The Unexpected Consent investigation: identity, consent, permissions, mailbox activity and response validation" /></div>
      <aside className="caselab-hero-panel"><span className="caselab-panel-label">YOUR CASE RECORD</span><strong>{submissions.length}</strong><span>saved attempt{submissions.length === 1 ? '' : 's'}</span><p>{auth.status === 'authenticated' ? 'Signed in · your submissions are private to your account' : auth.status === 'loading' ? 'Checking sign-in status…' : 'Public practice · sign in to save attempts'}</p></aside>
    </header>

    <div className="caselab-alert caselab-alert-review" role="note"><strong>Candidate case — human review required.</strong> The investigation uses real public incident disclosures for context, but all events and identities in the evidence pack are synthetic. It is not victim telemetry or an independently approved certification exercise.</div>
    <div className="caselab-alert" role="note"><strong>Evidence integrity:</strong> {evidencePack.disclaimer} {evidencePack.toolNote}</div>

    <LiveIncidentOps />

    <nav className="caselab-stage-nav" aria-label="Investigation stages">
      {STAGES.map((stage, index) => <button type="button" key={stage.id} className={`caselab-stage-tab ${activeStage === index ? 'is-active' : ''} ${index < activeStage ? 'is-complete' : ''}`} aria-current={activeStage === index ? 'step' : undefined} disabled={index > maxReachedStage} onClick={() => jumpToStage(index)}>
        <span>{stage.number}</span><b>{stage.short}</b>{index < maxReachedStage && <i aria-hidden="true">✓</i>}
      </button>)}
    </nav>
    <div className="caselab-stage-progress" role="progressbar" aria-label="Investigation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((activeStage / (STAGES.length - 1)) * 100)}><span style={{ width: `${(activeStage / (STAGES.length - 1)) * 100}%` }} /></div>

    <section className="caselab-section caselab-stage-section" id="caselab-stage-content" aria-labelledby="caselab-active-stage-title">
      <div className="caselab-stage-header"><span className="caselab-stage-number">{currentStage.number}</span><div><span className="caselab-kicker">INVESTIGATION WORKSPACE · STAGE {activeStage + 1} OF {STAGES.length}</span><h2 id="caselab-active-stage-title">{currentStage.title}</h2><p>{activeStage === 0 ? 'Understand the incident context and the mission.' : activeStage === 1 ? 'Search, compare and select records you can defend as relevant.' : activeStage === 2 ? 'State what the data supports, consider an alternative, and keep uncertainty visible.' : activeStage === 3 ? 'Choose proportionate response actions and define objective verification checks.' : 'Review your work, submit it, then use the after-action debrief to learn from the evidence.'}</p></div></div>

      {activeStage === 0 && <div className="caselab-stage-body">
        <div className="caselab-mission-callout"><span className="caselab-kicker">YOUR ASSIGNMENT</span><p>{caseItem.context}</p></div>
        <article className="caselab-public-flow"><div><span className="caselab-kicker">PUBLIC INCIDENT CONTEXT · SIMPLIFIED</span><h3>How the reported incident unfolded</h3><p>This diagram summarizes public disclosures. It is not the lab’s synthetic event timeline and does not represent private victim telemetry.</p><a href={`${BASE_PATH}cases/midnight-blizzard-public-incident-flow.svg`} target="_blank" rel="noreferrer">Open diagram at full size ↗</a></div><img src={`${BASE_PATH}cases/midnight-blizzard-public-incident-flow.svg`} alt="Simplified source-backed flow from reported password spraying to account foothold, OAuth permissions, email access and defensive response; not victim telemetry." loading="lazy" /></article>
        <div className="caselab-two-col">
          <article className="caselab-card"><h3>Mission objectives</h3><ul>{caseItem.learningObjectives.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article className="caselab-card"><h3>Investigation tasks</h3><ol>{caseItem.tasks.map((item) => <li key={item}>{item}</li>)}</ol></article>
        </div>
        <article className="caselab-practice-output" aria-labelledby="caselab-practice-output-title"><div className="caselab-practice-output-head"><span className="caselab-kicker">WHAT YOU ARE PRACTISING</span><h3 id="caselab-practice-output-title">Skills you must demonstrate</h3><p>This is not a copy-and-paste quiz. You must produce an evidence-backed incident timeline and explain the decisions you would make.</p></div><div className="caselab-practice-output-grid"><article><span>01 · RECONSTRUCT</span><strong>Build the event chain</strong><p>Correlate sign-in, consent, permission, credential, mailbox and response records in UTC order.</p></article><article><span>02 · REASON</span><strong>Test competing explanations</strong><p>Cite exact event IDs, compare the known-good control, and state what the evidence cannot prove.</p></article><article><span>03 · RESPOND</span><strong>Prove containment and recovery</strong><p>Prioritise scoped response, preserve records, and name the post-action evidence that confirms success.</p></article></div></article>
      <article className="caselab-card caselab-lab-pack-card"><div><span className="caselab-kicker">LOCAL EVIDENCE PACKAGE</span><h3>Download the investigation artifacts</h3><p>The ZIP contains JSONL/CSV records, field notes and a SHA-256 manifest. Analyse it locally with tools such as Python or PowerShell; no live target or production account is required.</p></div><a className="caselab-button caselab-button-primary" href={CASE_PACK_URL} download>Download evidence ZIP ↧</a></article>
        <article className="caselab-card"><h3>Source-backed incident context and limits</h3><ul>{caseItem.factsAndLimits.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <section className="caselab-source-section" aria-labelledby="caselab-source-title"><div><span className="caselab-kicker">INCIDENT DOSSIER · SOURCE REGISTER</span><h3 id="caselab-source-title">Review the public evidence base</h3><p className="caselab-muted">{caseItem.sources.length} linked materials grouped by what they help you learn. Primary disclosures establish reported facts; playbooks teach defensive investigation; independent analysis is clearly marked as interpretation. None of these sources is the fictional lab telemetry.</p><div className="caselab-source-summary"><span>{caseItem.sources.length} source materials</span><span>{SOURCE_GROUPS.filter((group) => caseItem.sources.some((source) => source.sourceGroup === group.id)).length} source groups</span><span>Public-source links</span></div></div><div className="caselab-source-groups">{SOURCE_GROUPS.map((group) => { const grouped = caseItem.sources.filter((source) => source.sourceGroup === group.id); return grouped.length ? <section className="caselab-source-group" key={group.id}><div className="caselab-source-group-head"><div><h4>{group.title}</h4><p>{group.purpose}</p></div><span>{grouped.length} materials</span></div><div className="caselab-source-list">{grouped.map((source) => <article className="caselab-source" key={source.id}><div><span className="caselab-source-publisher">{source.publisher} · {source.publishedAt}</span><h5>{source.title}</h5><p>{source.supports}</p><small>{source.sourceType}</small></div><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div></section> : null; })}</div><p className="caselab-review-date">Source list checked: {caseItem.sourceCheckedAt}. Published status remains candidate pending independent technical review. External documents may change; verify current source content and licensing before reuse.</p></section>
      </div>}

      {activeStage === 1 && <div className="caselab-stage-body">
        <div className="caselab-evidence-toolbar"><label className="caselab-search-field"><span>Search the evidence</span><input type="search" value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} placeholder="Event ID, principal, source, result…" /></label><div className="caselab-evidence-toolbar-actions"><span className="caselab-muted">{selectedEvidence.length} selected · {filteredEvents.length} shown</span><button type="button" className="caselab-button" onClick={() => setSelectedEvidence((current) => [...new Set([...current, ...filteredEvents.map((event) => event.id)])])}>Select visible</button><button type="button" className="caselab-button" onClick={() => setSelectedEvidence([])}>Clear</button></div></div>
        <div className="caselab-evidence-tools"><button type="button" className="caselab-button" onClick={() => downloadEvidencePack(evidencePack, caseItem, 'json')}>Export current evidence JSON</button><button type="button" className="caselab-button" onClick={() => downloadEvidencePack(evidencePack, caseItem, 'csv')}>Export current evidence CSV</button><a className="caselab-button" href={CASE_PACK_URL} download>Download multi-file pack ↧</a></div>
        <p className="caselab-muted">Select the records you will cite in your report. The events are sorted in UTC. A missing value is a collection limitation, not proof that the activity did or did not occur.</p>
        <div className="caselab-evidence-list">
          {filteredEvents.map((item) => <label className={`caselab-evidence-event ${selectedEvidence.includes(item.id) ? 'is-selected' : ''}`} key={item.id}>
            <input type="checkbox" checked={selectedEvidence.includes(item.id)} onChange={() => toggleValue(item.id, selectedEvidence, setSelectedEvidence)} />
            <span className="caselab-event-dot" aria-hidden="true" />
            <span className="caselab-event-body"><span className="caselab-event-meta"><b>{item.id}</b><time dateTime={item.timestampUtc}>{dateLabel(item.timestampUtc)}</time></span><strong>{item.eventType}</strong><span className="caselab-event-detail">{item.detail}</span><span className="caselab-event-tags"><span>{item.sourceType}</span><span>{item.result}</span><span>{item.classification}</span></span><small>Principal: {item.principal} · Source: {item.source}</small></span>
          </label>)}
          {!filteredEvents.length && <p className="caselab-empty-state">No evidence records match that search. Try an event ID, source type, or principal.</p>}
        </div>
        {selectedEvents.length > 0 && <aside className="caselab-selected-evidence"><strong>Selected evidence register</strong><p>{selectedEvents.map((item) => item.id).join(' · ')}</p><small>Reference these IDs in your written findings so another analyst can reproduce your reasoning.</small></aside>}
        <HintDeck hints={activeHints} />
      </div>}

      {activeStage === 2 && <div className="caselab-stage-body">
        <fieldset className="caselab-fieldset"><legend>Choose your working hypothesis</legend><p className="caselab-muted">Choose the explanation best supported so far. You may revise your position as you analyse more records.</p>{caseItem.hypothesisOptions.map((item) => <label className="caselab-option" key={item.id}><input type="radio" name="caselab-hypothesis" value={item.id} checked={hypothesisId === item.id} onChange={() => setHypothesisId(item.id)} /><span>{item.label}</span></label>)}</fieldset>
        <label className="caselab-field"><span>Investigation findings and uncertainty</span><textarea required minLength={40} maxLength={4000} value={findings} onChange={(event) => setFindings(event.target.value)} placeholder="Build a timeline. Cite event IDs. Separate observations from inference. Compare at least one alternative explanation. State what the evidence does not prove and what you need next." rows={8} /><small>{findings.length}/4000 characters. Strong findings cite specific events, explain relationships across data sources, and identify gaps or competing explanations.</small></label>
        <div className="caselab-analysis-checklist"><strong>Before continuing, check your reasoning</strong><label><input type="checkbox" /> I can point to the records that support my hypothesis.</label><label><input type="checkbox" /> I considered at least one benign or alternative explanation.</label><label><input type="checkbox" /> I separated observed events from assumptions about attribution or impact.</label></div>
        <HintDeck hints={activeHints} />
      </div>}

      {activeStage === 3 && <div className="caselab-stage-body">
        <fieldset className="caselab-fieldset"><legend>Choose response and evidence-preservation actions</legend><p className="caselab-muted">Prioritize reversible, approved and proportionate action. Consider what must be preserved before changes, what requires an owner/impact check, and what will prove completion.</p>{caseItem.responseActions.map((item) => <label className="caselab-option" key={item.id}><input type="checkbox" checked={responseActions.includes(item.id)} onChange={() => toggleValue(item.id, responseActions, setResponseActions)} /><span>{item.label}</span></label>)}</fieldset>
        <label className="caselab-field"><span>Post-response validation plan</span><textarea required minLength={10} maxLength={2000} value={validationPlan} onChange={(event) => setValidationPlan(event.target.value)} placeholder="Identify the authoritative records, exact post-action checks, expected results, monitoring window and role that confirms closure." rows={6} /><small>{validationPlan.length}/2000 characters. Do not write only a list of tools—explain what result would prove the action completed.</small></label>
        <HintDeck hints={activeHints} />
      </div>}

      {activeStage === 4 && <div className="caselab-stage-body">
        <div className="caselab-review-grid">
          <article className="caselab-review-item"><span className="caselab-kicker">EVIDENCE</span><strong>{selectedEvidence.length} records selected</strong><p>{selectedEvidence.slice().sort().join(', ') || 'No evidence selected'}</p></article>
          <article className="caselab-review-item"><span className="caselab-kicker">HYPOTHESIS</span><strong>{caseItem.hypothesisOptions.find((item) => item.id === hypothesisId)?.label || 'Not selected'}</strong></article>
          <article className="caselab-review-item"><span className="caselab-kicker">RESPONSE</span><strong>{responseActions.length} actions selected</strong><p>{caseItem.responseActions.filter((item) => responseActions.includes(item.id)).map((item) => item.label).join(' · ') || 'No response actions selected'}</p></article>
          <article className="caselab-review-item"><span className="caselab-kicker">VALIDATION</span><p>{validationPlan || 'No validation plan written'}</p></article>
        </div>
        <article className="caselab-card"><h3>Your written assessment</h3><p className="caselab-review-findings">{findings || 'No findings written'}</p></article>
        {saveError && <div className="caselab-alert caselab-alert-error" role="alert">{saveError}</div>}
        <div className="caselab-submit-row"><div><strong>Submit your investigation</strong><p>Feedback uses the case's transparent deterministic rubric. Written-response checks are heuristic and do not replace expert review.</p><small role="status">{notice}</small></div>{auth.status === 'authenticated' ? <button className="caselab-button caselab-button-primary" type="button" onClick={() => void submitAttempt()} disabled={saving}>{saving ? 'Submitting investigation…' : 'Submit and save investigation'}</button> : <button className="caselab-button caselab-button-primary" type="button" disabled={auth.status === 'loading' || !auth.configured} onClick={() => void auth.login()}>{!auth.configured ? 'Sign-in unavailable in this build' : auth.status === 'loading' ? 'Checking sign-in…' : 'Sign in to submit'}</button>}</div>
        {auth.status !== 'authenticated' && <p className="caselab-muted">You can inspect the case and download the evidence pack as a public preview. Saving an attempt and opening the after-action guide requires signing in.</p>}
        {submissions.length > 0 && <section className="caselab-history-panel"><div><span className="caselab-kicker">YOUR LEARNING RECORD</span><h3>Previous attempts</h3></div><div className="caselab-history-list">{submissions.map((item) => <button key={item.submissionId} type="button" className={`caselab-history-item ${latestSubmission?.submissionId === item.submissionId ? 'is-active' : ''}`} onClick={() => setLatestSubmission(item)}><span><strong>Attempt {item.attemptNo}</strong><small>{dateLabel(item.submittedAt)}</small></span><b>{item.score}/100</b></button>)}</div></section>}
      </div>}

      {stageError && <div className="caselab-alert caselab-alert-error" role="alert">{stageError}</div>}
      <div className="caselab-stage-controls"><button type="button" className="caselab-button" onClick={goBack} disabled={activeStage === 0}>← Previous stage</button>{activeStage < STAGES.length - 1 ? <button type="button" className="caselab-button caselab-button-primary" onClick={goNext}>Continue to {STAGES[activeStage + 1].short} →</button> : <span className="caselab-stage-last-note">Check your work before submitting.</span>}</div>
    </section>

    {latestSubmission && <section className="caselab-section caselab-results" aria-labelledby="caselab-results-title">
      <div className="caselab-section-heading"><span className="caselab-step">✓</span><div><span className="caselab-kicker">ATTEMPT FEEDBACK</span><h2 id="caselab-results-title">Attempt {latestSubmission.attemptNo}: {latestSubmission.score}/100</h2></div></div>
      <div className="caselab-score-track" role="img" aria-label={`Rubric score ${latestSubmission.score} out of 100`}><span style={{ width: `${Math.max(0, Math.min(100, Number(latestSubmission.score) || 0))}%` }} /></div>
      <div className="caselab-rubric">{(latestSubmission.rubricFeedback || []).map((item) => <article className="caselab-rubric-item" key={item.criterion}><div><strong>{item.criterion}</strong><span>{item.pointsAwarded}/{item.pointsPossible}</span></div><p>{item.feedback}</p></article>)}</div>
      <div className="caselab-submit-row"><p>This score is formative, not a certification. Export the attempt to preserve your reasoning and feedback.</p><button type="button" className="caselab-button" onClick={() => downloadSubmission(latestSubmission, caseItem)}>Export investigation report JSON</button></div>
      {debrief && <section className="caselab-debrief" aria-labelledby="caselab-debrief-title"><span className="caselab-kicker">AFTER-ACTION REVIEW</span><h2 id="caselab-debrief-title">{debrief.title}</h2><p>{debrief.assessment}</p><div className="caselab-debrief-chains">{debrief.evidenceChains.map((chain) => <article className="caselab-debrief-chain" key={chain.title}><h3>{chain.title}</h3><div className="caselab-event-tags">{chain.eventIds.map((id) => <span key={id}>{id}</span>)}</div><p>{chain.explanation}</p></article>)}</div><div className="caselab-two-col"><article className="caselab-card"><h3>Recommended response sequence</h3><ol>{debrief.responseSequence.map((step) => <li key={step}>{step}</li>)}</ol></article><article className="caselab-card"><h3>Closure checklist</h3><ul>{debrief.closureChecks.map((step) => <li key={step}>{step}</li>)}</ul></article></div><article className="caselab-card caselab-pitfalls"><h3>Common pitfalls to avoid</h3><ul>{debrief.commonPitfalls.map((step) => <li key={step}>{step}</li>)}</ul></article></section>}
      {debriefError && <div className="caselab-alert" role="status">After-action guide: {debriefError}</div>}
    </section>}
  </main>;
}
