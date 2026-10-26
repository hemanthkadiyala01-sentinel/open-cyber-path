import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number.parseInt(process.env.PORT || '8080', 10);
const host = '0.0.0.0';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}
if (!existsSync(resolve(root, 'index.html'))) {
  throw new Error(`Built website not found at ${root}. Run npm run build first.`);
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.webmanifest', 'application/manifest+json'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.mp4', 'video/mp4'],
  ['.pdf', 'application/pdf'],
]);

function sendText(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  response.end(body);
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return sendText(response, 405, 'Method not allowed');
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    return sendText(response, 400, 'Bad request');
  }

  if (pathname === '/healthz') {
    const body = JSON.stringify({ status: 'ok' });
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return response.end(request.method === 'HEAD' ? undefined : body);
  }

  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    return sendText(response, 403, 'Forbidden');
  }

  let filePath = candidate;
  try {
    if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = resolve(filePath, 'index.html');
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      // Vite SPA route fallback: unknown asset paths should still be 404s.
      if (extname(pathname)) return sendText(response, 404, 'Not found');
      filePath = resolve(root, 'index.html');
    }
  } catch {
    return sendText(response, 400, 'Bad request');
  }

  const ext = extname(filePath).toLowerCase();
  const cache = ext && /-[A-Za-z0-9_-]{6,}\./.test(filePath)
    ? 'public, max-age=31536000, immutable'
    : 'no-store';
  const headers = {
    'Content-Type': contentTypes.get(ext) || 'application/octet-stream',
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  let stat;
  try { stat = statSync(filePath); }
  catch { return sendText(response, 404, 'Not found'); }
  headers['Content-Length'] = stat.size;
  response.writeHead(200, headers);
  if (request.method === 'HEAD') return response.end();
  return createReadStream(filePath).on('error', () => {
    if (!response.headersSent) sendText(response, 500, 'File read failed');
    else response.destroy();
  }).pipe(response);
});

server.listen(port, host, () => {
  console.log(`OpenCyberPath staging website listening on ${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
