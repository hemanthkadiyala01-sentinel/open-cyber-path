import { useMemo, useState } from 'react';
import { certifications, freeLearningOptions } from '../data/certifications.js';
import careerPathProfiles from '../data/career-path-profiles.json';
import './CareerPathAdvisor.css';

function OfficialLink({ href, children }) {
  return <a className="cert-link" href={href} target="_blank" rel="noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
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
        <label><span>Target role</span>
          <select value={trackId} onChange={(event) => setTrackId(event.target.value)}>
            {careerPathProfiles.map((item) => <option key={item.id} value={item.track}>{item.title}</option>)}
          </select>
        </label>
        <label><span>Your starting point</span>
          <select value={experience} onChange={(event) => setExperience(event.target.value)}>
            {experienceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label><span>Exam budget</span>
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            {budgetOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label><span>Study time each week</span>
          <select value={hours} onChange={(event) => setHours(event.target.value)}>
            <option value="5">About 5 hours</option>
            <option value="10">About 10 hours</option>
            <option value="15">15+ hours</option>
          </select>
        </label>
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
                    <h3>{item.name}</h3>
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
