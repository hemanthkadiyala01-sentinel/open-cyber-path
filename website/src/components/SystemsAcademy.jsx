import { useEffect, useMemo, useState } from 'react';
import { operatingSystems, networkModules, practiceExercises } from '../data/systemsAcademy.js';
import { OperatingSystemsExplorer } from './OperatingSystemsExplorer.jsx';

export function SystemsAcademy({ Icon, careerPaths = [], initialPathId = 'all', onOpenLabs }) {
  const [track, setTrack] = useState('os');
  const [selectedOS, setSelectedOS] = useState('linux');
  const [selectedPath, setSelectedPath] = useState('all');
  const [search, setSearch] = useState('');
  const [activeExercise, setActiveExercise] = useState(practiceExercises[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [showCommands, setShowCommands] = useState(true);
  const [commandCopyNotice, setCommandCopyNotice] = useState('');

  const currentExercise = practiceExercises.find((exercise) => exercise.id === activeExercise) || practiceExercises[0];
  const visibleOS = useMemo(() => operatingSystems.filter((os) => {
    const matchesPath = selectedPath === 'all' || os.bestFor.includes(selectedPath);
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [os.name, os.family, os.summary, ...os.topics, ...os.commands.map((cmd) => `${cmd.label} ${cmd.command} ${cmd.purpose}`)].join(' ').toLowerCase().includes(term);
    return matchesPath && matchesSearch;
  }), [selectedPath, search]);
  const currentOS = visibleOS.find((os) => os.id === selectedOS) || visibleOS[0] || operatingSystems[0];
  useEffect(() => { if (initialPathId) setSelectedPath(initialPathId); }, [initialPathId]);
  useEffect(() => { if (visibleOS.length && !visibleOS.some((os) => os.id === selectedOS)) setSelectedOS(visibleOS[0].id); }, [visibleOS, selectedOS]);
  const visibleNetwork = useMemo(() => networkModules.filter((module) => {
    const matchesPath = selectedPath === 'all' || module.paths.includes(selectedPath);
    const term = search.trim().toLowerCase();
    return matchesPath && (!term || `${module.title} ${module.summary} ${module.objectives.join(' ')}`.toLowerCase().includes(term));
  }), [selectedPath, search]);

  function chooseExercise(id) {
    setActiveExercise(id);
    setSelectedAnswer(null);
    setAnswerChecked(false);
  }
  async function copyCommand(command) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(command);
      setCommandCopyNotice('Command copied. Review it before running it on your own system.');
    } catch {
      setCommandCopyNotice('Clipboard access is unavailable. Select the command text and copy it manually.');
    }
  }
  function submitAnswer() {
    if (selectedAnswer === null) return;
    setAnswerChecked(true);
    if (selectedAnswer === currentExercise.answer) setCompleted((previous) => previous.includes(currentExercise.id) ? previous : [...previous, currentExercise.id]);
  }

  return <section className="section-wrap systems-academy">
    <div className="systems-hero">
      <div className="systems-hero-copy">
        <div className="section-kicker">FOUNDATIONS THAT TRANSFER ACROSS CAREERS</div>
        <h1>Understand the <em>systems beneath security.</em></h1>
        <p>Study operating systems and networking as connected foundations. Choose a career path to surface the most relevant modules, learn from safe command examples, then test your understanding with browser-based practice.</p>
        <div className="systems-hero-stats"><span><b>{operatingSystems.length}</b> OS guides</span><span><b>{networkModules.length}</b> networking modules</span><span><b>{practiceExercises.length}</b> practice checks</span></div>
      </div>
      <div className="systems-hero-art" aria-hidden="true"><div className="systems-orbit orbit-one"/><div className="systems-orbit orbit-two"/><div className="systems-core"><Icon name="network" size={34}/><span>OS + NET</span></div><i className="systems-node node-one">KERNEL</i><i className="systems-node node-two">TCP/IP</i><i className="systems-node node-three">LOGS</i></div>
    </div>

    <div className="systems-filterbar">
      <label className="systems-search"><Icon name="search" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search OS, topic, command, or concept…" aria-label="Search systems academy"/></label>
      <label className="systems-path-select"><span>Career relevance</span><select value={selectedPath} onChange={(event) => setSelectedPath(event.target.value)}><option value="all">All career paths</option>{careerPaths.map((path) => <option key={path.id} value={path.id}>{path.shortTitle || path.title}</option>)}</select></label>
    </div>

    <div className="systems-track-switch" role="tablist" aria-label="Academy track">
      <button role="tab" aria-selected={track === 'explorer'} className={track === 'explorer' ? 'is-active' : ''} onClick={() => setTrack('explorer')}><Icon name="layers" size={18}/> OS Explorer <small>Visual guide & comparisons</small></button>
      <button role="tab" aria-selected={track === 'os'} className={track === 'os' ? 'is-active' : ''} onClick={() => setTrack('os')}><Icon name="monitor-check" size={18}/> Operating Systems <small>Learn the platform</small></button>
      <button role="tab" aria-selected={track === 'network'} className={track === 'network' ? 'is-active' : ''} onClick={() => setTrack('network')}><Icon name="network" size={18}/> Computer Networks <small>Learn how systems connect</small></button>
      <button role="tab" aria-selected={track === 'practice'} className={track === 'practice' ? 'is-active' : ''} onClick={() => setTrack('practice')}><Icon name="target" size={18}/> Practice zone <small>Check your understanding</small></button>
    </div>

    {track === 'explorer' && <OperatingSystemsExplorer />}

    {track === 'os' && <div className="systems-os-layout">
      <aside className="systems-os-list"><div className="systems-list-heading"><span>OS CATALOGUE</span><b>{visibleOS.length} shown</b></div>{visibleOS.map((os) => <button key={os.id} className={`systems-os-choice ${selectedOS === os.id ? 'is-active' : ''}`} onClick={() => setSelectedOS(os.id)}><span className="systems-os-glyph"><Icon name={os.id === 'windows' ? 'monitor-check' : os.id === 'macos' ? 'laptop' : 'terminal'} size={17}/></span><span><b>{os.name}</b><small>{os.family}</small></span><Icon name="arrow-right" size={15}/></button>)}{visibleOS.length === 0 && <p className="systems-empty">No OS matches. Clear the search or choose another career path.</p>}</aside>
      {visibleOS.length > 0 ? <article className="systems-os-detail"><div className="systems-detail-top"><div><span className="systems-chip">{currentOS.family}</span><h2>{currentOS.name}</h2><p>{currentOS.summary}</p></div><a className="systems-doc-link" href={currentOS.docs} target="_blank" rel="noreferrer">Official learning docs <Icon name="arrow-up-right" size={14}/></a></div>
        <div className="systems-topic-grid">{currentOS.topics.map((topic, index) => <div className="systems-topic-card" key={topic}><span>{String(index + 1).padStart(2,'0')}</span><b>{topic}</b><small>Read concept · review example · practise safely</small></div>)}</div>
        <div className="systems-command-head"><div><span className="section-kicker">COMMAND REFERENCE</span><h3>Useful commands, with context.</h3></div><button className="systems-text-button" onClick={() => setShowCommands((value) => !value)}>{showCommands ? 'Hide commands' : 'Show commands'}</button></div>
        {showCommands && <div className="systems-command-list">{currentOS.commands.map((command) => <div className="systems-command-card" key={command.label}><div className="systems-command-meta"><b>{command.label}</b><button onClick={() => copyCommand(command.command)} aria-label={`Copy ${command.label} command`}><Icon name="copy" size={14}/> Copy</button></div><code>{command.command}</code><p>{command.purpose}</p></div>)}{commandCopyNotice && <p className="systems-session-note" role="status">{commandCopyNotice}</p>}</div>}
        <div className="systems-safety-note"><Icon name="shield-check" size={18}/><p><b>Practice safely.</b> These examples inspect local system state. Review commands before running them, use a machine you control, and avoid elevated privileges unless a lab explicitly requires them.</p></div>
      </article> : <div className="systems-os-detail systems-empty">No operating systems match these filters. Clear the search or choose another career path.</div>}
    </div>}

    {track === 'network' && <div className="systems-network-grid">{visibleNetwork.map((module, index) => <article className="systems-network-card" key={module.id}><div className="systems-network-card-top"><span>{String(index + 1).padStart(2,'0')}</span><span className="systems-chip">{module.level}</span></div><h2>{module.title}</h2><p>{module.summary}</p><div className="systems-objectives"><b>By the end, you can:</b>{module.objectives.map((objective) => <span key={objective}><Icon name="check-circle" size={14}/>{objective}</span>)}</div><button className="systems-card-action" onClick={() => { setTrack('practice'); chooseExercise(module.lab === 'net-subnet-check' ? 'net-subnet-check' : module.lab === 'net-http-read' ? 'net-http-read' : module.lab === 'net-handshake' ? 'net-handshake' : module.lab === 'net-protocol-match' ? 'net-protocol-match' : module.lab === 'net-firewall-policy' ? 'net-firewall-policy' : module.lab === 'net-device-map' ? 'net-device-map' : module.lab === 'net-route-decision' ? 'net-route-decision' : module.lab === 'net-pcap-triage' ? 'net-pcap-triage' : 'net-layer-sort'); }}>Practice a related concept <Icon name="arrow-right" size={15}/></button></article>)}{visibleNetwork.length === 0 && <div className="systems-empty">No networking modules match these filters.</div>}</div>}

    {track === 'practice' && <div className="systems-practice-layout"><aside className="systems-practice-menu"><div className="systems-list-heading"><span>QUICK CHECKS</span><b>{completed.length}/{practiceExercises.length} complete</b></div>{practiceExercises.map((exercise) => <button key={exercise.id} className={`systems-practice-choice ${activeExercise === exercise.id ? 'is-active' : ''}`} onClick={() => chooseExercise(exercise.id)}><span className={completed.includes(exercise.id) ? 'practice-complete' : ''}>{completed.includes(exercise.id) ? '✓' : '›'}</span><span><b>{exercise.title}</b><small>{exercise.topic}</small></span></button>)}</aside><article className="systems-question-card"><div className="systems-question-kicker"><span className="systems-chip">{currentExercise.topic}</span><span>{completed.length} completed in this session</span></div><h2>{currentExercise.prompt}</h2><div className="systems-answer-options">{currentExercise.options.map((option, index) => <button key={option} className={`systems-answer-option ${selectedAnswer === index ? 'is-selected' : ''} ${selectedAnswer !== null && index === currentExercise.answer ? 'is-correct' : ''}`} onClick={() => { setSelectedAnswer(index); setAnswerChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><button className="button button-primary systems-submit-answer" onClick={submitAnswer} disabled={selectedAnswer === null}>Check answer <Icon name="arrow-right" size={15}/></button>{answerChecked && selectedAnswer !== null && <div className={`systems-feedback ${selectedAnswer === currentExercise.answer ? 'is-correct' : 'is-wrong'}`} role="status"><b>{selectedAnswer === currentExercise.answer ? 'Correct — concept understood.' : 'Not quite. Review the explanation.'}</b><p>{currentExercise.explanation}</p>{selectedAnswer === currentExercise.answer && <button onClick={() => { const next = practiceExercises[(practiceExercises.findIndex((item) => item.id === currentExercise.id) + 1) % practiceExercises.length]; chooseExercise(next.id); }}>Next practice check <Icon name="arrow-right" size={14}/></button>}</div>}<p className="systems-session-note">Completion is tracked in this open page session only. This version does not send answers to a server or save learner profiles.</p></article></div>}

    <div className="systems-next-step"><div><span className="section-kicker">PUT THE FOUNDATION TO WORK</span><h2>Turn concepts into <em>evidence.</em></h2><p>After learning the basics, use a relevant guided lab or notebook to practise with synthetic data and authorized environments.</p></div><button className="button button-primary" onClick={onOpenLabs}>Explore labs & notes <Icon name="arrow-right" size={16}/></button></div>
  </section>;
}
