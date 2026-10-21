/* OpenCyberPath Offline Learning v1. Caches only same-origin successful GET responses. */
const CACHE_PREFIX = 'opc-offline-learning-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v1`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v1`;
const APP_SCOPE = self.registration.scope;
const INDEX_URL = new URL('index.html', APP_SCOPE).href;
const ROOT_URL = APP_SCOPE;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    for (const url of [ROOT_URL, INDEX_URL]) {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) await cache.put(url, response.clone());
      } catch { /* A fresh offline install may not have a network; try again next load. */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

function inScope(url) {
  return url.origin === self.location.origin && url.href.startsWith(APP_SCOPE);
}

async function saveResponse(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.toLowerCase().includes('text/html');
      const isDownload = /\.(?:pdf|docx?|csv|json|txt|zip|xlsx?)(?:$|\?)/i.test(new URL(request.url).pathname + new URL(request.url).search);
      if (isHtml) {
        const cache = await caches.open(SHELL_CACHE);
        await cache.put(request, response.clone());
        await cache.put(ROOT_URL, response.clone());
      } else if (isDownload) {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    return (await caches.match(request))
      || (await caches.match(ROOT_URL))
      || (await caches.match(INDEX_URL))
      || new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font:16px system-ui;max-width:680px;margin:10vh auto;padding:24px"><h1>OpenCyberPath is offline</h1><p>This page was not cached yet. Reconnect and open it once, or use your downloaded standalone offline study pack.</p></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!inScope(url) || url.pathname.endsWith('/service-worker.js')) return;
  // Do not cache Vite dev/HMR source modules; cache-first behaviour could make hot reload stale.
  if (url.searchParams.has('t') || url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/@id/') || url.pathname.startsWith('/node_modules/') || url.pathname.startsWith('/src/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  const cacheableAsset = ['script', 'style', 'image', 'font'].includes(request.destination)
    || /\.(?:js|mjs|css|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|pdf|docx?|csv|json|txt|zip|xlsx?)(?:$|\?)/i.test(url.pathname + url.search);
  if (!cacheableAsset) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      await saveResponse(request, response);
      return response;
    } catch {
      return new Response('This file is not cached yet. Reconnect and visit this page once.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  event.waitUntil((async () => {
    let cached = 0;
    const uniqueUrls = [...new Set(event.data.urls)].slice(0, 100);
    const cache = await caches.open(RUNTIME_CACHE);
    await Promise.all(uniqueUrls.map(async (candidate) => {
      try {
        const url = new URL(candidate, APP_SCOPE);
        if (!inScope(url) || url.pathname.endsWith('/service-worker.js')) return;
        if (url.searchParams.has('t') || url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/@id/') || url.pathname.startsWith('/node_modules/') || url.pathname.startsWith('/src/')) return;
        const request = new Request(url.href, { method: 'GET', credentials: 'same-origin' });
        const existing = await cache.match(request) || await caches.match(request);
        if (existing) { cached += 1; return; }
        const response = await fetch(request);
        if (response.ok && response.type !== 'opaque') { await cache.put(request, response.clone()); cached += 1; }
      } catch { /* Skip one inaccessible asset without failing the whole operation. */ }
    }));
    event.ports?.[0]?.postMessage({ ok: true, requested: uniqueUrls.length, cached });
  })());
});
