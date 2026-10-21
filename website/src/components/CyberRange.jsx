import { useEffect, useMemo, useState } from 'react';
import './CyberRange.css'; // cyberrange-v1

const STORAGE_KEY = 'opencyberpath.cyberrange.v1';

const CASES = [
  {
    id: 'auth-burst', number: '01', title: 'Authentication burst', area: 'IDENTITY & ACCESS', level: 'Beginner', time: '8 min', risk: 'Needs investigation',
    objective: 'Triage a short run of failed sign-ins followed by a successful sign-in. Describe what the timeline supports—and what it does not prove.',
    columns: ['Time (UTC)', 'Account', 'Source', 'Result', 'Event ID'],
    events: [
      ['09:10:01', 'trainee.alex', '203.0.113.42', 'Failure · invalid password', '4625'],
      ['09:10:08', 'trainee.alex', '203.0.113.42', 'Failure · invalid password', '4625'],
      ['09:10:20', 'trainee.alex', '203.0.113.42', 'Success', '4624'],
      ['09:11:02', 'trainee.alex', '203.0.113.42', 'MFA result not supplied', '—'],
    ],
    note: 'Synthetic Windows-style sign-in events. The source address is documentation-only. This fixture does not describe a real account or system.',
    choices: [
      { id: 'pattern', label: 'Repeated failures followed by success are a pattern worth investigating; verify user context, MFA, and nearby events.', correct: true },
      { id: 'confirmed', label: 'This proves the account was taken over and every account is compromised.', correct: false },
      { id: 'normal', label: 'A successful sign-in makes the earlier failures irrelevant; close the alert without review.', correct: false },
    ],
    explanation: 'The timeline shows repeated authentication failures followed by success from the same fixture source. That can be consistent with mistyped credentials or password guessing. It does not, by itself, prove an account compromise. Correlate MFA, device, expected user activity, and other sign-in records.',
    hints: ['Read the events in timestamp order and notice what changed after the failures.', 'Separate the observed sequence from the explanation you suspect.', 'The next checks should add account, device, MFA, and user-context evidence.'],
  },
  {
    id: 'dns-anomaly', number: '02', title: 'DNS anomaly review', area: 'NETWORK TELEMETRY', level: 'Beginner → Intermediate', time: '10 min', risk: 'Unusual pattern',
    objective: 'Review a compact DNS fixture and choose a defensible interpretation. Look for rarity and timing without treating one indicator as proof.',
    columns: ['Time (UTC)', 'Client', 'Query', 'Answer / result', 'TTL'],
    events: [
      ['10:42:02', 'LAB-WS-02', 'portal.training.example', '192.0.2.18', '300 s'],
      ['10:42:06', 'LAB-WS-02', 'a81c.metrics-check.training.invalid', '198.51.100.77', '30 s'],
      ['10:42:09', 'LAB-WS-02', 'b193.metrics-check.training.invalid', '198.51.100.77', '30 s'],
      ['10:42:12', 'LAB-WS-02', 'c504.metrics-check.training.invalid', 'NXDOMAIN', '—'],
    ],
    note: 'Synthetic DNS events with documentation-only hostnames and addresses. A short TTL or unusual name is a clue for triage, not a verdict.',
    choices: [
      { id: 'rare-domains', label: 'The burst of unusual names is worth correlating with client process, DNS baseline, and known business use; it is not proof alone.', correct: true },
      { id: 'malware-proof', label: 'The low TTL confirms malware and identifies the threat actor.', correct: false },
      { id: 'ignore', label: 'NXDOMAIN is always harmless, so the other DNS events can be ignored.', correct: false },
    ],
    explanation: 'The fixture shows a short burst of unusual subdomain-like names, repeated answer data, a short TTL, and one NXDOMAIN response. These observations justify checking prevalence, client process telemetry, resolver context, and known services. DNS alone does not establish malicious intent.',
    hints: ['Compare the query names and timing, not just the final result.', 'A low TTL can be legitimate; use it with other context.', 'Look for client-process and baseline evidence before assigning a cause.'],
  },
  {
    id: 'process-chain', number: '03', title: 'Endpoint process chain', area: 'ENDPOINT DETECTION', level: 'Intermediate', time: '12 min', risk: 'Suspicious chain',
    objective: 'Assess a process-parent sequence from a fictional endpoint alert while keeping the investigation bounded to the supplied evidence.',
    columns: ['Time (UTC)', 'Host', 'Parent → child', 'Observed context', 'Network'],
    events: [
      ['11:06:14', 'LAB-WIN-07', 'WINWORD.EXE → powershell.exe', 'Document opened shortly before process start', 'Not supplied'],
      ['11:06:15', 'LAB-WIN-07', 'powershell.exe → rundll32.exe', 'Command-line field redacted in training fixture', 'Not supplied'],
      ['11:06:17', 'LAB-WIN-07', 'rundll32.exe', 'File hash and signer not supplied', '198.51.100.24 (fixture)'],
    ],
    note: 'Synthetic endpoint rows. The command-line is intentionally redacted; no payload or runnable command is included. Host and network details are fixtures.',
    choices: [
      { id: 'triage-chain', label: 'Treat the parent-child chain as suspicious and collect process, user, signature/hash, and network context before deciding on containment.', correct: true },
      { id: 'confirmed-malware', label: 'The process names alone prove malware; there is no need to collect more evidence.', correct: false },
      { id: 'allow-chain', label: 'These are built-in process names, so their parent-child relationship is always safe.', correct: false },
    ],
    explanation: 'Office spawning a scripting process followed by another utility can be suspicious, but process names alone are not conclusive. Validate the full command line in approved telemetry, user/session, file hash and signature, parent process, and correlated network data. Use your organization’s incident policy for containment decisions.',
    hints: ['Focus on the parent-child relationship and sequence.', 'The fixture deliberately withholds command-line, hash, and signer data.', 'A good triage recommendation names evidence to collect and avoids claiming certainty.'],
  },
];

