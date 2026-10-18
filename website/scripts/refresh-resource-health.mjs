import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { resources } from '../src/data/resources.js';
import { learningVideos } from '../src/data/learningVideos.js';
import { careerPathLabMap } from '../src/data/careerPathLabs.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(scriptDir, '..');
const outputPath = path.join(websiteDir, 'src', 'data', 'resourceHealth.generated.json');
const timeoutMs = Number(process.env.OCP_LINK_TIMEOUT_MS || 10000);
const concurrency = Math.max(1, Number(process.env.OCP_LINK_CHECK_CONCURRENCY || 8));

function addLink(index, url, entry) {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return;
  let record = index.get(url);
  if (!record) {
    record = { url, entries: [] };
    index.set(url, record);
  }
  if (entry && !record.entries.some((old) => old.id === entry.id && old.title === entry.title)) {
    record.entries.push(entry);
  }
}

function collectLinks() {
  const index = new Map();
  for (const resource of resources) {
    addLink(index, resource.url, { id: resource.id, title: resource.name, type: 'resource', provider: resource.provider || '' });
  }
  for (const video of learningVideos) {
    addLink(index, video.url, { id: video.id, title: video.title, type: 'learning-video', provider: video.creator || '' });
    if (video.officialDocs) {
      addLink(index, video.officialDocs, { id: `${video.id}-official-docs`, title: `${video.title} — official documentation`, type: 'official-reference', provider: video.creator || '' });
    }
  }
  for (const [pathId, entries] of Object.entries(careerPathLabMap)) {
    for (const item of entries || []) {
      addLink(index, item.url, { id: item.id, title: item.displayTitle || item.title, type: 'career-path-exercise', provider: item.provider || pathId });
    }
  }
  const externalLabFile = path.join(websiteDir, 'src', 'components', 'ExternalLabLinks.jsx');
  try {
    const source = awaitReadFileSyncCompat(externalLabFile);
    const matches = source.matchAll(/url\s*:\s*['"](https?:\/\/[^'"]+)['"]/g);
    let n = 0;
    for (const match of matches) {
      n += 1;
      addLink(index, match[1], { id: `external-note-link-${n}`, title: 'External lab companion link', type: 'lab-note-link', provider: 'External training provider' });
    }
  } catch (error) {
    console.warn(`Could not inspect ExternalLabLinks.jsx: ${error.message}`);
  }
  return [...index.values()].sort((a, b) => a.url.localeCompare(b.url));
}

// This file is small; a synchronous read here keeps collection deterministic.
function awaitReadFileSyncCompat(filePath) {
  return readFileSync(filePath, 'utf8');
}

async function probeUrl(url) {
  const startedAt = new Date().toISOString();
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'OpenCyberPath-ResourceHealth/1.0 (+https://github.com/hemanthkadiyala01-sentinel/open-cyber-path)',
        Range: 'bytes=0-0',
        Accept: 'text/html,application/xhtml+xml,application/xml,application/json,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
    // Do not download resource bodies. The result only records HTTP reachability.
    try { await response.body?.cancel(); } catch { /* best effort */ }
    let status = 'review';
    let detail = `HTTP ${response.status}; content and access terms not verified`;
    if (response.status >= 200 && response.status < 400) {
      status = 'healthy';
      detail = response.status === 206 ? 'HTTP range request responded; content not inspected' : `HTTP ${response.status}; content and access terms not verified`;
    } else if (response.status === 404 || response.status === 410) {
      status = 'broken';
      detail = `HTTP ${response.status}; check the provider page manually before removing the entry`;
    } else if (response.status === 401 || response.status === 403 || response.status === 429) {
      status = 'review';
      detail = `HTTP ${response.status}; access restriction or automated-request blocking may apply`;
    } else {
      detail = `HTTP ${response.status}; transient errors, bot protection, or access rules may apply`;
    }
    return { url, status, statusCode: response.status, finalUrl: response.url || url, checkedAt: startedAt, detail };
  } catch (error) {
    return {
      url,
      status: 'review',
      statusCode: null,
      finalUrl: null,
      checkedAt: startedAt,
      detail: error?.name === 'TimeoutError' || error?.name === 'AbortError'
        ? `Timed out after ${timeoutMs} ms; manual review recommended`
        : `Could not confirm reachability (${error?.name || 'network error'}); manual review recommended`
    };
  }
}

async function runPool(items, workerCount, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await worker(items[index]);
      if ((index + 1) % 20 === 0 || index + 1 === items.length) {
        console.log(`Checked ${index + 1}/${items.length} unique external URLs`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, items.length) }, runner));
  return output;
}

const links = collectLinks();
if (!links.length) throw new Error('No external resource URLs were found; refusing to overwrite health data.');
if (process.argv.includes('--collect-only')) {
  console.log(`Collection test passed: ${links.length} unique external URLs across the resource catalogue.`);
  console.log(`Types represented: ${[...new Set(links.flatMap((item) => item.entries.map((entry) => entry.type)))].sort().join(', ')}`);
  process.exit(0);
}
console.log(`Checking ${links.length} unique external resource URLs with concurrency ${concurrency}.`);
const results = await runPool(links, concurrency, async (entry) => ({ ...(await probeUrl(entry.url)), entries: entry.entries }));
const summary = {
  checkedUrls: results.length,
  healthy: results.filter((entry) => entry.status === 'healthy').length,
  broken: results.filter((entry) => entry.status === 'broken').length,
  review: results.filter((entry) => entry.status === 'review').length
};
const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  note: 'HTTP reachability is not proof that the page content is accurate, suitable, or free. 401/403/429 and transient failures are sent for manual review, not labelled broken.',
  summary,
  resources: results.sort((a, b) => a.url.localeCompare(b.url))
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outputPath}`);
console.log(`Health summary: ${summary.healthy} reachable, ${summary.broken} possible broken, ${summary.review} manual review.`);
