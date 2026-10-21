import { useEffect, useMemo, useState } from 'react';
import './LearningStudio.css';

const PROFILE_KEY = 'opencyberpath-learning-studio-profile-v1';
const REFLECTION_KEY = 'opencyberpath-learning-studio-reflections-v1';
const QUIZ_KEY = 'opencyberpath-learning-studio-checks-v1';
const CHECKPOINTS = ['understood', 'practised', 'evidence'];
const DEFAULT_PROFILE = { pathId: 'soc-blue-team', level: 'beginner', hours: '3-5', savedAt: null };

const PATH_CHECKS = {
  'soc-blue-team': {
    question: 'A sample log shows several failed sign-ins. What is the most defensible conclusion?',
    choices: ['The account is definitely compromised.', 'The record shows failed sign-ins; correlate surrounding events and baseline before concluding.', 'The events can be ignored without checking context.'],
    answer: 1,
    explanation: 'Logs are evidence of recorded events, not a complete story. Compare timestamps, successful sign-ins, device context, and expected activity.'
  },
  'threat-hunting-detection-engineering': {
    question: 'A DNS pattern looks unusual compared with a small baseline. What should you do next?',
    choices: ['Label the host malicious immediately.', 'Delete the events that do not fit the theory.', 'Form a hypothesis and correlate DNS with timing, host context, and other telemetry.'],
    answer: 2,
    explanation: 'A hunting signal is a lead, not proof. Test competing explanations and record what remains unknown.'
  },
  'digital-forensics-incident-response': {
    question: 'Which detail makes an evidence timeline easier for another analyst to reproduce?',
    choices: ['A conclusion without its source.', 'The timestamp and time zone, source record, event identifier, and noted limitations.', 'Only a screenshot cropped to the interesting line.'],
    answer: 1,
    explanation: 'Preserve provenance and context. State facts separately from inferences and avoid exposing sensitive data in reports.'
  },
  'application-security-bug-bounty': {
    question: 'Before testing an application as part of a bug-bounty exercise, what comes first?',
    choices: ['Confirm written program scope, permitted methods, and exclusions.', 'Run every scanner to see what responds.', 'Assume a public website is automatically in scope.'],
    answer: 0,
    explanation: 'A public website is not permission. Follow the programme rules or use a designated training lab.'
  },
  'cloud-security': {
    question: 'A fictional storage configuration appears public. What is the best first response in a learning exercise?',
    choices: ['Download everything to see what is inside.', 'Verify the intended access policy and ownership using the authorised test data, then document evidence.', 'Change production permissions without confirming impact.'],
    answer: 1,
    explanation: 'Validate the configuration and scope first. Use authorised test data, least privilege, and a documented change process.'
  },
  'grc-security-fundamentals': {
    question: 'A company has a written security policy. What does that alone prove about a control?',
    choices: ['That the control is implemented and effective.', 'Nothing about operation or effectiveness without supporting evidence.', 'That the control never needs review.'],
    answer: 1,
    explanation: 'Policy documents describe intent. Assess ownership, operating evidence, exceptions, and whether the control achieves its purpose.'
  },
  'penetration-testing-red-team': {
    question: 'What must be established before a penetration test starts?',
    choices: ['Written authorisation, target scope, time window, and prohibited actions.', 'A list of the most aggressive tools.', 'Only a target hostname.'],
    answer: 0,
    explanation: 'Authorisation and boundaries come first. Test only systems you own or targets expressly assigned by a provider.'
  },
  'security-engineering-devsecops-iam': {
    question: 'A lockfile changes unexpectedly in a pull request. What is the safest next step?',
    choices: ['Merge it because automated dependency updates are always safe.', 'Delete the lockfile and install latest versions.', 'Review the change, dependency provenance, advisory status, and build workflow before approving.'],
    answer: 2,
    explanation: 'Supply-chain security depends on understanding and verifying changes, not blindly trusting a package or automation.'
  },
  'threat-intelligence-ethical-osint': {
    question: 'Two social posts repeat the same allegation. What should an analyst do before presenting it as fact?',
    choices: ['Treat repetition as independent confirmation.', 'Trace the original source, seek independent corroboration, timestamp the evidence, and limit personal data.', 'Publish private details to make the report more convincing.'],
    answer: 1,
    explanation: 'Repeated claims can share one origin. Verify provenance, distinguish confidence from fact, and minimise unnecessary personal information.'
  },
  'malware-analysis-reverse-engineering': {
    question: 'You receive an unknown suspicious file for a learning exercise. What is a safe starting point?',
    choices: ['Run it on your everyday computer.', 'Upload it publicly without checking for sensitive content.', 'Do not execute it; follow the authorised lab procedure and begin with approved metadata or hash checks in an isolated environment.'],
    answer: 2,
    explanation: 'Unknown samples can be harmful or sensitive. Use a controlled, isolated, authorised analysis workflow.'
  }
};

