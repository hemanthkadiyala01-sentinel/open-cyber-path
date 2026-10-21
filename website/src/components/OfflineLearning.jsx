import { useEffect, useMemo, useRef, useState } from 'react';
import './OfflineLearning.css';

const STORAGE_KEY = 'opencyberpath-offline-learning-v1';

const MODULES = [
  {
    id: 'timeline', number: '01', title: 'Build an evidence timeline', level: 'Beginner', time: '8 min',
    summary: 'Put events in time order and separate what the records show from what you suspect.',
    points: ['Record timestamp, time zone, source, and event identifier.', 'Write observations before forming a theory.', 'Note gaps, clock differences, and missing records.'],
    prompt: 'Which statement is directly supported by a record, and which part is an inference?'
  },
  {
    id: 'authentication', number: '02', title: 'Review authentication events', level: 'Beginner', time: '10 min',
    summary: 'Repeated sign-in failures followed by success justify review, but do not prove an account takeover by themselves.',
    points: ['Compare nearby events and expected user activity.', 'Check user, device, source context, and MFA outcome where available.', 'Follow the organisation’s response process; do not jump from one indicator to a verdict.'],
    prompt: 'What additional evidence would help distinguish a mistyped password from password guessing?'
  },
  {
    id: 'dns', number: '03', title: 'Triage DNS telemetry', level: 'Beginner → Intermediate', time: '10 min',
    summary: 'Unusual names, short TTL values, repeated answers, and NXDOMAIN responses are investigation clues—not proof of malicious intent.',
    points: ['Compare the activity with the client and resolver baseline.', 'Correlate query timing with process and network telemetry.', 'Check known services and business context before escalating.'],
    prompt: 'What would you correlate with the DNS sequence before calling it malicious?'
  },
  {
    id: 'endpoint', number: '04', title: 'Review endpoint process chains', level: 'Intermediate', time: '12 min',
    summary: 'A surprising parent-child process chain deserves context; process names alone do not establish malware.',
    points: ['Collect the full command line from approved telemetry.', 'Review user/session, signer, file hash, parent process, and surrounding events.', 'Use approved incident-response policy for containment decisions.'],
    prompt: 'Which missing fields would you ask for before making a containment recommendation?'
  },
  {
    id: 'evidence-note', number: '05', title: 'Write a defensible evidence note', level: 'All levels', time: '5 min',
    summary: 'A useful note explains what was observed, where it came from, what remains uncertain, and what should be checked next.',
    points: ['Observed fact: what the record actually says.', 'Evidence source: file, event ID, timestamp, or dataset.', 'Limitation: what this evidence cannot prove.', 'Next check: a concrete, authorised follow-up.'],
    prompt: 'Can another analyst reproduce your reasoning from the note and source references?'
  }
];

const QUIZ = [
  { id: 'q-timeline', question: 'A timestamped record shows a failed sign-in. Which is the strongest wording?', options: ['The record shows a failed sign-in at that time.', 'An attacker definitely tried to break in.', 'The account owner is compromised.'], answer: 0, explanation: 'Start with the observed fact. Attribution and impact require more evidence.' },
  { id: 'q-auth', question: 'Several failed sign-ins are followed by success. What should you do next?', options: ['Close the alert because success means it is safe.', 'Correlate user, device, MFA, source, and nearby events.', 'Declare every account compromised.'], answer: 1, explanation: 'The sequence is worth investigating but does not prove compromise on its own.' },
  { id: 'q-dns', question: 'A synthetic DNS fixture shows unusual names and short TTL values. What is the best conclusion?', options: ['Short TTL proves malware.', 'NXDOMAIN means every other event is harmless.', 'Correlate client process, baseline, resolver context, and known services.'], answer: 2, explanation: 'DNS indicators are clues. Context and corroborating telemetry matter.' },
  { id: 'q-endpoint', question: 'A document application starts a scripting process, then a utility. What is most defensible?', options: ['Process names alone prove malware.', 'Collect command line, user/session, signature/hash, parent, and network context.', 'Built-in utilities are always safe.'], answer: 1, explanation: 'Treat the chain as suspicious enough to review, not conclusive by itself.' },
  { id: 'q-note', question: 'What makes an investigation note easier to review?', options: ['A confident conclusion without source details.', 'Observed fact, source, limitation, and next check.', 'Only a list of tools used.'], answer: 1, explanation: 'A strong note distinguishes facts from inferences and shows remaining uncertainty.' }
];

