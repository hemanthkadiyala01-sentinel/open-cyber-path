const ISSUE_URL = 'https://github.com/hemanthkadiyala01-sentinel/open-cyber-path/issues/new';

/** Build a prefilled issue URL; this opens GitHub and does not submit an issue automatically. */
export function buildResourceReportUrl(item = {}) {
  const title = String(item.title || item.name || item.displayTitle || 'Untitled resource').trim();
  const resourceId = String(item.id || 'not-provided').trim();
  const url = String(item.url || 'not-provided').trim();
  const provider = String(item.provider || 'not-provided').trim();
  const type = String(item.type || item.format || item.kind || 'not-classified').trim();
  const body = [
    '## Resource to review',
    `- Resource ID: ${resourceId}`,
    `- Title: ${title}`,
    `- Provider: ${provider}`,
    `- Current link: ${url}`,
    `- Displayed type: ${type}`,
    '',
    '## What seems wrong?',
    'Describe the broken link, changed access requirement, mismatch between label and destination, or outdated instructions. Please do not include personal or sensitive information.',
    '',
    '## Suggested correction (optional)',
    'Add a verified official URL or clarification if available.',
  ].join('\n');
  return `${ISSUE_URL}?template=resource-link-report.md&title=${encodeURIComponent(`[Resource review] ${title}`)}&body=${encodeURIComponent(body)}`;
}
