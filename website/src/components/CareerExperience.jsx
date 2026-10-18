import { useMemo, useState } from 'react';
import { beginnerStages, careerDirections, employerCareerPages, fictionalVacancy, hackerHats, jobBoards, roleSearchPresets } from './careerHubData.js';
import './career-experience.css';

const progressStorageKey = 'ocp-career-checklist-v1';
const trackerStorageKey = 'ocp-application-tracker-v1';
const resumeStorageKey = 'ocp-resume-draft-v1';

function readLocal(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function safeDownload(filename, content, type) {
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
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function ExternalIcon({ Icon }) { return Icon ? <Icon name="arrow-up-right" size={14} /> : <span aria-hidden="true">↗</span>; }
function ActionButton({ Icon, children, onClick, quiet = false, type = 'button' }) {
  return <button className={`button ${quiet ? 'button-quiet' : 'button-primary'} career-action-button`} type={type} onClick={onClick}>{children}{Icon && <Icon name="arrow-right" size={15} />}</button>;
}
function SectionHeader({ Icon, kicker, title, emphasis, description }) {
  return <div className="section-heading career-tool-heading"><div><div className="section-kicker">{kicker}</div><h2>{title}<br /><em>{emphasis}</em></h2></div><p>{description}</p></div>;
}

export function CareerHub({ Icon, onOpenPath, onOpenResume, onOpenJobs, onOpenDemo }) {
  const [activeHatId, setActiveHatId] = useState('white');
  const [doneStages, setDoneStages] = useState(() => readLocal(progressStorageKey, []));
  const activeHat = hackerHats.find((item) => item.id === activeHatId) || hackerHats[0];
  const doneCount = beginnerStages.filter((stage) => doneStages.includes(stage.id)).length;
  const progressPercent = Math.round((doneCount / beginnerStages.length) * 100);
  const toggleStage = (stageId) => {
    setDoneStages((current) => {
      const next = current.includes(stageId) ? current.filter((id) => id !== stageId) : [...current, stageId];
      writeLocal(progressStorageKey, next);
      return next;
    });
  };
  const resetStages = () => {
    setDoneStages([]);
    writeLocal(progressStorageKey, []);
  };

  return <section className="career-hub-page section-wrap">
    <header className="career-hub-hero">
      <div className="career-hub-hero-copy">
        <div className="career-tool-kicker"><span className="career-live-dot" /> CAREER JOURNEY · BEGINNER TO APPLICATION-READY</div>
        <h1>Learn the skill.<br /><em>Build the evidence.</em><br />Make the next move.</h1>
        <p>Open Cyber Path connects cybersecurity learning, safe practice, portfolio evidence, resume preparation, and job-search habits in one practical journey.</p>
        <div className="career-hub-hero-actions"><ActionButton Icon={Icon} onClick={() => document.getElementById('beginner-journey')?.scrollIntoView({ behavior: 'smooth' })}>Start the journey</ActionButton><ActionButton Icon={Icon} quiet onClick={onOpenResume}>Build a resume</ActionButton></div>
        <div className="career-hub-truth"><Icon name="shield-check" size={17} /><span>No job guarantees. Track what you can actually demonstrate and apply when the role fits.</span></div>
      </div>
      <div className="career-hub-console" aria-label="Learning to career stages">
        <div className="console-topline"><span><i /> PATHWAY OVERVIEW</span><span>OCP / 01</span></div>
        <div className="console-route"><span className="console-step">01</span><span className="console-step-label"><b>Learn</b><small>Foundations</small></span><span className="console-connector" /><span className="console-step">02</span><span className="console-step-label"><b>Practice</b><small>Labs + projects</small></span></div>
        <div className="console-route"><span className="console-step">03</span><span className="console-step-label"><b>Prove</b><small>Portfolio evidence</small></span><span className="console-connector" /><span className="console-step">04</span><span className="console-step-label"><b>Apply</b><small>Role-matched</small></span></div>
        <div className="console-progress-label"><span>YOUR CHECKLIST</span><b>{doneCount}/{beginnerStages.length} complete</b></div>
        <div className="console-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
        <small className="console-caption">Progress is saved in this browser only when you check stages below.</small>
      </div>
    </header>

    <div className="career-tool-trustbar"><div><Icon name="book-open" size={19} /><span><b>Learn in order</b><small>Foundations before specialisation</small></span></div><div><Icon name="target" size={19} /><span><b>Practise safely</b><small>Labs, CTFs, or scoped assessments</small></span></div><div><Icon name="file-text" size={19} /><span><b>Show real work</b><small>Reports and project evidence</small></span></div><div><Icon name="briefcase-business" size={19} /><span><b>Apply thoughtfully</b><small>Real requirements, no false claims</small></span></div></div>

    <section className="career-directions-block">
      <SectionHeader Icon={Icon} kicker="CHOOSE YOUR DIRECTION" title="Different roles." emphasis="One ethical standard." description="You can explore offensive, defensive, and cross-functional work. The job titles below are examples, not promises that a learner is qualified today." />
      <div className="career-direction-grid">{careerDirections.map((direction) => <article key={direction.id} className={`career-direction-card direction-${direction.tone}`}>
        <div className="direction-card-head"><span className="direction-symbol">{direction.symbol}</span><span>{direction.eyebrow}</span></div>
        <h3>{direction.title}</h3><p>{direction.summary}</p>
        <div className="direction-roles"><small>EXAMPLE ENTRY POINTS</small><div>{direction.roles.map((role) => <span key={role}>{role}</span>)}</div></div>
        <div className="direction-evidence"><small>FIRST PORTFOLIO EVIDENCE</small><p>{direction.firstEvidence}</p></div>
        <button className="career-inline-link" onClick={() => onOpenPath(direction.pathId)}>{direction.action} <ExternalIcon Icon={Icon} /></button>
      </article>)}</div>
    </section>

    <section id="beginner-journey" className="beginner-journey-block">
      <div className="journey-header"><div><div className="section-kicker">THE BEGINNER-TO-CAREER CHECKLIST</div><h2>Make progress <em>you can explain.</em></h2><p>Mark a stage complete after you can show the evidence—not just because you watched a video. Your checklist stays on this browser and can be reset at any time.</p></div><div className="journey-progress-box"><strong>{progressPercent}%</strong><span>CHECKLIST</span><div className="console-progress-track"><span style={{ width: `${progressPercent}%` }} /></div><button onClick={resetStages}>Reset progress</button></div></div>
      <div className="beginner-stage-list">{beginnerStages.map((stage) => {
        const complete = doneStages.includes(stage.id);
        return <article key={stage.id} className={`beginner-stage ${complete ? 'is-complete' : ''}`}>
          <label className="beginner-stage-check"><input type="checkbox" checked={complete} onChange={() => toggleStage(stage.id)} aria-label={`Mark ${stage.title} complete`} /><span><Icon name={complete ? 'check-circle' : 'circle'} size={19} /></span></label>
          <div className="beginner-stage-number">{stage.number}</div><div className="beginner-stage-main"><div className="beginner-stage-meta"><span>{stage.period}</span>{complete && <b><Icon name="check-circle" size={13} /> MARKED COMPLETE</b>}</div><h3>{stage.title}</h3><p>{stage.detail}</p><div className="beginner-stage-proof"><Icon name="file-text" size={15} /><span><b>Evidence to keep:</b> {stage.proof}</span></div></div>
        </article>;
      })}</div>
      <div className="journey-next-actions"><div><Icon name="spark" size={20} /><span><b>Need a first step?</b><small>Pick one role and complete its opening module before collecting more tools.</small></span></div><ActionButton Icon={Icon} onClick={() => onOpenPath('soc-blue-team')}>Start with SOC foundations</ActionButton></div>
    </section>

    <section className="hacker-hats-block">
      <SectionHeader Icon={Icon} kicker="TERMINOLOGY EXPLAINER" title="Hacker hats are labels." emphasis="Permission is the rule." description="The six terms are often used informally and do not all describe standardized professions. Use the professional role and actual responsibilities when planning a career." />
      <div className="hats-layout"><div className="hats-selector" role="tablist" aria-label="Select a hacker hat">{hackerHats.map((hat) => <button key={hat.id} className={`hat-tab hat-${hat.tone} ${activeHatId === hat.id ? 'active' : ''}`} role="tab" aria-selected={activeHatId === hat.id} onClick={() => setActiveHatId(hat.id)}><span className="hat-tab-dot" /><span><b>{hat.label}</b><small>{hat.short}</small></span><Icon name="arrow-up-right" size={15} /></button>)}</div>
        <article className={`hat-detail-card hat-detail-${activeHat.tone}`} role="tabpanel"><div className="hat-detail-code">HAT / {activeHat.id.toUpperCase()}</div><div className="hat-detail-mark"><Icon name={activeHat.id === 'white' ? 'shield-check' : activeHat.id === 'black' ? 'alert-triangle' : activeHat.id === 'grey' ? 'eye' : activeHat.id === 'green' ? 'graduation' : 'users'} size={29} /></div><h3>{activeHat.label}</h3><p>{activeHat.explanation}</p><div className="hat-boundary"><Icon name="shield-check" size={17} /><div><small>THE RESPONSIBLE APPROACH</small><p>{activeHat.boundary}</p></div></div><p className="hat-detail-footnote">These labels vary across communities. A professional career choice should be based on clear responsibilities, skills, authorization, and applicable law—not a colour alone.</p></article></div>
      <div className="purple-note"><Icon name="git-compare-arrows" size={21} /><p><b>Red Team vs Blue Team vs Purple Team:</b> Red Teams conduct authorized adversary simulations; Blue Teams defend, detect, and respond; Purple Team work helps both sides share findings and improve detections. “Purple Team” commonly describes collaboration rather than a separate universal job title.</p></div>
    </section>

    <section className="career-hub-bottom-cta"><div><div className="section-kicker">TURN LEARNING INTO NEXT STEPS</div><h2>Ready to make your work <em>application-ready?</em></h2><p>Use the free resume studio, search external job platforms, or practise with the fictional application demo.</p></div><div className="career-hub-cta-actions"><ActionButton Icon={Icon} onClick={onOpenResume}>Open resume studio</ActionButton><ActionButton Icon={Icon} quiet onClick={onOpenJobs}>Explore job links</ActionButton><button className="career-text-button" onClick={onOpenDemo}>Try the application demo <ExternalIcon Icon={Icon} /></button></div></section>
  </section>;
}

const initialResume = {
  fullName: '', headline: 'Entry-Level Cybersecurity Candidate', email: '', phone: '', location: '', linkedin: '', github: '',
  summary: 'Curious cybersecurity learner building practical skills through structured learning paths, safe labs, and documented projects. Focused on careful investigation, clear reporting, and responsible security practice.',
  education: '', skills: 'Networking fundamentals, Linux basics, Windows basics, HTTP, Git, technical documentation',
  projects: 'Project title — what you investigated, tools or methods used, the result you can demonstrate, and the limitations. Label practice work as a lab or learning project.',
  certifications: '', targetRole: 'Junior SOC Analyst',
};

const atsTerms = [
  'networking', 'tcp/ip', 'dns', 'linux', 'windows', 'log analysis', 'siem', 'incident response', 'threat hunting',
  'python', 'scripting', 'cloud security', 'iam', 'aws', 'azure', 'risk assessment', 'nist', 'owasp',
  'web application security', 'vulnerability management', 'git', 'documentation', 'digital forensics', 'access control',
];

function buildResumeText(resume) {
  const lines = [];
  if (resume.fullName.trim()) lines.push(resume.fullName.trim().toUpperCase());
  if (resume.headline.trim()) lines.push(resume.headline.trim());
  const contacts = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].map((item) => item.trim()).filter(Boolean);
  if (contacts.length) lines.push(contacts.join(' | '));
  const sections = [
    ['PROFESSIONAL SUMMARY', resume.summary],
    ['EDUCATION', resume.education],
    ['TECHNICAL SKILLS', resume.skills],
    ['PROJECTS', resume.projects],
    ['CERTIFICATIONS', resume.certifications],
  ];
  for (const [heading, value] of sections) {
    if (value && value.trim()) lines.push('', heading, value.trim());
  }
  return lines.join('\n').trim() + '\n';
}

function buildResumeHtml(resume) {
  const sections = [
    ['Professional Summary', resume.summary], ['Education', resume.education], ['Technical Skills', resume.skills],
    ['Projects', resume.projects], ['Certifications', resume.certifications],
  ].filter(([, value]) => value && value.trim());
  const contact = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter((value) => value && value.trim()).map(escapeHtml).join(' · ');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(resume.fullName || 'Cybersecurity Resume')}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#17212b;max-width:800px;margin:32px auto;padding:0 28px;line-height:1.5;font-size:11pt}h1{font-size:23pt;margin:0 0 4px}h2{font-size:11pt;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid #9aa8b5;padding-bottom:4px;margin:20px 0 8px}p{margin:6px 0;white-space:pre-wrap}.headline{font-size:12pt;color:#3c5567;margin:0 0 6px}.contact{font-size:9.5pt;color:#52616c;margin-bottom:18px;overflow-wrap:anywhere}@media print{body{margin:0 auto;padding:0 10mm}a{color:inherit;text-decoration:none}}</style></head><body><h1>${escapeHtml(resume.fullName || 'Your Name')}</h1><p class="headline">${escapeHtml(resume.headline)}</p><div class="contact">${contact}</div>${sections.map(([heading, value]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(value)}</p></section>`).join('')}</body></html>`;
}

