import { useEffect, useMemo, useState } from 'react';
import './CyberPulse.css';

const FEED_URL = '/data/cyberpulse-feed.json';
const FRESHNESS_URL = '/data/site-freshness.json';
const categories = ['All updates', 'Security news', 'Official advisory', 'Known exploited vulnerability', 'Software advisory', 'Distribution advisory', 'Community signal'];

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function dateLabel(value) {
  const d = parseDate(value);
  return d ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d) : 'Date not supplied by source';
}
function timeAgo(value) {
  const d = parseDate(value);
  if (!d) return 'No successful sync recorded';
  const hours = Math.max(0, Math.floor((Date.now() - d.getTime()) / 3600000));
  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
function statusText(status) {
  return ({ ok: 'All feeds refreshed', partial: 'Some feeds refreshed', bootstrap: 'Initial snapshot · not synced', unavailable: 'Feed unavailable', ready: 'Status ready', fresh: 'Fresh', stale: 'Stale', 'not-run': 'Not run yet', 'not-recorded': 'Not recorded', 'review-due': 'Review due', 'review-current': 'Review current' })[status] || status || 'Unknown';
}
function sourceClass(item) {
  const id = String(item?.sourceId || '').toLowerCase();
  if (id.includes('bleeping')) return 'bc';
  if (id.includes('hackernews') || id.includes('hacker-news')) return 'thn';
  if (id.includes('cert-in')) return 'certin';
  if (id.includes('cisa')) return 'cisa';
  if (id.includes('github')) return 'github';
  if (id.includes('debian')) return 'debian';
  return 'other';
}

export default function CyberPulse() {
  const [feed, setFeed] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All updates');
  const [sourceFilter, setSourceFilter] = useState('All sources');
  const [sortMode, setSortMode] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`${FEED_URL}?_=${Date.now()}`, { cache: 'no-store', signal: controller.signal }).then((r) => { if (!r.ok) throw new Error(`Feed HTTP ${r.status}`); return r.json(); }),
      fetch(`${FRESHNESS_URL}?_=${Date.now()}`, { cache: 'no-store', signal: controller.signal }).then((r) => { if (!r.ok) throw new Error(`Freshness HTTP ${r.status}`); return r.json(); }).catch(() => null),
    ]).then(([feedData, freshnessData]) => {
      if (!active) return;
      setFeed(feedData);
      setFreshness(freshnessData);
    }).catch((cause) => {
      if (!active || cause?.name === 'AbortError') return;
      setError('The published news snapshot could not be loaded. Try again later; the original provider websites may still be available.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [reloadKey]);

  const sourceNames = useMemo(() => ['All sources', ...new Set((feed?.items || []).map((item) => item.source).filter(Boolean).sort())], [feed]);
  const visibleItems = useMemo(() => {
    let result = [...(feed?.items || [])];
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((item) => `${item.title} ${item.summary} ${item.source} ${item.cveId || ''} ${item.topic || ''}`.toLowerCase().includes(q));
    if (category !== 'All updates') result = result.filter((item) => item.topic === category || item.type === category);
    if (sourceFilter !== 'All sources') result = result.filter((item) => item.source === sourceFilter);
    result.sort((a, b) => {
      const dateA = parseDate(a.updatedAt || a.publishedAt || a.lastSeenAt)?.getTime() || 0;
      const dateB = parseDate(b.updatedAt || b.publishedAt || b.lastSeenAt)?.getTime() || 0;
      return sortMode === 'oldest' ? dateA - dateB : dateB - dateA;
    });
    return result;
  }, [feed, query, category, sourceFilter, sortMode]);
  const sourceRows = feed?.sources || [];
  const refreshedSources = sourceRows.filter((source) => source.status === 'fresh').length;
  const feedAgeHours = (() => { const d = parseDate(feed?.lastSuccessfulSyncAt); return d ? (Date.now() - d.getTime()) / 3600000 : Infinity; })();
  const overallFeedStatus = !feed?.lastSuccessfulSyncAt ? (feed?.status || 'unavailable') : (feedAgeHours > 12 ? 'stale' : (feed?.status || 'unavailable'));

  return <section className="cyberpulse-page" aria-labelledby="cyberpulse-title">
    <section className="cyberpulse-hero">
      <div className="cyberpulse-hero-copy">
        <span className="cyberpulse-kicker">CYBERPULSE · SECURITY CHANGE RADAR</span>
        <h1 id="cyberpulse-title">Know what changed.<br /><em>Know what to check next.</em></h1>
        <p>Recent security reporting, official advisories, and vulnerability records in one place. Headlines are short summaries for discovery—open the original source before making a security decision.</p>
        <div className="cyberpulse-hero-actions"><a href="https://www.bleepingcomputer.com/rss-feeds/" target="_blank" rel="noreferrer">Feed sources ↗</a><button type="button" onClick={() => setReloadKey((value) => value + 1)}>Reload published feed</button></div>
      </div>
      <aside className={`cyberpulse-live-status is-${overallFeedStatus}`} aria-live="polite">
        <span className="cyberpulse-status-dot" />
        <span className="cyberpulse-live-label">PUBLISHED SNAPSHOT STATUS</span>
        <strong>{statusText(overallFeedStatus)}</strong>
        <p>Last successful source refresh: {timeAgo(feed?.lastSuccessfulSyncAt)}.</p>
        <small>{refreshedSources}/{sourceRows.length} sources succeeded in the latest recorded run.</small>
      </aside>
    </section>

    <section className="cyberpulse-stats" aria-label="Feed summary">
      <div><span>Indexed records</span><strong>{feed?.itemCount ?? (feed?.items || []).length}</strong><small>Retained public headlines and advisories</small></div>
      <div><span>Sources configured</span><strong>{feed?.sourceCount ?? sourceRows.length}</strong><small>Feeds and structured official data</small></div>
      <div><span>Latest snapshot</span><strong>{feed?.generatedAt ? dateLabel(feed.generatedAt) : '—'}</strong><small>Generation time, not article publication time</small></div>
    </section>

    {error && <div className="cyberpulse-alert" role="alert"><strong>Feed unavailable</strong><p>{error}</p><button type="button" onClick={() => setReloadKey((value) => value + 1)}>Retry</button></div>}
    {feed?.status === 'bootstrap' && <div className="cyberpulse-alert is-notice"><strong>Initial snapshot</strong><p>The scheduled feed has not completed a successful refresh yet. Records may be a starter snapshot until the source collector runs with network access.</p></div>}
    {feed?.status === 'partial' && <div className="cyberpulse-alert is-notice"><strong>Partial source refresh</strong><p>Some sources did not respond. Their last-known records are preserved and may be stale. Check each source status below.</p></div>}

    <section className="cyberpulse-source-panel" aria-labelledby="cyberpulse-sources-title">
      <div className="cyberpulse-section-head"><div><span className="cyberpulse-kicker">SOURCE HEALTH</span><h2 id="cyberpulse-sources-title">What updated—and what didn't</h2></div><p>A successful HTTP response confirms collection, not that every claim is independently verified.</p></div>
      <div className="cyberpulse-source-grid">
        {sourceRows.map((source) => <a className={`cyberpulse-source-chip status-${source.status || 'unknown'}`} href={source.url} target="_blank" rel="noreferrer" key={source.id}>
          <span className="cyberpulse-source-name">{source.label}</span><strong>{statusText(source.status)}</strong><small>{source.itemsFetched || 0} records · checked {timeAgo(source.checkedAt)}</small><small>{source.note}</small>
        </a>)}
        {!sourceRows.length && <p className="cyberpulse-empty">Source status will appear after the first collector run.</p>}
      </div>
    </section>

    <section className="cyberpulse-news-section" aria-labelledby="cyberpulse-news-title">
      <div className="cyberpulse-section-head"><div><span className="cyberpulse-kicker">THE SECURITY BRIEF</span><h2 id="cyberpulse-news-title">Recent updates</h2></div><p>Use filters to narrow the list. Community discussions are signals only; official advisories and vendor guidance take priority for action.</p></div>
      <div className="cyberpulse-controls">
        <label><span>Search headlines</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="AI security, CVE, ransomware…" /></label>
        <label><span>Topic</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
        <label><span>Publisher/source</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>{sourceNames.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <label><span>Order</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
      </div>
      <p className="cyberpulse-results">Showing <b>{visibleItems.length}</b> of <b>{(feed?.items || []).length}</b> records{loading ? ' · refreshing view…' : ''}</p>
      <div className="cyberpulse-news-grid">
        {visibleItems.slice(0, 90).map((item) => <article className={`cyberpulse-news-card source-${sourceClass(item)}`} key={item.id}>
          <div className="cyberpulse-news-meta"><span>{item.source}</span><span className={`cyberpulse-freshness-tag ${String(item.status || 'ACTIVE').toLowerCase()}`}>{item.status || 'ACTIVE'}</span></div>
          <h3>{item.title}</h3>
          {item.cveId && <span className="cyberpulse-cve">{item.cveId}</span>}
          <p>{item.summary || 'Open the original source for the full context, affected versions, evidence and recommended actions.'}</p>
          <div className="cyberpulse-news-foot"><span>{dateLabel(item.updatedAt || item.publishedAt || item.lastSeenAt)}{item.publishedAt ? ' · source date' : ' · observed date'}</span><span className="cyberpulse-confidence">{item.confidence}</span></div>
          <a href={item.url} target="_blank" rel="noreferrer">Open original source <span aria-hidden="true">↗</span></a>
        </article>)}
        {!loading && visibleItems.length === 0 && <div className="cyberpulse-empty"><h3>{(feed?.items || []).length ? 'No matching updates' : 'Waiting for the first source refresh'}</h3><p>{(feed?.items || []).length ? 'Try a broader search or clear filters.' : 'Run py -3 tools\\cyberpulse\\refresh_feeds.py from the repository root, or enable the scheduled GitHub Actions workflow after pushing it to the default branch.'}</p>{(feed?.items || []).length > 0 && <button type="button" onClick={() => { setQuery(''); setCategory('All updates'); setSourceFilter('All sources'); }}>Reset filters</button>}</div>}
      </div>
      <p className="cyberpulse-rights-note">OpenCyberPath shows headlines and short excerpts with source links for discovery. The original publishers retain their content. We do not re-host full articles. Always verify the published advisory and your own system's affected version before taking action.</p>
    </section>

    <section className="cyberpulse-freshness-section" aria-labelledby="cyberpulse-freshness-title">
      <div className="cyberpulse-section-head"><div><span className="cyberpulse-kicker">PLATFORM MAINTENANCE</span><h2 id="cyberpulse-freshness-title">How current is OpenCyberPath?</h2></div><p>Different content needs different update methods. Links and feeds can be checked automatically; learning curricula and scenarios need editorial review rather than silent rewriting.</p></div>
      <div className="cyberpulse-freshness-grid">
        {(freshness?.sections || []).map((section) => <article className={`cyberpulse-fresh-card state-${section.status || 'unknown'}`} key={section.id}>
          <div><span className="cyberpulse-mode">{section.mode === 'automatic' ? 'AUTOMATED CHECK' : 'EDITORIAL REVIEW'}</span><span className="cyberpulse-review-state">{statusText(section.status)}</span></div>
          <h3>{section.label}</h3><p>{section.summary}</p><footer><span>Cadence: {section.cadence}</span><small>{section.lastCheckedAt ? `Last checked ${dateLabel(section.lastCheckedAt)}` : 'Review/check timestamp not recorded yet'}</small></footer>
        </article>)}
        {!freshness?.sections?.length && <p className="cyberpulse-empty">The section-by-section freshness ledger will appear after the first collector run.</p>}
      </div>
      <p className="cyberpulse-rights-note">Status is deliberately honest: reachable does not mean free or accurate; updated does not mean reviewed; a published advisory is not a complete incident investigation. Editorial content must be reviewed by a person before revision.</p>
    </section>
  </section>;
}
