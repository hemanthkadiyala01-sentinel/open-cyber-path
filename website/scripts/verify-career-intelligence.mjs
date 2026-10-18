import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const checks = [];
function check(condition, label) {
  checks.push({ label, pass: Boolean(condition) });
}

const profiles = JSON.parse(await read('src/data/career-path-profiles.json'));
const catalog = await read('src/data/certifications.js');
const hub = await read('src/components/CertificationsHub.jsx');
const advisor = await read('src/components/CareerPathAdvisor.jsx');
const watcher = await read('scripts/watch-certification-sources.mjs');
const workflow = await read('../.github/workflows/certification-source-watch.yml');
const certStart = catalog.indexOf('export const certifications = [');
const learningStart = catalog.indexOf('export const freeLearningOptions = [');
const notesStart = catalog.indexOf('export const certificationHubNotes = [');
const trackStart = catalog.indexOf('export const certificationTracks = [');
const certSection = catalog.slice(certStart, learningStart);
const learningSection = catalog.slice(learningStart, notesStart);
const trackSection = catalog.slice(trackStart, certStart);
const certificationIds = new Set([...certSection.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]));
const learningIds = new Set([...learningSection.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]));
const trackLabels = new Set([...trackSection.matchAll(/label:\s*'([^']+)'/g)].map((match) => match[1]));
const uniqueProfileIds = new Set(profiles.map((profile) => profile.id));

check(profiles.length === 9, '9 role / career profiles are present');
check(uniqueProfileIds.size === profiles.length, 'career profile identifiers are unique');
check(profiles.every((profile) => profile.title && profile.summary && profile.skills?.length >= 3 && profile.portfolioEvidence?.length >= 3), 'every profile contains role context, skills and portfolio evidence');
check(profiles.every((profile) => Array.isArray(profile.credentialIds) && profile.credentialIds.length >= 3), 'every profile defines a multi-step credential sequence');
check(profiles.every((profile) => profile.credentialIds.every((id) => certificationIds.has(id))), 'all credential IDs map to the existing catalogue');
check(profiles.every((profile) => profile.learningIds?.length >= 2 && profile.learningIds.every((id) => learningIds.has(id))), 'all free-learning IDs map to existing provider records');
check(profiles.every((profile) => trackLabels.has(profile.track)), 'all target roles map to existing catalogue tracks');
check(advisor.includes('study block') && advisor.includes('not live vacancy counts'), 'advisor explains planning limits and avoids fake live hiring claims');
check(!hub.includes('/data/certification-source-status.json') && !hub.includes('does not confirm live seat availability'), 'learner-facing hub keeps maintenance monitoring out of the learner experience');
check(watcher.includes('reviewRequired') && watcher.includes('contentFingerprint') && watcher.includes('pageState'), 'monitor tracks source reachability and review-needed content changes');
check(workflow.includes('schedule:') && workflow.includes('contents: write') && workflow.includes('issues: write'), 'scheduled workflow enables report updates and review alerts');
check(workflow.includes('workflow_dispatch'), 'source monitoring can also be triggered manually');

for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.label}`);
const failed = checks.filter((item) => !item.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} career-intelligence checks passed.`);
if (failed.length) process.exit(1);
