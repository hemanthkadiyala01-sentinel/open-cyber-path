#!/usr/bin/env node
/**
 * Dependency-free quality gate for OpenCyberPath's learning journeys.
 * Run from website/: node scripts/verify-learning-journey.mjs
 * This is a static integration check; it does not pretend to replace real-browser testing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const src = path.join(root, 'src');
const errors = [];
const warnings = [];
const pass = [];
const warn = (message) => warnings.push(message);
const fail = (message) => errors.push(message);
const ok = (message) => pass.push(message);
const read = (relative) => {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
};
const uniqueIds = (items, label) => {
  const ids = new Set();
  for (const item of items) {
    if (!item?.id) fail(`${label}: item missing id`);
    else if (ids.has(item.id)) fail(`${label}: duplicate id ${item.id}`);
    else ids.add(item.id);
  }
  return ids;
};
const validHttps = (url, label) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') fail(`${label}: non-HTTPS URL ${url}`);
    return parsed;
  } catch {
    fail(`${label}: invalid URL ${String(url)}`);
    return null;
  }
};
const importData = async (name) => {
  const file = path.join(src, 'data', name);
  if (!fs.existsSync(file)) return null;
  return import(pathToFileURL(file).href);
};

const app = read('src/App.jsx');
const workbench = read('src/components/InteractiveLabWorkbench.jsx');
const workbenchCss = read('src/components/InteractiveLabWorkbench.css');
if (!app) fail('src/App.jsx missing');
if (!workbench) fail('InteractiveLabWorkbench.jsx missing');
if (!workbenchCss) fail('InteractiveLabWorkbench.css missing');

if (app && workbench) {
  if (!app.includes("const InteractiveLabWorkbench = lazy(() => import('./components/InteractiveLabWorkbench.jsx'))")) {
    fail('InteractiveLabWorkbench is not lazy-loaded from App.jsx');
  } else ok('InteractiveLabWorkbench is lazy-loaded');
  if (app.includes("import InteractiveLabWorkbench from './components/InteractiveLabWorkbench.jsx';")) {
    fail('App.jsx still statically imports InteractiveLabWorkbench');
  }
  const workbenchRenderIndex = app.indexOf('<InteractiveLabWorkbench />');
  const suspenseOpenIndex = workbenchRenderIndex >= 0 ? app.lastIndexOf('<Suspense', workbenchRenderIndex) : -1;
  const suspenseCloseBeforeIndex = workbenchRenderIndex >= 0 ? app.lastIndexOf('</Suspense>', workbenchRenderIndex) : -1;
  const suspenseCloseAfterIndex = suspenseOpenIndex >= 0 ? app.indexOf('</Suspense>', workbenchRenderIndex) : -1;
  const suspenseBlock = suspenseOpenIndex >= 0 && suspenseCloseAfterIndex > workbenchRenderIndex
    ? app.slice(suspenseOpenIndex, suspenseCloseAfterIndex) : '';
  if (workbenchRenderIndex < 0 || suspenseOpenIndex < suspenseCloseBeforeIndex || suspenseCloseAfterIndex < 0 || !suspenseBlock.includes('fallback=')) {
    fail('InteractiveLabWorkbench route has no visible Suspense fallback');
  } else ok('Workbench route has a loading fallback');
  for (const marker of [
    "const WORKBENCH_STORAGE_KEY = 'open-cyber-path-workbench-progress-v1';",
    'window.localStorage.getItem(WORKBENCH_STORAGE_KEY)',
    'window.localStorage.setItem(WORKBENCH_STORAGE_KEY',
    'notesByMission',
    'onClick={clearLocalProgress}',
    'aria-label="Evidence note for current mission"',
    'role="status" aria-live="polite"',
    'Fictional fixture data',
    'no shell execution',
  ]) {
    if (!workbench.includes(marker)) fail(`Workbench missing expected progress/safety/accessibility marker: ${marker}`);
  }
  if (/localStorage\.setItem\([^,]+,\s*JSON\.stringify\(\{[\s\S]{0,250}consoleLines/.test(workbench)) {
    fail('Terminal console history appears to be persisted; only completion and notes should be saved locally');
  }
  if (!workbenchCss.includes(':focus-visible')) fail('Workbench stylesheet has no visible keyboard-focus treatment');
  if (workbenchCss.includes('/* OpenCyberPath reliability patch: keyboard focus and local-save controls */')) ok('Keyboard focus styling added');
  if (workbench.includes('localStorage')) ok('Local-only progress persistence is wired');
}

