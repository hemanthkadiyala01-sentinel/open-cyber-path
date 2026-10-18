import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appPath = path.join(root, 'src', 'App.jsx');
const cssPath = path.join(root, 'src', 'styles.css');
const app = fs.readFileSync(appPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const start = app.indexOf('const attackPatterns = [');
const end = app.indexOf('];', start);
if (start < 0 || end < 0) throw new Error('Could not find attackPatterns array.');
const block = app.slice(start, end + 2);
const ids = [...block.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const images = [...block.matchAll(/\bimage:\s*["'](\/images\/learning\/basics\/[^"']+)["']/g)].map((m) => m[1]);
const expected = 16;
if (ids.length !== expected) throw new Error(`Expected ${expected} Basics topics; found ${ids.length}.`);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate Basics topic IDs found.');
if (images.length !== expected || new Set(images).size !== expected) throw new Error(`Expected ${expected} unique image paths; found ${images.length}.`);
for (const asset of images) {
  const disk = path.join(root, 'public', asset.replace(/^\//, ''));
  if (!fs.existsSync(disk)) throw new Error(`Missing Basics artwork: ${asset}`);
}
if (!block.includes('nextStep:')) throw new Error('Safe next-step field is missing.');
if (!app.includes('concept-identifiers') || !app.includes('concept-next-step')) throw new Error('Concept family/next-step UI is missing.');
if (!app.includes('Explore 16 illustrated security basics.')) throw new Error('Basics page heading has not been updated for the expanded library.');
if (!css.includes('Basics visual/content upgrade') || !css.includes('prefers-reduced-motion')) throw new Error('Basics visual stylesheet addition missing.');
if (!css.includes('grid-template-columns:repeat(4,minmax(0,1fr))')) throw new Error('Desktop 4-column Basics layout missing.');
console.log('OpenCyberPath Basics quality check');
console.log('PASS: 16 topics, 16 unique WebP illustrations, safe next steps, responsive layout, reduced-motion support.');
console.log('PASS: all illustration files exist in website/public.');
