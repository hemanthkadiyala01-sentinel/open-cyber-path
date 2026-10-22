import { useAuth } from './AuthProvider.jsx';

export default function LearningAccessGate({ destinationLabel = 'this learning workspace', onReturnToDiscovery }) {
  const auth = useAuth();
  const checking = auth.status === 'loading';
  const configured = auth.configured === true;

  return (
    <section className="section-wrap ocp-learning-gate" aria-labelledby="ocp-learning-gate-title">
      <div className="ocp-learning-gate-orbit" aria-hidden="true"><span /><span /><span /></div>
      <div className="ocp-learning-gate-content">
        <span className="ocp-learning-gate-kicker">YOUR LEARNING SPACE</span>
        <h1 id="ocp-learning-gate-title">Learn with a <em>place to continue.</em></h1>
        <p className="ocp-learning-gate-intro">Create a free OpenCyberPath account or sign in to enter {destinationLabel}. Your account is used to keep your module checkpoints with you, so you can return to your learning on another session or device when cloud sync is available.</p>
        <div className="ocp-learning-gate-benefits">
          <div><span aria-hidden="true">01</span><div><b>Resume your path</b><small>Keep your learning checkpoints with your account.</small></div></div>
          <div><span aria-hidden="true">02</span><div><b>Build a learning record</b><small>Track what you have understood, practised, and documented.</small></div></div>
          <div><span aria-hidden="true">03</span><div><b>Keep your data private</b><small>Account progress is protected by authenticated API access.</small></div></div>
        </div>
        {checking && <p className="ocp-learning-gate-status" role="status">Checking your sign-in status…</p>}
        {!configured && !checking && <p className="ocp-learning-gate-warning" role="status">Account sign-in is not configured in this build. You can still explore public paths, resource previews, and cybersecurity basics.</p>}
        {auth.error && <p className="ocp-learning-gate-warning" role="status">Sign-in did not complete. Please try again; your public browsing remains available.</p>}
        {configured && !checking && <div className="ocp-learning-gate-actions">
          <button type="button" className="ocp-account-button ocp-account-button-primary" onClick={() => void auth.login()}>Sign in</button>
          <button type="button" className="ocp-account-button ocp-account-button-secondary" onClick={() => void auth.register()}>Create free account</button>
        </div>}
        <button type="button" className="ocp-learning-gate-return" onClick={onReturnToDiscovery}>Back to public discovery</button>
        <p className="ocp-learning-gate-footnote">Public learning previews remain open. Signing in does not make external courses, labs, or certification exams free; their providers' terms still apply.</p>
      </div>
    </section>
  );
}
