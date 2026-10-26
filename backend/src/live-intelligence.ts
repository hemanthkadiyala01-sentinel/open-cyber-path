import { execFile as execFileCallback } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type FeedSource = { id?: string; name?: string; status?: string; [key: string]: unknown };
type FeedItem = { id?: string; [key: string]: unknown };
export type LiveIntelligenceSnapshot = {
  schemaVersion?: number;
  generatedAt?: string;
  sources: FeedSource[];
  items: FeedItem[];
  [key: string]: unknown;
};
export type LiveRefreshStatus = 'fresh' | 'partial' | 'refreshing' | 'stale' | 'error' | 'snapshot-only' | 'cooldown';
export type LiveRefreshState = {
  status: LiveRefreshStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  snapshotStaleAfterSeconds: number;
  retryAfterSeconds?: number;
};
export type LiveIntelligenceResponse = LiveIntelligenceSnapshot & { refreshState: LiveRefreshState };

export type LiveIntelligenceServiceOptions = {
  repoRoot?: string | null;
  snapshotPath?: string | null;
  refreshScriptPath?: string | null;
  now?: () => number;
  snapshotStaleAfterMs?: number;
  minimumIntervalMs?: number;
  refreshTimeoutMs?: number;
  pythonCommand?: string;
  runRefresh?: () => Promise<void>;
};

type ServicePaths = { repoRoot: string | null; snapshotPath: string | null; refreshScriptPath: string | null };
type RefreshResult = { status: LiveRefreshStatus; retryAfterSeconds?: number };

const DEFAULT_SNAPSHOT_STALE_AFTER_MS = 5 * 60 * 1000;
const DEFAULT_MINIMUM_INTERVAL_MS = 3 * 60 * 1000;
const DEFAULT_REFRESH_TIMEOUT_MS = 150 * 1000;

function findRepositoryRoot(moduleUrl: string): string | null {
  const starts = [dirname(fileURLToPath(moduleUrl)), process.cwd()];
  const seen = new Set<string>();
  for (const start of starts) {
    let current = resolve(start);
    for (let depth = 0; depth < 7; depth += 1) {
      if (seen.has(current)) break;
      seen.add(current);
      const script = join(current, 'tools', 'liveops', 'refresh_live_case_intelligence.py');
      const snapshot = join(current, 'website', 'public', 'live-case-intelligence.json');
      if (existsSync(script) && existsSync(snapshot)) return current;
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function resolvePaths(moduleUrl: string, options: LiveIntelligenceServiceOptions): ServicePaths {
  const envRoot = process.env.LIVE_INTELLIGENCE_REPO_ROOT?.trim();
  const repoRoot = options.repoRoot === undefined
    ? (envRoot ? resolve(envRoot) : findRepositoryRoot(moduleUrl))
    : options.repoRoot;
  const snapshotPath = options.snapshotPath ?? (repoRoot ? join(repoRoot, 'website', 'public', 'live-case-intelligence.json') : null);
  const refreshScriptPath = options.refreshScriptPath ?? (repoRoot ? join(repoRoot, 'tools', 'liveops', 'refresh_live_case_intelligence.py') : null);
  return { repoRoot, snapshotPath, refreshScriptPath };
}

function executeFile(command: string, args: string[], options: { cwd: string; timeout: number; maxBuffer: number }): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    execFileCallback(command, args, { ...options, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || error.message || 'refresh process failed').trim().slice(-1800);
        rejectPromise(new Error(detail || 'refresh process failed'));
        return;
      }
      resolvePromise({ stdout: String(stdout ?? ''), stderr: String(stderr ?? '') });
    });
  });
}

function cleanError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown refresh error');
  return message.replace(/[\r\n\t]+/g, ' ').slice(0, 500);
}