function readStored(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || 'null');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function checkpointFor(progress, pathId, moduleTitle) {
  const value = progress?.[`${pathId}::${moduleTitle}`];
  return value && typeof value === 'object' ? value : {};
}

function isModuleComplete(progress, pathId, moduleTitle) {
  const value = checkpointFor(progress, pathId, moduleTitle);
  return CHECKPOINTS.every((field) => value[field] === true);
}

function countCompleted(progress, path) {
  return (path?.modules || []).filter((module) => isModuleComplete(progress, path.id, module.title)).length;
}

function firstIncomplete(progress, path) {
  return (path?.modules || []).find((module) => !isModuleComplete(progress, path.id, module.title)) || path?.modules?.[0] || null;
}

function sessionsPerWeek(hours) {
  if (hours === '1-2') return 2;
  if (hours === '6-8') return 5;
  return 3;
}

function makeReflectionKey(pathId, moduleTitle) {
  return `${pathId}::${moduleTitle}`;
}

function safeText(value) {
  return typeof value === 'string' ? value : '';
}

export default function LearningStudio({ paths = [], moduleProgress = {}, onCheckpointChange, onOpenPath, onOpenLabs }) {
  const storedProfile = readStored(PROFILE_KEY, DEFAULT_PROFILE);
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE, ...storedProfile }));
  const [reflections, setReflections] = useState(() => readStored(REFLECTION_KEY, {}));
  const [checks, setChecks] = useState(() => readStored(QUIZ_KEY, {}));
  const [activeModuleTitle, setActiveModuleTitle] = useState('');
  const [quizChoice, setQuizChoice] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [saveNotice, setSaveNotice] = useState('');

  const selectedPath = paths.find((path) => path.id === profile.pathId) || paths[0] || null;
  const moduleList = selectedPath?.modules || [];
  const selectedModule = moduleList.find((module) => module.title === activeModuleTitle)
    || firstIncomplete(moduleProgress, selectedPath);
  const completedCount = selectedPath ? countCompleted(moduleProgress, selectedPath) : 0;
  const progressPercent = moduleList.length ? Math.round((completedCount / moduleList.length) * 100) : 0;
  const nextModuleIndex = Math.max(0, moduleList.findIndex((module) => module.title === (selectedModule?.title || '')));
  const weekModules = useMemo(() => {
    if (!moduleList.length) return [];
    const count = Math.min(sessionsPerWeek(profile.hours), moduleList.length);
    const chosen = [];
    for (let offset = 0; offset < moduleList.length && chosen.length < count; offset += 1) {
      const index = (nextModuleIndex + offset) % moduleList.length;
      const module = moduleList[index];
      if (!isModuleComplete(moduleProgress, selectedPath.id, module.title)) chosen.push({ module, index });
    }
    return chosen;
  }, [moduleList, moduleProgress, nextModuleIndex, profile.hours, selectedPath]);
  const focusReflectionKey = selectedPath && selectedModule ? makeReflectionKey(selectedPath.id, selectedModule.title) : '';
  const focusReflection = focusReflectionKey ? (reflections[focusReflectionKey] || {}) : {};
  const pathCheck = selectedPath ? (PATH_CHECKS[selectedPath.id] || PATH_CHECKS['soc-blue-team']) : null;
  const savedCheck = selectedPath ? checks[selectedPath.id] : null;

  useEffect(() => {
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* Continues in memory if storage is unavailable. */ }
  }, [profile]);
  useEffect(() => {
    try { window.localStorage.setItem(REFLECTION_KEY, JSON.stringify(reflections)); } catch { /* Notes remain available in this session. */ }
  }, [reflections]);
  useEffect(() => {
    try { window.localStorage.setItem(QUIZ_KEY, JSON.stringify(checks)); } catch { /* Checks remain available in this session. */ }
  }, [checks]);
  useEffect(() => {
    setActiveModuleTitle('');
    setQuizChoice('');
    setQuizResult(null);
    setSaveNotice('');
  }, [profile.pathId]);

  const setProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value, savedAt: null }));
    setSaveNotice('');
  };

  const savePlan = () => {
    const savedAt = new Date().toISOString();
    setProfile((current) => ({ ...current, savedAt }));
    setSaveNotice('Your learning plan is saved on this device. It is not synced to an online account.');
  };

  const updateReflection = (field, value) => {
    if (!focusReflectionKey) return;
    setReflections((current) => ({
      ...current,
      [focusReflectionKey]: { ...(current[focusReflectionKey] || {}), [field]: value, updatedAt: new Date().toISOString() },
    }));
  };

  const checkAnswer = () => {
    if (!selectedPath || quizChoice === '') return;
    const correct = Number(quizChoice) === pathCheck.answer;
    const result = { correct, answer: Number(quizChoice), attemptedAt: new Date().toISOString() };
    setQuizResult(result);
    setChecks((current) => ({ ...current, [selectedPath.id]: result }));
  };

  const markCheckpoint = (field, checked) => {
    if (!selectedPath || !selectedModule || typeof onCheckpointChange !== 'function') return;
    onCheckpointChange(selectedPath.id, selectedModule.title, field, checked);
  };

  const completedModuleCount = paths.reduce((total, path) => total + countCompleted(moduleProgress, path), 0);
  const allModuleCount = paths.reduce((total, path) => total + (path.modules || []).length, 0);

  return <section className="learning-studio section-wrap" aria-labelledby="learning-studio-title">
    <header className="learning-studio-hero">
      <div className="learning-studio-intro">
        <span className="learning-studio-kicker"><span className="learning-studio-live-dot" /> YOUR PERSONAL CYBERSECURITY CLASSROOM</span>
        <h1 id="learning-studio-title">A clear next step.<br /><em>A skill you can prove.</em></h1>
        <p>Choose a direction, learn one concept at a time, practise in an authorised environment, and keep evidence of what you understand. Your plan and reflections stay on this device.</p>
        <div className="learning-studio-hero-actions">
          {selectedPath && <button className="learning-studio-primary" type="button" onClick={() => selectedModule && setActiveModuleTitle(selectedModule.title)}><span aria-hidden="true">▶</span> Continue learning</button>}
          {selectedPath && typeof onOpenPath === 'function' && <button className="learning-studio-secondary" type="button" onClick={() => onOpenPath(selectedPath.id)}>Open full roadmap <span aria-hidden="true">↗</span></button>}
        </div>
      </div>
      <aside className="learning-studio-score-card" aria-label="Learning progress overview">
        <span className="learning-studio-score-label">CURRENT PATH PROGRESS</span>
        <strong>{progressPercent}%</strong>
        <div className="learning-studio-progress-track" role="progressbar" aria-label="Completed modules in selected path" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
        <p>{completedCount} of {moduleList.length} modules have all three self-checkpoints completed.</p>
        <div className="learning-studio-mini-stats"><span><b>{completedModuleCount}</b><small>modules complete across paths</small></span><span><b>{allModuleCount}</b><small>modules available</small></span></div>
      </aside>
    </header>

    <section className="learning-studio-setup" aria-labelledby="learning-studio-setup-title">
      <div className="learning-studio-section-title"><div><span className="learning-studio-kicker">01 / SET YOUR DIRECTION</span><h2 id="learning-studio-setup-title">Build a plan that fits <em>you.</em></h2></div><span className="learning-studio-local-badge">LOCAL-FIRST · NO ACCOUNT REQUIRED</span></div>
      <div className="learning-studio-fields">
        <label><span>YOUR MAIN GOAL</span><select value={selectedPath?.id || ''} onChange={(event) => setProfileField('pathId', event.target.value)} aria-label="Choose your cybersecurity learning goal">{paths.map((path) => <option key={path.id} value={path.id}>{path.shortTitle || path.title}</option>)}</select></label>
        <label><span>YOUR STARTING POINT</span><select value={profile.level} onChange={(event) => setProfileField('level', event.target.value)} aria-label="Choose your current experience level"><option value="beginner">New to cybersecurity</option><option value="foundations">Know some foundations</option><option value="practitioner">Have used security tools</option></select></label>
        <label><span>TIME AVAILABLE EACH WEEK</span><select value={profile.hours} onChange={(event) => setProfileField('hours', event.target.value)} aria-label="Choose weekly study time"><option value="1-2">1–2 focused hours</option><option value="3-5">3–5 focused hours</option><option value="6-8">6–8 focused hours</option></select></label>
      </div>
      <div className="learning-studio-plan-summary"><div><span className="learning-studio-plan-icon" aria-hidden="true">✦</span><div><b>{selectedPath?.shortTitle || selectedPath?.title || 'Choose a learning path'}</b><p>{profile.level === 'beginner' ? 'Start with the fundamentals and work through guided practice.' : profile.level === 'foundations' ? 'Connect your existing knowledge to the path’s practical exercises.' : 'Focus on evidence, reproducible work, and the path’s capstone outcome.'} Suggested pace: {sessionsPerWeek(profile.hours)} focused sessions per week.</p></div></div><button className="learning-studio-save" type="button" onClick={savePlan}>Save my plan <span aria-hidden="true">✓</span></button></div>
      {saveNotice && <p className="learning-studio-save-note" role="status">{saveNotice}</p>}
      {selectedPath?.prerequisites && <div className="learning-studio-prereq"><b>Before you start</b><p>{selectedPath.prerequisites}</p></div>}
    </section>

    <section className="learning-studio-week" aria-labelledby="learning-studio-week-title">
      <div className="learning-studio-section-title"><div><span className="learning-studio-kicker">02 / YOUR NEXT SESSIONS</span><h2 id="learning-studio-week-title">A simple plan for <em>this week.</em></h2></div><span className="learning-studio-week-count">{weekModules.length} suggested sessions</span></div>
      {weekModules.length ? <div className="learning-studio-week-grid">{weekModules.map(({ module, index }, sessionIndex) => <button className={`learning-studio-session ${selectedModule?.title === module.title ? 'is-active' : ''}`} key={`${selectedPath.id}-${module.title}`} type="button" onClick={() => { setActiveModuleTitle(module.title); setQuizChoice(''); setQuizResult(null); }}><span className="learning-studio-session-top"><small>SESSION {String(sessionIndex + 1).padStart(2, '0')}</small><b>{String(index + 1).padStart(2, '0')}</b></span><strong>{module.title}</strong><span className="learning-studio-session-objective">{module.objective}</span><span className="learning-studio-session-bottom">{isModuleComplete(moduleProgress, selectedPath.id, module.title) ? 'SELF-CHECK COMPLETE' : 'OPEN THIS LESSON'} <span aria-hidden="true">→</span></span></button>)}</div> : <div className="learning-studio-finished"><span aria-hidden="true">✦</span><div><b>You have completed the current path’s module checkpoints.</b><p>Review your capstone, revisit a module, or choose a related path when you are ready.</p></div>{typeof onOpenPath === 'function' && <button className="learning-studio-secondary" type="button" onClick={() => onOpenPath(selectedPath.id)}>Review capstone ↗</button>}</div>}
    </section>

    {selectedModule && <section className="learning-studio-lesson" aria-labelledby="learning-studio-lesson-title">
      <div className="learning-studio-section-title"><div><span className="learning-studio-kicker">03 / LEARN · PRACTISE · SHOW YOUR WORK</span><h2 id="learning-studio-lesson-title">Your focused <em>lesson.</em></h2></div><span className="learning-studio-lesson-index">MODULE {String(nextModuleIndex + 1).padStart(2, '0')} / {String(moduleList.length).padStart(2, '0')}</span></div>
      <article className="learning-studio-focus-card">
        <div className="learning-studio-focus-head"><div><span className="learning-studio-focus-kicker">CURRENT MODULE</span><h3>{selectedModule.title}</h3><p>{selectedModule.objective}</p></div><span className={`learning-studio-completion ${isModuleComplete(moduleProgress, selectedPath.id, selectedModule.title) ? 'is-done' : ''}`}>{isModuleComplete(moduleProgress, selectedPath.id, selectedModule.title) ? 'COMPLETE' : 'IN PROGRESS'}</span></div>
        <div className="learning-studio-lesson-columns">
          <section><span className="learning-studio-content-label"><i>01</i> LEARN THE CONCEPT</span><ul>{(selectedModule.learn || []).map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><span className="learning-studio-content-label"><i>02</i> PRACTISE SAFELY</span><p>{selectedModule.practice}</p><p className="learning-studio-safety">Use supplied samples, a local lab, or a target explicitly authorised by the training provider.</p>{typeof onOpenLabs === 'function' && <button type="button" className="learning-studio-text-button" onClick={onOpenLabs}>Browse labs & notes ↗</button>}</section>
          <section><span className="learning-studio-content-label"><i>03</i> SAVE EVIDENCE</span><p>{selectedModule.evidence}</p><p className="learning-studio-safety">Record the source and context, separate observations from inference, and note what the evidence cannot prove.</p></section>
        </div>
        <div className="learning-studio-checkpoints" aria-label={`Learning checkpoints for ${selectedModule.title}`}>
          <div className="learning-studio-checkpoints-head"><div><b>Mark your checkpoints</b><p>Be honest with yourself: this is a personal learning record, not an externally verified grade.</p></div><strong>{CHECKPOINTS.filter((field) => checkpointFor(moduleProgress, selectedPath.id, selectedModule.title)[field] === true).length}/3</strong></div>
          <div className="learning-studio-checkpoint-list">
            <label><input type="checkbox" checked={checkpointFor(moduleProgress, selectedPath.id, selectedModule.title).understood === true} onChange={(event) => markCheckpoint('understood', event.target.checked)} /><span><b>I can explain it</b><small>In my own words, without copying the lesson.</small></span></label>
            <label><input type="checkbox" checked={checkpointFor(moduleProgress, selectedPath.id, selectedModule.title).practised === true} onChange={(event) => markCheckpoint('practised', event.target.checked)} /><span><b>I practised it</b><small>I completed the exercise in an appropriate lab or with the supplied sample.</small></span></label>
            <label><input type="checkbox" checked={checkpointFor(moduleProgress, selectedPath.id, selectedModule.title).evidence === true} onChange={(event) => markCheckpoint('evidence', event.target.checked)} /><span><b>I recorded evidence</b><small>I saved a useful result and noted a limitation or next check.</small></span></label>
          </div>
        </div>
        <div className="learning-studio-reflection">
          <div className="learning-studio-reflection-intro"><span className="learning-studio-content-label"><i>04</i> YOUR LEARNING JOURNAL</span><p>These notes autosave in this browser or app on this device. Do not enter passwords, personal data, real tokens, or sensitive incident details.</p></div>
          <label><span>What did you observe or learn?</span><textarea rows="2" value={safeText(focusReflection.observed)} onChange={(event) => updateReflection('observed', event.target.value)} placeholder="Write the concept or evidence you can now explain…" /></label>
          <div className="learning-studio-reflection-pair"><label><span>What is still uncertain?</span><textarea rows="2" value={safeText(focusReflection.uncertain)} onChange={(event) => updateReflection('uncertain', event.target.value)} placeholder="Name one assumption or missing fact…" /></label><label><span>What will you check next?</span><textarea rows="2" value={safeText(focusReflection.next)} onChange={(event) => updateReflection('next', event.target.value)} placeholder="Choose one safe, specific next action…" /></label></div>
          <span className="learning-studio-autosave">{focusReflection.updatedAt ? `Saved locally · ${new Date(focusReflection.updatedAt).toLocaleString()}` : 'Your notes will be saved as you type.'}</span>
        </div>
        <div className="learning-studio-focus-actions">{typeof onOpenPath === 'function' && <button type="button" className="learning-studio-primary" onClick={() => onOpenPath(selectedPath.id)}>Open full roadmap details <span aria-hidden="true">↗</span></button>}<button type="button" className="learning-studio-secondary" onClick={() => { const next = moduleList.find((module) => module.title !== selectedModule.title && !isModuleComplete(moduleProgress, selectedPath.id, module.title)); if (next) { setActiveModuleTitle(next.title); setQuizChoice(''); setQuizResult(null); } else setActiveModuleTitle(''); }}>Next unfinished module <span aria-hidden="true">→</span></button></div>
      </article>
    </section>}

    {pathCheck && <section className="learning-studio-quiz" aria-labelledby="learning-studio-quiz-title">
      <div className="learning-studio-quiz-copy"><span className="learning-studio-kicker">04 / QUICK KNOWLEDGE CHECK</span><h2 id="learning-studio-quiz-title">Make a careful <em>decision.</em></h2><p>A short, formative question for your selected path. It is not a certification exam or a complete assessment of your skill.</p><div className="learning-studio-quiz-topic"><span aria-hidden="true">◇</span><span>PATH CHECK</span><b>{selectedPath?.shortTitle || selectedPath?.title}</b></div></div>
      <div className="learning-studio-quiz-card"><h3>{pathCheck.question}</h3><fieldset><legend>Choose the best answer</legend>{pathCheck.choices.map((choice, index) => <label className={`learning-studio-choice ${quizChoice === String(index) ? 'is-selected' : ''}`} key={choice}><input type="radio" name="learning-studio-path-check" value={index} checked={quizChoice === String(index)} onChange={(event) => { setQuizChoice(event.target.value); setQuizResult(null); }} /><span>{choice}</span></label>)}</fieldset><button type="button" className="learning-studio-primary" onClick={checkAnswer} disabled={quizChoice === ''}>Check answer</button>{quizResult && <div className={`learning-studio-quiz-feedback ${quizResult.correct ? 'is-correct' : 'is-review'}`} role="status"><b>{quizResult.correct ? 'Good reasoning.' : 'Review the reasoning.'}</b><p>{pathCheck.explanation}</p></div>}{!quizResult && savedCheck && <p className="learning-studio-previous-check">Last attempt on this device: {savedCheck.correct ? 'answered correctly' : 'review recommended'}.</p>}</div>
    </section>}

    <footer className="learning-studio-footnote"><span aria-hidden="true">ⓘ</span><p><b>What this studio does—and does not do.</b> It organises existing OpenCyberPath roadmaps and practice into a guided local learning flow. Preferences, reflections, and module checkpoints stay in this browser/app storage; they do not synchronise to a cloud account. The path check is formative, and this version does not include an online tutor or automatic grading for written answers.</p></footer>
  </section>;
}
