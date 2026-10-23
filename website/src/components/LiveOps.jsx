import { useEffect, useMemo, useState } from 'react';
import './LiveOps.css'; // cyberpath-liveops-v1
import './LiveOpsVisualRefresh.css'; // liveops-visual-refresh-v1

const FEED_URL = '/liveops-feed.json';
const DRAFT_KEY = 'opencyberpath.liveops.drafts.v1';
const SAVED_KEY = 'opencyberpath.liveops.saved.v1';
const STARTER_EVIDENCE = {
  agentBoundary: {
    environment: 'Fictional company: Northstar Research',
    notice: 'All identities, systems, hostnames, credentials, and events below are synthetic. The pack does not describe a named victim.',
    events: [
      { time: '09:00:02Z', source: 'CI policy', event: 'Evaluation job started', evidence: 'scope=repo-read; egress=allow-list' },
      { time: '09:01:14Z', source: 'Secret scanner', event: 'Test credential detected in fixture repository history', evidence: 'secret_ref=DEMO-KEY-17; credential value intentionally omitted' },
      { time: '09:02:03Z', source: 'Cloud audit', event: 'Training role requested broad object listing', evidence: 'role=eval-worker; action=object.list; decision=ALLOW' },
      { time: '09:02:07Z', source: 'Network audit', event: 'Evaluation job reached an unlisted training destination', evidence: 'destination=api-lab.invalid; decision=ALLOW; synthetic=true' },
      { time: '09:03:22Z', source: 'API gateway', event: 'Legacy test endpoint returned a synthetic record count', evidence: 'route=/training/legacy-export; auth_context=service-role; synthetic=true' },
      { time: '09:06:45Z', source: 'Scheduler', event: 'Evaluation job completed without an out-of-scope alert', evidence: 'policy_alert_count=0' }
    ],
    files: [
      { name: 'scope-policy.json', purpose: 'Declared job scope and egress allow-list', content: '{"job":"eval-worker","read_scope":["repo-fixture"],"egress_mode":"allow-list","allowed_hosts":["artifacts.lab.invalid"]}' },
      { name: 'training-role.json', purpose: 'Synthetic role policy', content: '{"role":"eval-worker","permissions":["object.list:*","object.read:*"],"note":"training fixture - excessive permissions are intentional"}' },
      { name: 'api-inventory.csv', purpose: 'Synthetic service inventory', content: 'route,environment,auth,owner,status\n/training/health,test,none,platform,required\n/training/legacy-export,test,service-role,unknown,decommission-candidate\n/artifacts/read,test,workload-identity,platform,required' }
    ]
  },
  paymentApi: {
    environment: 'Fictional payment sandbox: BlueHarbor Demo',
    notice: 'All amounts, transaction IDs, customers, approvals, and events are fabricated for learning. No payment endpoint exists.',
    events: [
      { time: '14:20:01Z', source: 'Payment API', event: 'Payout request accepted for validation', evidence: 'txn=TX-DEMO-1001; amount=1200; approval_ref=APR-4401' },
      { time: '14:20:03Z', source: 'Approval ledger', event: 'Approval reference validated', evidence: 'APR-4401; status=approved; limit=2000' },
      { time: '14:23:17Z', source: 'Payment API', event: 'Payout request accepted', evidence: 'txn=TX-DEMO-1002; amount=48000; approval_ref=APR-4401' },
      { time: '14:23:18Z', source: 'Approval ledger', event: 'No approval record matched transaction TX-DEMO-1002', evidence: 'lookup_result=not_found; correlation_id=COR-DEMO-77' },
      { time: '14:24:09Z', source: 'Payment API', event: 'Client retried the same request identifier', evidence: 'txn=TX-DEMO-1002; request_id=REQ-DEMO-02; attempt=2' },
      { time: '14:25:11Z', source: 'Reconciliation', event: 'A legitimate payout had delayed ledger replication', evidence: 'txn=TX-DEMO-1003; approval_ref=APR-4403; replication_delay_ms=9500' }
    ],
    files: [
      { name: 'transaction-events.csv', purpose: 'Synthetic payout request and approval events', content: 'txn,amount,approval_ref,approval_status,request_id\nTX-DEMO-1001,1200,APR-4401,approved,REQ-DEMO-01\nTX-DEMO-1002,48000,APR-4401,not_found,REQ-DEMO-02\nTX-DEMO-1003,950,APR-4403,delayed,REQ-DEMO-03' },
      { name: 'workflow-rules.json', purpose: 'Intended business invariants', content: '{"rules":["approval must be bound to the exact transaction ID and amount","retries must be idempotent","delayed ledger replication must not be confused with missing approval","all decisions must be auditable"]}' }
    ]
  },
  patchTriage: {
    environment: 'Fictional enterprise change window: Cedarline Systems',
    notice: 'This is a patch-prioritisation exercise inspired by public advisories. Versions, assets, owners, test results and telemetry below are synthetic.',
    events: [
      { time: '08:00:00Z', source: 'Asset inventory', event: 'Internet-facing application node discovered', evidence: 'asset=APP-DEMO-03; owner=payments; maintenance_window=tonight' },
      { time: '08:04:00Z', source: 'Software inventory', event: 'A component matches a vendor advisory range', evidence: 'component=sample-middleware; version=4.2.1; advisory_ref=TRAINING-ADV-18' },
      { time: '08:06:11Z', source: 'Threat intel', event: 'Exploit status is unknown in this fixture', evidence: 'exploitation_confirmed=false; source_age=unknown' },
      { time: '08:11:45Z', source: 'QA', event: 'Patch passes unit tests but breaks one integration fixture', evidence: 'unit=42/42; integration=7/8; regression=auth-timeout' },
      { time: '08:18:00Z', source: 'Operations', event: 'Compensating control is available for a limited window', evidence: 'control=restrict_public_route; validated_in_staging=true' }
    ],
    files: [
      { name: 'asset-inventory.csv', purpose: 'Synthetic assets and business criticality', content: 'asset,exposure,criticality,owner\nAPP-DEMO-03,internet-facing,high,payments\nJOB-DEMO-02,internal,medium,platform\nDEV-DEMO-01,restricted,low,engineering' },
      { name: 'patch-test-results.json', purpose: 'Synthetic validation record', content: '{"unit":{"passed":42,"failed":0},"integration":{"passed":7,"failed":1},"failure":"auth-timeout","compensating_control":"restrict_public_route"}' }
    ]
  }
};