function loadSavedState() {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function evidenceChecklist(note) {
  const value = String(note || '').toLowerCase();
  const checks = [
    { id: 'observation', label: 'Observed fact', ok: /observed|event|log|shows|record|timestamp|failed|success|query|process/.test(value) },
    { id: 'source', label: 'Evidence source', ok: /source|event id|4624|4625|dns|endpoint|telemetry|fixture/.test(value) },
    { id: 'limit', label: 'Limit or uncertainty', ok: /cannot prove|does not prove|unknown|uncertain|limitation|not enough|not supplied|not confirmed|insufficient/.test(value) },
    { id: 'next', label: 'Next check', ok: /check|correlat|verify|review|confirm|compare|investigat|collect|validate/.test(value) },
  ];
  return checks;
}

function downloadReport(caseItem, chosen, result, evidence, checklist) {
  const body = [
    'OpenCyberPath CyberRange — Training Record',
    `Case: ${caseItem.title}`,
    `Generated: ${new Date().toISOString()}`,
    'Data: Synthetic training fixture only',
    `Selected answer: ${chosen ? chosen.label : 'No answer submitted'}`,
    `Knowledge check: ${result === true ? 'Correct' : result === false ? 'Needs another attempt' : 'Not submitted'}`,
    '', 'Evidence note:', evidence.trim() || '(No evidence note written)',
    '', 'Evidence note checklist:',
    ...checklist.map((item) => `${item.ok ? '[x]' : '[ ]'} ${item.label}`),
    '', 'Reminder: This is a learning record, not a credential or a real incident report.',
  ].join('\n');
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `opencyberpath-${caseItem.id}-training-record.txt`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CyberRange() {
  const saved = useMemo(() => loadSavedState(), []);
  const [activeId, setActiveId] = useState(CASES.some((item) => item.id === saved.activeId) ? saved.activeId : CASES[0].id);
  const [selectedAnswers, setSelectedAnswers] = useState(saved.selectedAnswers && typeof saved.selectedAnswers === 'object' ? saved.selectedAnswers : {});
  const [submissions, setSubmissions] = useState(saved.submissions && typeof saved.submissions === 'object' ? saved.submissions : {});
  const [completed, setCompleted] = useState(Array.isArray(saved.completed) ? saved.completed.filter((id) => CASES.some((item) => item.id === id)) : []);
  const [hintLevels, setHintLevels] = useState(saved.hintLevels && typeof saved.hintLevels === 'object' ? saved.hintLevels : {});
  const [evidenceNotes, setEvidenceNotes] = useState(saved.evidenceNotes && typeof saved.evidenceNotes === 'object' ? saved.evidenceNotes : {});
  const [reviewRequested, setReviewRequested] = useState({});
  const [storageNotice, setStorageNotice] = useState('Progress is stored locally in this browser.');
  const currentCase = CASES.find((item) => item.id === activeId) || CASES[0];
  const selected = currentCase.choices.find((item) => item.id === selectedAnswers[activeId]) || null;
  const submission = submissions[activeId];
  const note = evidenceNotes[activeId] || '';
  const checklist = evidenceChecklist(note);
  const passedCount = completed.length;
  const hintsShown = hintLevels[activeId] || 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, activeId, selectedAnswers, submissions, completed, hintLevels, evidenceNotes, savedAt: new Date().toISOString() }));
      setStorageNotice('Progress and evidence notes saved only in this browser.');
    } catch {
      setStorageNotice('Browser storage is unavailable. Export your training record to keep a copy.');
    }
  }, [activeId, selectedAnswers, submissions, completed, hintLevels, evidenceNotes]);

  function chooseCase(id) {
    setActiveId(id);
    setReviewRequested((current) => ({ ...current, [id]: false }));
  }

  function submitAnswer() {
    if (!selectedAnswers[activeId]) return;
    const choice = currentCase.choices.find((item) => item.id === selectedAnswers[activeId]);
    const passed = choice?.correct === true;
    setSubmissions((current) => ({ ...current, [activeId]: { choiceId: choice?.id || '', correct: passed, submittedAt: new Date().toISOString() } }));
    if (passed) setCompleted((current) => current.includes(activeId) ? current : [...current, activeId]);
  }

  function reviewEvidence() {
    setReviewRequested((current) => ({ ...current, [activeId]: true }));
  }

  return <section className="section-wrap cr-range" aria-labelledby="cr-range-title">
    <header className="cr-hero">
      <div className="cr-hero-copy">
        <span className="cr-eyebrow">BROWSER-BASED DEFENSIVE PRACTICE · V1</span>
        <h1 id="cr-range-title">CyberRange<span> /</span> <em>investigate the evidence.</em></h1>
        <p>Work through fictional authentication, DNS, and endpoint events. Make a reasoned decision, reveal progressive hints, and record what the evidence does—and does not—support.</p>
        <div className="cr-hero-tags"><span>✓ Synthetic data</span><span>✓ No target scanning</span><span>✓ No account required</span></div>
      </div>
      <div className="cr-score-panel"><span className="cr-eyebrow">YOUR LOCAL PROGRESS</span><strong>{passedCount}<small> / {CASES.length}</small></strong><span>cases passed</span><div className="cr-progress-track"><span style={{ width: `${(passedCount / CASES.length) * 100}%` }} /></div><p>{storageNotice}</p></div>
    </header>

    <div className="cr-safety-banner" role="note"><span aria-hidden="true">ⓘ</span><div><b>Training environment only</b><p>Every row below is fictional. Documentation-only hostnames and IP addresses are used; this exercise does not connect to a target, inspect your device, or execute commands.</p></div></div>

    <div className="cr-workspace">
      <aside className="cr-case-list" aria-label="Choose a CyberRange case">
        <div className="cr-panel-heading"><span>CASE FILES</span><span>{passedCount}/{CASES.length}</span></div>
        {CASES.map((item) => <button key={item.id} type="button" className={`cr-case-button ${activeId === item.id ? 'is-active' : ''}`} onClick={() => chooseCase(item.id)} aria-current={activeId === item.id ? 'true' : undefined}>
          <span className={`cr-case-number ${completed.includes(item.id) ? 'is-complete' : ''}`}>{completed.includes(item.id) ? '✓' : item.number}</span><span className="cr-case-copy"><b>{item.title}</b><small>{item.area} · {item.time}</small></span><span className="cr-case-arrow">›</span>
        </button>)}
        <p className="cr-case-footer">Your progress is local to this browser profile; there is no remote sync.</p>
      </aside>

      <article className="cr-case-detail">
        <div className="cr-case-topline"><span>{currentCase.area}</span><span>{currentCase.level}</span><span className="cr-risk-label">{completed.includes(activeId) ? 'PASSED' : currentCase.risk.toUpperCase()}</span></div>
        <h2>{currentCase.title}</h2>
        <p className="cr-objective">{currentCase.objective}</p>
        <div className="cr-evidence-heading"><div><span className="cr-eyebrow">EVIDENCE VIEWER</span><h3>Timeline observations</h3></div><span className="cr-synthetic-label">SYNTHETIC FIXTURE</span></div>
        <div className="cr-table-scroll"><table className="cr-event-table"><thead><tr>{currentCase.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{currentCase.events.map((event, rowIndex) => <tr key={`${currentCase.id}-${rowIndex}`}>{event.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>
        <p className="cr-fixture-note">{currentCase.note}</p>

        <section className="cr-knowledge-check" aria-labelledby="cr-question-title">
          <div className="cr-subsection-heading"><span className="cr-step-number">01</span><div><span className="cr-eyebrow">KNOWLEDGE CHECK</span><h3 id="cr-question-title">What is the most defensible conclusion?</h3></div></div>
          <fieldset className="cr-answer-list"><legend className="cr-sr-only">Choose the most defensible conclusion</legend>{currentCase.choices.map((choice, index) => <label key={choice.id} className={`cr-answer-option ${selectedAnswers[activeId] === choice.id ? 'is-selected' : ''} ${submission && selectedAnswers[activeId] === choice.id && choice.correct ? 'is-right' : ''}`}><input type="radio" name={`answer-${activeId}`} value={choice.id} checked={selectedAnswers[activeId] === choice.id} onChange={() => { setSelectedAnswers((current) => ({ ...current, [activeId]: choice.id })); setSubmissions((current) => { const next = { ...current }; delete next[activeId]; return next; }); }}/><span className="cr-choice-index">{String.fromCharCode(65 + index)}</span><span>{choice.label}</span></label>)}</fieldset>
          <div className="cr-answer-actions"><button type="button" className="cr-primary-button" onClick={submitAnswer} disabled={!selectedAnswers[activeId]}>Check answer <span aria-hidden="true">→</span></button><button type="button" className="cr-secondary-button" onClick={() => setHintLevels((current) => ({ ...current, [activeId]: Math.min(currentCase.hints.length, (current[activeId] || 0) + 1) }))} disabled={hintsShown >= currentCase.hints.length}>Reveal hint {Math.min(hintsShown + 1, currentCase.hints.length)}</button><span className="cr-hint-count">{hintsShown}/{currentCase.hints.length} hints</span></div>
          {hintsShown > 0 && <div className="cr-hints-box" aria-live="polite">{currentCase.hints.slice(0, hintsShown).map((hint, index) => <p key={`${activeId}-hint-${index}`}><b>Hint {index + 1}</b>{hint}</p>)}</div>}
          {submission && <div className={`cr-feedback ${submission.correct ? 'is-correct' : 'is-try-again'}`} role="status"><b>{submission.correct ? 'Good analysis — answer validated.' : 'Not quite. Revisit the timeline and try again.'}</b><p>{currentCase.explanation}</p>{!submission.correct && <small>Review the observation, avoid overclaiming, and use a hint if it helps.</small>}</div>}
        </section>

        <section className="cr-evidence-notes" aria-labelledby="cr-evidence-note-title">
          <div className="cr-subsection-heading"><span className="cr-step-number">02</span><div><span className="cr-eyebrow">WRITE YOUR FINDING</span><h3 id="cr-evidence-note-title">Evidence note</h3></div></div>
          <p>Record the key observation, the source, one limitation, and a sensible next check. This transparent checklist uses simple keyword prompts, not AI or an external service.</p>
          <label className="cr-note-label" htmlFor={`cr-note-${activeId}`}>Your investigation notes</label><textarea id={`cr-note-${activeId}`} value={note} maxLength={8000} rows={4} onChange={(event) => setEvidenceNotes((current) => ({ ...current, [activeId]: event.target.value }))} placeholder="Observed fact: …\nEvidence source: …\nLimitation / unknown: …\nNext check: …" />
          <div className="cr-note-controls"><span>{note.length}/8000 characters · saved locally</span><button type="button" className="cr-secondary-button" onClick={reviewEvidence}>Review evidence note</button><button type="button" className="cr-secondary-button" onClick={() => downloadReport(currentCase, selected, submission?.correct, note, checklist)}>Export training record (.txt)</button></div>
          {reviewRequested[activeId] && <div className="cr-note-review" role="status"><b>Evidence-note checklist</b><div className="cr-checklist">{checklist.map((item) => <span key={item.id} className={item.ok ? 'is-met' : ''}><i aria-hidden="true">{item.ok ? '✓' : '○'}</i>{item.label}</span>)}</div><p>{checklist.every((item) => item.ok) ? 'All four prompts appear to be covered. Read your note once more to ensure each statement is accurate.' : 'Add the missing context prompts above. These checks only look for common words; they do not verify the truth of your note.'}</p></div>}
        </section>
      </article>
    </div>

    <footer className="cr-bottom-note"><b>Scope note:</b> CyberRange v1 assesses selected answers against fixed training scenarios. It is not a live SOC, does not connect to real systems, and does not award a certification. More cases can be added without replacing the existing labs or learning content.</footer>
  </section>;
}
