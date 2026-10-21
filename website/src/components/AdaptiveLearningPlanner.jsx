import { useEffect, useMemo, useState } from 'react';
import './AdaptiveLearningPlanner.css';

const PREFERENCE_KEY = 'open-cyber-path-adaptive-plan-v1';
const CHECKPOINTS = ['understood', 'practised', 'evidence'];
const CHECKPOINT_LABELS = {
  understood: 'Understand the concept',
  practised: 'Practise safely',
  evidence: 'Record evidence',
};
const EXPERIENCE_OPTIONS = [
  { value: 'new', label: 'I am new to cybersecurity' },
  { value: 'foundations', label: 'I know some fundamentals' },
  { value: 'hands-on', label: 'I have lab or work experience' },
];
const STUDY_OPTIONS = [
  { value: '3', label: '3 hours / week' },
  { value: '5', label: '5 hours / week' },
  { value: '10', label: '10 hours / week' },
];

function readPreferences() {
  const defaults = { pathId: 'soc-blue-team', experience: 'new', hours: '5' };
  if (typeof window === 'undefined') return defaults;
  try {
    const value = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) || 'null');
    if (!value || typeof value !== 'object') return defaults;
    return {
      pathId: typeof value.pathId === 'string' ? value.pathId : defaults.pathId,
      experience: EXPERIENCE_OPTIONS.some((item) => item.value === value.experience) ? value.experience : defaults.experience,
      hours: STUDY_OPTIONS.some((item) => item.value === String(value.hours)) ? String(value.hours) : defaults.hours,
    };
  } catch {
    return defaults;
  }
}

function moduleKey(pathId, title) {
  return `${pathId}::${title}`;
}

function getProgress(moduleProgress, pathId, title) {
  const value = moduleProgress?.[moduleKey(pathId, title)] || {};
  return Object.fromEntries(CHECKPOINTS.map((field) => [field, value[field] === true]));
}

function countCompleted(path, moduleProgress) {
  return path.modules.reduce((count, module) => {
    const status = getProgress(moduleProgress, path.id, module.title);
    return count + CHECKPOINTS.filter((field) => status[field]).length;
  }, 0);
}

function chooseCheckpoint(status, experience) {
  const preference = experience === 'hands-on'
    ? ['practised', 'evidence', 'understood']
    : experience === 'foundations'
      ? ['practised', 'understood', 'evidence']
      : ['understood', 'practised', 'evidence'];
  return preference.find((field) => !status[field]) || null;
}

function getNudge(field, module) {
  if (field === 'practised') {
    return [
      `Re-read the objective for “${module.title}” and identify one observable task.`,
      'Use the supplied sample, local exercise, or explicitly authorised training environment only.',
      'Record what you observed and compare it with the expected result; note anything that remains uncertain.',
    ];
  }
  if (field === 'evidence') {
    return [
      'Write the task and the question you were trying to answer.',
      'Record the method and a sanitised observation that another learner could follow.',
      'State limitations, alternative explanations, and one sensible next check.',
    ];
  }
  return [
    `Explain the objective of “${module.title}” in your own words.`,
    'Pick one unfamiliar term from the learning list and look it up in the linked official documentation.',
    'Before moving on, write one question you can now answer and one that still needs evidence.',
  ];
}

