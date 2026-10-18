import { useMemo, useState } from 'react';
import './StartHereGuide.css';

const FOUNDATION_BY_INTEREST = {
  'soc-blue-team': 'soc-blue-team',
  'threat-hunting-detection-engineering': 'soc-blue-team',
  'digital-forensics-incident-response': 'digital-forensics-incident-response',
  'application-security-bug-bounty': 'application-security-bug-bounty',
  'cloud-security': 'cloud-security',
  'grc-security-fundamentals': 'grc-security-fundamentals',
  'penetration-testing-red-team': 'application-security-bug-bounty',
  'security-engineering-devsecops-iam': 'soc-blue-team',
  'threat-intelligence-ethical-osint': 'threat-intelligence-ethical-osint',
  'malware-analysis-reverse-engineering': 'digital-forensics-incident-response',
};

const REASONS = {
  'soc-blue-team': 'SOC and blue-team work introduces logs, alerts, systems, and evidence—the building blocks used by several security specialisations.',
  'digital-forensics-incident-response': 'DFIR introduces timelines, artefacts, and careful evidence handling before deeper malware analysis.',
  'application-security-bug-bounty': 'Web security foundations help you understand HTTP, scope, and responsible testing before deeper assessment work.',
  'cloud-security': 'Cloud security can start with diagrams, identity concepts, and review checklists; creating paid cloud resources is optional.',
  'grc-security-fundamentals': 'GRC is accessible without a technical background and builds practical skills in risk, controls, and evidence.',
  'threat-intelligence-ethical-osint': 'Threat intelligence begins with source evaluation, context, and transparent confidence—not simply collecting links.',
};

export default function StartHereGuide({ paths = [], onOpenPath }) {
  const [interest, setInterest] = useState('explore');
  const [experience, setExperience] = useState('new');
  const interestPath = interest === 'explore' ? paths.find((path) => path.id === 'soc-blue-team') : paths.find((path) => path.id === interest);
  const recommendedId = interest === 'explore' ? 'soc-blue-team' : (experience === 'new' ? (FOUNDATION_BY_INTEREST[interest] || interest) : interest);
  const recommendedPath = useMemo(() => paths.find((path) => path.id === recommendedId) || interestPath || paths[0], [paths, recommendedId, interestPath]);
  const selectedPath = interestPath || recommendedPath;
  const hasDifferentSelection = Boolean(selectedPath && recommendedPath && selectedPath.id !== recommendedPath.id);
  if (!paths.length) return null;

  return <section className="start-here" id="start-here" aria-labelledby="start-here-title">
    <div className="start-here-heading">
      <span className="start-here-kicker">START HERE · NO EXPERIENCE REQUIRED</span>
      <h2 id="start-here-title">Find your <em>first useful step.</em></h2>
      <p>Choose an interest and tell us where you are starting. This guide recommends a path; it is not a test or a career prediction.</p>
    </div>
    <div className="start-here-controls">
      <label><span>What interests you most?</span>
        <select value={interest} onChange={(event) => setInterest(event.target.value)}>
          <option value="explore">I'm exploring cybersecurity</option>
          {paths.map((path) => <option key={path.id} value={path.id}>{path.shortTitle || path.title}</option>)}
        </select>
      </label>
      <label><span>How familiar are you with the basics?</span>
        <select value={experience} onChange={(event) => setExperience(event.target.value)}>
          <option value="new">I'm new to cybersecurity</option>
          <option value="basics">I know some fundamentals</option>
        </select>
      </label>
    </div>
    <div className="start-here-recommendation" aria-live="polite">
      <div className="start-here-recommendation-mark" aria-hidden="true">01</div>
      <div className="start-here-recommendation-copy">
        <span>{experience === 'new' && interest !== 'explore' && recommendedPath?.id !== interest ? 'SUGGESTED FOUNDATION' : 'SUGGESTED FIRST PATH'}</span>
        <h3>{recommendedPath?.shortTitle || recommendedPath?.title || 'SOC & Blue Team'}</h3>
        <p>{REASONS[recommendedPath?.id] || recommendedPath?.desc || 'Start with core concepts and build toward a specialist path.'}</p>
        <small>{recommendedPath?.prerequisites || 'Start with the module prerequisites shown inside the path.'}</small>
      </div>
      <div className="start-here-actions">
        <button className="button button-primary" type="button" onClick={() => onOpenPath(recommendedPath.id)}>Open recommended path <span aria-hidden="true">→</span></button>
        {hasDifferentSelection && <button className="button button-quiet" type="button" onClick={() => onOpenPath(selectedPath.id)}>View my selected interest</button>}
      </div>
    </div>
    <p className="start-here-footnote">Every path is self-paced. You can change direction at any time, and completing a module is a learning checkpoint—not a certification or job guarantee.</p>
  </section>;
}