function FormField({ label, value, onChange, placeholder, wide = false, rows = 1, hint, type = 'text', optional = false }) {
  const fieldId = `resume-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <label className={`resume-field ${wide ? 'resume-field-wide' : ''}`} htmlFor={fieldId}><span>{label}{optional && <small> OPTIONAL</small>}</span>{rows > 1 ? <textarea id={fieldId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} /> : <input id={fieldId} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}{hint && <small className="resume-field-hint">{hint}</small>}</label>;
}

export function ResumeStudio({ Icon, onOpenJobs }) {
  const [resume, setResume] = useState(() => ({ ...initialResume, ...readLocal(resumeStorageKey, {}) }));
  const [jobDescription, setJobDescription] = useState('');
  const [notice, setNotice] = useState('');
  const resumeText = useMemo(() => buildResumeText(resume), [resume]);
  const matchingTerms = useMemo(() => {
    const resumeContent = resumeText.toLowerCase();
    const requested = jobDescription.trim() ? atsTerms.filter((term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(jobDescription)) : [];
    return { requested, matched: requested.filter((term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(resumeContent)), missing: requested.filter((term) => !new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(resumeContent)) };
  }, [resumeText, jobDescription]);
  const setField = (key, value) => setResume((current) => ({ ...current, [key]: value }));
  const saveDraft = () => setNotice(writeLocal(resumeStorageKey, resume) ? 'Draft saved in this browser. Do not save personal information on a shared device.' : 'Could not save to this browser. Download a local copy instead.');
  const printResume = () => {
    document.body.classList.add('print-resume');
    const cleanup = () => document.body.classList.remove('print-resume');
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  };
  const clearResume = () => {
    setResume(initialResume);
    setNotice('Form reset. Your previously saved browser draft remains until you overwrite it or clear it manually.');
  };

  return <section className="section-wrap resume-studio-page">
    <SectionHeader Icon={Icon} kicker="FREE · LOCAL-FIRST TOOL" title="A resume built on" emphasis="evidence, not hype." description="Create a clean, text-first cybersecurity resume, preview it as you work, and review basic job-description keyword coverage. No account or upload is needed by this tool." />
    <div className="resume-privacy-note"><Icon name="lock" size={19} /><p><b>Privacy first.</b> This tool runs in your browser. Resume content is not sent to Open Cyber Path. Browser saving is optional and stays on this device; avoid shared devices and do not include Aadhaar/PAN numbers, passwords, OTPs, full home addresses, or other unnecessary sensitive details.</p></div>
    <div className="resume-studio-layout">
      <div className="resume-builder-column"><div className="career-panel-header"><div><div className="section-kicker">YOUR DETAILS</div><h3>Resume editor</h3><p>Leave a field blank rather than inventing information.</p></div><span className="career-panel-index">01 / EDIT</span></div>
        <div className="resume-form-grid">
          <FormField label="Full name" value={resume.fullName} onChange={(v) => setField('fullName', v)} placeholder="Your name" />
          <FormField label="Target role / headline" value={resume.headline} onChange={(v) => setField('headline', v)} placeholder="e.g. Junior SOC Analyst" />
          <FormField label="Email" type="email" value={resume.email} onChange={(v) => setField('email', v)} placeholder="you@example.com" />
          <FormField label="Phone" value={resume.phone} onChange={(v) => setField('phone', v)} placeholder="Optional" optional />
          <FormField label="City / region" value={resume.location} onChange={(v) => setField('location', v)} placeholder="e.g. Hyderabad, India" optional />
          <FormField label="LinkedIn URL" value={resume.linkedin} onChange={(v) => setField('linkedin', v)} placeholder="https://linkedin.com/in/…" optional />
          <FormField label="GitHub / portfolio URL" value={resume.github} onChange={(v) => setField('github', v)} placeholder="https://github.com/…" optional />
          <FormField label="Professional summary" value={resume.summary} onChange={(v) => setField('summary', v)} wide rows={4} hint="Use truthful language. Replace the starter text with your current focus and evidence." />
          <FormField label="Education" value={resume.education} onChange={(v) => setField('education', v)} wide rows={3} placeholder="Degree / course · institution · expected year (if useful)" />
          <FormField label="Technical skills" value={resume.skills} onChange={(v) => setField('skills', v)} wide rows={3} hint="Keep only skills you can explain or demonstrate." />
          <FormField label="Projects & practical evidence" value={resume.projects} onChange={(v) => setField('projects', v)} wide rows={5} hint="For each project: goal, your work, tools/method, result, and limitations. Clearly label labs and simulations." />
          <FormField label="Certifications / training" value={resume.certifications} onChange={(v) => setField('certifications', v)} wide rows={2} optional hint="List only completed, verifiable certifications; put in-progress training in a separate clearly labelled line." />
        </div>
        <div className="resume-controls"><button className="button button-primary" onClick={saveDraft}><Icon name="save" size={15} /> Save in this browser</button><button className="button button-quiet" onClick={() => safeDownload('open-cyber-path-resume.txt', resumeText, 'text/plain;charset=utf-8')}><Icon name="download" size={15} /> Download TXT</button><button className="button button-quiet" onClick={() => safeDownload('open-cyber-path-resume.html', buildResumeHtml(resume), 'text/html;charset=utf-8')}><Icon name="download" size={15} /> Download HTML</button><button className="button button-quiet" onClick={printResume}><Icon name="file-text" size={15} /> Print / Save as PDF</button><button className="resume-reset-button" onClick={clearResume}>Reset form</button></div>
        {notice && <p className="resume-notice" role="status">{notice}</p>}
      </div>
      <aside className="resume-preview-column"><div className="career-panel-header"><div><div className="section-kicker">LIVE PREVIEW</div><h3>Readable, ATS-friendly layout</h3><p>One column, standard headings, no charts or skill-rating graphics.</p></div><span className="career-panel-index">02 / PREVIEW</span></div>
        <article className="resume-preview"><header><h1>{resume.fullName.trim() || 'YOUR NAME'}</h1><div className="resume-preview-headline">{resume.headline}</div><div className="resume-preview-contact">{[resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter((item) => item && item.trim()).join(' · ') || 'Email · City · LinkedIn · GitHub (add only what you want to share)'}</div></header>
          {[['Professional Summary', resume.summary], ['Education', resume.education], ['Technical Skills', resume.skills], ['Projects', resume.projects], ['Certifications', resume.certifications]].filter(([, value]) => value && value.trim()).map(([heading, value]) => <section key={heading}><h2>{heading}</h2><p>{value}</p></section>)}
        </article>
        <div className="resume-quality-checks"><h4><Icon name="check-circle" size={17} /> Beginner resume checklist</h4><p>Before exporting, confirm that the file includes relevant evidence and is easy to skim.</p><ul><li>Role headline matches the opportunity</li><li>Projects explain your contribution, not just tool names</li><li>Skills are defensible in an interview</li><li>Dates, links, spelling, and contact details are correct</li><li>No photo, chart, rating bars, or unnecessary sensitive identifiers</li></ul></div>
      </aside>
    </div>
    <section className="ats-review-panel"><div className="ats-review-heading"><div className="ats-review-symbol"><Icon name="scan-text" size={23} /></div><div><div className="section-kicker">BASIC KEYWORD REVIEW</div><h3>Compare against a job description</h3><p>Paste the job description here for local keyword comparison. The text is checked in this browser and is not uploaded.</p></div></div>
      <label className="ats-job-description">Job description<textarea rows={7} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste a job description. Remove names or other personal information first." /></label>
      {jobDescription.trim() ? <div className="ats-review-results"><div className="ats-review-score"><strong>{matchingTerms.requested.length ? `${Math.round((matchingTerms.matched.length / matchingTerms.requested.length) * 100)}%` : '—'}</strong><span>listed terms matched</span><small>{matchingTerms.matched.length} of {matchingTerms.requested.length} supported terms</small></div><div className="ats-term-columns"><div><b>Found in resume</b><div className="ats-term-tags">{matchingTerms.matched.length ? matchingTerms.matched.map((term) => <span className="term-found" key={term}><Icon name="check-circle" size={12} />{term}</span>) : <small>No supported terms matched yet.</small>}</div></div><div><b>Review manually</b><div className="ats-term-tags">{matchingTerms.missing.length ? matchingTerms.missing.map((term) => <span className="term-missing" key={term}>{term}</span>) : <small>No missing terms from this limited list.</small>}</div></div></div></div> : <div className="ats-empty-state"><Icon name="target" size={17} /> Add a job description to see keyword overlap.</div>}
      <p className="ats-disclaimer"><Icon name="alert-triangle" size={15} /> This is a simple dictionary-based review, not a real applicant-tracking system, recruiter assessment, or hiring prediction. It does not establish qualification and cannot guarantee that an employer's system will accept or rank a resume.</p>
      <div className="ats-next-step"><span>Next: review the role's requirements and tailor your project evidence.</span><ActionButton Icon={Icon} onClick={onOpenJobs}>Find entry-level job links</ActionButton></div>
    </section>
  </section>;
}

export function JobsHub({ Icon, onOpenResume, onOpenDemo, onOpenTracker }) {
  const [role, setRole] = useState('Cybersecurity Intern');
  const [location, setLocation] = useState('India');
  const [customRole, setCustomRole] = useState('');
  const queryRole = customRole.trim() || role;
  const [filter, setFilter] = useState('All sources');
  const boardFilters = ['All sources', ...new Set(jobBoards.map((board) => board.category))];
  const shownBoards = jobBoards.filter((board) => filter === 'All sources' || board.category === filter);
  const searchParams = { role: queryRole, location: location.trim() || 'India' };
  return <section className="section-wrap jobs-hub-page">
    <SectionHeader Icon={Icon} kicker="CURATED EXTERNAL LINKS · INDIA-FIRST" title="Find a suitable" emphasis="first opportunity." description="Search for internships and junior roles on established job platforms. Open the original posting, verify the employer and eligibility, and apply through the official process." />
    <div className="job-search-builder"><div className="job-search-copy"><div className="section-kicker">BUILD YOUR SEARCH</div><h3>Start with a role, then filter.</h3><p>Job availability changes frequently. These are outbound searches rather than live listings from Open Cyber Path.</p></div><div className="job-search-fields"><label>Role or keyword<select value={role} onChange={(event) => { setRole(event.target.value); setCustomRole(''); }}>{roleSearchPresets.map((preset) => <option key={preset.query} value={preset.query}>{preset.label}</option>)}</select></label><label>Custom role keyword<input value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="Optional: e.g. SOC trainee" /></label><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="India, Hyderabad, Remote…" /></label></div><div className="job-search-actions"><a className="button button-primary" href={jobBoards[0].searchUrl(searchParams)} target="_blank" rel="noreferrer">Search LinkedIn <ExternalIcon Icon={Icon} /></a><a className="button button-quiet" href={jobBoards[2].searchUrl(searchParams)} target="_blank" rel="noreferrer">Search Indeed <ExternalIcon Icon={Icon} /></a><button className="button button-quiet" onClick={onOpenTracker}><Icon name="clipboard" size={15} /> Open my tracker</button></div></div>
    <div className="job-hub-safety"><Icon name="shield-check" size={21} /><p><b>Application safety rule:</b> never pay an individual to guarantee a job, interview, referral, or offer. Do not share passwords, OTPs, or unnecessary identity documents. Check the employer's official domain and read the actual role requirements. In particular, India's National Career Service warns that its employment services are free of cost.</p></div>
    <div className="job-boards-heading"><div><div className="section-kicker">JOB SEARCH RESOURCES</div><h3>Choose a platform</h3><p>Each card leads to an external service. Open it to confirm the listing is current.</p></div><div className="job-filter-row" role="group" aria-label="Filter job search resources">{boardFilters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
    <div className="job-board-grid">{shownBoards.map((board) => <article key={board.id} className={`job-board-card job-board-${board.id}`}><div className="job-board-meta"><span className="job-board-icon"><Icon name={board.id === 'ncs' ? 'shield-check' : board.id === 'internshala' ? 'graduation' : board.id === 'wellfound' ? 'spark' : 'briefcase-business'} size={21} /></span><span className="job-board-tag">{board.tag}</span></div><h3>{board.name}</h3><p>{board.description}</p><div className="job-board-warning"><Icon name="alert-triangle" size={14} /><span>{board.warning}</span></div><div className="job-board-actions"><a href={board.url} target="_blank" rel="noreferrer">Open platform <ExternalIcon Icon={Icon} /></a><a href={board.searchUrl(searchParams)} target="_blank" rel="noreferrer">{board.searchLabel || 'Browse jobs'} <ExternalIcon Icon={Icon} /></a></div></article>)}</div>
    <section className="employer-career-section"><div className="job-boards-heading"><div><div className="section-kicker">GO TO THE EMPLOYER DIRECTLY</div><h3>Official early-career portals</h3><p>These company links are starting points, not endorsements or promises of an open cybersecurity vacancy.</p></div></div><div className="employer-career-grid">{employerCareerPages.map((employer) => <article className={`employer-career-card employer-${employer.id}`} key={employer.id}><span>{employer.audience}</span><h4>{employer.name}</h4><p>{employer.description}</p><a href={employer.url} target="_blank" rel="noreferrer">Open employer website <ExternalIcon Icon={Icon} /></a></article>)}</div></section>
    <div className="job-application-path"><div><div className="section-kicker">BEFORE YOU PRESS APPLY</div><h3>Use a repeatable checklist.</h3><p>Read the requirements, tailor the resume, confirm the application domain, and save the next action. The form below is a practice demo only; it never contacts an employer.</p></div><div className="job-application-actions"><ActionButton Icon={Icon} onClick={onOpenResume}>Prepare resume</ActionButton><ActionButton Icon={Icon} quiet onClick={onOpenDemo}>Try fictional application demo</ActionButton></div></div>
    <section className="job-source-note"><h4><Icon name="book-open" size={17} /> Official source note</h4><p>National Career Service (Government of India) publishes job-search and employment services and warns users about fraudulent claims of association. Open Cyber Path does not verify, endorse, or guarantee any third-party vacancy. Treat this hub as a starting directory and follow each provider's current terms.</p><a href="https://www.ncs.gov.in/pages/govt-job-vacancies.aspx" target="_blank" rel="noreferrer">National Career Service safety / recruitment information <ExternalIcon Icon={Icon} /></a></section>
  </section>;
}

export function ApplicationLab({ Icon, onOpenResume, onOpenJobs }) {
  const [checks, setChecks] = useState({ requirements: false, resume: false, project: false, verified: false });
  const [reviewed, setReviewed] = useState(false);
  const checkedCount = Object.values(checks).filter(Boolean).length;
  const [tracker, setTracker] = useState(() => readLocal(trackerStorageKey, []));
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('Preparing');
  const [nextAction, setNextAction] = useState('Review role requirements');
  const [followUp, setFollowUp] = useState('');
  const [trackerNotice, setTrackerNotice] = useState('');

  const updateCheck = (key) => {
    setChecks((current) => ({ ...current, [key]: !current[key] }));
    setReviewed(false);
  };
  const addTrackerItem = (event) => {
    event.preventDefault();
    if (!company.trim() || !jobTitle.trim()) {
      setTrackerNotice('Add a company or organization name and the role title first.');
      return;
    }
    const item = { id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, company: company.trim(), jobTitle: jobTitle.trim(), status, nextAction: nextAction.trim() || 'Review role', followUp, createdAt: new Date().toISOString().slice(0, 10) };
    setTracker((current) => {
      const next = [item, ...current];
      writeLocal(trackerStorageKey, next);
      return next;
    });
    setCompany(''); setJobTitle(''); setFollowUp(''); setStatus('Preparing'); setNextAction('Review role requirements');
    setTrackerNotice('Saved to this browser. Review and update the next action as things change.');
  };
  const deleteTrackerItem = (id) => {
    setTracker((current) => {
      const next = current.filter((item) => item.id !== id);
      writeLocal(trackerStorageKey, next);
      return next;
    });
  };
  const updateTrackerStatus = (id, nextStatus) => {
    setTracker((current) => {
      const next = current.map((item) => item.id === id ? { ...item, status: nextStatus } : item);
      writeLocal(trackerStorageKey, next);
      return next;
    });
  };
  const downloadTracker = () => safeDownload('open-cyber-path-application-tracker.json', JSON.stringify(tracker, null, 2), 'application/json;charset=utf-8');

  return <section className="section-wrap application-lab-page">
    <SectionHeader Icon={Icon} kicker="PRACTICE · NOTHING IS SUBMITTED" title="Rehearse the application." emphasis="Then track the real one." description="Use a fictional cybersecurity internship to practise application readiness, then keep your own job-search checklist locally in your browser. No application is sent to any employer." />
    <div className="fictional-role-card"><div className="fictional-role-top"><span><Icon name="graduation" size={18} /> FICTIONAL PRACTICE VACANCY</span><span>DEMO ONLY</span></div><h2>{fictionalVacancy.title}</h2><p className="fictional-company">{fictionalVacancy.company}</p><p>{fictionalVacancy.description}</p><div className="fictional-requirements"><b>What this practice role asks for</b>{fictionalVacancy.requirements.map((requirement) => <span key={requirement}><Icon name="check-circle" size={14} />{requirement}</span>)}</div></div>
    <div className="application-review-layout"><section className="application-check-panel"><div className="career-panel-header"><div><div className="section-kicker">APPLICATION READINESS</div><h3>Review before applying</h3><p>Tick an item only when you have actually checked it.</p></div><span className="career-panel-index">01 / CHECK</span></div>
      <div className="application-checklist">{[
        ['requirements', 'I understand the role requirements', 'I can explain which requirements I already meet and which I still need to learn.'],
        ['resume', 'My resume is truthful and tailored', 'The resume uses relevant language without claiming skills or qualifications I do not have.'],
        ['project', 'My project evidence is ready', 'I can describe my role, methods, result, and limitations with links or notes when appropriate.'],
        ['verified', 'I verified the employer and application site', 'I checked the original employer or official platform and saw no suspicious fee or data request.'],
      ].map(([id, label, description]) => <label className={`application-check-item ${checks[id] ? 'selected' : ''}`} key={id}><input type="checkbox" checked={checks[id]} onChange={() => updateCheck(id)} /><span><Icon name={checks[id] ? 'check-circle' : 'circle'} size={19} /></span><span className="application-check-copy"><b>{label}</b><small>{description}</small></span></label>)}</div>
      <div className="application-check-footer"><div><strong>{checkedCount}/4</strong><span>readiness checks</span></div><button className="button button-primary" onClick={() => setReviewed(true)}>Review demo checklist <Icon name="arrow-right" size={15} /></button></div>
      {reviewed && <div className={`application-result ${checkedCount === 4 ? 'all-clear' : ''}`} role="status"><Icon name={checkedCount === 4 ? 'check-circle' : 'lightbulb'} size={19} /><div><b>{checkedCount === 4 ? 'Demo checklist complete' : 'Demo review saved'}</b><p>{checkedCount === 4 ? 'All four preparation checks are marked. This still does not submit an application or guarantee an interview.' : `You marked ${checkedCount} of 4 checks. Complete the remaining items or leave them unchecked until you are ready.`}</p><small>This is only a local practice simulation. No company was contacted.</small></div></div>}
      <div className="demo-next-links"><button onClick={onOpenResume}>Open resume studio <ExternalIcon Icon={Icon} /></button><button onClick={onOpenJobs}>Browse job-search links <ExternalIcon Icon={Icon} /></button></div>
    </section>
    <aside className="application-demo-side"><div className="application-side-icon"><Icon name="lock" size={25} /></div><div className="section-kicker">SAFE SIMULATION</div><h3>No fake “submit” button.</h3><p>The demo shows a preparation review, not a real application. For a genuine role, follow the employer's current instructions and review every document before sending it.</p><ul><li>No email is sent</li><li>No company API is called</li><li>No credentials or identity documents requested</li><li>You stay in control of every real application</li></ul></aside></div>

    <section id="application-tracker" className="application-tracker-section"><div className="career-section-header"><div><div className="section-kicker">PRIVATE JOB-SEARCH NOTES</div><h2>Your application <em>tracker.</em></h2></div><p>Record only the details needed to remember your progress. Information is stored in this browser; download a JSON backup before clearing browser data.</p></div>
      <form className="application-tracker-form" onSubmit={addTrackerItem}><div className="tracker-form-heading"><Icon name="clipboard" size={20} /><div><h3>Add an opportunity</h3><p>Use the role and company from a real listing you have checked.</p></div></div><div className="tracker-form-grid"><label>Company / organization<input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" required /></label><label>Role title<input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. SOC Analyst Intern" required /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{['Preparing', 'Ready to apply', 'Applied', 'Assessment', 'Interview', 'Offer', 'Closed'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Next action<input value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="e.g. Tailor project section" /></label><label>Follow-up date (optional)<input type="date" value={followUp} onChange={(event) => setFollowUp(event.target.value)} /></label><div className="tracker-form-submit"><button className="button button-primary" type="submit"><Icon name="plus" size={15} /> Save opportunity locally</button></div></div>{trackerNotice && <p className="tracker-notice" role="status">{trackerNotice}</p>}</form>
      <div className="tracker-list-heading"><h3>Saved opportunities <span>{tracker.length}</span></h3><button className="button button-quiet" onClick={downloadTracker} disabled={!tracker.length}><Icon name="download" size={14} /> Export JSON backup</button></div>
      {tracker.length ? <div className="tracker-list">{tracker.map((item) => <article className="tracker-item" key={item.id}><div className="tracker-item-icon"><Icon name="briefcase-business" size={19} /></div><div className="tracker-item-main"><div className="tracker-company">{item.company}</div><h4>{item.jobTitle}</h4><p><Icon name="arrow-right" size={13} /> Next: {item.nextAction || 'Review role'}</p><small>Added {item.createdAt}{item.followUp ? ` · Follow up ${item.followUp}` : ''}</small></div><div className="tracker-item-actions"><label>Status<select value={item.status} onChange={(event) => updateTrackerStatus(item.id, event.target.value)}>{['Preparing', 'Ready to apply', 'Applied', 'Assessment', 'Interview', 'Offer', 'Closed'].map((entry) => <option key={entry}>{entry}</option>)}</select></label><button className="tracker-remove" onClick={() => deleteTrackerItem(item.id)}>Remove</button></div></article>)}</div> : <div className="tracker-empty"><Icon name="clipboard" size={24} /><h4>No opportunities saved yet</h4><p>Add a real opportunity after you have checked the source and role details.</p></div>}
    </section>
  </section>;
}
