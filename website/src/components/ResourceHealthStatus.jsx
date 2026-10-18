import resourceHealth from '../data/resourceHealth.generated.json';
import './ResourceHealthStatus.css';

const byUrl = new Map((resourceHealth.resources || []).map((item) => [item.url, item]));

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export default function ResourceHealthStatus({ url }) {
  const item = byUrl.get(url);
  if (!resourceHealth.generatedAt || !item) {
    return <span className="resource-health-status is-pending" title="The automated link check runs weekly when GitHub Actions is enabled.">Weekly link check pending</span>;
  }
  const label = item.status === 'healthy'
    ? 'Link responded'
    : item.status === 'broken'
      ? 'Possible broken link'
      : 'Check access manually';
  const checked = dateLabel(item.checkedAt || resourceHealth.generatedAt);
  const className = item.status === 'healthy' ? 'is-healthy' : item.status === 'broken' ? 'is-broken' : 'is-review';
  const explanation = `${item.detail || 'HTTP reachability only; page content and access terms are not verified.'}${checked ? ` Last checked ${checked}.` : ''}`;
  return <span className={`resource-health-status ${className}`} title={explanation} aria-label={`${label}${checked ? `, checked ${checked}` : ''}`}>
    <span className="resource-health-dot" aria-hidden="true" />{label}{checked ? ` · ${checked}` : ''}
  </span>;
}
