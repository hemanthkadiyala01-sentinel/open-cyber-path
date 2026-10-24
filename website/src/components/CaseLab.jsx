import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import './CaseLab.css';

const CASE_ID = 'midnight-blizzard-identity-response';
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

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
  })[code] || `The request could not be completed (${code}).`;
}

async function getJson(url, options = {}) {
  const response = await fetch(url, { credentials: 'omit', cache: 'no-store', ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(formatError(body, response.status));
  return body;
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
    sources: caseItem?.sources?.map(({ publisher, title, publishedAt, url }) => ({ publisher, title, publishedAt, url })) || [],
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `opencyberpath-caselab-attempt-${submission.attemptNo || 'latest'}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CaseLab() {
  const auth = useAuth();
  const [caseItem, setCaseItem] = useState(null);
  const [evidencePack, setEvidencePack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [hypothesisId, setHypothesisId] = useState('identity-compromise-suspected');
  const [responseActions, setResponseActions] = useState([]);
  const [findings, setFindings] = useState('');
  const [validationPlan, setValidationPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('Your work is not saved until you submit while signed in.');

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
        const rows = Array.isArray(body?.submissions) ? body.submissions : [];
        setSubmissions(rows);
        setLatestSubmission((current) => current || rows[0] || null);
        if (rows.length) setNotice(`Loaded ${rows.length} saved attempt${rows.length === 1 ? '' : 's'} for your signed-in account.`);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setSaveError(error instanceof Error ? error.message : 'Saved attempts could not be loaded.');
      }
    }
    void loadSubmissions();
    return () => { active = false; controller.abort(); };
  }, [auth.status]);

  const events = useMemo(() => [...(evidencePack?.events || [])].sort((a, b) => a.timestampUtc.localeCompare(b.timestampUtc)), [evidencePack]);
  const toggleValue = (value, values, setValues) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  async function submitAttempt(event) {
    event.preventDefault();
    setSaveError('');
    if (auth.status !== 'authenticated') {
      setSaveError(auth.configured ? 'Sign in first to save this attempt to your account.' : 'Account sign-in is not configured in this build. Your work has not been saved.');
      return;
    }
    if (!caseItem || !validationPlan.trim()) {
      setSaveError('Add a validation plan before submitting.');
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
      setNotice(`Attempt ${submission.attemptNo} saved to your signed-in account.`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The attempt could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="section-wrap caselab-page"><p role="status">Loading CaseLab case and synthetic evidence…</p></section>;

  if (loadError) return <section className="section-wrap caselab-page" aria-labelledby="caselab-title">
    <div className="caselab-hero"><div><span className="caselab-kicker">CASELAB · INVESTIGATE WITH EVIDENCE</span><h1 id="caselab-title">One case. <em>Defensible decisions.</em></h1><p>CaseLab needs the configured OpenCyberPath API to load the source record and synthetic evidence.</p></div></div>
    <div className="caselab-alert" role="alert">{loadError}</div>
    <button type="button" className="caselab-button caselab-button-primary" onClick={() => window.location.reload()}>Retry case loading</button>
  </section>;

  return <main className="section-wrap caselab-page" aria-labelledby="caselab-title">
    <header className="caselab-hero">
      <div className="caselab-hero-copy">
        <span className="caselab-kicker">CASELAB · SOURCE-BACKED DEFENSIVE INVESTIGATION</span>
        <h1 id="caselab-title">Investigate the signals.<br /><em>Defend the conclusion.</em></h1>
        <p>Work from the supplied record, correlate events, state a hypothesis with appropriate uncertainty, and define the checks that would validate your response.</p>
        <div className="caselab-tags"><span>{caseItem.topic}</span><span>{caseItem.difficulty}</span><span>{caseItem.estimatedMinutes} min</span><span>Revision {caseItem.revision}</span></div>
      </div>
      <aside className="caselab-hero-panel"><span className="caselab-panel-label">YOUR CURRENT RECORD</span><strong>{submissions.length}</strong><span>saved attempt{submissions.length === 1 ? '' : 's'} for this account</span><p>{auth.status === 'authenticated' ? 'Signed in · account persistence available' : auth.status === 'loading' ? 'Checking sign-in status…' : 'Public preview · sign in to save attempts'}</p></aside>
    </header>

    <div className="caselab-alert caselab-alert-review" role="note"><strong>Draft case — human review required.</strong> The source links are provided for independent review. This is an AI-assisted candidate exercise, not a certified or independently approved training case.</div>
    <div className="caselab-alert" role="note"><strong>Evidence integrity:</strong> {evidencePack.disclaimer}</div>

    <section className="caselab-section" aria-labelledby="caselab-objectives-title">
      <div className="caselab-section-heading"><span className="caselab-step">01</span><div><span className="caselab-kicker">MISSION BRIEF</span><h2 id="caselab-objectives-title">What you are investigating</h2></div></div>
      <p className="caselab-context">{caseItem.context}</p>
      <div className="caselab-two-col">
        <article className="caselab-card"><h3>Learning objectives</h3><ul>{caseItem.learningObjectives.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article className="caselab-card"><h3>Source-backed context and limits</h3><ul>{caseItem.factsAndLimits.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
    </section>

    <section className="caselab-section" aria-labelledby="caselab-evidence-title">
      <div className="caselab-section-heading"><span className="caselab-step">02</span><div><span className="caselab-kicker">UTC EVIDENCE TIMELINE</span><h2 id="caselab-evidence-title">Build the story from records</h2></div></div>
      <p className="caselab-muted">Select the events you rely on. A timestamp or a successful sign-in is not proof of compromise on its own.</p>
      <div className="caselab-evidence-list">
        {events.map((item) => <label className={`caselab-evidence-event ${selectedEvidence.includes(item.id) ? 'is-selected' : ''}`} key={item.id}>
          <input type="checkbox" checked={selectedEvidence.includes(item.id)} onChange={() => toggleValue(item.id, selectedEvidence, setSelectedEvidence)} />
          <span className="caselab-event-dot" aria-hidden="true" />
          <span className="caselab-event-body"><span className="caselab-event-meta"><b>{item.id}</b><time dateTime={item.timestampUtc}>{dateLabel(item.timestampUtc)}</time></span><strong>{item.eventType}</strong><span className="caselab-event-detail">{item.detail}</span><span className="caselab-event-tags"><span>{item.sourceType}</span><span>{item.result}</span><span>{item.classification}</span></span><small>Principal: {item.principal} · Source: {item.source}</small></span>
        </label>)}
      </div>
    </section>

    <form className="caselab-section caselab-investigation-form" onSubmit={submitAttempt} aria-labelledby="caselab-assessment-title">
      <div className="caselab-section-heading"><span className="caselab-step">03</span><div><span className="caselab-kicker">INVESTIGATOR WORKSPACE</span><h2 id="caselab-assessment-title">Explain your assessment</h2></div></div>
      <label className="caselab-field"><span>Findings and uncertainty</span><textarea required minLength={40} maxLength={4000} value={findings} onChange={(event) => setFindings(event.target.value)} placeholder="Describe the sequence, what the evidence supports, what remains unknown, and the next facts you need." rows={5} /><small>40–4,000 characters. Cite specific event IDs where useful, separate observations from inference, and state what the fixture cannot prove.</small></label>

      <fieldset className="caselab-fieldset"><legend>Choose a working hypothesis</legend>{caseItem.hypothesisOptions.map((item) => <label className="caselab-option" key={item.id}><input type="radio" name="caselab-hypothesis" value={item.id} checked={hypothesisId === item.id} onChange={() => setHypothesisId(item.id)} /><span>{item.label}</span></label>)}</fieldset>

      <fieldset className="caselab-fieldset"><legend>Choose response and validation actions</legend><p className="caselab-muted">Consider containment, owner validation, audit preservation, credential/session actions, and privileged permissions.</p>{caseItem.responseActions.map((item) => <label className="caselab-option" key={item.id}><input type="checkbox" checked={responseActions.includes(item.id)} onChange={() => toggleValue(item.id, responseActions, setResponseActions)} /><span>{item.label}</span></label>)}</fieldset>

      <label className="caselab-field"><span>Post-response validation plan</span><textarea required minLength={10} maxLength={2000} value={validationPlan} onChange={(event) => setValidationPlan(event.target.value)} placeholder="Name the sign-in/audit records and permission/session checks you would verify, the expected result, and who confirms closure." rows={4} /><small>{validationPlan.length}/2000 characters. A detailed plan is more useful than listing tools alone.</small></label>

      {saveError && <div className="caselab-alert caselab-alert-error" role="alert">{saveError}</div>}
      <div className="caselab-submit-row"><div><strong>Attempt feedback</strong><p>Transparent, deterministic formative rubric. It is not independent certification.</p><small role="status">{notice}</small></div>{auth.status === 'authenticated' ? <button className="caselab-button caselab-button-primary" type="submit" disabled={saving}>{saving ? 'Saving attempt…' : 'Submit and save attempt'}</button> : <button className="caselab-button caselab-button-primary" type="button" disabled={auth.status === 'loading' || !auth.configured} onClick={() => void auth.login()}>{!auth.configured ? 'Sign-in unavailable in this build' : auth.status === 'loading' ? 'Checking sign-in…' : 'Sign in to save attempt'}</button>}</div>
      {auth.status !== 'authenticated' && <p className="caselab-muted">You may explore the public case without signing in. Your answers remain only in this open page until you submit while authenticated; this preview does not promise local draft persistence.</p>}
    </form>

    {latestSubmission && <section className="caselab-section caselab-results" aria-labelledby="caselab-results-title">
      <div className="caselab-section-heading"><span className="caselab-step">04</span><div><span className="caselab-kicker">RUBRIC FEEDBACK</span><h2 id="caselab-results-title">Attempt {latestSubmission.attemptNo}: {latestSubmission.score}/100</h2></div></div>
      <div className="caselab-score-track" role="img" aria-label={`Rubric score ${latestSubmission.score} out of 100`}><span style={{ width: `${Math.max(0, Math.min(100, Number(latestSubmission.score) || 0))}%` }} /></div>
      <div className="caselab-rubric">{(latestSubmission.rubricFeedback || []).map((item) => <article className="caselab-rubric-item" key={item.criterion}><div><strong>{item.criterion}</strong><span>{item.pointsAwarded}/{item.pointsPossible}</span></div><p>{item.feedback}</p></article>)}</div>
      <div className="caselab-submit-row"><p>This is formative feedback from a published deterministic rubric. It does not certify competence, independently verify your work, or replace human review.</p><button type="button" className="caselab-button" onClick={() => downloadSubmission(latestSubmission, caseItem)}>Export attempt JSON</button></div>
    </section>}

    <section className="caselab-section" aria-labelledby="caselab-sources-title">
      <div className="caselab-section-heading"><span className="caselab-step">05</span><div><span className="caselab-kicker">SOURCE REGISTER</span><h2 id="caselab-sources-title">Read the original material</h2></div></div>
      <p className="caselab-muted">Publication dates are shown from the source records. Open the original source and review its scope before relying on a summary.</p>
      <div className="caselab-source-list">{caseItem.sources.map((source) => <article className="caselab-source" key={source.id}><div><span className="caselab-source-publisher">{source.publisher} · {source.publishedAt}</span><h3>{source.title}</h3><p>{source.supports}</p><small>{source.sourceType}</small></div><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div>
      <p className="caselab-review-date">Source list checked: {caseItem.sourceCheckedAt}. This candidate case still requires human content review before it should be represented as an approved or production case.</p>
    </section>

    {auth.status === 'authenticated' && submissions.length > 0 && <section className="caselab-section" aria-labelledby="caselab-history-title"><div className="caselab-section-heading"><span className="caselab-step">06</span><div><span className="caselab-kicker">YOUR LEARNING RECORD</span><h2 id="caselab-history-title">Saved attempts</h2></div></div><div className="caselab-history-list">{submissions.map((item) => <button key={item.submissionId} type="button" className={`caselab-history-item ${latestSubmission?.submissionId === item.submissionId ? 'is-active' : ''}`} onClick={() => setLatestSubmission(item)}><span><strong>Attempt {item.attemptNo}</strong><small>{dateLabel(item.submittedAt)}</small></span><b>{item.score}/100</b></button>)}</div></section>}
  </main>;
}