export function createLiveIntelligenceService(options: LiveIntelligenceServiceOptions = {}) {
  const paths = resolvePaths(import.meta.url, options);
  const now = options.now ?? Date.now;
  const requestedStaleAfter = options.snapshotStaleAfterMs ?? Number(process.env.LIVE_INTELLIGENCE_STALE_AFTER_MS);
  const requestedMinimumInterval = options.minimumIntervalMs ?? Number(process.env.LIVE_INTELLIGENCE_MIN_REFRESH_INTERVAL_MS);
  const snapshotStaleAfterMs = Number.isFinite(requestedStaleAfter) && requestedStaleAfter > 0
    ? Math.max(30_000, requestedStaleAfter)
    : DEFAULT_SNAPSHOT_STALE_AFTER_MS;
  const minimumIntervalMs = Number.isFinite(requestedMinimumInterval) && requestedMinimumInterval > 0
    ? Math.max(30_000, requestedMinimumInterval)
    : DEFAULT_MINIMUM_INTERVAL_MS;
  const refreshTimeoutMs = Math.max(10_000, options.refreshTimeoutMs ?? DEFAULT_REFRESH_TIMEOUT_MS);
  const pythonCommand = options.pythonCommand ?? process.env.LIVE_INTELLIGENCE_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');

  let inFlight: Promise<void> | null = null;
  let lastAttemptAt: number | null = null;
  let lastSuccessAt: number | null = null;
  let lastError: string | null = null;

  async function readSnapshot(): Promise<LiveIntelligenceSnapshot> {
    if (!paths.snapshotPath) throw new Error('snapshot path is not configured');
    const raw = await readFile(paths.snapshotPath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('feed snapshot is not an object');
    const snapshot = parsed as Partial<LiveIntelligenceSnapshot>;
    if (!Array.isArray(snapshot.items) || !Array.isArray(snapshot.sources)) throw new Error('feed snapshot schema is invalid');
    return snapshot as LiveIntelligenceSnapshot;
  }

  function runRefreshProcess(): Promise<void> {
    if (options.runRefresh) return options.runRefresh();
    if (!paths.repoRoot || !paths.refreshScriptPath || !existsSync(paths.refreshScriptPath)) {
      return Promise.reject(new Error('live source refresh is unavailable in this runtime; serve the scheduled snapshot instead'));
    }
    return executeFile(pythonCommand, [paths.refreshScriptPath, '--output', paths.snapshotPath!], {
      cwd: paths.repoRoot,
      timeout: refreshTimeoutMs,
      maxBuffer: 2 * 1024 * 1024,
    }).then(async () => {
      // A successful process exit is not enough: verify that it wrote a parseable snapshot.
      const updated = await readSnapshot();
      const timestamp = Date.parse(String(updated.generatedAt ?? ''));
      if (!Number.isFinite(timestamp)) throw new Error('refresh produced a snapshot without a valid generatedAt timestamp');
      lastSuccessAt = timestamp;
    });
  }

  function startRefresh(): boolean {
    if (inFlight || !paths.snapshotPath || !paths.refreshScriptPath || !paths.repoRoot) return false;
    lastAttemptAt = now();
    lastError = null;
    const task = Promise.resolve().then(async () => {
      try {
        await runRefreshProcess();
      } catch (error) {
        lastError = cleanError(error);
      } finally {
        inFlight = null;
      }
    });
    inFlight = task;
    return true;
  }

  function buildState(snapshot: LiveIntelligenceSnapshot, forcedStatus?: LiveRefreshStatus, retryAfterSeconds?: number): LiveRefreshState {
    const timestamp = Date.parse(String(snapshot.generatedAt ?? ''));
    const age = Number.isFinite(timestamp) ? now() - timestamp : Number.POSITIVE_INFINITY;
    const unhealthy = snapshot.sources.some((source) => source.status === 'stale' || source.status === 'error');
    let status: LiveRefreshStatus;
    if (forcedStatus) status = forcedStatus;
    else if (inFlight) status = 'refreshing';
    else if (!paths.refreshScriptPath || !existsSync(paths.refreshScriptPath)) status = 'snapshot-only';
    else if (lastError) status = 'error';
    else if (age >= snapshotStaleAfterMs) status = 'stale';
    else if (unhealthy) status = 'partial';
    else status = 'fresh';
    return {
      status,
      lastAttemptAt: lastAttemptAt === null ? null : new Date(lastAttemptAt).toISOString(),
      lastSuccessAt: lastSuccessAt === null ? (Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null) : new Date(lastSuccessAt).toISOString(),
      lastError,
      snapshotStaleAfterSeconds: Math.round(snapshotStaleAfterMs / 1000),
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    };
  }

  async function getSnapshot(): Promise<{ ok: true; feed: LiveIntelligenceResponse } | { ok: false; error: string }> {
    let snapshot: LiveIntelligenceSnapshot;
    try {
      snapshot = await readSnapshot();
    } catch (error) {
      return { ok: false, error: cleanError(error) };
    }
    if ((!paths.repoRoot || !paths.refreshScriptPath || (!options.runRefresh && !existsSync(paths.refreshScriptPath))) && !inFlight) {
      return { ok: true, feed: { ...snapshot, refreshState: buildState(snapshot, 'snapshot-only') } };
    }
    // Every page-load request can ask for a new source check, but only when the
    // per-process cooldown has elapsed. Repeated refreshes cannot hammer providers.
    const cooldownPassed = lastAttemptAt === null || now() - lastAttemptAt >= minimumIntervalMs;
    if (!inFlight && cooldownPassed) startRefresh();
    return { ok: true, feed: { ...snapshot, refreshState: buildState(snapshot) } };
  }

  async function triggerRefresh(): Promise<RefreshResult> {
    if (!paths.snapshotPath || !paths.refreshScriptPath || !paths.repoRoot || (!options.runRefresh && !existsSync(paths.refreshScriptPath))) {
      return { status: 'snapshot-only' };
    }
    if (inFlight) return { status: 'refreshing' };
    const timeSinceAttempt = lastAttemptAt === null ? Number.POSITIVE_INFINITY : now() - lastAttemptAt;
    if (timeSinceAttempt < minimumIntervalMs) {
      return { status: 'cooldown', retryAfterSeconds: Math.ceil((minimumIntervalMs - timeSinceAttempt) / 1000) };
    }
    startRefresh();
    return { status: inFlight ? 'refreshing' : 'error' };
  }

  return { getSnapshot, triggerRefresh };
}
