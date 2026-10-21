import { useEffect, useState } from 'react';
import './FirstVisitTour.css';

const interestOptions = [
  { id: 'beginner', mark: '01', title: 'I am new to cybersecurity', note: 'Start with foundations, then follow a clear learning route.', primary: 'roadmap', secondary: 'concepts', primaryLabel: 'Explore beginner paths', secondaryLabel: 'Learn the security basics' },
  { id: 'exam', mark: '02', title: 'I want a certification or exam', note: 'Find official credential pages, exam objectives, and preparation options.', primary: 'certifications', secondary: 'resources', primaryLabel: 'Explore certs & exams', secondaryLabel: 'Find prep resources' },
  { id: 'labs', mark: '03', title: 'I want hands-on labs', note: 'Try guided practice, worksheets, and notebook-style learning materials.', primary: 'labs', secondary: 'roadmap', primaryLabel: 'Open labs & notes', secondaryLabel: 'Choose a path first' },
  { id: 'resources', mark: '04', title: 'I want courses, videos, or guides', note: 'Browse curated resources with skills, access notes, and provider links.', primary: 'resources', secondary: 'labs', primaryLabel: 'Browse resources', secondaryLabel: 'Pair learning with practice' },
  { id: 'career', mark: '05', title: 'I want a cybersecurity career plan', note: 'Connect skills and portfolio evidence with role exploration and application tools.', primary: 'career-hub', secondary: 'resume-studio', primaryLabel: 'Explore the career hub', secondaryLabel: 'Open resume studio' },
  { id: 'tools', mark: '06', title: 'I want tools and security concepts', note: 'Explore defensive tools, threat examples, and security basics in plain language.', primary: 'tools', secondary: 'concepts', primaryLabel: 'Explore tools & case studies', secondaryLabel: 'Read security basics' },
  { id: 'systems', mark: '07', title: 'I need operating systems and networks', note: 'Build foundations that help make later security topics easier to understand.', primary: 'systems-academy', secondary: 'roadmap', primaryLabel: 'Open OS + Networks', secondaryLabel: 'Connect it to a learning path' },
];

const siteSections = [
  { mark: '01', title: 'Learning paths', note: 'Sequenced modules, milestones, and capstones.', page: 'roadmap' },
  { mark: '02', title: 'Resource library', note: 'Courses, documentation, videos, and access notes.', page: 'resources' },
  { mark: '03', title: 'Labs & notes', note: 'Practice work, downloadable notes, and safe exercises.', page: 'labs' },
  { mark: '04', title: 'Certs & exams', note: 'Credential pages, objectives, and preparation routes.', page: 'certifications' },
  { mark: '05', title: 'OS + Networks', note: 'Foundations that support deeper security learning.', page: 'systems-academy' },
  { mark: '06', title: 'Tools & film cases', note: 'Explore tools and how security appears in scenarios.', page: 'tools' },
  { mark: '07', title: 'Security basics', note: 'Understand common patterns and defensive responses.', page: 'concepts' },
  { mark: '08', title: 'Career toolkit', note: 'Explore roles, resume tools, jobs, and applications.', page: 'career-hub' },
];

