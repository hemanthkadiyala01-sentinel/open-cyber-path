import { useMemo, useRef, useState } from 'react';

const FORMAT_ID = 'opencyberpath-learning-progress';
const FORMAT_VERSION = 1;
const CHECKPOINT_FIELDS = ['understood', 'practised', 'evidence'];

function moduleKey(pathId, moduleTitle) {
  return `${pathId}::${moduleTitle}`;
}

function knownModuleKeys(paths) {
  return new Set((paths || []).flatMap((path) =>
    (path.modules || []).map((module) => moduleKey(path.id, module.title)),
  ));
}

function countTrueCheckpoints(modules = {}) {
  return Object.values(modules).reduce((total, module) =>
    total + CHECKPOINT_FIELDS.filter((field) => module?.[field] === true).length, 0);
}

function validateBackup(payload, paths) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || payload.format !== FORMAT_ID
    || payload.version !== FORMAT_VERSION
    || !payload.modules || typeof payload.modules !== 'object' || Array.isArray(payload.modules)) {
    throw new Error('That file is not a supported OpenCyberPath progress backup. Choose a JSON backup exported from this feature.');
  }

  const allowedKeys = knownModuleKeys(paths);
  const accepted = {};
  let recognized = 0;

  for (const [key, value] of Object.entries(payload.modules)) {
    if (!allowedKeys.has(key) || !value || typeof value !== 'object' || Array.isArray(value)) continue;
    if (!CHECKPOINT_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(value, field))) continue;
    accepted[key] = Object.fromEntries(CHECKPOINT_FIELDS.map((field) => [field, value[field] === true]));
    recognized += 1;
  }

  if (recognized === 0) {
    throw new Error('No matching learning checkpoints were found in that file. Your current progress has not changed.');
  }

  const parsedDate = typeof payload.exportedAt === 'string' ? Date.parse(payload.exportedAt) : NaN;
  return {
    modules: accepted,
    recognized,
    exportedAt: Number.isFinite(parsedDate) ? new Date(parsedDate).toISOString() : null,
  };
}

function getMergeCounts(importedModules, currentProgress) {
  let backupCompleted = 0;
  let newCompleted = 0;
  let alreadyCompleted = 0;

  for (const [key, values] of Object.entries(importedModules || {})) {
    for (const field of CHECKPOINT_FIELDS) {
      if (values?.[field] !== true) continue;
      backupCompleted += 1;
      if (currentProgress?.[key]?.[field] === true) alreadyCompleted += 1;
      else newCompleted += 1;
    }
  }

  return { backupCompleted, newCompleted, alreadyCompleted };
}

