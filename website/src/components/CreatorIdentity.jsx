const PROFILE_LINKS = {
  linkedin: 'https://www.linkedin.com/in/hemanth-kadiyala-8611a8358/',
  github: 'https://github.com/hemanthkadiyala01-sentinel',
  openCyberPath: 'https://github.com/hemanthkadiyala01-sentinel/open-cyber-path',
  linuxLab: 'https://github.com/hemanthkadiyala01-sentinel/linux-os-fundamentals',
};

function ExternalProfileLink({ href, children, primary = false }) {
  return (
    <a
      className={`nyxovar-link${primary ? ' nyxovar-link-primary' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}<span aria-hidden="true"> ↗</span>
    </a>
  );
}

export default function CreatorIdentity() {
  return (
    <section className="section-wrap nyxovar-page" aria-labelledby="nyxovar-page-title">
      <header className="nyxovar-hero">
        <img
          className="nyxovar-eclipse-image"
          src="/images/nyxovar-eclipse.png"
          alt="The NYXOVAR eclipse artwork: a dark sphere edged by a thin blue-white glow across a black horizon."
          fetchPriority="high"
        />
        <div className="nyxovar-hero-shade" aria-hidden="true" />
        <div className="nyxovar-hero-content">
          <span className="nyxovar-eyebrow">PERSONAL TECHNICAL IDENTITY / 01</span>
          <h1 id="nyxovar-page-title">NYXOVAR</h1>
          <p className="nyxovar-motto">OBSERVE. VERIFY. BUILD.</p>
          <p className="nyxovar-hero-note">A personal identity built around evidence, technical work, and continuous learning.</p>
          <a className="nyxovar-jump-link" href="#nyxovar-story">Meet the creator <span aria-hidden="true">↓</span></a>
        </div>
        <div className="nyxovar-hero-signature" aria-label="Creator name and field">
          <span>HEMANTH KADIYALA</span>
          <span>CYBERSECURITY · BUILD LOG</span>
        </div>
      </header>

      <section className="nyxovar-story-panel" id="nyxovar-story" aria-labelledby="nyxovar-story-title">
        <div className="nyxovar-section-kicker">ABOUT THE CREATOR</div>
        <div className="nyxovar-story-grid">
          <div className="nyxovar-story-heading">
            <p className="nyxovar-name-line">Hemanth Kadiyala <span>/ NYXOVAR</span></p>
            <h2 id="nyxovar-story-title">Learning by building. Improving through evidence.</h2>
          </div>
          <div className="nyxovar-bio">
            <p>I’m a B.Tech Cybersecurity student learning by building things, testing them, and figuring out why they work—or why they don’t.</p>
            <p>My current focus is OpenCyberPath, a project I’m building to make cybersecurity learning easier to navigate through career roadmaps, certifications, learning resources, and practical exercises.</p>
            <p>I’m also working on Linux fundamentals and defensive-security labs, exploring system monitoring, Windows telemetry, Wazuh, and evidence-based investigation.</p>
            <p>I’d rather document what I’ve tested, understand what the evidence actually shows, and improve the parts that aren’t good enough yet than claim expertise I haven’t earned.</p>
          </div>
        </div>
        <div className="nyxovar-values" aria-label="Working principles">
          <div><span>01</span><strong>Observe</strong><small>Look carefully before drawing conclusions.</small></div>
          <div><span>02</span><strong>Verify</strong><small>Check claims against evidence and sources.</small></div>
          <div><span>03</span><strong>Build</strong><small>Turn learning into useful, testable work.</small></div>
        </div>
      </section>

      <section className="nyxovar-work-section" aria-labelledby="nyxovar-work-title">
        <div className="nyxovar-section-heading">
          <div className="nyxovar-section-kicker">WORK IN PROGRESS</div>
          <h2 id="nyxovar-work-title">Projects over claims.</h2>
          <p>These are places to inspect the work, documentation, and changes—not just a list of skills.</p>
        </div>
        <div className="nyxovar-project-grid">
          <article className="nyxovar-project-card">
            <div className="nyxovar-project-index">PROJECT / 01</div>
            <h3>OpenCyberPath</h3>
            <p>A cybersecurity learning platform connecting career roadmaps, certification preparation, free learning resources, and hands-on exercises.</p>
            <ExternalProfileLink href={PROFILE_LINKS.openCyberPath} primary>View source repository</ExternalProfileLink>
          </article>
          <article className="nyxovar-project-card">
            <div className="nyxovar-project-index">PROJECT / 02</div>
            <h3>Linux OS Fundamentals &amp; Defensive Security Lab</h3>
            <p>An evidence-first lab project exploring Linux foundations, endpoint telemetry, Wazuh, threat hunting, investigation, and detection engineering.</p>
            <ExternalProfileLink href={PROFILE_LINKS.linuxLab} primary>View lab repository</ExternalProfileLink>
          </article>
        </div>
      </section>

      <section className="nyxovar-connect-panel" aria-labelledby="nyxovar-connect-title">
        <div>
          <div className="nyxovar-section-kicker">CONNECT / FOLLOW THE WORK</div>
          <h2 id="nyxovar-connect-title">The identity is public. The evidence is inspectable.</h2>
          <p>Follow my learning progress on LinkedIn or explore the projects and source code on GitHub.</p>
        </div>
        <div className="nyxovar-connect-actions">
          <ExternalProfileLink href={PROFILE_LINKS.linkedin} primary>LinkedIn profile</ExternalProfileLink>
          <ExternalProfileLink href={PROFILE_LINKS.github}>GitHub profile</ExternalProfileLink>
        </div>
      </section>
      <p className="nyxovar-accuracy-note">This profile describes current learning and project work. Project scope and capabilities should be judged from their public repositories and documentation.</p>
    </section>
  );
}