export default function AdaptiveLearningPlanner({ paths = [], moduleProgress = {}, onOpenPath }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [showNudge, setShowNudge] = useState(false);
  const path = paths.find((item) => item.id === preferences.pathId) || paths[0] || null;

  useEffect(() => {
    if (!path) return;
    const next = { ...preferences, pathId: path.id };
    try {
      window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ ...next, savedAt: new Date().toISOString() }));
    } catch {
      // The planner remains usable in memory when local storage is unavailable.
    }
    if (next.pathId !== preferences.pathId) setPreferences(next);
  }, [preferences, path]);

  const plan = useMemo(() => {
    if (!path) return null;
    const moduleStates = path.modules.map((module) => ({
      module,
      status: getProgress(moduleProgress, path.id, module.title),
    }));
    const completeModules = moduleStates.filter(({ status }) => CHECKPOINTS.every((field) => status[field]));
    const incomplete = moduleStates.filter(({ status }) => !CHECKPOINTS.every((field) => status[field]));
    let next = incomplete[0] || null;

    // For experienced learners, prioritise unfinished practice/evidence in the current sequence;
    // never skip an unfinished earlier module entirely.
    if (next) {
      const chosenField = chooseCheckpoint(next.status, preferences.experience);
      next = { ...next, focus: chosenField || 'understood' };
    }

    const totalCheckpoints = path.modules.length * CHECKPOINTS.length;
    const completedCheckpoints = countCompleted(path, moduleProgress);
    const hours = Number(preferences.hours) || 5;
    const minutes = hours * 60;
    const weekly = [
      { title: 'Learn & understand', minutes: Math.round(minutes * 0.3), detail: 'Read the concepts and explain them in your own words.' },
      { title: 'Practise safely', minutes: Math.round(minutes * 0.45), detail: 'Work with supplied sample data or an authorised lab.' },
      { title: 'Evidence & reflect', minutes: minutes - Math.round(minutes * 0.3) - Math.round(minutes * 0.45), detail: 'Save sanitised observations, limitations, and next steps.' },
    ];
    return {
      moduleStates,
      completeModules,
      incomplete,
      next,
      totalCheckpoints,
      completedCheckpoints,
      percentage: totalCheckpoints ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0,
      weekly,
    };
  }, [path, moduleProgress, preferences.experience, preferences.hours]);

  if (!path || !plan) return null;

  const changePreference = (field, value) => {
    setShowNudge(false);
    setPreferences((current) => ({ ...current, [field]: value }));
  };
  const experienceLabel = EXPERIENCE_OPTIONS.find((item) => item.value === preferences.experience)?.label || EXPERIENCE_OPTIONS[0].label;
  const nextModule = plan.next?.module;
  const nextStatus = plan.next?.status;
  const nextFocus = plan.next?.focus || 'understood';
  const nudgeSteps = nextModule ? getNudge(nextFocus, nextModule) : [];

  return (
    <section className="adaptive-planner" aria-labelledby="adaptive-planner-title">
      <div className="adaptive-planner-head">
        <div>
          <span className="adaptive-planner-kicker">CYBERPATH ADAPTIVE LEARNING · V1</span>
          <h2 id="adaptive-planner-title">Your next step, <em>matched to your goals.</em></h2>
          <p>Choose a career direction, starting point, and weekly study time. This local planner uses your existing roadmap and saved checkpoints to suggest a practical next step.</p>
        </div>
        <div className="adaptive-planner-score" aria-label={`${plan.percentage}% of this pathway's checkpoints completed`}>
          <strong>{plan.percentage}%</strong>
          <span>path checkpoints</span>
          <div className="adaptive-planner-track"><span style={{ width: `${plan.percentage}%` }} /></div>
        </div>
      </div>

      <div className="adaptive-planner-controls">
        <label>
          <span>Target career path</span>
          <select value={path.id} onChange={(event) => changePreference('pathId', event.target.value)}>
            {paths.map((item) => <option key={item.id} value={item.id}>{item.shortTitle || item.title}</option>)}
          </select>
        </label>
        <label>
          <span>Current experience</span>
          <select value={preferences.experience} onChange={(event) => changePreference('experience', event.target.value)}>
            {EXPERIENCE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Study time available</span>
          <select value={preferences.hours} onChange={(event) => changePreference('hours', event.target.value)}>
            {STUDY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="adaptive-planner-results" aria-live="polite">
        <div className="adaptive-planner-progressline">
          <span>{plan.completedCheckpoints} / {plan.totalCheckpoints} checkpoints marked in this path</span>
          <span>{plan.completeModules.length} / {path.modules.length} modules self-checked</span>
        </div>

        {nextModule ? (
          <div className="adaptive-planner-next">
            <div className="adaptive-planner-next-top">
              <span className="adaptive-planner-pill">RECOMMENDED NEXT MODULE</span>
              <span className="adaptive-planner-focus">Focus: {CHECKPOINT_LABELS[nextFocus]}</span>
            </div>
            <h3>{nextModule.title}</h3>
            <p className="adaptive-planner-objective">{nextModule.objective}</p>
            <p className="adaptive-planner-why"><strong>Why this next?</strong> {preferences.experience === 'new'
              ? 'Start with the earliest unfinished module and build understanding before moving to later topics.'
              : preferences.experience === 'foundations'
                ? `You selected “${experienceLabel}”; the plan prioritises unfinished practical work while respecting the pathway sequence.`
                : `You selected “${experienceLabel}”; the plan highlights a practice or evidence checkpoint in the earliest unfinished module.`}</p>
            <div className="adaptive-planner-work-grid">
              <article><span>01 · LEARN</span><ul>{nextModule.learn.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article><span>02 · PRACTISE</span><p>{nextModule.practice}</p></article>
              <article><span>03 · SAVE EVIDENCE</span><p>{nextModule.evidence}</p></article>
            </div>
            <div className="adaptive-planner-actions">
              <button type="button" className="adaptive-planner-primary" onClick={() => onOpenPath?.(path.id)}>Open full career path <span aria-hidden="true">↗</span></button>
              <button type="button" className="adaptive-planner-secondary" onClick={() => setShowNudge((value) => !value)} aria-expanded={showNudge}>{showNudge ? 'Hide learning nudge' : 'I’m stuck — give me a nudge'}</button>
            </div>
            {showNudge && <div className="adaptive-planner-nudge"><strong>Try these three steps</strong><ol>{nudgeSteps.map((step) => <li key={step}>{step}</li>)}</ol><small>Hints guide your process; they do not claim to assess your skill automatically.</small></div>}
          </div>
        ) : (
          <div className="adaptive-planner-finished"><span className="adaptive-planner-pill">ALL MODULE CHECKPOINTS MARKED</span><h3>You have self-checked every module in this path.</h3><p>Review your evidence, revisit any weak areas, or choose another career path. These checkpoints are self-reported and are not an external skills assessment.</p><button type="button" className="adaptive-planner-primary" onClick={() => onOpenPath?.(path.id)}>Review this career path ↗</button></div>
        )}
      </div>

      <div className="adaptive-planner-weekly">
        <div className="adaptive-planner-weekly-head"><div><span className="adaptive-planner-kicker">YOUR WEEKLY STUDY BUDGET</span><h3>{preferences.hours} hours, divided into useful blocks</h3></div><p>Adjust the plan to your schedule. This is a pacing suggestion, not a guarantee of job readiness.</p></div>
        <div className="adaptive-planner-week-grid">{plan.weekly.map((block) => <article key={block.title}><span>{block.title}</span><strong>{block.minutes} min</strong><p>{block.detail}</p></article>)}</div>
      </div>

      <p className="adaptive-planner-privacy">Rule-based and free: no AI API, account, or server required. Preferences are saved in this browser only. Use the existing JSON progress backup when moving to another device.</p>
    </section>
  );
}