const STARTER_CHALLENGES = [
  {
    id: 'liveops-agent-boundary-2026-0049', reference: 'CIAD-2026-0049', sourceId: 'cert-in', sourceName: 'CERT-In',
    sourceUrl: 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0049&pageid=PUBVLNOTES02',
    publishedAt: '2026-10-15', sourceConfidence: 'Official government advisory', freshness: 'NEW',
    title: 'The Agent That Crossed Its Boundary', level: 'Intermediate → Advanced', duration: '3–5 hours', area: 'AI agent security',
    summary: 'A fictional evaluation agent operates with broad permissions and reaches an unlisted destination. Reconstruct how the guardrails failed, then prove a safer design works.',
    task: 'Your team must explain the authorization boundary failure using the supplied synthetic evidence, propose least-privilege and network controls, and demonstrate that legitimate in-scope work still succeeds.',
    objectives: ['Build a timeline with specific evidence references.', 'Separate the initial exposure, permission design, and detection failure.', 'Propose short-lived identity, default-deny egress, API inventory and secret-remediation controls.', 'Define positive and negative tests, including allowed and out-of-scope destinations.', 'State what this synthetic pack cannot prove about a real incident.'],
    deliverables: ['Incident timeline (UTC timestamps + source)', 'Root-cause analysis with an alternative hypothesis', 'Defensive control plan', 'Detection logic and false-positive notes', 'Validation matrix with pass/fail criteria'],
    skills: ['cloud IAM', 'secret management', 'audit-log analysis', 'egress controls', 'incident response'], rubric: [{name:'Evidence and timeline',points:25},{name:'Root cause and alternatives',points:25},{name:'Defensive controls',points:20},{name:'Validation and detection',points:20},{name:'Limitations and communication',points:10}], evidenceKey:'agentBoundary',
    sourceNote: 'Challenge topic is derived from the public CERT-In advisory. The organisation and all logs/files in this lab are fictional; this does not reproduce evidence from any affected organisation.'
  },
  {
    id: 'liveops-payment-api-2026-0046', reference: 'CIAD-2026-0046', sourceId: 'cert-in', sourceName: 'CERT-In',
    sourceUrl: 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0046&pageid=PUBVLNOTES02',
    publishedAt: '2026-10-09', sourceConfidence: 'Official government advisory', freshness: 'ACTIVE',
    title: 'The Payment API That Ignored the Workflow', level: 'Intermediate → Advanced', duration: '3–5 hours', area: 'API and business logic',
    summary: 'A fictional payout API accepts a request whose approval does not match the exact transaction. A delayed ledger event creates a misleading signal; the analyst must distinguish both.',
    task: 'Use synthetic request, approval, retry, and reconciliation records to identify violated business invariants. Design a detection rule and controls that stop invalid payouts without flagging every delayed or high-value transaction.',
    objectives: ['Correlate each payout with the exact approval record and amount.', 'Identify duplicate/retry behaviour without assuming every retry is malicious.', 'Write deterministic checks against the supplied fixture.', 'Design idempotency and server-side authorization controls.', 'Document how to preserve evidence and safely limit further risk.'],
    deliverables: ['Transaction evidence table', 'Detection query or pseudocode', 'Authorization and validation design', 'Positive/negative test cases', 'Response plan and known limitations'],
    skills: ['API security', 'business logic', 'transaction integrity', 'detection engineering', 'testing'], rubric: [{name:'Evidence and transaction correlation',points:30},{name:'Rule correctness',points:20},{name:'Defensive design',points:20},{name:'False-positive handling',points:15},{name:'Limitations and response',points:15}], evidenceKey:'paymentApi',
    sourceNote: 'Challenge topic is derived from a public CERT-In advisory. Transaction IDs, values, approvals, customers and system events are entirely synthetic and do not describe real financial transactions.'
  },
  {
    id: 'liveops-patch-triage-debian-2026-10', reference: 'DSA-6571-1 / Debian security updates', sourceId: 'debian', sourceName: 'Debian Security Advisories',
    sourceUrl: 'https://www.debian.org/security/dsa', publishedAt: '2026-10-18', sourceConfidence: 'Official distribution advisory feed', freshness: 'NEW',
    title: 'Patch Fast Without Breaking Production', level: 'Intermediate', duration: '2–4 hours', area: 'Vulnerability management',
    summary: 'A fictional service matches a vendor advisory, but the first patch candidate fails an integration test. Prioritise the response, use a compensating control, and define release gates.',
    task: 'Create a risk-based change decision from synthetic asset inventory, advisory metadata and test results. Do not assume severity alone determines order, and do not claim a patch is safe until the failure is understood.',
    objectives: ['Rank assets by exposure, impact and available evidence.', 'Explain what is known versus unknown about exploitation.', 'Propose a time-bound compensating control.', 'Build regression and rollback criteria.', 'Document patch status and reassessment triggers.'],
    deliverables: ['Prioritisation table', 'Change decision and rationale', 'Regression/rollback checklist', 'Evidence and uncertainty notes'],
    skills: ['vulnerability management', 'risk prioritisation', 'change management', 'software testing'], rubric: [{name:'Prioritisation rationale',points:30},{name:'Mitigation quality',points:25},{name:'Validation plan',points:25},{name:'Evidence/limitations',points:20}], evidenceKey:'patchTriage',
    sourceNote: 'This exercise is inspired by the fact that Debian publishes frequent security and regression updates. It is not a claim that the named real package has the synthetic test failure shown here.'
  }
];

