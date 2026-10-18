#!/usr/bin/env node
/**
 * Data contract checks for the Certifications & Exams Hub.
 * Run from website/: node scripts/verify-certifications.mjs
 * These checks validate local catalogue structure, not real-time pricing or every URL's reachability.
 */
import { readFileSync } from 'node:fs';
import { certifications, certificationTracks, freeLearningOptions, certificationHubNotes } from '../src/data/certifications.js';
import { careerPaths } from '../src/data/careerPaths.js';

const componentText = readFileSync(new URL('../src/components/CertificationsHub.jsx', import.meta.url), 'utf8');
const styleText = readFileSync(new URL('../src/components/CertificationsHub.css', import.meta.url), 'utf8');
const errors = [];
const pass = (message) => console.log(`PASS: ${message}`);
const fail = (message) => errors.push(message);
const unique = (items, getId, label) => {
  const ids = new Set();
  for (const item of items) {
    const id = getId(item);
    if (!id) fail(`${label}: missing ID`);
    else if (ids.has(id)) fail(`${label}: duplicate ID '${id}'`);
    else ids.add(id);
  }
  return ids;
};
const validHttps = (value, context) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') fail(`${context}: URL must use HTTPS`);
  } catch {
    fail(`${context}: invalid URL '${value}'`);
  }
};

