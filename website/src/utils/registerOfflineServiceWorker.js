// Register only on localhost or secure origins, as required by the browser platform.
// Registration is intentionally non-blocking: OpenCyberPath remains usable if it fails.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}service-worker.js`, { scope: base })
      .then((registration) => registration.update().catch(() => {}))
      .catch((error) => console.info('OpenCyberPath offline cache was not enabled:', error));
  }, { once: true });
}