function safeText(value, limit = 500) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
}
function formatDate(value) {
  if (!value) return 'Date not supplied by source';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return safeText(value, 30);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}
function formatDateTime(value) {
  if (!value) return 'Not yet recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return safeText(value, 40);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(date);
}
function statusLabel(status) {
  const clean = String(status || 'ACTIVE').toUpperCase();
  return ['NEW', 'UPDATED', 'ACTIVE', 'ARCHIVED'].includes(clean) ? clean : 'ACTIVE';
}
function statusTone(status) {
  const clean = statusLabel(status).toLowerCase();
  return `liveops-status-${clean}`;
}
function effectiveStatus(item) {
  const current = statusLabel(item?.freshness || item?.status);
  const anchor = parseDateForUi(item?.publishedAt);
  const updated = parseDateForUi(item?.updatedAt);
  const latest = updated && (!anchor || updated > anchor) ? updated : anchor;
  if ((current === 'NEW' || current === 'UPDATED') && latest) {
    const age = (Date.now() - latest.getTime()) / 86400000;
    if (age > 7) return age > 90 ? 'ARCHIVED' : 'ACTIVE';
  }
  return current;
}
function parseDateForUi(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function downloadBlob(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function makeSourceChallenge(item) {
  const category = safeText(item.category || 'general security', 80);
  const title = safeText(item.title || 'Security update requires triage', 180);
  const id = `source-${safeText(item.id || title, 100).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return {
    id, title: `Triage: ${title}`, level: 'Intermediate', duration: '45–90 minutes', area: category,
    summary: safeText(item.summary || 'Review the attributed source record and identify the defensive work it implies.', 520),
    task: 'Treat this as a source-led candidate exercise. Verify affected components and versions from the original source, separate known facts from assumptions, then produce a defensive triage and validation plan. Do not test the real affected service.',
    sourceUrl: item.sourceUrl, sourceName: item.sourceName, reference: item.reference || item.id, publishedAt: item.publishedAt,
    sourceConfidence: item.confidence || 'Public source record; verify source details', freshness: statusLabel(item.status),
    objectives: ['Identify the affected component and source-supported facts.', 'Write down unknowns and alternative explanations.', 'Prioritise a safe mitigation or patch-validation action.', 'Define a regression test and evidence required to close the issue.'],
    deliverables: ['Source-backed triage note', 'Mitigation/patch validation plan', 'Test matrix including a negative test', 'Limitations and next checks'],
    skills: ['source validation', 'risk triage', 'remediation', 'testing'], rubric: [{name:'Facts and source references',points:30},{name:'Risk prioritisation',points:25},{name:'Mitigation plan',points:25},{name:'Testing and limitations',points:20}],
    evidenceKey: null, sourceNote: 'This is an automatically templated candidate exercise based on public source metadata. It has not been individually reviewed as a bespoke lab; verify the original source and treat any generated context as a learning prompt only.'
  };
}

export function LiveOps({ Icon }) {
  const [feed, setFeed] = useState(null);
  const [feedError, setFeedError] = useState('');
  const [feedFromOfflineCache, setFeedFromOfflineCache] = useState(false);
  const [tab, setTab] = useState('challenges');
  const [search, setSearch] = useState('');
  const [freshness, setFreshness] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [drafts, setDrafts] = useState(() => {
    try { const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); return parsed && typeof parsed === 'object' ? parsed : {}; } catch { return {}; }
  });
  const [savedIds, setSavedIds] = useState(() => {
    try { const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(FEED_URL, { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
      return response.json().then((data) => ({ data, offlineCache: response.headers.get('X-OpenCyberPath-Data-Source') === 'offline-cache' }));
    }).then(({ data, offlineCache }) => {
      if (!cancelled && data && Array.isArray(data.items)) {
        setFeed(data);
        setFeedFromOfflineCache(offlineCache);
      } else if (!cancelled) throw new Error('Feed format was not recognised');
    }).catch((error) => { if (!cancelled) setFeedError(safeText(error?.message || 'Unable to load the latest source feed.', 200)); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)); } catch { setNotice('Browser storage is unavailable. Export your draft to keep it.'); } }, [drafts]);
  useEffect(() => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds)); } catch { setNotice('Browser storage is unavailable. Saved challenge markers may not persist.'); } }, [savedIds]);

  const sourceItems = useMemo(() => Array.isArray(feed?.items) ? feed.items : [], [feed]);
  const derived = useMemo(() => sourceItems.slice().sort((a,b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || ''))).slice(0, 60).map(makeSourceChallenge), [sourceItems]);
  const allChallenges = useMemo(() => [...STARTER_CHALLENGES, ...derived], [derived]);
  const visibleChallenges = useMemo(() => allChallenges.filter((challenge) => {
    const term = search.trim().toLowerCase();
    const matchesText = !term || [challenge.title, challenge.summary, challenge.area, challenge.sourceName, challenge.reference, ...(challenge.skills || [])].join(' ').toLowerCase().includes(term);
    const matchesFresh = freshness === 'all' || effectiveStatus(challenge) === freshness;
    const matchesDifficulty = difficulty === 'all' || challenge.level.toLowerCase().includes(difficulty);
    const matchesSource = sourceFilter === 'all' || challenge.sourceName === sourceFilter;
    return matchesText && matchesFresh && matchesDifficulty && matchesSource;
  }), [allChallenges, search, freshness, difficulty, sourceFilter]);

  const activeChallenge = selected ? allChallenges.find((item) => item.id === selected) || null : null;
  const getDraft = (id) => drafts[id] || { hypothesis: '', evidence: '', rootCause: '', remediation: '', validation: '', limitations: '', reviewed: {} };
  function updateDraft(id, field, value) {
    setDrafts((current) => ({ ...current, [id]: { ...(current[id] || { hypothesis: '', evidence: '', rootCause: '', remediation: '', validation: '', limitations: '', reviewed: {} }), [field]: value } }));
  }
  function updateChecklist(id, name, value) {
    setDrafts((current) => { const currentDraft = current[id] || { hypothesis: '', evidence: '', rootCause: '', remediation: '', validation: '', limitations: '', reviewed: {} }; return { ...current, [id]: { ...currentDraft, reviewed: { ...(currentDraft.reviewed || {}), [name]: value } } }; });
  }
  function exportSolution(challenge) {
    const draft = getDraft(challenge.id);
    const payload = {
      product: 'OpenCyberPath LiveOps', version: 1,
      challenge: { id: challenge.id, title: challenge.title, sourceName: challenge.sourceName, sourceReference: challenge.reference, sourceUrl: challenge.sourceUrl, publishedAt: challenge.publishedAt, sourceConfidence: challenge.sourceConfidence },
      trainingBoundary: 'All practice must stay in the supplied synthetic fixture or explicitly authorised training environment. Do not test the real affected service.',
      submittedAt: new Date().toISOString(), draft,
      privacy: 'Review and redact personal information, secrets, and credentials before sharing this exported record. This is a local learner submission, not an independently verified result.'
    };
    downloadBlob(`${challenge.id}-solution.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    setNotice('Solution exported as JSON. This is not a graded or verified submission.');
  }
  function exportEvidence(challenge) {
    if (!challenge.evidenceKey || !STARTER_EVIDENCE[challenge.evidenceKey]) return;
    const pack = STARTER_EVIDENCE[challenge.evidenceKey];
    downloadBlob(`${challenge.id}-synthetic-evidence.json`, JSON.stringify({ product: 'OpenCyberPath LiveOps', challengeId: challenge.id, synthetic: true, label: 'FICTIONAL TRAINING EVIDENCE — NOT FROM A REAL VICTIM', ...pack }, null, 2), 'application/json;charset=utf-8');
  }
  function saveSelected(challenge) {
    setSavedIds((current) => current.includes(challenge.id) ? current.filter((id) => id !== challenge.id) : [...current, challenge.id]);
    setNotice(savedIds.includes(challenge.id) ? 'Challenge removed from your saved list.' : 'Challenge saved locally in this browser.');
  }
  function resetDraft(challenge) {
    const confirmed = window.confirm('Clear this local solution draft? This action cannot be undone.');
    if (!confirmed) return;
    setDrafts((current) => { const next = { ...current }; delete next[challenge.id]; return next; });
    setNotice('Local solution draft cleared.');
  }
  const sourceNames = [...new Set(allChallenges.map((item) => item.sourceName).filter(Boolean))].sort();
  const sourceHealth = Array.isArray(feed?.sources) ? feed.sources : [];
  const generatedAt = feed?.generatedAt || feed?.meta?.generatedAt;
  const feedIsSnapshot = !feed || feed.feedMode === 'starter-snapshot';
  const feedIsManual = Boolean(feed && feed.feedMode === 'manual-refresh');

  return <section className="section-wrap liveops-wrap" aria-labelledby="liveops-title">
    <section className="liveops-hero">
      <div className="liveops-hero-copy">
        <div className="section-kicker"><span className="liveops-pulse"/> LIVEOPS · REAL SOURCES · SYNTHETIC PRACTICE</div>
        <h1 id="liveops-title">Real problems.<br/><em>Defensible solutions.</em></h1>
        <p>Work from public security advisories and uncommon technical sources. Reconstruct the failure, validate your reasoning, and prepare evidence a reviewer can reproduce—without touching real affected systems.</p>
        <div className="liveops-hero-actions"><button className="button button-primary" onClick={() => { setTab('challenges'); document.getElementById('liveops-board')?.scrollIntoView({behavior:'smooth',block:'start'}); }}>Explore problem statements <Icon name="arrow-right" size={16}/></button><button className="button button-quiet" onClick={() => setTab('sources')}><Icon name="radar" size={16}/> View source radar</button></div>
        <div className="liveops-identity-note"><Icon name="shield-check" size={16}/> Public cards identify source organisations and references—not individual reporters.</div>
      </div>
      <div className="liveops-hero-panel">
        <div className="liveops-orbit-art"><span className="liveops-orbit liveops-orbit-a"/><span className="liveops-orbit liveops-orbit-b"/><span className="liveops-orbit-core"><Icon name="radar" size={31}/></span><span className="liveops-art-node liveops-art-node-a">SOURCE</span><span className="liveops-art-node liveops-art-node-b">EVIDENCE</span><span className="liveops-art-node liveops-art-node-c">VALIDATE</span></div>
        <div className="liveops-stats"><div><b>{STARTER_CHALLENGES.length}</b><span>Reviewed starter labs</span></div><div><b>{sourceItems.length}</b><span>Source records</span></div><div><b>{sourceHealth.filter((source) => source.status === 'ok').length}/{sourceHealth.length || 4}</b><span>Sources reporting OK</span></div></div>
      </div>
    </section>

    {feedFromOfflineCache && <div className="liveops-feed-warning" role="status"><Icon name="lightbulb" size={17}/><div><b>Offline cached source feed.</b><p>A fresh network response was unavailable. Last feed generation: {formatDateTime(feed?.generatedAt || feed?.meta?.generatedAt)}. Reconnect and reload to verify current source records.</p></div></div>}
    {feedIsSnapshot && <div className="liveops-feed-warning" role="status"><Icon name="lightbulb" size={17}/><div><b>Starter snapshot — scheduled refresh is not confirmed yet.</b><p>{feed ? 'The bundled feed is available, but it becomes automatically refreshed only after the project and workflow are pushed to GitHub and the scheduled action runs.' : `The source feed could not be loaded (${feedError || 'waiting for response'}). The reviewed starter challenges remain available.`}</p></div></div>}
    {feedIsManual && <div className="liveops-feed-warning" role="status"><Icon name="lightbulb" size={17}/><div><b>Feed refreshed manually — schedule not yet confirmed.</b><p>Last collector run: {formatDateTime(generatedAt)}. Push the workflow to GitHub and check Actions to enable scheduled refreshes.</p></div></div>}
    {!feedIsSnapshot && !feedIsManual && <div className="liveops-feed-ok" role="status"><Icon name="check-circle" size={17}/><div><b>Scheduled source feed</b><p>Last feed generation: {formatDate(generatedAt)} · this is the collector time, not a guarantee of instant updates.</p></div></div>}

    <div className="liveops-mode-bar" id="liveops-board">
      <div className="liveops-mode-copy"><span className="section-kicker">THE CHALLENGE BOARD</span><h2>Investigate the signal.<br/><em>Prove the control.</em></h2><p>Challenge prompts are not copied exploit instructions. Each task focuses on investigation, risk decisions, tests and defensive validation.</p></div>
      <div className="liveops-mode-tabs" role="tablist" aria-label="LiveOps views"><button role="tab" aria-selected={tab === 'challenges'} className={tab === 'challenges' ? 'is-active' : ''} onClick={() => setTab('challenges')}><Icon name="target" size={16}/> Problem statements</button><button role="tab" aria-selected={tab === 'sources'} className={tab === 'sources' ? 'is-active' : ''} onClick={() => setTab('sources')}><Icon name="radar" size={16}/> Source radar</button></div>
    </div>

    {tab === 'challenges' ? <>
      <div className="liveops-filterbar"><label className="liveops-search"><Icon name="search" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problem, skill, ID or source…" aria-label="Search LiveOps problem statements"/></label><label><span>Freshness</span><select value={freshness} onChange={(event) => setFreshness(event.target.value)}><option value="all">All statuses</option><option value="NEW">New</option><option value="UPDATED">Updated</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label><label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">All levels</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label><span>Source</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}><option value="all">All sources</option>{sourceNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label></div>
      <div className="liveops-result-line"><span>Showing <b>{visibleChallenges.length}</b> problem statements and source-led candidates</span><span>Saved locally: <b>{savedIds.length}</b></span></div>
      <div className="liveops-challenge-grid">{visibleChallenges.map((challenge) => <article className="liveops-challenge-card" key={challenge.id}>
        <div className="liveops-card-top"><span className={`liveops-status ${statusTone(effectiveStatus(challenge))}`}>{effectiveStatus(challenge)}</span><span className="liveops-source-confidence"><Icon name="shield-check" size={13}/>{challenge.sourceConfidence}</span></div>
        <div className="liveops-card-eyebrow">{safeText(challenge.area, 80)} <span>•</span> {safeText(challenge.level, 80)}</div>
        <h3>{challenge.title}</h3><p>{challenge.summary}</p>
        <div className="liveops-card-meta"><span><Icon name="clock" size={14}/>{challenge.duration}</span><span><Icon name="clock" size={14}/>{formatDate(challenge.publishedAt)}</span></div>
        <div className="liveops-skill-tags">{(challenge.skills || []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
        <div className="liveops-card-source"><span>Source: <b>{challenge.sourceName || 'Public source'}</b></span><span>{challenge.reference || 'Public record'}</span></div>
        <div className="liveops-card-actions"><button className="button button-primary" onClick={() => setSelected(challenge.id)}>Open challenge <Icon name="arrow-right" size={15}/></button><button className={`liveops-save ${savedIds.includes(challenge.id) ? 'is-saved' : ''}`} onClick={() => saveSelected(challenge)} aria-label={savedIds.includes(challenge.id) ? 'Remove saved challenge' : 'Save challenge'}><Icon name={savedIds.includes(challenge.id) ? 'bookmark-check' : 'bookmark'} size={16}/></button></div>
      </article>)}</div>
      {visibleChallenges.length === 0 && <div className="liveops-empty"><Icon name="search" size={27}/><h3>No matches for these filters</h3><p>Clear a filter or broaden the search phrase.</p><button className="button button-quiet" onClick={() => {setSearch('');setFreshness('all');setDifficulty('all');setSourceFilter('all');}}>Clear filters</button></div>}
    </> : <section className="liveops-source-view">
      <div className="liveops-source-intro"><div><span className="section-kicker">APPROVED PUBLIC SOURCES</span><h3>Signals in. <em>Evidence out.</em></h3><p>This radar lists public source records. An issue, commit or source update is not automatically proof of a vulnerability or a ready-to-publish challenge. Freshness labels describe source timing, not whether a system is patched.</p></div><div className="liveops-last-sync"><span>Feed generated</span><b>{generatedAt ? formatDateTime(generatedAt) : 'Starter snapshot'}</b><small>{feed?.feedMode === 'automated-refresh' ? 'Automated collector' : 'Snapshot; not yet confirmed automated'}</small></div></div>
      <div className="liveops-source-health-grid">{(sourceHealth.length ? sourceHealth : [
        {id:'cert-in',name:'CERT-In',url:'https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST02&year=2026',status:'snapshot',message:'Official Indian government advisories',itemsSeen:4},
        {id:'cisa-kev',name:'CISA KEV',url:'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',status:'snapshot',message:'Known exploited vulnerability catalogue',itemsSeen:0},
        {id:'github-advisories',name:'GitHub Global Security Advisories',url:'https://docs.github.com/en/rest/security-advisories/global-advisories',status:'snapshot',message:'Public reviewed package security advisories',itemsSeen:0},
        {id:'debian',name:'Debian Security Advisories',url:'https://www.debian.org/security/dsa',status:'snapshot',message:'Distribution-level advisories and regressions',itemsSeen:3},
        {id:'github-signals',name:'GitHub Public Issues & Fix Signals',url:'https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests',status:'snapshot',message:'Public issue/PR title-only signals; unverified until reviewed',itemsSeen:0}
      ]).map((source) => <article className="liveops-source-tile" key={source.id}><div className="liveops-source-tile-top"><span className={`liveops-source-dot ${source.status === 'ok' ? 'is-ok' : source.status === 'error' ? 'is-error' : ''}`}/><b>{source.name}</b><span className="liveops-source-state">{source.status === 'ok' ? 'OK' : source.status === 'error' ? 'Error' : 'Snapshot'}</span></div><p>{source.message || `${source.itemsSeen || 0} source items collected.`}</p><div className="liveops-source-tile-bottom"><span>{source.itemsSeen ?? 0} records</span><a href={source.url} target="_blank" rel="noreferrer">Open source <Icon name="arrow-up-right" size={13}/></a></div>{source.lastSuccessAt && <small className="liveops-source-updated">Last success: {formatDateTime(source.lastSuccessAt)}</small>}</article>)}</div>
      <div className="liveops-feed-list-heading"><h3>Recent source records</h3><span>{sourceItems.length} entries · contributor names not shown</span></div>
      <div className="liveops-source-record-list">{sourceItems.slice().sort((a,b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || ''))).slice(0,80).map((item) => <article className="liveops-source-record" key={item.id}><div><span className={`liveops-status ${statusTone(effectiveStatus(item))}`}>{effectiveStatus(item)}</span><span className="liveops-source-name">{item.sourceName}</span><h4>{item.title}</h4><p>{item.summary || 'Open the original source for details.'}</p><div className="liveops-source-record-meta"><span>{item.reference || item.id}</span><span>Published: {formatDate(item.publishedAt)}</span>{item.updatedAt && <span>Updated: {formatDate(item.updatedAt)}</span>}</div></div><a className="liveops-source-open" href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${item.title}`}>View source <Icon name="arrow-up-right" size={15}/></a></article>)}</div>
      {sourceItems.length === 0 && <div className="liveops-empty"><h3>No source records loaded</h3><p>The curated starter challenges still work; the collector must run successfully to populate this feed.</p></div>}
    </section>}

    <div className="liveops-method-strip"><div><Icon name="file-text" size={19}/><span><b>Real source, synthetic environment</b><small>Attribution and source dates stay traceable; training evidence is clearly labelled.</small></span></div><div><Icon name="shield-check" size={19}/><span><b>Privacy-aware display</b><small>Individual researcher names are not displayed on public cards.</small></span></div><div><Icon name="check-circle" size={19}/><span><b>Honest status labels</b><small>Source records are candidates until their challenge is reviewed.</small></span></div></div>
    {notice && <div className="liveops-notice" role="status"><Icon name="lightbulb" size={15}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}

    {activeChallenge && <div className="liveops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="liveops-modal" role="dialog" aria-modal="true" aria-labelledby="liveops-detail-title"><div className="liveops-modal-header"><div><span className={`liveops-status ${statusTone(effectiveStatus(activeChallenge))}`}>{effectiveStatus(activeChallenge)}</span><span className="liveops-card-eyebrow">{activeChallenge.sourceName} · {activeChallenge.reference}</span><h2 id="liveops-detail-title">{activeChallenge.title}</h2><p>{activeChallenge.summary}</p></div><button className="liveops-modal-close" onClick={() => setSelected(null)} aria-label="Close challenge">×</button></div>
      <div className="liveops-modal-body"><div className="liveops-task-callout"><b>Mission</b><p>{activeChallenge.task}</p><small>{activeChallenge.sourceNote}</small></div>
        <div className="liveops-detail-columns"><div><h3>Investigation objectives</h3><ol>{activeChallenge.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol><h3>Required deliverables</h3><ul>{activeChallenge.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}</ul><h3>Evaluation rubric · 100 points</h3><div className="liveops-rubric">{activeChallenge.rubric.map((criterion) => <div key={criterion.name}><span>{criterion.name}</span><b>{criterion.points}</b></div>)}<div className="liveops-rubric-total"><span>Total available</span><b>{activeChallenge.rubric.reduce((sum,criterion) => sum + criterion.points,0)}</b></div></div></div>
          <aside><div className="liveops-evidence-panel"><div className="liveops-evidence-panel-top"><Icon name="file-text" size={17}/><b>Evidence pack</b></div>{activeChallenge.evidenceKey ? <><p>Download a JSON bundle with timestamps, source events, synthetic inventory files and an explicit synthetic-data label.</p><button className="button button-primary" onClick={() => exportEvidence(activeChallenge)}><Icon name="download" size={15}/> Download synthetic evidence</button></> : <p>This feed record has no dedicated evidence pack yet. Use it as a source-backed triage exercise; do not infer details absent from the original advisory.</p>}<a href={activeChallenge.sourceUrl} target="_blank" rel="noreferrer">Open attributed source <Icon name="arrow-up-right" size={14}/></a></div><div className="liveops-skill-panel"><b>Skills practised</b><div className="liveops-skill-tags">{(activeChallenge.skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="liveops-detail-meta"><span>Source date</span><b>{formatDate(activeChallenge.publishedAt)}</b><span>Duration</span><b>{activeChallenge.duration}</b><span>Confidence</span><b>{activeChallenge.sourceConfidence}</b></div></div></aside></div>
        <div className="liveops-solution-workspace"><div className="liveops-solution-heading"><div><span className="section-kicker">YOUR WORKSPACE · LOCAL ONLY</span><h3>Write the solution. <em>Keep the evidence.</em></h3><p>Use the supplied training files only. Drafts save to this browser and are not uploaded or automatically graded.</p></div><button className="button button-quiet" onClick={() => exportSolution(activeChallenge)}><Icon name="download" size={15}/> Export solution JSON</button></div>
          {['hypothesis','evidence','rootCause','remediation','validation','limitations'].map((field) => {const labels={hypothesis:['Initial hypothesis','What are you investigating?'],evidence:['Evidence references','Record event IDs, timestamps and fields supporting your claim.'],rootCause:['Root cause and alternatives','Explain the design or process failure; include an alternative explanation.'],remediation:['Remediation plan','Prioritise controls and explain their scope.'],validation:['Validation tests','Include positive tests, negative tests, and false-positive checks.'],limitations:['Limitations and next checks','State what cannot be established and what you would inspect next.']};return <label className="liveops-solution-field" key={field}><span>{labels[field][0]}</span><textarea value={getDraft(activeChallenge.id)[field] || ''} onChange={(event) => updateDraft(activeChallenge.id,field,event.target.value.slice(0,12000))} placeholder={labels[field][1]} rows={field === 'hypothesis' ? 2 : 3}/></label>;})}
          <div className="liveops-review-checks"><b>Before exporting</b>{[['scope','I stayed inside the supplied synthetic scope.'],['sources','I cited the evidence and separated facts from inference.'],['privacy','I removed secrets and personal information.'],['tests','I described how the fix can be validated.']].map(([key,label]) => <label key={key}><input type="checkbox" checked={Boolean(getDraft(activeChallenge.id).reviewed?.[key])} onChange={(event) => updateChecklist(activeChallenge.id,key,event.target.checked)}/><span>{label}</span></label>)}</div>
          <div className="liveops-solution-actions"><button className="button button-primary" onClick={() => exportSolution(activeChallenge)}><Icon name="download" size={15}/> Export solution record</button><button className="button button-quiet" onClick={() => resetDraft(activeChallenge)}>Clear this draft</button><span>Self-authored work · not a credential or verified score</span></div>
        </div>
      </div>
      </section></div>}
  </section>;
}

export default LiveOps;
