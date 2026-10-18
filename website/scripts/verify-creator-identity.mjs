import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(scriptDir, '..');
const appPath = path.join(websiteRoot, 'src', 'App.jsx');
const componentPath = path.join(websiteRoot, 'src', 'components', 'CreatorIdentity.jsx');
const cssPath = path.join(websiteRoot, 'src', 'components', 'CreatorIdentity.css');
const imagePath = path.join(websiteRoot, 'public', 'images', 'nyxovar-eclipse.png');
const checks = [];
const check = (condition, label) => checks.push({ condition: Boolean(condition), label });

for (const [file, label] of [
  [appPath, 'App.jsx exists'],
  [componentPath, 'creator page component exists'],
  [cssPath, 'responsive creator identity styles exist'],
  [imagePath, 'user-provided eclipse artwork is bundled locally'],
]) check(fs.existsSync(file), label);

if (checks.every((item) => item.condition)) {
  const app = fs.readFileSync(appPath, 'utf8');
  const component = fs.readFileSync(componentPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  check(app.includes("import('./components/CreatorIdentity.jsx')"), 'creator page is lazy-loaded by the site app');
  check(app.includes("page === 'creator'"), 'creator page is reachable through the app route');
  check(app.includes("navigate('creator')") && app.includes('About the creator'), 'site footer links to the creator page');
  check(app.includes('Built by Hemanth Kadiyala') && app.includes('NYXOVAR'), 'site-wide footer attribution is present');
  check(component.includes('Hemanth Kadiyala') && component.includes('NYXOVAR'), 'real name and personal brand are visible');
  check(component.includes('https://www.linkedin.com/in/hemanth-kadiyala-8611a8358/'), 'LinkedIn link matches supplied profile');
  check(component.includes('https://github.com/hemanthkadiyala01-sentinel/open-cyber-path'), 'OpenCyberPath repository link is present');
  check(component.includes('/images/nyxovar-eclipse.png'), 'creator page uses the provided eclipse image');
  check(css.includes('@media(max-width:760px)') && css.includes('prefers-reduced-motion'), 'creator page supports mobile layout and reduced motion');
  check(fs.statSync(imagePath).size > 100000, 'bundled eclipse image is non-empty and full resolution');
}

for (const item of checks) console.log(`${item.condition ? 'PASS' : 'FAIL'} ${item.label}`);
const failed = checks.filter((item) => !item.condition);
console.log(`\n${checks.length - failed.length}/${checks.length} creator identity checks passed.`);
if (failed.length) process.exit(1);
