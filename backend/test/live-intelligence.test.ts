import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createLiveIntelligenceService, type LiveIntelligenceSnapshot } from '../src/live-intelligence.js';

async function makeFixture(t: { after: (fn: () => void | Promise<void>) => void }, generatedAt: string) {
  const root = await mkdtemp(join(tmpdir(), 'opencyberpath-live-intelligence-'));
  const snapshotPath = join(root, 'website', 'public', 'live-case-intelligence.json');
  const refreshScriptPath = join(root, 'tools', 'liveops', 'refresh_live_case_intelligence.py');
  await mkdir(join(root, 'website', 'public'), { recursive: true });
  await mkdir(join(root, 'tools', 'liveops'), { recursive: true });
  await writeFile(refreshScriptPath, '# test-only refresh script\n', 'utf8');
  const snapshot: LiveIntelligenceSnapshot = {
    schemaVersion: 1,
    generatedAt,
    sources: [{ id: 'cert-in', name: 'CERT-In', status: 'ok' }],
    items: [{ id: 'incident-1', title: 'Test incident' }],
  };
  await writeFile(snapshotPath, `${JSON.stringify(snapshot)}\n`, 'utf8');
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, snapshotPath, refreshScriptPath, snapshot };
}

async function waitForSettled(service: ReturnType<typeof createLiveIntelligenceService>) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const result = await service.getSnapshot();
    if (result.ok && result.feed.refreshState.status !== 'refreshing') return result;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  throw new Error('live-intelligence refresh did not settle');
}

test('each page load starts a source check when the cooldown allows, even if the snapshot is recent', async (t) => {
  const current = Date.parse('2026-10-24T12:00:00.000Z');
  const files = await makeFixture(t, new Date(current - 1000).toISOString());
  let runs = 0;
  const service = createLiveIntelligenceService({
    ...files,
    repoRoot: files.root,
    now: () => current,
    snapshotStaleAfterMs: 60_000,
    minimumIntervalMs: 30_000,
    runRefresh: async () => {
      runs += 1;
      const updated: LiveIntelligenceSnapshot = {
        ...files.snapshot,
        generatedAt: new Date(current + 1000).toISOString(),
        items: [{ id: 'incident-latest', title: 'Freshly checked test incident' }],
      };
      await writeFile(files.snapshotPath, `${JSON.stringify(updated)}\n`, 'utf8');
    },
  });
  const initial = await service.getSnapshot();
  assert.equal(initial.ok && initial.feed.refreshState.status, 'refreshing');
  const settled = await waitForSettled(service);
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.feed.items[0]?.id, 'incident-latest');
  assert.equal(settled.feed.refreshState.status, 'fresh');
  assert.equal(runs, 1);
});

test('simultaneous page loads share a single background refresh', async (t) => {
  const current = Date.parse('2026-10-24T12:00:00.000Z');
  const files = await makeFixture(t, new Date(current - 10 * 60_000).toISOString());
  let runs = 0;
  let releaseRefresh!: () => void;
  const gate = new Promise<void>((resolve) => { releaseRefresh = resolve; });
  const service = createLiveIntelligenceService({
    ...files,
    repoRoot: files.root,
    now: () => current,
    snapshotStaleAfterMs: 60_000,
    minimumIntervalMs: 30_000,
    runRefresh: async () => {
      runs += 1;
      await gate;
      const updated: LiveIntelligenceSnapshot = {
        ...files.snapshot,
        generatedAt: new Date(current + 1000).toISOString(),
        items: [{ id: 'incident-2', title: 'Fresh test incident' }],
      };
      await writeFile(files.snapshotPath, `${JSON.stringify(updated)}\n`, 'utf8');
    },
  });
  const first = await service.getSnapshot();
  const second = await service.getSnapshot();
  assert.equal(first.ok && first.feed.refreshState.status, 'refreshing');
  assert.equal(second.ok && second.feed.refreshState.status, 'refreshing');
  assert.equal(runs, 1);
  releaseRefresh();
  const settled = await waitForSettled(service);
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.feed.items[0]?.id, 'incident-2');
  assert.equal(settled.feed.refreshState.status, 'fresh');
});

test('manual refresh is subject to cooldown to prevent provider hammering', async (t) => {
  const current = Date.parse('2026-10-24T12:00:00.000Z');
  const files = await makeFixture(t, new Date(current - 10 * 60_000).toISOString());
  let runs = 0;
  const service = createLiveIntelligenceService({
    ...files,
    repoRoot: files.root,
    now: () => current,
    snapshotStaleAfterMs: 60_000,
    minimumIntervalMs: 30_000,
    runRefresh: async () => {
      runs += 1;
      const updated = { ...files.snapshot, generatedAt: new Date(current).toISOString() };
      await writeFile(files.snapshotPath, `${JSON.stringify(updated)}\n`, 'utf8');
    },
  });
  const result = await service.triggerRefresh();
  assert.equal(result.status, 'refreshing');
  await waitForSettled(service);
  const second = await service.triggerRefresh();
  assert.equal(second.status, 'cooldown');
  assert.ok((second.retryAfterSeconds ?? 0) > 0);
  assert.equal(runs, 1);
});

test('failed upstream refresh preserves and returns the previous snapshot with an error state', async (t) => {
  const current = Date.parse('2026-10-24T12:00:00.000Z');
  const oldGeneratedAt = new Date(current - 10 * 60_000).toISOString();
  const files = await makeFixture(t, oldGeneratedAt);
  const service = createLiveIntelligenceService({
    ...files,
    repoRoot: files.root,
    now: () => current,
    snapshotStaleAfterMs: 60_000,
    minimumIntervalMs: 30_000,
    runRefresh: async () => { throw new Error('simulated source failure'); },
  });
  await service.getSnapshot();
  const settled = await waitForSettled(service);
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.feed.generatedAt, oldGeneratedAt);
  assert.equal(settled.feed.refreshState.status, 'error');
  assert.match(settled.feed.refreshState.lastError ?? '', /simulated source failure/);
  const unchanged = JSON.parse(await readFile(files.snapshotPath, 'utf8')) as LiveIntelligenceSnapshot;
  assert.equal(unchanged.generatedAt, oldGeneratedAt);
});

test('snapshot-only deployment reports that on-demand refresh is unavailable', async (t) => {
  const current = Date.parse('2026-10-24T12:00:00.000Z');
  const files = await makeFixture(t, new Date(current - 10 * 60_000).toISOString());
  const service = createLiveIntelligenceService({
    ...files,
    refreshScriptPath: join(files.root, 'missing-refresh-script.py'),
    now: () => current,
    snapshotStaleAfterMs: 60_000,
    minimumIntervalMs: 30_000,
  });
  const result = await service.getSnapshot();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.feed.refreshState.status, 'snapshot-only');
  assert.equal(result.feed.items.length, 1);
});
