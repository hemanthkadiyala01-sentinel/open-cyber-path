import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteRoot = resolve(scriptDir, '..');
const dataPath = resolve(websiteRoot, 'src/data/certifications.js');
const reportPath = resolve(websiteRoot, 'public/data/certification-source-status.json');
const maxBodyBytes = 120_000;
const concurrency = 4;
const timeoutMs = 15_000;

const readText = (path) => readFile(path, 'utf8');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const decodeSmallEntities = (value) => value
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function readPreviousReport() {
  try { return JSON.parse(await readText(reportPath)); }
  catch { return { sources: [] }; }
}

function getSourceUrls(sourceText) {
  const matches = [...sourceText.matchAll(/\b(?:officialUrl|syllabusUrl|prepUrl|url)\s*:\s*'((?:https?):\/\/[^']+)'/g)];
  const unique = new Map();
  for (const match of matches) {
    try {
      const parsed = new URL(match[1]);
      parsed.hash = '';
      if (parsed.protocol !== 'https:') continue;
      unique.set(parsed.toString(), parsed.toString());
    } catch { /* Invalid source values are covered by the static data checker. */ }
  }
  return [...unique.values()].sort();
}

async function readLimitedBody(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let result = '';
  while (size < maxBodyBytes) {
    const { value, done } = await reader.read();
    if (done) break;
    const allowed = value.subarray(0, Math.max(0, maxBodyBytes - size));
    result += decoder.decode(allowed, { stream: true });
    size += allowed.byteLength;
    if (allowed.byteLength < value.byteLength) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  result += decoder.decode();
  return result;
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  return match ? decodeSmallEntities(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 180) : '';
}

function textFingerprintInput(html, title, etag, lastModified) {
  const visible = decodeSmallEntities(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()).slice(0, 6_000);
  // Fingerprinting is only a change signal, never a parsed claim about cost or enrollment status.
  return `${title}\n${visible}`;
}

async function checkOne(url, prior) {
  const checkedAt = new Date().toISOString();
  let pageState = 'unreachable';
  let statusCode = null;
  let title = '';
  let etag = null;
  let lastModified = null;
  let contentFingerprint = null;
  let error = null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'user-agent': 'OpenCyberPath-Official-Source-Monitor/1.0 (+https://github.com/hemanthkadiyala01-sentinel/open-cyber-path)',
        'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
      },
    });
    statusCode = response.status;
    etag = response.headers.get('etag');
    lastModified = response.headers.get('last-modified');
    const html = await readLimitedBody(response);
    title = extractTitle(html);
    if (response.ok || (response.status >= 300 && response.status < 400)) pageState = 'reachable';
    else if ([401, 403, 406, 429].includes(response.status)) pageState = 'blocked';
    else pageState = 'unreachable';
    if (pageState === 'reachable') contentFingerprint = hash(textFingerprintInput(html, title, etag, lastModified));
  } catch (cause) {
    pageState = 'unreachable';
    error = cause instanceof Error ? cause.message.slice(0, 220) : 'Unknown network error';
  }

  const changedThisRun = Boolean(prior?.contentFingerprint && contentFingerprint && prior.contentFingerprint !== contentFingerprint && prior.reviewedFingerprint !== contentFingerprint);
  const reviewRequired = Boolean(contentFingerprint && prior?.reviewRequired && contentFingerprint !== prior.reviewedFingerprint) || changedThisRun;
  const transitionedToProblem = Boolean(prior && prior.pageState === 'reachable' && pageState !== 'reachable');
  const recovered = Boolean(prior && prior.pageState !== 'reachable' && pageState === 'reachable');
  const firstCheckProblem = !prior && pageState !== 'reachable';
  const alertThisRun = changedThisRun || transitionedToProblem || recovered || firstCheckProblem;
  const finalUrl = url;
  let host = url;
  try { host = new URL(url).hostname; } catch { /* validated upstream */ }

  return {
    url: finalUrl,
    host,
    checkedAt,
    pageState,
    statusCode,
    title,
    etag,
    lastModified,
    contentFingerprint,
    reviewedFingerprint: prior?.reviewedFingerprint || null,
    reviewRequired,
    changedThisRun,
    alertThisRun,
    error,
    lastStateChangeAt: alertThisRun ? checkedAt : (prior?.lastStateChangeAt || null),
    note: pageState === 'reachable'
      ? (reviewRequired ? 'Public page fingerprint changed; verify exam details manually.' : 'Public page responded; booking availability has not been checked.')
      : pageState === 'blocked'
        ? 'The provider blocked or rate-limited the automated check; open the official page manually.'
        : 'The public page could not be verified from this run; this is not proof that an exam is closed.',
  };
}

async function runPool(items, worker, limit) {
  const output = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return output;
}

const sourceText = await readText(dataPath);
const urls = getSourceUrls(sourceText);
if (urls.length < 10) throw new Error(`Expected at least 10 official https source URLs; found ${urls.length}. Check the source extraction pattern.`);
const previous = await readPreviousReport();
const priorByUrl = new Map((previous.sources || []).map((item) => [item.url, item]));
const sources = await runPool(urls, (url) => checkOne(url, priorByUrl.get(url)), concurrency);
const generatedAt = new Date().toISOString();
const alertSources = sources.filter((source) => source.alertThisRun);
const summary = {
  checked: sources.length,
  reachable: sources.filter((source) => source.pageState === 'reachable').length,
  needsReview: sources.filter((source) => source.reviewRequired || source.pageState !== 'reachable').length,
  alertsThisRun: alertSources.length,
};
const report = {
  schemaVersion: 1,
  status: 'ready',
  generatedAt,
  sourceCount: sources.length,
  summary,
  sources,
  notice: 'A reachable page is not evidence that exam registration, a voucher promotion, or a seat is available. Fingerprint changes require a human review of the official provider page.',
};
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (process.env.GITHUB_OUTPUT) {
  const lines = [`has_alerts=${alertSources.length > 0}`, `alert_count=${alertSources.length}`, `checked_count=${sources.length}`];
  await appendFile(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`, 'utf8');
}

console.log(`Official source monitor complete: ${summary.checked} checked; ${summary.reachable} responded; ${summary.needsReview} need review; ${summary.alertsThisRun} new alerts.`);
for (const source of alertSources) console.log(`ALERT ${source.pageState} ${source.url}${source.changedThisRun ? ' (page fingerprint changed)' : ''}`);
console.log(`Report written: ${reportPath}`);
