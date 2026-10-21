#!/usr/bin/env node
/**
 * OpenCyberPath static quality gate. Run from website/: node scripts/verify-learning-quality.mjs
 * Optional online audit: node scripts/verify-learning-quality.mjs --online
 * The online mode only checks URL reachability; it does not interact with lab targets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { careerPaths } from '../src/data/careerPaths.js';
import { resources } from '../src/data/resources.js';
import { labs } from '../src/data/labs.js';
import { learningVideos } from '../src/data/learningVideos.js';
import { careerPathLabMap } from '../src/data/careerPathLabs.js';
import { certifications, freeLearningOptions, certificationHubNotes } from '../src/data/certifications.js';

const websiteRoot = process.cwd();
const errors = [];
const warnings = [];
const sourceStats = { paths: careerPaths.length, modules: 0, resources: resources.length, noteCards: labs.length, videos: learningVideos.length, externalPathLabs: 0, externalNoteLinks: 0 };
const validUrl = (value, context) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') errors.push(`${context}: expected HTTPS URL, got ${url.protocol}`);
    return url;
  } catch {
    errors.push(`${context}: invalid URL '${value}'`);
    return null;
  }
};
const unique = (items, getId, label) => {
  const found = new Set();
  for (const item of items) {
    const id = getId(item);
    if (!id) errors.push(`${label}: missing ID`);
    else if (found.has(id)) errors.push(`${label}: duplicate ID '${id}'`);
    else found.add(id);
  }
  return found;
};
const pathIds = unique(careerPaths, (p) => p.id, 'career paths');
const resourceIds = unique(resources, (r) => r.id, 'resources');
const labIds = unique(labs, (lab) => lab.id, 'labs/notes');
const videoIds = unique(learningVideos, (v) => v.id, 'videos');
const advancedVideos = learningVideos.filter((video) => video.level === 'Advanced');
const advancedTopics = new Set(advancedVideos.map((video) => video.topic));
const advancedPathIds = new Set(advancedVideos.flatMap((video) => video.careerPathIds || []));
if (advancedVideos.length < 12) errors.push(`Expected at least 12 Advanced-level learning videos; found ${advancedVideos.length}`);
if (advancedTopics.size < 8) errors.push(`Expected Advanced resources across at least 8 topics; found ${advancedTopics.size}`);
for (const pathId of pathIds) {
  if (!advancedPathIds.has(pathId)) errors.push(`Career path '${pathId}' has no Advanced-level learning video mapped`);
}

for (const route of careerPaths) {
  sourceStats.modules += route.modules?.length || 0;
  if (!route.title || !route.capstoneTitle || !Array.isArray(route.modules) || route.modules.length === 0) {
    errors.push(`Career path '${route.id}' is missing title/capstone/modules`);
  }
  for (const id of route.resourceIds || []) if (!resourceIds.has(id)) errors.push(`Career path '${route.id}' references missing resource '${id}'`);
  for (const id of route.labIds || []) if (!labIds.has(id)) errors.push(`Career path '${route.id}' references missing local lab '${id}'`);
  const pathVideos = learningVideos.filter((video) => (video.careerPathIds || []).includes(route.id));
  if (pathVideos.length === 0) errors.push(`Career path '${route.id}' has no matched video lessons`);
}

for (const resource of resources) {
  validUrl(resource.url, `Resource '${resource.id}'`);
  if (!resource.name || !resource.description || !resource.category) errors.push(`Resource '${resource.id}' is missing catalogue metadata`);
}
for (const credential of certifications) {
  for (const field of ['officialUrl', 'syllabusUrl', 'prepUrl']) validUrl(credential[field], `Certification '${credential.id}' ${field}`);
}
for (const option of freeLearningOptions) validUrl(option.url, `Free learning option '${option.id}'`);
for (const note of certificationHubNotes) validUrl(note.url, `Certification update '${note.id}'`);

for (const video of learningVideos) {
  validUrl(video.url, `Video '${video.id}'`);
  if (video.officialDocs) validUrl(video.officialDocs, `Video reference '${video.id}'`);
  if (!video.title || !video.creator || !video.topic || !video.level) errors.push(`Video '${video.id}' is missing title/creator/topic/level`);
  if (!Array.isArray(video.careerPathIds) || video.careerPathIds.length === 0) errors.push(`Video '${video.id}' is not mapped to a career path`);
  for (const pathId of video.careerPathIds || []) if (!pathIds.has(pathId)) errors.push(`Video '${video.id}' references unknown career path '${pathId}'`);
}

const publicRoot = path.resolve(websiteRoot, 'public');
for (const lab of labs) {
  if (!lab.title || !lab.summary || !lab.category || !lab.estimated) errors.push(`Lab/notes item '${lab.id}' is missing user-facing metadata`);
  for (const field of ['pdf', 'docx', 'dataset', 'script', 'worksheet']) {
    if (!lab[field]) continue;
    const relative = String(lab[field]).replace(/^\/+/, '');
    const resolved = path.resolve(publicRoot, relative);
    if (!resolved.startsWith(publicRoot + path.sep)) {
      errors.push(`Lab '${lab.id}' has a path outside public/: ${lab[field]}`);
      continue;
    }
    if (!fs.existsSync(resolved)) errors.push(`Lab '${lab.id}' links to missing public file '${lab[field]}'`);
    else if (['pdf', 'docx'].includes(field) && fs.statSync(resolved).size < 5000) errors.push(`Lab '${lab.id}' note file looks unexpectedly small: '${lab[field]}'`);
  }
}

const mappedPathIds = Object.keys(careerPathLabMap);
for (const id of mappedPathIds) if (!pathIds.has(id)) errors.push(`External lab map references unknown path '${id}'`);
for (const id of pathIds) if (!careerPathLabMap[id] || careerPathLabMap[id].length === 0) errors.push(`Career path '${id}' has no external practice recommendations`);
const externalLabIds = new Set();
const reviewLinks = [];
for (const [pathId, entries] of Object.entries(careerPathLabMap)) {
  const route = careerPaths.find((item) => item.id === pathId);
  for (const item of entries) {
    sourceStats.externalPathLabs += 1;
    if (!item.id || !item.title || !item.provider || !item.displayTitle || !item.providerTask || !item.url || !item.format || !item.tier || !item.module || !item.objective || !item.access || !item.linkLabel) {
      errors.push(`External lab '${pathId}/${item.id || '(no id)'}' has incomplete metadata`);
    }
    if (externalLabIds.has(item.id)) errors.push(`External lab ID '${item.id}' is reused in more than one path`);
    externalLabIds.add(item.id);
    validUrl(item.url, `External lab '${item.id}'`);
    if (route && !route.modules.some((module) => module.title === item.module)) errors.push(`External lab '${item.id}' points to unknown module '${item.module}' on '${pathId}'`);
    if (!/\((?:lab|guided exercise) for these notes\)$/i.test(item.displayTitle)) warnings.push(`Card title does not use the reviewed notes/exercise label: '${item.id}'`);
    if (/catalog|catalogue|challenge list|lab board|training catalogue/i.test(item.linkLabel)) {
      reviewLinks.push({ pathId, id: item.id, title: item.displayTitle, url: item.url, note: item.linkLabel });
    }
    const url = new URL(item.url);
    if (/exact lab|exact challenge|exact scenario/i.test(item.linkLabel) && (url.pathname === '/' || /\/(catalogue|blue-team-labs|challenges|practice)\/?$/i.test(url.pathname))) {
      errors.push(`External lab '${item.id}' is labelled exact but points to a catalogue/board URL '${item.url}'`);
    }
  }
}

const appPath = path.resolve(websiteRoot, 'src/App.jsx');
const app = fs.existsSync(appPath) ? fs.readFileSync(appPath, 'utf8') : '';
for (const marker of [
  '<ExternalLabLinks labId={lab.id} />',
  '<CareerPathLabDirectory path={activeLearningPath} />',
  'const InteractiveLabWorkbench = lazy(',
  'const CuratedVideosLibrary = lazy(',
  'const CareerVideoLibrary = lazy(',
  'const CareerHub = lazy(',
  'const JobsHub = lazy(',
  'const ResumeStudio = lazy(',
  'const ApplicationLab = lazy(',
  'const ToolsThreats = lazy(',
  'const SystemsAcademy = lazy(',
]) if (!app.includes(marker)) errors.push(`App.jsx is not wired for expected quality feature: ${marker}`);
for (const marker of ['import { CareerHub', 'import { ToolsThreats }', 'import { SystemsAcademy }']) {
  if (app.includes(marker)) errors.push(`App.jsx still statically imports a lazy-load feature: ${marker}`);
}

const startHerePath = path.resolve(websiteRoot, 'src/components/StartHereGuide.jsx');
if (!fs.existsSync(startHerePath)) errors.push('StartHereGuide.jsx is missing');
else {
  const source = fs.readFileSync(startHerePath, 'utf8');
  for (const marker of ['id="start-here"', 'onOpenPath(recommendedPath.id)', `I'm exploring cybersecurity`]) {
    if (!source.includes(marker)) errors.push(`StartHereGuide.jsx missing expected beginner-start behaviour: ${marker}`);
  }
}
for (const marker of ['MODULE_PROGRESS_STORAGE_KEY', 'Knowledge check & reflection', 'career-module-checkpoint-list', 'buildResourceReportUrl']) {
  if (!app.includes(marker)) errors.push(`App.jsx missing expected learner/resource improvement: ${marker}`);
}
const workbenchPath = path.resolve(websiteRoot, 'src/components/InteractiveLabWorkbench.jsx');
if (!fs.existsSync(workbenchPath)) errors.push('InteractiveLabWorkbench.jsx is missing');
else {
  const source = fs.readFileSync(workbenchPath, 'utf8');
  for (const marker of ['expectedOutput:', 'selfCheck:', 'Reveal hint', 'Show expected checkpoint and explanation']) {
    if (!source.includes(marker)) errors.push(`InteractiveLabWorkbench.jsx missing guided practice behaviour: ${marker}`);
  }
}
const feedbackPath = path.resolve(websiteRoot, 'src/utils/resourceFeedback.js');
if (!fs.existsSync(feedbackPath) || !fs.readFileSync(feedbackPath, 'utf8').includes('/issues/new')) errors.push('Resource issue-report helper is missing or not wired to GitHub Issues');

const externalLinksPath = path.resolve(websiteRoot, 'src/components/ExternalLabLinks.jsx');
if (!fs.existsSync(externalLinksPath)) errors.push('ExternalLabLinks.jsx is missing');
else {
  const externalSource = fs.readFileSync(externalLinksPath, 'utf8');
  const urls = [...externalSource.matchAll(/url:\s*'(https:\/\/[^']+)'/g)].map((match) => match[1]);
  sourceStats.externalNoteLinks = new Set(urls).size;
  if (urls.length < 20) errors.push(`Expected 20+ specific provider links for existing notes; found ${urls.length}`);
  for (const url of urls) validUrl(url, 'External note link');
  const mappedNoteIds = new Set([...externalSource.matchAll(/^\s{2}'([^']+)':\s*\{/gm)].map((match) => match[1]));
  for (const lab of labs) if (!mappedNoteIds.has(lab.id)) errors.push(`Lab/notes card '${lab.id}' has no external practice mapping`);
  for (const mappedId of mappedNoteIds) if (!labIds.has(mappedId)) warnings.push(`External note mapping '${mappedId}' does not match a visible note card`);
  for (const id of mappedNoteIds) {
    const snippet = externalSource.match(new RegExp(`'${id}':\\s*\\{([\\s\\S]*?)(?=\\n  '[-a-z0-9]+':\\s*\\{|\\n  \\};)`));
    if (snippet && !/links:\s*\[[\s\S]*?url:\s*'https:\/\//.test(snippet[1])) errors.push(`External note mapping '${id}' has no HTTPS provider link`);
  }
}

console.log('\nOpenCyberPath learning quality gate');
console.log('====================================');
console.log(`Career paths: ${sourceStats.paths} | path modules: ${sourceStats.modules}`);
console.log(`Resources: ${sourceStats.resources} | local lab/notes cards: ${sourceStats.noteCards}`);
console.log(`Video lessons: ${sourceStats.videos} | path-mapped external exercises: ${sourceStats.externalPathLabs}`);
console.log(`Specific external links across existing note cards: ${sourceStats.externalNoteLinks}`);
console.log(`Catalogue/board URLs that remain intentionally labelled for review: ${reviewLinks.length}`);
if (reviewLinks.length) {
  for (const item of reviewLinks) console.log(`  REVIEW ${item.pathId}/${item.id}: ${item.note} -> ${item.url}`);
}
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) console.log(`  WARN ${warning}`);
}

if (process.argv.includes('--online')) {
  const collected = new Map();
  const add = (url, label) => {
    if (!collected.has(url)) collected.set(url, new Set());
    collected.get(url).add(label);
  };
  for (const [pathId, entries] of Object.entries(careerPathLabMap)) for (const item of entries) add(item.url, `career lab ${pathId}/${item.id}`);
  for (const resource of resources) add(resource.url, `resource ${resource.id}`);
  for (const credential of certifications) {
    if (credential.officialUrl) add(credential.officialUrl, `credential ${credential.id} official page`);
    if (credential.syllabusUrl) add(credential.syllabusUrl, `credential ${credential.id} syllabus/objectives`);
    if (credential.prepUrl) add(credential.prepUrl, `credential ${credential.id} preparation`);
  }
  for (const option of freeLearningOptions) add(option.url, `free learning ${option.id}`);
  for (const note of certificationHubNotes) add(note.url, `certification update ${note.id}`);
  for (const video of learningVideos) { add(video.url, `video ${video.id}`); if (video.officialDocs) add(video.officialDocs, `video docs ${video.id}`); }
  if (fs.existsSync(externalLinksPath)) {
    const externalSource = fs.readFileSync(externalLinksPath, 'utf8');
    for (const [index, match] of [...externalSource.matchAll(/url:\s*'(https:\/\/[^']+)'/g)].entries()) add(match[1], `note link ${index + 1}`);
  }
  const jobs = [...collected.entries()];
  const outcomes = [];
  let cursor = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const current = jobs[cursor++];
      const [url, labels] = current;
      let status = 'ERROR';
      let detail = '';
      try {
        let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(6500), headers: { 'user-agent': 'OpenCyberPath-Link-Audit/1.0 (student-project quality check)' } });
        if ([404, 405, 501].includes(response.status)) {
          response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(6500), headers: { range: 'bytes=0-0', 'user-agent': 'OpenCyberPath-Link-Audit/1.0 (student-project quality check)' } });
          if (response.body) await response.body.cancel().catch(() => {});
        }
        status = response.status;
        detail = response.url && response.url !== url ? `redirected to ${response.url}` : '';
      } catch (error) {
        detail = error?.name === 'TimeoutError' ? 'timeout' : String(error?.message || error).slice(0, 120);
      }
      const verdict = typeof status === 'number' && status >= 200 && status < 400 ? 'OK'
        : [401, 403, 405, 408, 429].includes(status) || (typeof status === 'number' && status >= 500) || status === 'ERROR' ? 'REVIEW' : 'BROKEN';
      outcomes.push({ url, labels: [...labels], status, verdict, detail });
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, jobs.length) }, worker));
  outcomes.sort((a, b) => a.verdict.localeCompare(b.verdict) || a.url.localeCompare(b.url));
  const reportDir = path.resolve(websiteRoot, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'learning-link-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), total: outcomes.length, summary: Object.fromEntries(['OK','REVIEW','BROKEN'].map((v) => [v, outcomes.filter((row) => row.verdict === v).length])), outcomes }, null, 2), 'utf8');
  console.log(`Online URL audit: ${outcomes.length} unique URLs`);
  console.log(`  OK=${outcomes.filter((row) => row.verdict === 'OK').length}, REVIEW=${outcomes.filter((row) => row.verdict === 'REVIEW').length}, BROKEN=${outcomes.filter((row) => row.verdict === 'BROKEN').length}`);
  console.log(`  Report: ${reportPath}`);
  console.log('Note: a provider can block HEAD, rate-limit automated checks, require login, or temporarily be offline; REVIEW requires a human browser check, not automatic removal.');
}

if (errors.length) {
  console.error(`\nQUALITY GATE FAILED: ${errors.length} issue(s)`);
  for (const error of errors) console.error(`  ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nQUALITY GATE PASSED');
  console.log('Static catalogue, module mappings, files, and lazy-load wiring passed.');
}