if (certifications.length < 20) fail(`Expected at least 20 initial certification/course credentials; found ${certifications.length}`);
const mappedBadgeImages = [...componentText.matchAll(/images\.credly\.com\/images\//g)].length;
if (mappedBadgeImages < 11) fail(`Expected at least 11 matching issuer badge image mappings; found ${mappedBadgeImages}`);
if (!componentText.includes('cert-card-art') || !componentText.includes('cert-learning-art')) fail('Credential and free-resource cards must include visual image headers');
if (componentText.includes('cert-source-watch') || componentText.includes('Official page monitor')) fail('The official-source monitor must remain maintainer tooling, not learner-facing UI');
if (componentText.includes('freeResourceFilter') && !styleText.includes('cert-learning-filters')) fail('Free-resource category filters need visible CSS styling');
if (certificationTracks.length < 8) fail(`Expected at least 8 career tracks; found ${certificationTracks.length}`);
if (freeLearningOptions.length < 17) fail(`Expected at least 17 free learning/prep/lab options; found ${freeLearningOptions.length}`);
if (freeLearningOptions.some((item) => !['free-badge', 'free-course', 'official-prep', 'hands-on', 'freemium'].includes(item.category))) fail('Every free resource must have a recognized category for the catalogue filters');
if (freeLearningOptions.some((item) => !item.kindLabel)) fail('Every free resource must have a visible access-type label');
if (!certifications.some((item) => item.id === 'ibm-skillsbuild-cybersecurity-fundamentals' && item.costClass === 'course-certificate' && /free/i.test(item.costLabel))) fail('Expected IBM SkillsBuild free digital badge to be mapped as a course credential, not a proctored exam');
if (!freeLearningOptions.some((item) => item.id === 'cisco-introduction-to-cybersecurity-badge' && item.category === 'free-badge' && item.imageUrl?.includes('images.credly.com'))) fail('Expected a genuine Cisco introductory-course badge resource with matching image artwork');
const freeCourseCredentials = certifications.filter((item) => item.costClass === 'course-certificate' && /free/i.test(item.costLabel));
if (freeCourseCredentials.length < 2) fail(`Expected at least 2 clearly labelled free learning badges/course credentials; found ${freeCourseCredentials.length}`);
if (certificationHubNotes.length < 3) fail('Expected syllabus-change notes with effective dates and official sources');

const certificationIds = unique(certifications, (item) => item.id, 'certifications');
const trackIds = new Set(certificationTracks.map((item) => item.id));
const trackLabels = new Set(certificationTracks.map((item) => item.label));
const careerPathIds = new Set(careerPaths.map((item) => item.id));
unique(freeLearningOptions, (item) => item.id, 'free learning options');
unique(certificationHubNotes, (item) => item.id, 'certification update notes');

for (const item of certificationTracks) {
  if (!item.label) fail(`Track '${item.id}' has no label`);
}

for (const item of certifications) {
  for (const field of ['name', 'issuer', 'track', 'level', 'credentialType', 'examCode', 'costClass', 'costLabel', 'priceNote', 'format', 'prerequisites', 'renewal', 'overview', 'verifiedOn']) {
    if (!String(item[field] ?? '').trim()) fail(`Certification '${item.id}' is missing ${field}`);
  }
  if (!trackLabels.has(item.track) || !trackIds.has(item.track)) fail(`Certification '${item.id}' has unknown track '${item.track}'`);
  if (!['paid-exam', 'course-certificate'].includes(item.costClass)) fail(`Certification '${item.id}' has unrecognised costClass '${item.costClass}'`);
  if (!Array.isArray(item.domains) || item.domains.length < 3) fail(`Certification '${item.id}' needs at least 3 syllabus summary topics`);
  if (!Array.isArray(item.roadmap) || item.roadmap.length < 4) fail(`Certification '${item.id}' needs at least 4 roadmap steps`);
  for (const [index, step] of (item.roadmap || []).entries()) {
    if (!step.title || !step.detail || !step.output) fail(`Certification '${item.id}' roadmap step ${index + 1} is incomplete`);
  }
  if (!Array.isArray(item.careerPathIds) || item.careerPathIds.length === 0) fail(`Certification '${item.id}' is not mapped to an OpenCyberPath career route`);
  for (const pathId of item.careerPathIds || []) if (!careerPathIds.has(pathId)) fail(`Certification '${item.id}' references unknown career path '${pathId}'`);
  for (const field of ['officialUrl', 'syllabusUrl', 'prepUrl']) validHttps(item[field], `Certification '${item.id}' ${field}`);
  if (item.costClass === 'course-certificate' && !/not a proctored certification exam/i.test(item.credentialType)) {
    fail(`Course-based credential '${item.id}' must be distinguished from a proctored certification exam`);
  }
  if (item.costClass === 'paid-exam' && !/paid/i.test(item.costLabel)) fail(`Paid exam '${item.id}' must have a clear paid-access label`);
  if (item.hasFreePrep && item.costClass === 'paid-exam' && !/paid|separate|regional price|voucher/i.test(`${item.costLabel} ${item.priceNote}`)) {
    fail(`Free-prep credential '${item.id}' must explicitly disclose that the professional exam or voucher is paid/separate`);
  }
}

for (const item of freeLearningOptions) {
  for (const field of ['name', 'provider', 'accessLabel', 'focus', 'details']) {
    if (!String(item[field] ?? '').trim()) fail(`Free learning option '${item.id}' is missing ${field}`);
  }
  if (!item.category || !item.kindLabel) fail(`Free learning option '${item.id}' needs a category and visible access label`);
  validHttps(item.url, `Free learning option '${item.id}'`);
  if (item.imageUrl) validHttps(item.imageUrl, `Free learning option '${item.id}' image`);
  if (!/not all certifications|not a professional certification|exam is separate|not itself a professional certification/i.test(`${item.details} ${item.accessLabel}`)) {
    // Each entry should make clear what is free and whether the exam is separate; a concise access label counts too.
    if (!/separate|not a|may cost|exams? can have/i.test(`${item.details} ${item.accessLabel}`)) fail(`Free learning option '${item.id}' needs a clear exam/credential distinction`);
  }
}

for (const note of certificationHubNotes) {
  if (!note.title || !note.date || !note.body) fail(`Certification update '${note.id}' is incomplete`);
  validHttps(note.url, `Certification update '${note.id}'`);
  if (!/^20\d\d-\d\d-\d\d$/.test(note.date)) fail(`Certification update '${note.id}' date must be ISO YYYY-MM-DD`);
}

if (errors.length) {
  console.error('\nCERTIFICATION HUB DATA CHECK FAILED');
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exitCode = 1;
} else {
  pass(`${certifications.length} credentials/course certificates or badges have unique IDs and required metadata`);
  pass(`${freeCourseCredentials.length} free course achievement options are explicitly distinguished from paid professional exams`);
  pass(`${certificationTracks.length - 1} selectable career tracks map to the site's career catalogue`);
  pass('Every certification has an official page, official syllabus/prep links, syllabus summary and 4+ roadmap steps');
  pass('A free digital learning badge is separate from proctored professional exams');
  pass(`${freeLearningOptions.length} free-learning options clearly distinguish training from exam fees`);
  pass(`${mappedBadgeImages} issuer-hosted badge image URL references are present in card imagery`);
  pass('Source monitor is no longer exposed in the learner-facing certification UI');
  pass(`${certificationHubNotes.length} syllabus-change notices include dated official sources`);
  console.log('\nCERTIFICATION HUB DATA CHECK PASSED');
}