function readProgress() {
  const fallback = { completedModules: [], completedQuestions: [], answers: {} };
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!value || typeof value !== 'object') return fallback;
    return {
      completedModules: Array.isArray(value.completedModules) ? value.completedModules.filter((id) => MODULES.some((item) => item.id === id)) : [],
      completedQuestions: Array.isArray(value.completedQuestions) ? value.completedQuestions.filter((id) => QUIZ.some((item) => item.id === id)) : [],
      answers: value.answers && typeof value.answers === 'object' ? value.answers : {},
    };
  } catch { return fallback; }
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildStandalonePack() {
  const data = JSON.stringify({ modules: MODULES, quiz: QUIZ }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenCyberPath Offline Study Pack</title>
<style>
:root{color-scheme:dark;font:16px/1.6 system-ui,Segoe UI,sans-serif;background:#06121d;color:#eaf5f7}*{box-sizing:border-box}body{margin:0;padding:24px;max-width:1000px;margin-inline:auto}h1,h2,h3{line-height:1.2}h1 em{color:#35f2bd;font-style:normal}.lead,.muted{color:#a9c0c9}.top,.module,.question{border:1px solid #244959;border-radius:14px;padding:18px;margin:14px 0;background:#0a1d2a}.pill{display:inline-block;border:1px solid #286252;border-radius:999px;padding:3px 9px;color:#62f5ca;font-size:12px}.module li{margin:5px 0}button{border:1px solid #286252;border-radius:9px;padding:10px 13px;background:#0c3033;color:#eafff8;font:inherit;cursor:pointer}button:hover{border-color:#35f2bd}label{display:block;margin:8px 0;padding:9px;border:1px solid #244959;border-radius:8px}input[type=radio]{margin-right:8px}.feedback{color:#63f2be}.wrong{color:#ffcc78}textarea{display:block;width:100%;min-height:100px;background:#071724;color:#eaf5f7;border:1px solid #244959;border-radius:9px;padding:10px;font:inherit}.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}footer{margin:24px 0;color:#90aeb8;font-size:13px}@media print{body{color:#111;background:#fff;max-width:none}.top,.module,.question{background:#fff;color:#111;border-color:#aaa}button,.row{display:none}.lead,.muted,footer{color:#444}}
</style></head><body><section class="top"><span class="pill">WORKS WITHOUT A CONNECTION</span><h1>OpenCyberPath <em>Offline Study Pack</em></h1><p class="lead">Standalone learning notes and knowledge checks. No external scripts, fonts, images, accounts, or network requests.</p><p class="muted">Complete the notes, use the questions for self-checking, and export a JSON record to preserve your progress. This is a learning aid, not a certification.</p><div class="row"><button id="export">Export study record (.json)</button><button onclick="window.print()">Print / Save as PDF</button></div></section>
<div id="lessons"></div><section class="top"><h2>Knowledge checks</h2><p class="muted">Choose an answer, then check it. The pack records correct self-checks on this page until you export a record. Local browser storage for downloaded files varies by browser, so export when you need a durable copy.</p><div id="questions"></div></section>
<section class="top"><h2>My field note</h2><p>Use explicit labels to structure your reasoning.</p><textarea id="note" placeholder="Observed fact: …\nEvidence source: …\nLimitation: …\nNext check: …"></textarea><div class="row"><button id="saveNote">Save note to current session</button><button id="exportNote">Export note (.txt)</button></div><p class="muted" id="notice" role="status">This page keeps changes in memory until you export them.</p></section>
<footer>Only fictional training examples are described. Practise only with supplied samples or systems you are explicitly authorised to assess.</footer>
<script>
const DATA=${data};const state={completedModules:[],completedQuestions:[],answers:{},note:''};
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lessons=document.getElementById('lessons');lessons.innerHTML=DATA.modules.map(m=>'<article class="module"><span class="pill">'+esc(m.number)+' · '+esc(m.level)+' · '+esc(m.time)+'</span><h2>'+esc(m.title)+'</h2><p>'+esc(m.summary)+'</p><ul>'+m.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul><p><b>Reflection:</b> '+esc(m.prompt)+'</p><label><input type="checkbox" data-module="'+esc(m.id)+'"> I reviewed this lesson</label></article>').join('');
lessons.querySelectorAll('[data-module]').forEach(c=>c.addEventListener('change',()=>{state.completedModules=lessons.querySelectorAll('[data-module]:checked').length?[...lessons.querySelectorAll('[data-module]:checked')].map(x=>x.dataset.module):[]}));
const questions=document.getElementById('questions');questions.innerHTML=DATA.quiz.map((q,i)=>'<article class="question" data-question="'+esc(q.id)+'"><h3>'+(i+1)+'. '+esc(q.question)+'</h3>'+q.options.map((op,j)=>'<label><input type="radio" name="'+esc(q.id)+'" value="'+j+'"> '+esc(op)+'</label>').join('')+'<div class="row"><button data-check="'+esc(q.id)+'">Check answer</button></div><p class="muted" data-feedback></p></article>').join('');
questions.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{const q=DATA.quiz.find(x=>x.id===b.dataset.check),card=b.closest('[data-question]'),choice=card.querySelector('input:checked'),out=card.querySelector('[data-feedback]');if(!choice){out.className='wrong';out.textContent='Choose an answer first.';return;}state.answers[q.id]=Number(choice.value);if(Number(choice.value)===q.answer){state.completedQuestions=[...new Set([...state.completedQuestions,q.id])];out.className='feedback';out.textContent='Correct. '+q.explanation;}else{state.completedQuestions=state.completedQuestions.filter(id=>id!==q.id);out.className='wrong';out.textContent='Not quite. '+q.explanation;}}));
document.getElementById('saveNote').addEventListener('click',()=>{state.note=document.getElementById('note').value;document.getElementById('notice').textContent='Note held in this page session. Export the JSON or TXT file to keep a copy.'});
const save=(name,content,type)=>{const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
document.getElementById('exportNote').addEventListener('click',()=>save('opencyberpath-offline-field-note.txt',document.getElementById('note').value,'text/plain;charset=utf-8'));
document.getElementById('export').addEventListener('click',()=>save('opencyberpath-offline-study-progress.json',JSON.stringify({product:'OpenCyberPath Offline Study Pack',version:1,completedModules:state.completedModules,completedQuestions:state.completedQuestions,answers:state.answers,note:document.getElementById('note').value,savedAt:new Date().toISOString()},null,2),'application/json;charset=utf-8'));
</script></body></html>`;
}

export default function OfflineLearning() {
  const [progress, setProgress] = useState(readProgress);
  const [connection, setConnection] = useState(() => typeof navigator === 'undefined' || navigator.onLine ? 'online' : 'offline');
  const [workerStatus, setWorkerStatus] = useState('Checking offline cache support…');
  const [cacheStatus, setCacheStatus] = useState('App files are cached as you visit pages.');
  const [storageStatus, setStorageStatus] = useState('Checking local storage…');
  const [importPreview, setImportPreview] = useState(null);
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const fileInputRef = useRef(null);
  const completeCount = progress.completedModules.length;
  const correctCount = progress.completedQuestions.length;
  const progressPercent = Math.round(((completeCount + correctCount) / (MODULES.length + QUIZ.length)) * 100);

  useEffect(() => {
    const online = () => setConnection(navigator.onLine ? 'online' : 'offline');
    const checkWorker = async () => {
      if (!('serviceWorker' in navigator)) { setWorkerStatus('Service workers are not supported in this browser. The downloadable pack still works.'); return; }
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        setWorkerStatus(registration?.active ? 'Offline service worker is active.' : 'Offline service worker is installing. Reload once if it is not controlling this page yet.');
      } catch { setWorkerStatus('Could not inspect offline cache status in this browser.'); }
    };
    online(); checkWorker();
    window.addEventListener('online', online); window.addEventListener('offline', online);
    navigator.serviceWorker?.addEventListener?.('controllerchange', checkWorker);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', online); navigator.serviceWorker?.removeEventListener?.('controllerchange', checkWorker); };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...progress, savedAt: new Date().toISOString() }));
      setStorageStatus('Offline-learning checkpoints are saved in this browser profile. No account or cloud sync.');
    } catch { setStorageStatus('Browser storage is unavailable. Export your JSON progress to keep a copy.'); }
  }, [progress]);

  const quizMap = useMemo(() => Object.fromEntries(QUIZ.map((item) => [item.id, item])), []);

  function selectAnswer(questionId, optionIndex) {
    setCheckedAnswers((current) => { const next = { ...current }; delete next[questionId]; return next; });
    setProgress((current) => ({ ...current, completedQuestions: current.completedQuestions.filter((id) => id !== questionId), answers: { ...current.answers, [questionId]: optionIndex } }));
  }

  function checkAnswer(questionId) {
    const question = quizMap[questionId];
    const selected = progress.answers[questionId];
    if (selected === undefined || selected === null) return;
    const correct = selected === question.answer;
    setCheckedAnswers((current) => ({ ...current, [questionId]: { selected, correct } }));
    setProgress((current) => ({ ...current, completedQuestions: correct ? [...new Set([...current.completedQuestions, questionId])] : current.completedQuestions.filter((id) => id !== questionId) }));
  }

  async function cacheCurrentAssets() {
    if (!('serviceWorker' in navigator)) { setCacheStatus('Service workers are unavailable; download the standalone study pack instead.'); return; }
    setCacheStatus('Collecting same-origin files already loaded by this browser…');
    try {
      const registration = await navigator.serviceWorker.ready;
      const urls = new Set([window.location.href, new URL('.', window.location.href).href]);
      document.querySelectorAll('script[src],link[href],img[src],a[href]').forEach((node) => {
        const raw = node.getAttribute('src') || node.getAttribute('href');
        if (!raw) return;
        try { const url = new URL(raw, window.location.href); if (url.origin === window.location.origin && /\.(?:js|css|mjs|svg|png|jpe?g|webp|ico|woff2?|ttf|pdf|docx?|csv|json|txt|zip|xlsx?)(?:\?|$)/i.test(url.pathname + url.search)) urls.add(url.href); } catch { /* ignore invalid URL */ }
      });
      performance.getEntriesByType('resource').forEach((entry) => {
        try { const url = new URL(entry.name); if (url.origin === window.location.origin && /\.(?:js|css|mjs|svg|png|jpe?g|webp|ico|woff2?|ttf|pdf|docx?|csv|json|txt|zip|xlsx?)(?:\?|$)/i.test(url.pathname + url.search)) urls.add(url.href); } catch { /* ignore invalid URL */ }
      });
      const worker = registration.active || navigator.serviceWorker.controller;
      if (!worker) { setCacheStatus('The offline service worker is not active yet. Reload the page, then try again.'); return; }
      const channel = new MessageChannel();
      const response = new Promise((resolve) => {
        const timer = window.setTimeout(() => resolve(null), 20000);
        channel.port1.onmessage = (event) => { window.clearTimeout(timer); resolve(event.data); };
      });
      worker.postMessage({ type: 'CACHE_URLS', urls: [...urls].slice(0, 100) }, [channel.port2]);
      const result = await response;
      if (result?.ok) setCacheStatus(`Cached ${result.cached} of ${result.requested} same-origin app files found in this session. New or never-visited pages may still need an online visit.`);
      else setCacheStatus('The cache request did not return a status. The core app shell is cached when available; download the standalone pack for dependable offline study.');
    } catch { setCacheStatus('Could not refresh the app cache. Download the standalone study pack; check this page again while online.'); }
  }

  function exportProgress() {
    downloadBlob('opencyberpath-offline-learning-progress.json', JSON.stringify({ product: 'OpenCyberPath Offline Learning', version: 1, completedModules: progress.completedModules, completedQuestions: progress.completedQuestions, answers: progress.answers, savedAt: new Date().toISOString() }, null, 2), 'application/json;charset=utf-8');
  }

  async function prepareImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error('File is larger than 1 MB.');
      const data = JSON.parse(await file.text());
      if (data?.version !== 1 || !Array.isArray(data.completedModules) || !Array.isArray(data.completedQuestions)) throw new Error('This is not a supported Offline Learning progress file.');
      const modules = data.completedModules.filter((id) => MODULES.some((item) => item.id === id));
      const rawAnswers = data.answers && typeof data.answers === 'object' ? Object.fromEntries(Object.entries(data.answers).filter(([id, value]) => QUIZ.some((item) => item.id === id) && Number.isInteger(value) && value >= 0 && value < 3)) : {};
      const questions = data.completedQuestions.filter((id) => QUIZ.some((item) => item.id === id && rawAnswers[id] === item.answer));
      const answers = rawAnswers;
      setImportPreview({ modules, questions, answers, newModules: modules.filter((id) => !progress.completedModules.includes(id)).length, existingModules: modules.filter((id) => progress.completedModules.includes(id)).length, newQuestions: questions.filter((id) => !progress.completedQuestions.includes(id)).length, filename: file.name });
    } catch (error) { setCacheStatus(`Import not prepared: ${error.message || 'invalid JSON file'}`); }
  }

  function confirmImport() {
    if (!importPreview) return;
    setProgress((current) => ({
      ...current,
      completedModules: [...new Set([...current.completedModules, ...importPreview.modules])],
      completedQuestions: [...new Set([...current.completedQuestions, ...importPreview.questions])],
      answers: { ...current.answers, ...importPreview.answers },
    }));
    setCacheStatus(`Merged ${importPreview.filename} additively. Existing completed marks were kept.`);
    setImportPreview(null);
  }

  return <section className="section-wrap opc-offline-page" aria-labelledby="opc-offline-title">
    <div className="opc-offline-hero">
      <div>
        <div className="section-kicker">OFFLINE-FIRST LEARNING · LOCAL BY DEFAULT</div>
        <h1 id="opc-offline-title">Keep learning.<br /><em>Even when the connection drops.</em></h1>
        <p>Save a standalone study pack, check what this browser has cached, and keep your learning checkpoints on this device. No account or paid service is required.</p>
        <div className="opc-offline-actions">
          <button className="button button-primary" type="button" onClick={() => downloadBlob('opencyberpath-offline-study-pack.html', buildStandalonePack(), 'text/html;charset=utf-8')}>Download standalone study pack <span>↓</span></button>
          <button className="button button-quiet" type="button" onClick={cacheCurrentAssets}>Save loaded app files offline</button>
        </div>
      </div>
      <aside className="opc-offline-status-card">
        <span className={`opc-offline-status-pill ${connection === 'online' ? 'is-online' : 'is-offline'}`}><i /> {connection === 'online' ? 'ONLINE NOW' : 'OFFLINE MODE'}</span>
        <h2>Offline readiness</h2>
        <p>{workerStatus}</p>
        <p>{storageStatus}</p>
        <small>Visited files can be cached. Some pages and assets may still need an online visit before they work offline.</small>
      </aside>
    </div>

    <section className="opc-offline-cache-panel" aria-live="polite">
      <div><span className="section-kicker">CACHE STATUS</span><h2>What is saved?</h2><p>{cacheStatus}</p></div>
      <div className="opc-offline-cache-actions"><button className="button" type="button" onClick={exportProgress}>Export progress JSON</button><button className="button" type="button" onClick={() => fileInputRef.current?.click()}>Import progress JSON</button><input ref={fileInputRef} className="opc-offline-file-input" type="file" accept="application/json,.json" onChange={prepareImport} aria-label="Choose offline learning progress JSON" /></div>
    </section>

    {importPreview && <section className="opc-offline-import-preview" aria-live="polite"><div><b>Review before merging</b><p>File: {importPreview.filename}</p><p>{importPreview.newModules} new module marks · {importPreview.existingModules} already completed · {importPreview.newQuestions} new correct answers.</p><small>Completed marks merge additively. Import will not uncheck completed items.</small></div><div className="opc-offline-cache-actions"><button className="button button-primary" type="button" onClick={confirmImport}>Confirm merge</button><button className="button" type="button" onClick={() => setImportPreview(null)}>Cancel</button></div></section>}

    <div className="opc-offline-progress-line"><div><span className="section-kicker">YOUR CHECKPOINTS</span><h2>Small steps, saved locally.</h2></div><div className="opc-offline-progress-numbers"><b>{completeCount}/{MODULES.length}</b> modules <span>·</span> <b>{correctCount}/{QUIZ.length}</b> knowledge checks <span>·</span> <b>{progressPercent}%</b></div></div>
    <div className="opc-offline-module-grid">{MODULES.map((item) => {
      const complete = progress.completedModules.includes(item.id);
      return <article className={`opc-offline-module ${complete ? 'is-complete' : ''}`} key={item.id}>
        <div className="opc-offline-module-top"><span>{item.number}</span><small>{item.level} · {item.time}</small></div>
        <h3>{item.title}</h3><p>{item.summary}</p>
        <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <div className="opc-offline-reflection"><b>Reflect</b><span>{item.prompt}</span></div>
        <label className="opc-offline-complete-label"><input type="checkbox" checked={complete} onChange={(event) => setProgress((current) => ({ ...current, completedModules: event.target.checked ? [...new Set([...current.completedModules, item.id])] : current.completedModules.filter((id) => id !== item.id) }))} /><span>{complete ? 'Reviewed' : 'Mark lesson reviewed'}</span></label>
      </article>;
    })}</div>

    <section className="opc-offline-quiz-section"><div className="opc-offline-section-heading"><div><div className="section-kicker">SELF-CHECK · NO GRADES</div><h2>Test the reasoning, not the guess.</h2></div><p>Answers are checked locally against fixed training explanations. A correct answer is a checkpoint, not a credential.</p></div>
      <div className="opc-offline-quiz-list">{QUIZ.map((question, index) => {
        const selected = progress.answers[question.id];
        const done = progress.completedQuestions.includes(question.id);
        return <article className={`opc-offline-question ${done ? 'is-correct' : ''}`} key={question.id}>
          <div className="opc-offline-question-label">QUESTION {String(index + 1).padStart(2, '0')} {done && <span>✓ CORRECT</span>}</div>
          <h3>{question.question}</h3>
          <div className="opc-offline-options">{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => selectAnswer(question.id, optionIndex)} /><span>{option}</span></label>)}</div>
          <div className="opc-offline-question-actions"><button className="button button-primary" type="button" disabled={selected === undefined || selected === null} onClick={() => checkAnswer(question.id)}>Check answer</button>{done && <p role="status">Correct. {question.explanation}</p>}{!done && checkedAnswers[question.id]?.selected === selected && <p role="status">Not quite. {question.explanation}</p>}{selected !== undefined && selected !== null && !done && checkedAnswers[question.id]?.selected !== selected && <p>Choose “Check answer” to review the explanation.</p>}</div>
        </article>;
      })}</div>
    </section>
    <div className="opc-offline-boundary"><b>Important boundary:</b> this feature stores progress only in this browser profile and provides export/import for deliberate backups. It does not sync to a server or between devices. The downloaded HTML pack works offline independently; use its export button to preserve pack progress.</div>
  </section>;
}
