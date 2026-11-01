import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './SiteGuideAssistant.css';

const SiteGuideAssistantPanel = lazy(() => import('./SiteGuideAssistant.jsx'));
const POSITION_STORAGE_KEY = 'ocp-guide-assistant-position-v1';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function readSavedPosition() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(POSITION_STORAGE_KEY) || 'null');
    if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) return saved;
  } catch { /* Storage may be unavailable in private or restricted contexts. */ }
  return null;
}

function savePosition(position) {
  try {
    if (position) window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    else window.localStorage.removeItem(POSITION_STORAGE_KEY);
  } catch { /* The assistant remains movable for this session when storage is unavailable. */ }
}

function bottomGuard() {
  const nativeMobile = document.querySelector('.native-app-shell') && window.matchMedia('(max-width: 640px)').matches;
  return nativeMobile ? 84 : 12;
}

function clampLauncherPosition(position, width, height) {
  const pad = 8;
  return {
    left: clamp(position.left, pad, window.innerWidth - width - pad),
    top: clamp(position.top, pad, window.innerHeight - height - bottomGuard()),
  };
}

function makePanelStyle(position, launcherElement) {
  if (!position) return undefined;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const nativeMobile = document.querySelector('.native-app-shell') && viewportWidth <= 640;
  const panelWidth = Math.min(390, Math.max(260, viewportWidth - 24));
  const guard = nativeMobile ? 84 : 12;
  const panelHeight = Math.min(650, Math.max(240, viewportHeight - 24 - guard));
  const launcherRect = launcherElement?.getBoundingClientRect();
  const launcherWidth = launcherRect?.width || 280;
  const launcherHeight = launcherRect?.height || 50;
  const left = clamp(position.left + launcherWidth - panelWidth, 12, viewportWidth - panelWidth - 12);
  let top = position.top - panelHeight - 12;
  if (top < 12) top = position.top + launcherHeight + 12;
  const safeTop = clamp(top, 12, viewportHeight - panelHeight - guard);
  return {
    position: 'fixed',
    left: `${left}px`,
    top: `${safeTop}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${panelWidth}px`,
    height: `${panelHeight}px`,
    maxHeight: `${panelHeight}px`,
  };
}

export default function DeferredSiteGuideAssistant({ onOpenPage = () => {}, onOpenPath = () => {} }) {
  const [opened, setOpened] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [launcherPosition, setLauncherPosition] = useState(() => readSavedPosition());
  const launcherRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const toggleGuide = () => {
    if (opened) {
      setOpened(false);
      return;
    }
    setHasOpened(true);
    setOpened(true);
  };

  const resetPosition = () => {
    setLauncherPosition(null);
    savePosition(null);
  };

  useEffect(() => {
    const clampCurrentPosition = () => {
      const element = launcherRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setLauncherPosition((current) => {
        if (!current) return current;
        const next = clampLauncherPosition(current, rect.width, rect.height);
        savePosition(next);
        return next;
      });
    };
    clampCurrentPosition();
    window.addEventListener('resize', clampCurrentPosition);
    return () => window.removeEventListener('resize', clampCurrentPosition);
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const startingPosition = launcherPosition || { left: rect.left, top: rect.top };
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: startingPosition.left,
      startTop: startingPosition.top,
      moved: false,
      lastPosition: startingPosition,
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture is not required on every webview. */ }
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && (dx * dx + dy * dy) < 36) return;
    drag.moved = true;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const next = clampLauncherPosition({ left: drag.startLeft + dx, top: drag.startTop + dy }, rect.width, rect.height);
    drag.lastPosition = next;
    setLauncherPosition(next);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const rect = launcherRef.current?.getBoundingClientRect();
    const next = clampLauncherPosition(drag.lastPosition, rect?.width || 280, rect?.height || 50);
    setLauncherPosition(next);
    savePosition(next);
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 400);
  };

  const handleLauncherClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    toggleGuide();
  };

  const handleLauncherKeyDown = (event) => {
    if (event.key === 'Home') {
      event.preventDefault();
      resetPosition();
      return;
    }
    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = launcherRef.current?.getBoundingClientRect();
    if (!rect) return;
    const current = launcherPosition || { left: rect.left, top: rect.top };
    const step = event.shiftKey ? 32 : 12;
    const next = clampLauncherPosition({
      left: current.left + direction[0] * step,
      top: current.top + direction[1] * step,
    }, rect.width, rect.height);
    setLauncherPosition(next);
    savePosition(next);
  };

  const launcherStyle = launcherPosition ? {
    left: `${launcherPosition.left}px`,
    top: `${launcherPosition.top}px`,
    right: 'auto',
    bottom: 'auto',
  } : undefined;
  const panelStyle = opened && launcherPosition ? makePanelStyle(launcherPosition, launcherRef.current) : undefined;

  return (
    <div className="ocp-guide-assistant" style={launcherStyle}>
      {hasOpened && (
        <Suspense fallback={opened ? (
          <div className="ocp-guide-panel ocp-guide-loading" style={panelStyle} role="status" aria-live="polite">
            <p>Loading the site guide...</p>
          </div>
        ) : null}>
          <SiteGuideAssistantPanel
            opened={opened}
            hideLauncher
            panelStyle={panelStyle}
            onResetPosition={resetPosition}
            onDismiss={() => setOpened(false)}
            onOpenPage={onOpenPage}
            onOpenPath={onOpenPath}
          />
        </Suspense>
      )}
      <button
        ref={launcherRef}
        className={`ocp-guide-launcher ${opened ? 'is-open' : ''}`}
        type="button"
        aria-expanded={opened}
        aria-controls={opened ? 'ocp-guide-title' : undefined}
        aria-label={opened ? 'Close OpenCyberPath assistant. Drag to move; use arrow keys to reposition; Home resets position.' : 'Ask OpenCyberPath. Drag to move; use arrow keys to reposition; Home resets position.'}
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home"
        title="Drag to move. Arrow keys also move the assistant; Home resets its position."
        onClick={handleLauncherClick}
        onKeyDown={handleLauncherKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="ocp-guide-launcher-mark" aria-hidden="true">{opened ? 'x' : '?'}</span>
        <span>{opened ? 'Close guide' : 'Ask OpenCyberPath'}</span>
      </button>
    </div>
  );
}