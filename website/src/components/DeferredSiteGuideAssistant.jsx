import { lazy, Suspense, useState } from 'react';
import './SiteGuideAssistant.css';

const SiteGuideAssistantPanel = lazy(() => import('./SiteGuideAssistant.jsx'));

export default function DeferredSiteGuideAssistant({ onOpenPage = () => {}, onOpenPath = () => {} }) {
  const [opened, setOpened] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const toggleGuide = () => {
    if (opened) {
      setOpened(false);
      return;
    }
    setHasOpened(true);
    setOpened(true);
  };

  return (
    <div className="ocp-guide-assistant">
      {hasOpened && (
        <Suspense fallback={opened ? (
          <div className="ocp-guide-panel ocp-guide-loading" role="status" aria-live="polite">
            <p>Loading the site guide...</p>
          </div>
        ) : null}>
          <SiteGuideAssistantPanel
            opened={opened}
            hideLauncher
            onDismiss={() => setOpened(false)}
            onOpenPage={onOpenPage}
            onOpenPath={onOpenPath}
          />
        </Suspense>
      )}
      <button
        className={`ocp-guide-launcher ${opened ? 'is-open' : ''}`}
        type="button"
        aria-expanded={opened}
        aria-controls={opened ? 'ocp-guide-title' : undefined}
        onClick={toggleGuide}
      >
        <span className="ocp-guide-launcher-mark" aria-hidden="true">{opened ? 'x' : '?'}</span>
        <span>{opened ? 'Close guide' : 'Ask OpenCyberPath'}</span>
      </button>
    </div>
  );
}