const [pathsModule, labsModule, videosModule, resourcesModule, pathLabsModule] = await Promise.all([
  importData('careerPaths.js'), importData('labs.js'), importData('learningVideos.js'), importData('resources.js'), importData('careerPathLabs.js'),
]);
const paths = pathsModule?.careerPaths || [];
const labs = labsModule?.labs || [];
const videos = videosModule?.learningVideos || [];
const resources = resourcesModule?.resources || [];
const pathLabs = pathLabsModule?.careerPathLabMap || null;

if (!paths.length) fail('careerPaths.js is missing or contains no career paths');
if (paths.length) {
  uniqueIds(paths, 'career paths');
  const pathIds = new Set(paths.map((p) => p.id));
  let moduleCount = 0;
  let coveredModules = 0;
  for (const route of paths) {
    if (!route.title || !Array.isArray(route.modules) || route.modules.length === 0) fail(`Career path ${route.id} has no sequenced modules`);
    moduleCount += route.modules?.length || 0;
    const matchedVideos = videos.filter((video) => (video.careerPathIds || []).includes(route.id));
    if (videos.some((video) => Array.isArray(video.careerPathIds)) && matchedVideos.length === 0) warn(`No entries in learningVideos.js map directly to career path ${route.id}; check the separate career video component.`);
    if (pathLabs) {
      const entries = pathLabs[route.id] || [];
      if (!entries.length) fail(`Career path ${route.id} has no mapped lab recommendations`);
      const missingModuleMappings = [];
      for (const module of route.modules || []) {
        if (entries.some((item) => item.module === module.title)) coveredModules += 1;
        else missingModuleMappings.push(module.title);
      }
      if (missingModuleMappings.length) {
        warn(`Career path ${route.id} has ${missingModuleMappings.length} module(s) without a mapped external practice recommendation: ${missingModuleMappings.join('; ')}`);
      }
      for (const item of entries) {
        if (!route.modules.some((module) => module.title === item.module)) fail(`Lab ${item.id} points to a missing module ${route.id}/${item.module}`);
        const url = validHttps(item.url, `career path lab ${item.id}`);
        if (!item.title || !item.provider || !item.providerTask || !item.format || !item.access || !item.linkLabel || !item.objective) fail(`Career path lab ${item.id} has incomplete display/access metadata`);
        const standaloneTrainingApps = new Set(['ethernaut.openzeppelin.com', 'gandalf.lakera.ai']);
        if (url && /exact lab|exact challenge/i.test(item.linkLabel) && !standaloneTrainingApps.has(url.hostname) && (
          url.pathname === '/' || /\/(blue-team-labs|challenges|practice|programs|catalogue|catalog|labs|wargames)\/?$/i.test(url.pathname)
        )) fail(`Lab ${item.id} is labelled as an exact exercise but points at a broad directory: ${item.url}`);
        if (url && /challenge list|catalogue|catalog|program page|training program/i.test(item.linkLabel)) warn(`Manual destination check required for ${item.id}: ${item.linkLabel} -> ${item.url}`);
      }
    }
  }
  console.log(`Career paths: ${paths.length}; path modules: ${moduleCount}`);
  if (pathLabs) console.log(`Path lab recommendations: ${Object.values(pathLabs).reduce((n, entries) => n + entries.length, 0)}; modules with mapped lab recommendations: ${coveredModules}/${moduleCount}`);
  else warn('careerPathLabs.js not present; external path-lab mapping checks skipped (install the external-lab quality upgrade first).');
}