function formatExportDate(value) {
  if (!value) return 'Date not provided';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function makeReadableReport(paths, moduleProgress, exportedAt) {
  const totalCheckpoints = (paths || []).reduce((total, path) =>
    total + (path.modules || []).length * CHECKPOINT_FIELDS.length, 0);
  let completedCheckpoints = 0;
  let completedModules = 0;

  const pathSections = (paths || []).map((path) => {
    const rows = (path.modules || []).map((module) => {
      const key = moduleKey(path.id, module.title);
      const saved = moduleProgress?.[key] || {};
      const states = Object.fromEntries(CHECKPOINT_FIELDS.map((field) => [field, saved[field] === true]));
      const markedCount = CHECKPOINT_FIELDS.filter((field) => states[field]).length;
      const finished = markedCount === CHECKPOINT_FIELDS.length;
      const started = markedCount > 0;
      completedCheckpoints += markedCount;
      if (finished) completedModules += 1;
      const mark = (field) => `<span class="mark ${states[field] ? 'done' : 'pending'}">${states[field] ? 'Complete' : 'Not yet'}</span>`;
      const status = finished
        ? '<strong class="module-status done">Self-check complete</strong>'
        : started
          ? '<span class="module-status pending">In progress</span>'
          : '<span class="module-status not-started">Not started</span>';
      return `<tr><th scope="row">${escapeHtml(module.title)}</th><td>${mark('understood')}</td><td>${mark('practised')}</td><td>${mark('evidence')}</td><td>${status}</td></tr>`;
    }).join('');
    const pathCompleted = (path.modules || []).reduce((count, module) => {
      const saved = moduleProgress?.[moduleKey(path.id, module.title)] || {};
      return count + CHECKPOINT_FIELDS.filter((field) => saved[field] === true).length;
    }, 0);
    const pathTotal = (path.modules || []).length * CHECKPOINT_FIELDS.length;
    const title = path.title || path.shortTitle || path.id || 'Learning path';
    return `<section class="path-section"><div class="path-heading"><div><p class="eyebrow">CAREER VISION</p><h2>${escapeHtml(title)}</h2></div><p class="path-score">${pathCompleted} / ${pathTotal} checkpoints</p></div><div class="table-wrap"><table><thead><tr><th scope="col">Module</th><th scope="col">Understand</th><th scope="col">Practise</th><th scope="col">Evidence</th><th scope="col">Module status</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No modules are defined for this path.</td></tr>'}</tbody></table></div></section>`;
  }).join('');

  const completionPercent = totalCheckpoints ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;
  const generatedLabel = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(exportedAt));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>OpenCyberPath Learning Progress Report</title>
<style>
:root{font-family:Segoe UI,Arial,sans-serif;color:#172b3a;background:#f4f7fa;font-synthesis:none}*{box-sizing:border-box}body{margin:0;padding:30px 18px}.report{max-width:1100px;margin:0 auto}.topline{display:flex;justify-content:space-between;gap:18px;align-items:center;border-bottom:3px solid #1b8585;padding-bottom:14px}.brand{font-weight:800;letter-spacing:.2px;font-size:13px;color:#087b80}.eyebrow{font:700 10px/1.4 Consolas,monospace;letter-spacing:1.6px;color:#087b80;margin:0 0 7px;text-transform:uppercase}h1{font-size:clamp(27px,4vw,42px);line-height:1.08;letter-spacing:-1px;margin:22px 0 10px}h1 span{color:#087f89}.lede{max-width:800px;color:#526675;line-height:1.65;margin:0 0 22px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:22px 0 28px}.stat{padding:15px;border:1px solid #d1dee6;border-radius:12px;background:white}.stat span{display:block;color:#667a88;font-size:12px}.stat strong{display:block;font-size:25px;margin-top:6px;color:#183547;font-variant-numeric:tabular-nums}.progress-track{height:8px;background:#dce7ec;border-radius:99px;overflow:hidden;margin-top:12px}.progress-track span{display:block;height:100%;width:${completionPercent}%;background:linear-gradient(90deg,#087f89,#35baa4);border-radius:99px}.path-section{margin:25px 0 0;break-inside:auto}.path-heading{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:10px}.path-heading h2{font-size:19px;margin:0}.path-score{font:700 11px Consolas,monospace;color:#087b80;white-space:nowrap}.table-wrap{width:100%;overflow-x:auto;border:1px solid #d1dee6;border-radius:10px;background:white}table{width:100%;border-collapse:collapse;font-size:12px;min-width:720px}th,td{padding:10px 11px;border-bottom:1px solid #e3ebef;text-align:left;vertical-align:top}thead th{background:#edf4f6;color:#516775;font-size:10px;text-transform:uppercase;letter-spacing:.4px}tbody th{font-weight:650;color:#203b4b;min-width:210px}tbody tr:last-child th,tbody tr:last-child td{border-bottom:0}.mark,.module-status{display:inline-block;font-size:10px;white-space:nowrap}.mark.done,.module-status.done{color:#087a5c;font-weight:750}.mark.pending,.module-status.pending{color:#778793}.module-status.not-started{color:#667986;font-style:italic}.footer{border-top:1px solid #cfdae1;margin-top:32px;padding-top:14px;color:#5d707d;font-size:11px;line-height:1.7}.actions{display:flex;gap:8px;justify-content:flex-end;margin:0 0 15px}.actions button{border:1px solid #a7c1ca;border-radius:8px;background:white;color:#1a5963;padding:9px 12px;font-weight:700;cursor:pointer}@media(max-width:640px){.summary{grid-template-columns:repeat(2,minmax(0,1fr))}.topline,.path-heading{align-items:flex-start;flex-direction:column}.actions{justify-content:flex-start}}@media print{@page{size:A4 landscape;margin:12mm}body{background:white;padding:0}.actions{display:none}.report{max-width:none}.path-section{break-inside:avoid-page}.topline{border-color:#888}.summary{grid-template-columns:repeat(4,minmax(0,1fr))}.stat,.table-wrap{background:white;box-shadow:none}h1{font-size:28px}.path-section{margin-top:18px}thead{display:table-header-group}tr{break-inside:avoid}a{color:inherit;text-decoration:none}}
</style></head><body><main class="report"><div class="actions"><button type="button" onclick="window.print()">Print / Save as PDF</button><button type="button" onclick="window.close()">Close report</button></div><div class="topline"><span class="brand">OPEN CYBER PATH</span><span>PERSONAL LEARNING RECORD · ${escapeHtml(generatedLabel)}</span></div><p class="eyebrow" style="margin-top:28px">LEARN · PRACTISE · GROW TOGETHER</p><h1>Learning progress <span>report</span></h1><p class="lede">A local summary of self-reported learning checkpoints across your OpenCyberPath career visions. Use it to resume study, reflect on gaps, or print a personal progress record.</p><div class="summary"><div class="stat"><span>Completed checkpoints</span><strong>${completedCheckpoints} / ${totalCheckpoints}</strong><div class="progress-track" role="img" aria-label="${completionPercent}% of checkpoints completed"><span></span></div></div><div class="stat"><span>Overall checkpoint progress</span><strong>${completionPercent}%</strong></div><div class="stat"><span>Modules fully self-checked</span><strong>${completedModules}</strong></div><div class="stat"><span>Career visions included</span><strong>${(paths || []).length}</strong></div></div>${pathSections}<footer class="footer"><strong>Important:</strong> This report contains personal, self-reported checkpoints only. It is not a grade, certificate, accreditation, employment guarantee, or independent verification of skills. Checkpoint values are read locally in your browser and this report is created locally; it is not uploaded to a server. Generated ${escapeHtml(generatedLabel)}.</footer></main></body></html>`;
}

export default function LearningProgressBackup({ paths = [], moduleProgress = {}, onImport }) {
  const fileInputRef = useRef(null);
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState('info');
  const [pendingImport, setPendingImport] = useState(null);

  const totalCheckpoints = useMemo(() => paths.reduce((total, path) => total + (path.modules?.length || 0) * CHECKPOINT_FIELDS.length, 0), [paths]);
  const completedCheckpoints = useMemo(() => countTrueCheckpoints(moduleProgress), [moduleProgress]);
  const previewCounts = useMemo(() => pendingImport ? getMergeCounts(pendingImport.modules, moduleProgress) : null, [pendingImport, moduleProgress]);

  const exportBackup = () => {
    try {
      const allowedKeys = knownModuleKeys(paths);
      const safeModules = Object.fromEntries(Object.entries(moduleProgress)
        .filter(([key, value]) => allowedKeys.has(key) && value && typeof value === 'object' && !Array.isArray(value))
        .map(([key, value]) => [key, Object.fromEntries(CHECKPOINT_FIELDS.map((field) => [field, value[field] === true]))]));
      const payload = {
        app: 'OpenCyberPath',
        format: FORMAT_ID,
        version: FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        note: 'Personal learning checkpoints only; not a certificate or external verification.',
        modules: safeModules,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `opencyberpath-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPendingImport(null);
      setNotice('Backup downloaded. Keep the JSON file somewhere safe; it contains only your learning checkpoints.');
      setNoticeKind('success');
    } catch {
      setNotice('The backup could not be created in this browser. Your saved checkpoints have not been changed.');
      setNoticeKind('error');
    }
  };

  const exportReadableReport = () => {
    try {
      const generatedAt = new Date().toISOString();
      const html = makeReadableReport(paths, moduleProgress, generatedAt);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `opencyberpath-learning-progress-report-${generatedAt.slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Readable progress report downloaded. Open the HTML file to review or print it; use Print / Save as PDF for a portable copy.');
      setNoticeKind('success');
    } catch {
      setNotice('The readable report could not be created in this browser. Your saved checkpoints have not been changed.');
      setNoticeKind('error');
    }
  };

  const inspectBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPendingImport(null);
    if (file.size > 1024 * 1024) {
      setNotice('That file is larger than the 1 MB safety limit. Your current progress has not changed.');
      setNoticeKind('error');
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      const checked = validateBackup(payload, paths);
      setPendingImport({ ...checked, fileName: file.name });
      setNotice('Backup checked. Review the preview below before confirming the merge. Nothing has been imported yet.');
      setNoticeKind('info');
    } catch (error) {
      setPendingImport(null);
      setNotice(error instanceof Error ? error.message : 'The backup could not be read. Your current progress has not changed.');
      setNoticeKind('error');
    }
  };

  const confirmImport = () => {
    if (!pendingImport || typeof onImport !== 'function' || !previewCounts) {
      setNotice('Import is unavailable right now. Your current progress has not changed.');
      setNoticeKind('error');
      return;
    }

    const { modules, recognized, fileName } = pendingImport;
    const { newCompleted, alreadyCompleted } = previewCounts;
    try {
      onImport(modules);
      setPendingImport(null);
      setNotice(`Merged ${recognized} matching modules from ${fileName}. Added ${newCompleted} newly completed checkpoints; ${alreadyCompleted} were already complete. Existing completed checkpoints were preserved.`);
      setNoticeKind('success');
    } catch {
      setNotice('The import could not be applied. Your current progress has not been intentionally changed; reload and try again.');
      setNoticeKind('error');
    }
  };

  return (
    <section className="learning-progress-backup" aria-labelledby="learning-progress-backup-title">
      <div className="learning-progress-backup-copy">
        <span className="learning-progress-backup-kicker">LOCAL DATA · YOUR CONTROL</span>
        <h3 id="learning-progress-backup-title">Back up your learning progress</h3>
        <p>Checkpoints live in this browser. Export a JSON backup before clearing browser data or moving to another device. Imports are previewed first; merge adds completed checkpoints and never clears existing progress.</p>
        <div className="learning-progress-backup-count" aria-live="polite">{completedCheckpoints} of {totalCheckpoints} checkpoints marked complete</div>
      </div>
      <div className="learning-progress-backup-actions">
        <button className="learning-progress-backup-button is-primary" type="button" onClick={exportBackup}>Export backup <span aria-hidden="true">↓</span></button>
        <button className="learning-progress-backup-button learning-progress-report-button" type="button" onClick={exportReadableReport}>Progress report <span aria-hidden="true">↗</span></button>
        <button className="learning-progress-backup-button" type="button" onClick={() => fileInputRef.current?.click()}>Import &amp; merge <span aria-hidden="true">↑</span></button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={inspectBackup} aria-label="Choose an OpenCyberPath progress backup JSON file" hidden />
      </div>

      {pendingImport && previewCounts && (
        <div className="learning-progress-backup-preview" aria-labelledby="learning-progress-backup-preview-title">
          <div className="learning-progress-backup-preview-heading">
            <span className="learning-progress-backup-preview-icon" aria-hidden="true">✓</span>
            <div>
              <h4 id="learning-progress-backup-preview-title">Backup preview</h4>
              <p>{pendingImport.fileName}</p>
            </div>
          </div>
          <dl className="learning-progress-backup-preview-stats">
            <div><dt>Matching modules</dt><dd>{pendingImport.recognized}</dd></div>
            <div><dt>Completed marks in backup</dt><dd>{previewCounts.backupCompleted}</dd></div>
            <div><dt>New marks to restore</dt><dd>{previewCounts.newCompleted}</dd></div>
            <div><dt>Already completed here</dt><dd>{previewCounts.alreadyCompleted}</dd></div>
          </dl>
          <p className="learning-progress-backup-preview-date">Exported: {formatExportDate(pendingImport.exportedAt)}</p>
          <p className="learning-progress-backup-preview-warning">Import only adds completed checkpoints. It will not uncheck or erase anything you have already completed. Review the counts before continuing.</p>
          <div className="learning-progress-backup-preview-actions">
            <button className="learning-progress-backup-button is-primary" type="button" onClick={confirmImport}>Confirm import &amp; merge</button>
            <button className="learning-progress-backup-button" type="button" onClick={() => { setPendingImport(null); setNotice('Import cancelled. Your current progress has not changed.'); setNoticeKind('info'); }}>Cancel</button>
          </div>
        </div>
      )}

      {notice && <p className={`learning-progress-backup-notice is-${noticeKind}`} role="status" aria-live="polite">{notice}</p>}
    </section>
  );
}