const tourSteps = [
  {
    id: 'opening',
    kicker: 'AN OPENING CHAPTER · 01 / 07',
    symbol: '✦',
    artLabel: 'YOUR NEXT CHAPTER',
    title: 'Cybersecurity is a path. Not a maze.',
    description: 'OpenCyberPath helps you find a useful next step—whether you came to understand the basics, explore an exam, practise in a lab, or discover a career direction.',
    points: [
      ['The purpose', 'Bring learning routes, curated external resources, practice materials, certifications, and career tools into one clear starting place.'],
      ['Your pace, your interest', 'Choose one goal and explore from there. You do not need to know every section before you begin.'],
      ['A guide, not a gate', 'This short introduction is optional. Skip it now or replay it whenever you need a map.'],
    ],
    content: 'opening',
  },
  {
    id: 'interest',
    kicker: 'START WITH YOUR REASON · 02 / 07',
    symbol: '⌁',
    artLabel: 'CHOOSE YOUR DIRECTION',
    title: 'What brought you here today?',
    description: 'Choose the option closest to your current goal. We will use it to suggest a useful first destination at the end of the tour. You can change your choice at any time.',
    content: 'interest',
  },
  {
    id: 'map',
    kicker: 'A GLIMPSE OF THE WHOLE SITE · 03 / 07',
    symbol: '◎',
    artLabel: 'EIGHT AREAS · ONE MAP',
    title: 'Here is the landscape you can explore.',
    description: 'Each area has a different job. Open one directly from this map, or keep going for a quick introduction before choosing.',
    content: 'map',
  },
  {
    id: 'paths',
    kicker: 'LEARN IN A USEFUL ORDER · 04 / 07',
    symbol: '↗',
    artLabel: 'LEARN · CONNECT · GROW',
    title: 'Build understanding before you collect tabs.',
    description: 'Learning paths connect concepts into a sequence. OS and network foundations help fill gaps, and security basics explain why common risks happen and how defenders respond.',
    points: [
      ['Follow a route', 'Paths provide modules, suggested practice, and a capstone so you can see how topics connect.'],
      ['Strengthen the base', 'Use the OS + Networks academy or Security Basics when a term or concept feels unfamiliar.'],
    ],
    content: 'paths',
  },
  {
    id: 'resources',
    kicker: 'FIND THE RIGHT MATERIAL · 05 / 07',
    symbol: '⌘',
    artLabel: 'RESOURCES & EXAMS',
    title: 'Explore resources with context—not guesswork.',
    description: 'Resource cards outline skills, access requirements, and provider notes. The certifications area helps distinguish official credential information, exam objectives, and preparation links.',
    points: [
      ['Understand access first', 'Some content is free; some labs, accounts, products, or exams may cost money. Confirm current terms at the provider.'],
      ['Know where links go', 'Courses, exam portals, and many labs open on their providers’ websites. OpenCyberPath is a guide, not the exam issuer or host for every resource.'],
    ],
    content: 'resources',
  },
  {
    id: 'practice',
    kicker: 'PRACTISE WITH PURPOSE · 06 / 07',
    symbol: '◈',
    artLabel: 'PRACTISE · RECORD · EXPLAIN',
    title: 'Make your learning visible and responsible.',
    description: 'Labs and notes help turn reading into something you can explain. Career tools help you reflect on your skills and organise portfolio evidence as you progress.',
    points: [
      ['Use authorised practice', 'Use the supplied samples, local exercises, or a provider’s explicitly authorised training environment. Never test a system without permission.'],
      ['Save useful evidence', 'Record your steps, observations, assumptions, limitations, and next check. A lab completion alone is not proof of professional mastery.'],
      ['Keep expectations realistic', 'Learning can support a portfolio, but it cannot guarantee a job, exam pass, bounty, or other reward.'],
    ],
    content: 'practice',
  },
  {
    id: 'next',
    kicker: 'YOUR FIRST MOVE · 07 / 07',
    symbol: '→',
    artLabel: 'THE NEXT CHAPTER IS YOURS',
    title: 'Ready? Start where your interest is.',
    description: 'Based on the direction you selected, here are a couple of sensible places to go first. You can change direction whenever you like.',
    content: 'next',
  },
];

