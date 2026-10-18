import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(scriptDir, '../public/data/certification-source-status.json');
const urlIndex = process.argv.indexOf('--url');
const targetUrl = urlIndex >= 0 ? process.argv[urlIndex + 1] : null;
if (!targetUrl) {
  console.error('Usage: npm run ack:certification-source -- --url "https://official.example/exam-page"');
  process.exit(2);
}
const report = JSON.parse(await readFile(reportPath, 'utf8'));
const source = report.sources.find((item) => item.url === targetUrl);
if (!source) {
  console.error('The exact URL was not found in the latest source report. Copy the URL from public/data/certification-source-status.json.');
  process.exit(1);
}
if (source.pageState !== 'reachable' || !source.contentFingerprint) {
  console.error('Cannot acknowledge this source because the public page is not currently verified as reachable. Recheck it manually first.');
  process.exit(1);
}
source.reviewedFingerprint = source.contentFingerprint;
source.reviewRequired = false;
source.changedThisRun = false;
source.note = 'A reviewer acknowledged this page fingerprint; booking availability still requires checking the official portal.';
source.reviewedAt = new Date().toISOString();
report.summary.needsReview = report.sources.filter((item) => item.reviewRequired || item.pageState !== 'reachable').length;
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Acknowledged the current page fingerprint for ${source.url}. This does not verify fees, syllabus details or exam-seat availability.`);
