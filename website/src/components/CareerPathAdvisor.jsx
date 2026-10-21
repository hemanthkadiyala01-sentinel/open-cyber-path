import { useEffect, useId, useMemo, useRef, useState } from 'react';
import BrandIcon from './BrandIcon.jsx';
import { certifications, freeLearningOptions } from '../data/certifications.js';
import careerPathProfiles from '../data/career-path-profiles.json';
import './CareerPathAdvisor.css';

function OfficialLink({ href, children }) {
  return <a className="cert-link" href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
}

function AdvisorPicker({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const pickerId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[selectedIndex]?.focus();
  }, [open, selectedIndex]);

  const moveFocus = (index, direction) => {
    const nextIndex = (index + direction + options.length) % options.length;
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="advisor-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="advisor-picker-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={pickerId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) setOpen(true);
            else moveFocus(selectedIndex, event.key === 'ArrowDown' ? 1 : -1);
          }
        }}
      >
        <span>{selectedOption?.label ?? String(value)}</span>
        <span className={`advisor-picker-chevron${open ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="advisor-picker-options" id={pickerId} role="listbox" aria-label={`${label} options`}>
          {options.map((option, index) => (
            <button
              ref={(element) => { optionRefs.current[index] = element; }}
              key={option.value}
              type="button"
              className={`advisor-picker-option${option.value === value ? ' is-selected' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(index, 1); }
                if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(index, -1); }
                if (event.key === 'Home') { event.preventDefault(); optionRefs.current[0]?.focus(); }
                if (event.key === 'End') { event.preventDefault(); optionRefs.current[options.length - 1]?.focus(); }
              }}
            >
              <span>{option.label}</span>
              <span className="advisor-picker-check" aria-hidden="true">{option.value === value ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


const experienceOptions = [
  { value: 'new', label: 'New to cybersecurity' },
  { value: 'it', label: 'Know IT / networking basics' },
  { value: 'hands-on', label: 'Already have lab or work experience' },
];
const budgetOptions = [
  { value: 'free', label: 'Free learning first' },
  { value: 'entry', label: 'Could consider one entry-level exam' },
  { value: 'flexible', label: 'Flexible budget; compare local fees' },
];

export default function CareerPathAdvisor({ onSelectCertification }) {
  const [trackId, setTrackId] = useState('SOC & Blue Team');
  const [experience, setExperience] = useState('new');
  const [budget, setBudget] = useState('free');
  const [hours, setHours] = useState('5');

  const profile = careerPathProfiles.find((item) => item.track === trackId) || careerPathProfiles[0];
  const recommended = useMemo(() => {
    const all = profile.credentialIds.map((id) => certifications.find((item) => item.id === id)).filter(Boolean);
    const startIndex = experience === 'new' ? 0 : experience === 'it' ? (profile.itStartAt ?? 1) : (profile.handsOnStartAt ?? 2);
    return all.slice(startIndex, startIndex + 3);
  }, [profile, experience]);

  const learning = profile.learningIds
    .map((id) => freeLearningOptions.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 3);
  const planningWeeks = Math.max(1, Math.ceil(40 / Number(hours)));
  const experienceLabel = experienceOptions.find((item) => item.value === experience)?.label || experience;
  const budgetLabel = budgetOptions.find((item) => item.value === budget)?.label || budget;

  return (
    <section className="career-advisor" aria-labelledby="career-advisor-title">
      <div className="career-advisor-head">
        <div>
          <span className="cert-eyebrow"><span className="cert-live-dot" /> PERSONALIZED · ROLE-ALIGNED</span>
          <h2 id="career-advisor-title">Find your certification path</h2>
          <p>Choose a target role and your current starting point. The sequence adapts to your experience and budget instead of treating every credential as equally useful.</p>
        </div>
        <div className="career-advisor-badge"><span>PATH ENGINE</span><strong>Skills → Evidence → Credential</strong></div>
      </div>

      <div className="career-advisor-controls">
        <div className="career-advisor-control"><span className="career-advisor-control-label">Target role</span>
          <AdvisorPicker label="Target role" value={trackId} options={careerPathProfiles.map((item) => ({ value: item.track, label: item.title }))} onChange={setTrackId} />
        </div>
        <div className="career-advisor-control"><span className="career-advisor-control-label">Your starting point</span>
          <AdvisorPicker label="Your starting point" value={experience} options={experienceOptions} onChange={setExperience} />
        </div>
        <div className="career-advisor-control"><span className="career-advisor-control-label">Exam budget</span>
          <AdvisorPicker label="Exam budget" value={budget} options={budgetOptions} onChange={setBudget} />
        </div>
        <div className="career-advisor-control"><span className="career-advisor-control-label">Study time each week</span>
          <AdvisorPicker label="Study time each week" value={hours} options={[
            { value: '5', label: 'About 5 hours' },
            { value: '10', label: 'About 10 hours' },
            { value: '15', label: '15+ hours' },
          ]} onChange={setHours} />
        </div>
      </div>

      <div className="career-advisor-summary">
        <div><span className="career-summary-label">TARGET</span><strong>{profile.title}</strong></div>
        <div><span className="career-summary-label">STARTING POINT</span><strong>{experienceLabel}</strong></div>
        <div><span className="career-summary-label">BUDGET APPROACH</span><strong>{budgetLabel}</strong></div>
        <div><span className="career-summary-label">FIRST STUDY BLOCK</span><strong>{planningWeeks} weeks at {hours} h/week</strong></div>
      </div>

      <div className="career-advisor-body">
        <div className="career-advisor-sequence">
          <div className="career-subhead"><span className="cert-eyebrow">RECOMMENDED ORDER</span><span>Sequence is guidance, not a pass guarantee</span></div>
          <div className="career-stage-list">
            {recommended.map((item, index) => {
              const paid = item.costClass === 'paid-exam';
              const holdForBudget = paid && budget === 'free';
              const stageLabels = ['Next milestone', 'Role-focused credential', 'Later specialisation'];
              return (
                <article className={`career-stage-card${index === 0 ? ' career-stage-primary' : ''}`} key={item.id}>
                  <div className="career-stage-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="career-stage-content">
                    <div className="career-stage-meta"><span>{stageLabels[index]}</span><span className={holdForBudget ? 'career-budget-hold' : paid ? 'career-paid' : 'career-free'}>{holdForBudget ? 'Study now · defer exam spend' : paid ? 'Paid exam · verify local price' : 'Course / learning credential'}</span></div>
                    <div className="career-stage-title"><BrandIcon name={item.issuer} url={item.officialUrl} size={30} /><h3>{item.name}</h3></div>
                    <p>{item.overview}</p>
                    <p className="career-stage-cost">{item.costLabel}</p>
                    <div className="career-stage-actions">
                      <button type="button" className="cert-primary-button" onClick={() => onSelectCertification(item.id)}>View syllabus &amp; roadmap</button>
                      <OfficialLink href={item.officialUrl}>Issuer details</OfficialLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="career-advisor-caveat">Planning estimate only: the first study block uses an illustrative 40-hour starter budget, not an exam-provider requirement. Your pace depends on prior experience, practice results and the current official syllabus. Never book before checking eligibility, regional pricing and the active exam version.</p>
        </div>

        <aside className="career-advisor-evidence">
          <div className="career-evidence-block">
            <span className="cert-eyebrow">BUILD THE SKILL FIRST</span>
            <h3>Free learning to start with</h3>
            {learning.map((item) => <div className="career-learning-item" key={item.id}>
              <strong>{item.name}</strong><p>{item.details}</p><OfficialLink href={item.url}>Open official learning</OfficialLink>
            </div>)}
          </div>
          <div className="career-evidence-block">
            <span className="cert-eyebrow">WHAT TO SHOW EMPLOYERS</span>
            <h3>Portfolio evidence checklist</h3>
            <ul>{profile.portfolioEvidence.map((line) => <li key={line}>{line}</li>)}</ul>
            <p className="career-evidence-note">These are portfolio suggestions for this role—not live vacancy counts or a claim that employers require a particular certificate.</p>
          </div>
          <div className="career-evidence-block">
            <span className="cert-eyebrow">CORE ROLE SKILLS</span>
            <div className="career-skill-list">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