export default function FirstVisitTour({ onClose, onNavigate }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedInterest, setSelectedInterest] = useState('beginner');
  const step = tourSteps[activeStep];
  const chosenInterest = interestOptions.find((item) => item.id === selectedInterest) || interestOptions[0];
  const isFinalStep = activeStep === tourSteps.length - 1;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && activeStep < tourSteps.length - 1) setActiveStep((current) => Math.min(current + 1, tourSteps.length - 1));
      if (event.key === 'ArrowLeft' && activeStep > 0) setActiveStep((current) => Math.max(current - 1, 0));
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, activeStep]);

  const openDestination = (destination) => onNavigate(destination);

  return <div className="first-tour-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`first-tour-dialog first-tour-scene-${step.id}`} role="dialog" aria-modal="true" aria-labelledby="first-tour-title" aria-describedby="first-tour-description">
      <header className="first-tour-header">
        <div className="first-tour-brand"><span className="first-tour-brand-mark">O<span>↗</span></span><span><b>OpenCyberPath</b><small>LEARN · PRACTISE · FIND YOUR ROUTE</small></span></div>
        <div className="first-tour-header-right"><span className="first-tour-optional">OPTIONAL DISCOVERY TOUR</span><button type="button" className="first-tour-close" onClick={onClose} aria-label="Close guided tour">×</button></div>
      </header>

      <div className="first-tour-progress" aria-label={`Tour step ${activeStep + 1} of ${tourSteps.length}`}>
        {tourSteps.map((item, index) => <button type="button" key={item.id} className={index === activeStep ? 'is-current' : index < activeStep ? 'is-complete' : ''} onClick={() => setActiveStep(index)} aria-label={`Go to tour step ${index + 1}`} aria-current={index === activeStep ? 'step' : undefined} />)}
      </div>

      <div className="first-tour-layout" key={step.id}>
        <aside className={`first-tour-art first-tour-art-${step.id}`} aria-hidden="true">
          <div className="first-tour-art-grid" />
          <div className="first-tour-orbit first-tour-orbit-one" />
          <div className="first-tour-orbit first-tour-orbit-two" />
          <div className="first-tour-orbit first-tour-orbit-three" />
          <div className="first-tour-symbol">{step.symbol}</div>
          <span className="first-tour-art-index">SCENE / {String(activeStep + 1).padStart(2, '0')}</span>
          <div className="first-tour-art-caption"><i /> {step.artLabel}</div>
          <div className="first-tour-art-watermark">OCP</div>
        </aside>

        <div className="first-tour-copy">
          <div className="first-tour-kicker"><span className="first-tour-kicker-dot" />{step.kicker}</div>
          <h2 id="first-tour-title">{step.title}</h2>
          <p id="first-tour-description" className="first-tour-description">{step.description}</p>
          {step.points && <div className="first-tour-points">
            {step.points.map(([title, note], index) => <article className="first-tour-point" key={title}>
              <span className="first-tour-point-index">0{index + 1}</span>
              <div><b>{title}</b><p>{note}</p></div>
            </article>)}
          </div>}

          {step.content === 'interest' && <div className="first-tour-interest-grid">
            {interestOptions.map((item) => <button type="button" className={`first-tour-interest ${selectedInterest === item.id ? 'is-selected' : ''}`} key={item.id} onClick={() => setSelectedInterest(item.id)} aria-pressed={selectedInterest === item.id}>
              <span className="first-tour-interest-mark">{item.mark}</span><span className="first-tour-interest-copy"><b>{item.title}</b><small>{item.note}</small></span><span className="first-tour-interest-check" aria-hidden="true">{selectedInterest === item.id ? '✓' : '+'}</span>
            </button>)}
          </div>}
        </div>
      </div>

      {step.content === 'map' && <div className="first-tour-section-map">
        <div className="first-tour-subheading"><span>THE SITE AT A GLANCE</span><p>Choose a card to jump straight to that area, or continue the tour.</p></div>
        <div className="first-tour-map-grid">
          {siteSections.map((item) => <button type="button" className="first-tour-map-card" key={item.page} onClick={() => openDestination(item.page)}>
            <span className="first-tour-map-mark">{item.mark}</span><span className="first-tour-map-copy"><b>{item.title}</b><small>{item.note}</small></span><span className="first-tour-map-arrow" aria-hidden="true">↗</span>
          </button>)}
        </div>
      </div>}

      {step.content === 'paths' && <div className="first-tour-action-grid">
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('roadmap')}><span className="first-tour-action-mark">01 / ROUTES</span><b>Explore learning paths <span>↗</span></b><small>See sequenced modules and suggested outcomes.</small></button>
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('systems-academy')}><span className="first-tour-action-mark">02 / FOUNDATIONS</span><b>Open OS + Networks <span>↗</span></b><small>Strengthen background knowledge for security topics.</small></button>
      </div>}

      {step.content === 'resources' && <div className="first-tour-action-grid">
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('resources')}><span className="first-tour-action-mark">01 / EXPLORE</span><b>Browse learning resources <span>↗</span></b><small>Review skills, access requirements, provider notes, and destination links.</small></button>
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('certifications')}><span className="first-tour-action-mark">02 / EXAM ROUTE</span><b>Explore certs & exams <span>↗</span></b><small>Compare credential information and follow official issuer links.</small></button>
      </div>}

      {step.content === 'practice' && <div className="first-tour-action-grid">
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('labs')}><span className="first-tour-action-mark">01 / HANDS-ON</span><b>Open labs & notes <span>↗</span></b><small>Use worksheets and authorised practice material.</small></button>
        <button type="button" className="first-tour-action-card" onClick={() => openDestination('career-hub')}><span className="first-tour-action-mark">02 / NEXT STEPS</span><b>Explore the career toolkit <span>↗</span></b><small>Connect learning with role exploration and portfolio evidence.</small></button>
      </div>}

      {step.content === 'next' && <div className="first-tour-recommendation">
        <div className="first-tour-recommendation-label"><span>YOUR SELECTED INTEREST</span><b>{chosenInterest.title}</b></div>
        <div className="first-tour-recommendation-actions">
          <button type="button" className="first-tour-recommendation-primary" onClick={() => openDestination(chosenInterest.primary)}><span><small>START HERE</small><b>{chosenInterest.primaryLabel}</b></span><span aria-hidden="true">↗</span></button>
          <button type="button" className="first-tour-recommendation-secondary" onClick={() => openDestination(chosenInterest.secondary)}><span><small>ANOTHER USEFUL STOP</small><b>{chosenInterest.secondaryLabel}</b></span><span aria-hidden="true">↗</span></button>
        </div>
        <p className="first-tour-recommendation-note">You can revisit this tour from Home. The route is a suggestion, not a requirement—explore in the order that helps you learn.</p>
      </div>}

      <footer className="first-tour-footer">
        <button type="button" className="first-tour-skip" onClick={onClose}>Close tour</button>
        <div className="first-tour-step-label">SCENE <b>{String(activeStep + 1).padStart(2, '0')}</b> <span>/</span> {String(tourSteps.length).padStart(2, '0')}</div>
        <div className="first-tour-nav">
          <button type="button" className="first-tour-back" disabled={activeStep === 0} onClick={() => setActiveStep((current) => Math.max(0, current - 1))}>Back</button>
          {!isFinalStep && <button type="button" className="first-tour-next" onClick={() => setActiveStep((current) => Math.min(current + 1, tourSteps.length - 1))}>Continue <span aria-hidden="true">→</span></button>}
          {isFinalStep && <button type="button" className="first-tour-next" onClick={onClose}>Finish tour <span aria-hidden="true">✓</span></button>}
        </div>
      </footer>
    </section>
  </div>;
}