if (labs.length) {
  uniqueIds(labs, 'labs/notes');
  const publicRoot = path.join(root, 'public');
  for (const lab of labs) {
    for (const field of ['pdf', 'docx', 'dataset', 'script', 'worksheet']) {
      if (!lab[field]) continue;
      const relative = String(lab[field]).replace(/^\/+/, '');
      const file = path.resolve(publicRoot, relative);
      if (!file.startsWith(publicRoot + path.sep)) fail(`Lab ${lab.id} points outside public/: ${lab[field]}`);
      else if (!fs.existsSync(file)) fail(`Lab ${lab.id} links to missing ${field}: ${lab[field]}`);
    }
  }
  console.log(`Existing lab/note cards: ${labs.length}`);
} else warn('labs.js missing; note-file coverage checks skipped.');

if (videos.length) {
  uniqueIds(videos, 'video lessons');
  const known = new Set(paths.map((p) => p.id));
  for (const video of videos) {
    const url = validHttps(video.url, `video ${video.id}`);
    if (!video.title || !video.topic || !video.level) fail(`Video ${video.id} is missing title/topic/level`);
    if (Array.isArray(video.careerPathIds)) {
      if (!video.careerPathIds.length) fail(`Video ${video.id} has an empty careerPathIds list`);
      for (const pathId of video.careerPathIds) if (!known.has(pathId)) fail(`Video ${video.id} refers to unknown career path ${pathId}`);
    }
    if (video.officialDocs) validHttps(video.officialDocs, `video docs ${video.id}`);
    if (video.embedUrl) validHttps(video.embedUrl, `video embed ${video.id}`);
    if (url && !url.hostname.includes('youtube') && !url.hostname.includes('youtu.be')) {
      const reviewedKinds = new Set(['video', 'video-series', 'video-course', 'tutorial-hub', 'interactive-lab', 'reference']);
      if (!reviewedKinds.has(video.contentKind) || video.reviewStatus !== 'verified') {
        warn(`Non-YouTube learning item needs a manual type check: ${video.id} -> ${video.url}`);
      } else {
        ok(`Non-YouTube item has reviewed type metadata: ${video.id} (${video.contentKind})`);
      }
    }
  }
  console.log(`Learning video/resource entries: ${videos.length}`);
} else warn('learningVideos.js missing or empty.');

if (resources.length) {
  uniqueIds(resources, 'resources');
  for (const resource of resources) validHttps(resource.url, `resource ${resource.id}`);
  console.log(`Resource directory entries: ${resources.length}`);
}

const externalLinks = read('src/components/ExternalLabLinks.jsx');
if (externalLinks && labs.length) {
  const mappedIds = new Set([...externalLinks.matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map((match) => match[1]));
  for (const lab of labs) if (!mappedIds.has(lab.id)) fail(`Visible note card ${lab.id} has no external-practice group`);
  if (mappedIds.size) ok(`External note-link groups are present for ${mappedIds.size} card IDs`);
} else if (labs.length) {
  warn('ExternalLabLinks.jsx is not present, so note-card-to-provider mappings were not checked. Install the external-lab integration before treating lab coverage as verified.');
}

console.log('\nOpenCyberPath end-to-end learning journey gate');
console.log('==============================================');
for (const message of pass) console.log(`PASS  ${message}`);
for (const message of warnings) console.log(`WARN  ${message}`);
for (const message of errors) console.log(`FAIL  ${message}`);
if (errors.length) {
  console.error(`\nFAILED: ${errors.length} reliability issue(s), ${warnings.length} manual review item(s).`);
  process.exitCode = 1;
} else {
  console.log(`\nSTATIC QUALITY GATE PASSED (${warnings.length} manual review item(s)).`);
  console.log('This gate checks source/data contracts. Use docs/LEARNING-JOURNEY-SMOKE-TEST.md for real-browser validation.');
}
