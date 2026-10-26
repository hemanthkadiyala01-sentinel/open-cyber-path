export const CASE_ID = 'midnight-blizzard-identity-response';
export const CASE_REVISION = '1.2.0';

const CASE_DEFINITION = {
  id: CASE_ID,
  revision: CASE_REVISION,
  title: 'The Unexpected Consent: Cloud Identity Incident Response',
  subtitle: 'A staged investigation into identity signals, application permissions, mailbox activity, and response validation.',
  topic: 'Identity & cloud security',
  difficulty: 'Intermediate',
  estimatedMinutes: 45,
  curationStatus: 'draft-awaiting-human-review',
  sourceCheckedAt: '2026-10-24',
  context: 'MISSION: You are the Tier-2 analyst on duty for a fictional organisation. An identity alert shows repeated failures followed by a successful sign-in. Minutes later, an unfamiliar cloud application receives consent and mailbox-related permissions, then performs mailbox reads. Your task is to reconstruct what the supplied records support, test competing explanations, determine scope, and propose a response that can be verified. This investigation is inspired by public reporting about the 2023–2024 Midnight Blizzard incident; the training tenant and all records below are fictional and are not Microsoft victim telemetry.',
  learningObjectives: [
    'Correlate repeated authentication failures with a later success without treating the pattern alone as proof of compromise.',
    'Trace the relationship between OAuth consent, application permissions, and mailbox-access telemetry.',
    'Prioritize containment while preserving audit evidence and checking whether sessions or tokens remain usable.',
    'Separate source-backed incident facts from synthetic training evidence and state uncertainty accurately.',
  ],
  safetyAndScope: 'Training only. The evidence below is synthetic and was created for this exercise. It is not telemetry from Microsoft, an affected organization, or a real tenant. Use the exercise to practise defensive triage only; do not test the techniques against real accounts or systems.',
  evidenceDisclaimer: 'SYNTHETIC TRAINING EVIDENCE — every account, event, application name, timestamp, and activity record below is fictional. Documentation-only IP ranges are used. These records do not reproduce victim telemetry from the public incident.',
  factsAndLimits: [
    'Microsoft reported password spraying against a legacy non-production test tenant account beginning in late November 2023 and detected the activity on its corporate systems in January 2024.',
    'Microsoft later described the use of malicious OAuth applications and application permissions during continued activity.',
    'CISA Emergency Directive 24-02 applied to U.S. federal civilian executive branch agencies; it is not a universal legal requirement for every organisation.',
    'The training events are fictional. They illustrate defensive correlation questions, not the actual timeline, indicators, or internal logs from the Microsoft incident.',
  ],
  sources: [
    {
      id: 'msrc-disclosure-2024-01-19',
      sourceGroup: 'incident-disclosures',
      publisher: 'Microsoft Security Response Center',
      title: 'Microsoft Actions Following Attack by Nation State Actor Midnight Blizzard',
      publishedAt: '2024-01-19',
      url: 'https://www.microsoft.com/en-us/msrc/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/',
      sourceType: 'Primary incident disclosure',
      supports: 'Microsoft’s stated discovery date, the reported password-spray foothold, the legacy non-production test account, and the limited corporate-email access described at that time.',
    },
    {
      id: 'mti-responder-guidance-2024-01-25',
      sourceGroup: 'technical-response',
      publisher: 'Microsoft Threat Intelligence',
      title: 'Midnight Blizzard: Guidance for responders on nation-state attack',
      publishedAt: '2024-01-25',
      url: 'https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/',
      sourceType: 'Primary technical guidance',
      supports: 'Microsoft’s later description of legacy test OAuth application abuse, malicious OAuth apps, app permissions, and the limits of IP-only detection in that activity.',
    },
    {
      id: 'cisa-ed-24-02-2024-04-11',
      sourceGroup: 'government-response',
      publisher: 'Cybersecurity and Infrastructure Security Agency (CISA)',
      title: 'Emergency Directive 24-02: Mitigating the Significant Risk from Nation-State Compromise of Microsoft Corporate Email System',
      publishedAt: '2024-04-11',
      url: 'https://www.cisa.gov/news-events/directives/ed-24-02-mitigating-significant-risk-nation-state-compromise-microsoft-corporate-email-system',
      sourceType: 'Government response directive',
      supports: 'The federal directive’s response focus: assess exposed email contents, reset affected credentials, and secure privileged cloud accounts; the directive’s stated scope is federal civilian executive branch agencies.',
    },
    {
      id: 'msrc-update-2024-03-08',
      sourceGroup: 'incident-disclosures',
      publisher: 'Microsoft Security Response Center',
      title: 'Update on Microsoft Actions Following Attack by Nation State Actor Midnight Blizzard',
      publishedAt: '2024-03-08',
      url: 'https://www.microsoft.com/en-us/msrc/blog/2024/03/update-on-microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard',
      sourceType: 'Primary incident update',
      supports: 'Microsoft’s later update on continued activity, password-spray volume, and attempts to use information found in exfiltrated email.',
    },
    {
      id: 'cisa-ed-24-02-alert-2024-04-11',
      sourceGroup: 'government-response',
      publisher: 'Cybersecurity and Infrastructure Security Agency (CISA)',
      title: 'CISA Issues Emergency Directive 24-02: Mitigating the Significant Risk from Nation-State Compromise of Microsoft Corporate Email System',
      publishedAt: '2024-04-11',
      url: 'https://www.cisa.gov/news-events/alerts/2024/04/11/cisa-issues-emergency-directive-24-02-mitigating-significant-risk-nation-state-compromise-microsoft',
      sourceType: 'Government incident alert',
      supports: 'The official announcement explains why federal civilian executive branch agencies were directed to review potentially exposed correspondence, reset affected credentials, and secure privileged Azure accounts. Use it to learn scope and authority—not to generalize the directive as a universal legal requirement.'
    },
    {
      id: 'mslearn-app-consent-playbook',
      sourceGroup: 'defender-playbooks',
      publisher: 'Microsoft Learn',
      title: 'App consent grant investigation',
      publishedAt: 'Undated; checked 2026-10-24',
      url: 'https://learn.microsoft.com/en-us/security/operations/incident-response-playbook-app-consent',
      sourceType: 'Official investigation playbook',
      supports: 'A step-by-step defensive playbook for reviewing consent grants, app permissions, affected identities, audit evidence, attack scope, remediation and prevention. This is general operational guidance, not a claim about private Microsoft victim logs.'
    },
    {
      id: 'mslearn-risky-oauth-apps',
      sourceGroup: 'defender-playbooks',
      publisher: 'Microsoft Learn',
      title: 'Investigate and remediate risky OAuth apps',
      publishedAt: 'Undated; checked 2026-10-24',
      url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/investigate-risky-oauth',
      sourceType: 'Official detection and remediation guidance',
      supports: 'Shows how defenders review app publishers, permission levels, consent activity and related app activity, then ban or revoke a risky app where justified. Use this to practise testing whether an application is expected, not merely unfamiliar.'
    },
    {
      id: 'mslearn-oauth-anomaly-alerts',
      sourceGroup: 'defender-playbooks',
      publisher: 'Microsoft Learn',
      title: 'How to investigate anomaly detection alerts',
      publishedAt: 'Undated; checked 2026-10-24',
      url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/investigate-anomaly-alerts',
      sourceType: 'Official detection guidance',
      supports: 'Describes suspicious OAuth-app credential additions and unusual app activity, plus the distinction between true positives and false positives. It supports analysis and detection practice; current product behaviour should be checked against the live documentation.'
    },
    {
      id: 'mitre-apt29-group',
      sourceGroup: 'threat-intelligence',
      publisher: 'MITRE ATT&CK',
      title: 'APT29 (G0016) — threat group and technique reference',
      publishedAt: 'Continuously maintained; checked 2026-10-24',
      url: 'https://attack.mitre.org/groups/G0016/',
      sourceType: 'Threat actor and technique reference',
      supports: 'A maintained reference for reported activity and technique mappings associated with APT29 / Midnight Blizzard naming. Treat technique mappings as contextual intelligence; they do not prove that any one technique occurred in every incident.'
    },
    {
      id: 'bleepingcomputer-source-code-followup-2024-03-08',
      sourceGroup: 'independent-analysis',
      publisher: 'BleepingComputer',
      title: 'Microsoft says Russian hackers breached its systems, accessed source code',
      publishedAt: '2024-03-08',
      url: 'https://www.bleepingcomputer.com/news/microsoft/microsoft-says-russian-hackers-breached-its-systems-accessed-source-code/',
      sourceType: 'Independent incident reporting',
      supports: 'Secondary reporting on Microsoft’s March update and the reported use of information from earlier email exfiltration. Compare the report to Microsoft’s own statement before treating details as confirmed.'
    },
    {
      id: 'trellix-midnight-blizzard-detection',
      sourceGroup: 'independent-analysis',
      publisher: 'Trellix',
      title: 'Midnight Blizzard Attack Detection in Trellix Helix',
      publishedAt: 'Publication date not displayed; checked 2026-10-24',
      url: 'https://www.trellix.com/blogs/research/midnight-blizzard-attack-detection-in-trellix-helix/',
      sourceType: 'Independent detection analysis and attack-flow diagram',
      supports: 'A vendor analysis illustrating the reported sequence and a detection perspective. It is secondary interpretation; compare its assertions with Microsoft’s primary disclosure and guidance.'
    },
    {
      id: 'appomni-midnight-blizzard-flow-analysis',
      sourceGroup: 'independent-analysis',
      publisher: 'AppOmni',
      title: 'Midnight Blizzard and Cloudflare-Atlassian cybersecurity incidents',
      publishedAt: '2024; exact publication date not displayed',
      url: 'https://appomni.com/blog/midnight-blizzard-and-cloudflare-atlassian-cybersecurity-incidents/',
      sourceType: 'Independent analysis and publisher-hosted incident-flow illustration',
      supports: 'A visual interpretation of the reported identity and OAuth attack flow. The illustration is a secondary explanation, not an original Microsoft forensic artifact; the site links to the publisher-hosted visual rather than copying it.'
    },
  ],
  tasks: [
    'Stage 1 — Triage: establish the UTC sequence and identify which authentication records are relevant without treating a failure-to-success pattern as proof on its own.',
    'Stage 2 — Correlate: connect consent, application permission, credential, and mailbox events across different record sources.',
    'Stage 3 — Test alternatives: compare the suspicious application with the supplied known-good control, change-management lookup, owner confirmation, and missing context.',
    'Stage 4 — Scope: state what can be concluded about affected identities and mailbox activity, and what is still unknown.',
    'Stage 5 — Respond: prioritize evidence preservation and proportionate containment; distinguish requested actions from completed actions.',
    'Stage 6 — Validate: specify the exact post-response records, expected results, and closure owner.',
  ],
  hints: [
    { id: 'hint-1', stage: 'triage', title: 'Start with time and identity', text: 'Sort by UTC timestamp. Track the principal, application name, and source across log types. Separate the observable sequence from your interpretation.' },
    { id: 'hint-2', stage: 'correlate', title: 'Look for a cross-source chain', text: 'Compare identity sign-in, directory audit, application inventory, change records, and mailbox audit. A single event rarely establishes cause or impact.' },
    { id: 'hint-3', stage: 'test-alternatives', title: 'Use the control record carefully', text: 'The known-good application is not the same principal or client. Explain what the comparison supports and what it cannot rule out.' },
    { id: 'hint-4', stage: 'respond', title: 'Request is not completion', text: 'A revocation request or pending disable ticket does not prove that access has stopped. Define a verification step and expected observation.' },
  ],
  hypothesisOptions: [
    { id: 'identity-compromise-suspected', label: 'Suspected identity compromise with possible OAuth application abuse; contain and validate before declaring scope.' },
    { id: 'legitimate-automation', label: 'Likely legitimate automation; verify the application owner, approved change, and expected activity before closing.' },
    { id: 'insufficient-evidence', label: 'Evidence is insufficient to choose a likely explanation; preserve the records and gather identity and application context.' },
  ],
  responseActions: [
    { id: 'disable-oauth-app', label: 'Restrict or disable the suspicious app/consent through the approved incident process after confirming ownership and impact.' },
    { id: 'revoke-sessions', label: 'Revoke affected sessions and refresh tokens; verify revocation rather than assuming the request ended access.' },
    { id: 'reset-credentials', label: 'Reset credentials for affected identities and check for password reuse or related accounts where policy requires.' },
    { id: 'preserve-audit-logs', label: 'Preserve sign-in, directory audit, consent, application, and mailbox logs with UTC timestamps and collection notes.' },
    { id: 'review-privileged-access', label: 'Review privileged role assignments, application permissions, and all affected identities for scope and persistence.' },
    { id: 'confirm-with-account-owner', label: 'Verify unexpected activity with the account/app owner using an independently trusted channel.' },
  ],
} as const;

export interface SyntheticEvidenceEvent {
  id: string;
  timestampUtc: string;
  sourceType: string;
  eventType: string;
  principal: string;
  source: string;
  result: string;
  detail: string;
  classification: 'synthetic';
}

const SYNTHETIC_EVIDENCE: SyntheticEvidenceEvent[] = [
  {
    "id": "evt-101",
    "timestampUtc": "2026-02-04T08:12:03Z",
    "sourceType": "Identity sign-in log",
    "eventType": "sign-in.failure",
    "principal": "svc-legacy-test",
    "source": "198.51.100.24",
    "result": "Failure",
    "detail": "Password authentication failed for the fictional service account. One failure alone is not enough to attribute an actor or confirm compromise.",
    "classification": "synthetic"
  },
  {
    "id": "evt-102",
    "timestampUtc": "2026-02-04T08:12:19Z",
    "sourceType": "Identity sign-in log",
    "eventType": "sign-in.failure",
    "principal": "svc-legacy-test",
    "source": "198.51.100.24",
    "result": "Failure",
    "detail": "A second password failure for the same synthetic account and source, 16 seconds later. Check the wider baseline and whether the source is expected for this account.",
    "classification": "synthetic"
  },
  {
    "id": "evt-103",
    "timestampUtc": "2026-02-04T08:13:07Z",
    "sourceType": "Identity sign-in log",
    "eventType": "sign-in.success",
    "principal": "svc-legacy-test",
    "source": "198.51.100.24",
    "result": "Success; device and MFA context absent",
    "detail": "A successful sign-in follows the failures. This is a high-priority pivot, but the excerpt does not contain enough device, client, or MFA context to declare the account compromised by itself.",
    "classification": "synthetic"
  },
  {
    "id": "evt-104",
    "timestampUtc": "2026-02-04T08:13:08Z",
    "sourceType": "Conditional access record",
    "eventType": "conditional-access.evaluated",
    "principal": "svc-legacy-test",
    "source": "Synthetic identity policy log",
    "result": "Report-only evaluation",
    "detail": "The relevant policy evaluated in report-only mode and did not block this sign-in. Confirm whether this mode was expected and whether another control applied.",
    "classification": "synthetic"
  },
  {
    "id": "evt-105",
    "timestampUtc": "2026-02-04T08:14:24Z",
    "sourceType": "Directory audit log",
    "eventType": "oauth.consent-granted",
    "principal": "svc-legacy-test",
    "source": "Synthetic directory audit",
    "result": "Consent granted",
    "detail": "The synthetic identity granted consent to an unfamiliar fictional application named Calendar Bridge QA. The record does not independently establish who requested or approved the action.",
    "classification": "synthetic"
  },
  {
    "id": "evt-106",
    "timestampUtc": "2026-02-04T08:15:09Z",
    "sourceType": "Directory audit log",
    "eventType": "application.permission-added",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic directory audit",
    "result": "Mailbox.Read application permission added",
    "detail": "A mailbox-reading application permission appears shortly after consent. Verify the exact granted permission, whether admin consent was required, and the application's approved purpose.",
    "classification": "synthetic"
  },
  {
    "id": "evt-107",
    "timestampUtc": "2026-02-04T08:16:14Z",
    "sourceType": "Directory audit log",
    "eventType": "application.credential-added",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic directory audit",
    "result": "New client secret recorded",
    "detail": "A new credential was added to the fictional application. This may extend access, but the record alone does not establish whether the credential was used or by whom.",
    "classification": "synthetic"
  },
  {
    "id": "evt-108",
    "timestampUtc": "2026-02-04T08:16:52Z",
    "sourceType": "Change-management export",
    "eventType": "change-ticket.lookup",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic change register",
    "result": "No matching approved ticket found in searched window",
    "detail": "The lookup covered tickets tagged with the app name and service principal for the preceding 24 hours. Missing or inconsistent ticket tags remain possible; treat this as corroborating context, not proof by itself.",
    "classification": "synthetic"
  },
  {
    "id": "evt-109",
    "timestampUtc": "2026-02-04T08:17:30Z",
    "sourceType": "Application inventory",
    "eventType": "application.owner-lookup",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic service catalog",
    "result": "No active owner assigned",
    "detail": "The internal service catalog has no active owner recorded for this app. Check the authoritative app registration, business owner, and approved inventory before treating absence as definitive.",
    "classification": "synthetic"
  },
  {
    "id": "evt-110",
    "timestampUtc": "2026-02-04T08:18:51Z",
    "sourceType": "Mailbox audit log",
    "eventType": "mailbox.read-activity",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic mailbox audit",
    "result": "45 read operations across 3 fictional mailboxes",
    "detail": "Mailbox reads are recorded after the permission change. Determine which mailbox identities and operation details are available; the count is not a count of unique messages or confirmed exfiltration.",
    "classification": "synthetic"
  },
  {
    "id": "evt-111",
    "timestampUtc": "2026-02-04T08:19:40Z",
    "sourceType": "Mailbox audit log",
    "eventType": "mailbox.read-activity",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic mailbox audit",
    "result": "17 further read operations; same app principal",
    "detail": "A second audit record shows additional reads by the same fictional app. Correlate the operation IDs and mailbox identifiers before calculating total scope; do not assume there is no overlap.",
    "classification": "synthetic"
  },
  {
    "id": "evt-112",
    "timestampUtc": "2026-02-04T08:19:58Z",
    "sourceType": "Identity owner confirmation",
    "eventType": "owner.activity-confirmation",
    "principal": "svc-legacy-test owner",
    "source": "Synthetic verified contact record",
    "result": "Owner denies authorizing this consent or app change",
    "detail": "The account owner was contacted using an independently verified channel and does not recognise the consent or app change. This is meaningful corroboration; preserve the confirmation method and timestamp.",
    "classification": "synthetic"
  },
  {
    "id": "evt-113",
    "timestampUtc": "2026-02-03T03:00:00Z",
    "sourceType": "Mailbox audit baseline",
    "eventType": "known-good.application-activity",
    "principal": "Approved MailSync Agent",
    "source": "Synthetic prior-day control record",
    "result": "Expected scheduled activity for different app principal",
    "detail": "A known approved synchronisation app has a documented 03:00 UTC baseline. It uses a different principal and client application; similar mailbox activity does not make the suspicious app legitimate.",
    "classification": "synthetic"
  },
  {
    "id": "evt-114",
    "timestampUtc": "2026-02-04T08:20:01Z",
    "sourceType": "Identity sign-in log",
    "eventType": "sign-in.context-gap",
    "principal": "svc-legacy-test",
    "source": "Synthetic identity sign-in export",
    "result": "Device ID, client app, and MFA result unavailable in supplied excerpt",
    "detail": "Context needed to validate the successful sign-in is absent from this export. Obtain the authoritative identity-provider record and check the export's collection scope before finalising the hypothesis.",
    "classification": "synthetic"
  },
  {
    "id": "evt-115",
    "timestampUtc": "2026-02-04T08:20:10Z",
    "sourceType": "Response tracking record",
    "eventType": "session-revocation.requested",
    "principal": "svc-legacy-test",
    "source": "Synthetic incident tracker",
    "result": "Requested; completion not recorded",
    "detail": "A session/token revocation request exists, but this record does not confirm completion or invalidation of every relevant refresh token or application credential.",
    "classification": "synthetic"
  },
  {
    "id": "evt-116",
    "timestampUtc": "2026-02-04T08:22:07Z",
    "sourceType": "Mailbox audit log",
    "eventType": "mailbox.read-activity",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic mailbox audit",
    "result": "6 read operations after revocation request timestamp",
    "detail": "Reads occur after the request was opened. Because completion time is absent, this does not prove revocation failed; it does make action-completion verification a priority.",
    "classification": "synthetic"
  },
  {
    "id": "evt-117",
    "timestampUtc": "2026-02-04T08:23:30Z",
    "sourceType": "Response tracking record",
    "eventType": "application.disable-requested",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic incident tracker",
    "result": "Pending approval; disable completion absent",
    "detail": "The application restriction has been requested but is still pending in the supplied tracker. Record the owner, approval, impact, completion timestamp, and post-action access check.",
    "classification": "synthetic"
  },
  {
    "id": "evt-118",
    "timestampUtc": "2026-02-04T08:24:12Z",
    "sourceType": "Directory audit log",
    "eventType": "privileged-role.review",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic directory audit",
    "result": "No new directory role assignment found in supplied window",
    "detail": "No new directory role assignment was found in this excerpt. This does not neutralise the separately observed application permission; scope and app permissions still require review.",
    "classification": "synthetic"
  },
  {
    "id": "evt-119",
    "timestampUtc": "2026-02-04T08:25:00Z",
    "sourceType": "Evidence collection manifest",
    "eventType": "evidence.export-status",
    "principal": "IR-Analyst-02",
    "source": "Synthetic evidence collection log",
    "result": "Export captured; one identity-context gap remains",
    "detail": "The analyst's export time and collector are recorded. Preserve original source, UTC normalisation notes, query parameters, file hashes, and the missing-context limitation in the case notes.",
    "classification": "synthetic"
  },
  {
    "id": "evt-120",
    "timestampUtc": "2026-02-04T08:26:00Z",
    "sourceType": "Application inventory",
    "eventType": "application.baseline-compare",
    "principal": "Calendar Bridge QA",
    "source": "Synthetic service catalog",
    "result": "No expected deployment record found",
    "detail": "The app does not match an approved deployment entry in the supplied inventory snapshot. Confirm the snapshot freshness and search aliases before concluding the app is unauthorised.",
    "classification": "synthetic"
  }
];

export function listPublicCases() {
  return [{
    id: CASE_ID,
    revision: CASE_REVISION,
    title: CASE_DEFINITION.title,
    topic: CASE_DEFINITION.topic,
    difficulty: CASE_DEFINITION.difficulty,
    estimatedMinutes: CASE_DEFINITION.estimatedMinutes,
    curationStatus: CASE_DEFINITION.curationStatus,
    summary: 'A staged, source-backed incident-response investigation using 20 cross-source synthetic records, alternative hypotheses, containment decisions, and validation requirements.',
  }];
}

export function getPublicCase(caseId: unknown) {
  if (caseId !== CASE_ID) return null;
  return CASE_DEFINITION;
}

export function getCaseEvidence(caseId: unknown) {
  if (caseId !== CASE_ID) return null;
  return {
    caseId: CASE_ID,
    revision: CASE_REVISION,
    classification: 'synthetic-training-fixture',
    disclaimer: CASE_DEFINITION.evidenceDisclaimer,
    events: SYNTHETIC_EVIDENCE,
    artifactFormats: ['JSON event records', 'CSV export', 'downloadable ZIP evidence pack'],
    toolNote: 'Evidence is synthetic and safe for local analysis. It is structured training data, not a native cloud tenant export, PCAP, EVTX, or victim telemetry.',
  };
}

export interface CaseSubmissionInput {
  caseRevision: string;
  evidenceRefs: string[];
  hypothesisId: string;
  responseActions: string[];
  findings: string;
  validationPlan: string;
}

const VALID_EVIDENCE_IDS = new Set(SYNTHETIC_EVIDENCE.map((event) => event.id));
const VALID_HYPOTHESES = new Set<string>(CASE_DEFINITION.hypothesisOptions.map((item) => item.id));
const VALID_ACTIONS = new Set<string>(CASE_DEFINITION.responseActions.map((item) => item.id));

export function validateCaseSubmission(value: unknown):
  | { ok: true; value: CaseSubmissionInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'body_must_be_object' };
  const input = value as Record<string, unknown>;
  const allowed = ['caseRevision', 'evidenceRefs', 'hypothesisId', 'responseActions', 'findings', 'validationPlan'];
  if (Object.keys(input).some((key) => !allowed.includes(key))) return { ok: false, error: 'unexpected_property' };
  if (input.caseRevision !== CASE_REVISION) return { ok: false, error: 'unsupported_case_revision' };
  if (!Array.isArray(input.evidenceRefs) || input.evidenceRefs.length > SYNTHETIC_EVIDENCE.length) {
    return { ok: false, error: 'invalid_evidence_refs' };
  }
  const evidenceRefs: string[] = [];
  for (const id of input.evidenceRefs) {
    if (typeof id !== 'string' || !VALID_EVIDENCE_IDS.has(id) || evidenceRefs.includes(id)) {
      return { ok: false, error: 'invalid_or_duplicate_evidence_ref' };
    }
    evidenceRefs.push(id);
  }
  if (typeof input.hypothesisId !== 'string' || !VALID_HYPOTHESES.has(input.hypothesisId)) {
    return { ok: false, error: 'invalid_hypothesis' };
  }
  if (!Array.isArray(input.responseActions) || input.responseActions.length > CASE_DEFINITION.responseActions.length) {
    return { ok: false, error: 'invalid_response_actions' };
  }
  const responseActions: string[] = [];
  for (const action of input.responseActions) {
    if (typeof action !== 'string' || !VALID_ACTIONS.has(action) || responseActions.includes(action)) {
      return { ok: false, error: 'invalid_or_duplicate_response_action' };
    }
    responseActions.push(action);
  }
  if (typeof input.findings !== 'string' || input.findings.trim().length < 40 || input.findings.length > 4000) return { ok: false, error: 'invalid_findings' };
  if (typeof input.validationPlan !== 'string' || input.validationPlan.trim().length < 10 || input.validationPlan.length > 2000) {
    return { ok: false, error: 'invalid_validation_plan' };
  }
  return {
    ok: true,
    value: {
      caseRevision: CASE_REVISION,
      evidenceRefs,
      hypothesisId: input.hypothesisId,
      responseActions,
      findings: input.findings.trim(),
      validationPlan: input.validationPlan.trim(),
    },
  };
}

export interface RubricCriterion {
  criterion: string;
  pointsAwarded: number;
  pointsPossible: number;
  feedback: string;
}

export function getCaseDebrief(caseId: unknown) {
  if (caseId !== CASE_ID) return null;
  return {
    title: 'After-action review: The Unexpected Consent',
    assessment: 'The most defensible working conclusion is suspected identity and OAuth application misuse requiring containment and validation. The synthetic records support a correlated sequence, but do not establish actor attribution, confirmed exfiltration, or the exact contents accessed.',
    evidenceChains: [
      {
        title: 'Authentication anomaly (not proof by itself)',
        eventIds: ['evt-101', 'evt-102', 'evt-103', 'evt-104', 'evt-114'],
        explanation: 'Two failures precede a success for the same identity and source. The report-only policy result and missing device/client/MFA context increase the need to validate the authoritative sign-in record. The pattern alone does not prove compromise.',
      },
      {
        title: 'Application and mailbox sequence',
        eventIds: ['evt-105', 'evt-106', 'evt-107', 'evt-110', 'evt-111', 'evt-116'],
        explanation: 'Consent, a mailbox permission, a new app credential, and mailbox reads form a coherent risk chain. Reads after a revocation request are concerning, but without the completion timestamp they do not prove the revocation failed.',
      },
      {
        title: 'Independent context and counter-evidence',
        eventIds: ['evt-108', 'evt-109', 'evt-112', 'evt-113', 'evt-118', 'evt-120'],
        explanation: 'No matching change or owner is present in the supplied snapshots, and the account owner does not recognise the action. The known-good synchronisation activity uses a different app principal. No new directory role is found, but that does not remove the risk from app permissions.',
      },
    ],
    responseSequence: [
      'Preserve original identity, directory, application, mailbox, change-management, and response records. Record UTC normalisation, collection query, source, collector, and SHA-256 hashes.',
      'Confirm the application and account owners through trusted channels; determine the exact permission type, grant, credential, affected mailboxes, and business impact.',
      'Through the approved incident process, restrict the suspicious app/consent and invalidate relevant sessions, refresh tokens, and app credentials. Sequence approvals and impact checks; do not treat a request as completion.',
      'Review related identities, app permissions, credential changes and privileged access; scope only from corroborated records.',
      'Validate from fresh authoritative logs that the app/permission/credential is disabled or removed, relevant sessions/tokens no longer provide access, and no further unexpected mailbox operations occur in the monitoring window.',
    ],
    commonPitfalls: [
      'Claiming the sign-in failures prove compromise or actor attribution.',
      'Treating mailbox read-operation counts as unique messages, or claiming confirmed exfiltration without evidence unless the underlying records support those conclusions.',
      'Assuming a revocation request means tokens were already invalidated.',
      'Treating a missing change ticket or inventory owner as conclusive without checking the source snapshot and aliases.',
      'Using the approved MailSync control record as if it belonged to Calendar Bridge QA.',
      'Ignoring missing device/MFA context or assuming no new directory role means the application permissions are harmless.',
    ],
    closureChecks: [
      'Authoritative sign-in record includes or explains device, client, MFA, and Conditional Access context.',
      'App consent, permissions, credential inventory, app owner, and approved change record are reconciled.',
      'Session/token/credential invalidation and app restriction have completion timestamps and verification evidence.',
      'Mailbox audit scope, affected identities, time range, and any data-access conclusions are documented with limits.',
      'A named incident owner accepts residual risk and records the closure decision.',
    ],
  };
}

export function scoreCaseSubmission(input: CaseSubmissionInput): { score: number; rubricFeedback: RubricCriterion[] } {
  const refs = new Set(input.evidenceRefs);
  const authIds = ['evt-101', 'evt-102', 'evt-103', 'evt-104', 'evt-114'];
  const authCount = authIds.filter((id) => refs.has(id)).length;
  const authPoints = authCount === 5 ? 25 : authCount >= 4 ? 20 : authCount >= 3 ? 15 : authCount >= 2 ? 8 : 0;

  const appIds = ['evt-105', 'evt-106', 'evt-107', 'evt-110', 'evt-111'];
  const appCount = appIds.filter((id) => refs.has(id)).length;
  const appPoints = appCount === 5 ? 25 : appCount >= 4 ? 20 : appCount >= 3 ? 14 : appCount >= 2 ? 8 : 0;

  const findingsText = input.findings.trim().toLowerCase();
  const citedIds = new Set((input.findings.match(/\bevt-\d{3}\b/gi) ?? []).map((id) => id.toLowerCase()));
  const citesEvidence = citedIds.size >= 2;
  const statesUncertainty = [
    'does not prove', 'not prove', 'unknown', 'uncertain', 'insufficient',
    'not confirmed', 'cannot conclude', 'not enough evidence', 'verify', 'validate',
    'not established', 'cannot establish',
  ].some((term) => findingsText.includes(term));
  const considersAlternative = ['alternative', 'benign', 'legitimate', 'approved change', 'competing explanation', 'known-good'].some((term) => findingsText.includes(term));
  const findingsPoints = findingsText.length >= 140 && citesEvidence && statesUncertainty && considersAlternative
    ? 15
    : findingsText.length >= 80 && citesEvidence && statesUncertainty ? 10
      : findingsText.length >= 40 && citesEvidence ? 5 : 0;

  const criticalActions = ['disable-oauth-app', 'revoke-sessions', 'reset-credentials', 'preserve-audit-logs', 'review-privileged-access'];
  const matchedCriticalActions = criticalActions.filter((id) => input.responseActions.includes(id)).length;
  const actionPoints = matchedCriticalActions * 4;

  const planText = input.validationPlan.toLowerCase();
  const validationTopics = ['audit', 'token', 'session', 'sign-in', 'signin', 'consent', 'permission', 'mailbox', 'log', 'verify', 'owner', 'credential', 'post-action', 'completion'];
  const matchedTopics = new Set(validationTopics.filter((topic) => planText.includes(topic)));
  const validationPoints = input.validationPlan.trim().length >= 100 && matchedTopics.size >= 3
    ? 15 : matchedTopics.size >= 2 ? 10 : matchedTopics.size >= 1 ? 5 : 0;

  const rubricFeedback: RubricCriterion[] = [
    {
      criterion: 'Authentication timeline and missing context', pointsAwarded: authPoints, pointsPossible: 25,
      feedback: authPoints === 25
        ? 'You selected the failures, following success, policy evaluation, and missing sign-in context. Keep the conclusion qualified until the authoritative device, client, MFA, and policy records are checked.'
        : authPoints >= 15
          ? 'You selected part of the authentication sequence. Include the failed/successful sign-ins and context records, and explain why the pattern is a signal rather than proof.'
          : 'Build the UTC sequence from the authentication records and identify which identity context is missing.',
    },
    {
      criterion: 'OAuth-to-mailbox evidence chain', pointsAwarded: appPoints, pointsPossible: 25,
      feedback: appPoints === 25
        ? 'You connected consent, app permission, credential creation, and mailbox activity. Confirm the specific grant and affected identities before stating impact.'
        : appPoints >= 14
          ? 'Part of the app-to-mailbox chain is selected. Correlate the consent, permission, credential, and mailbox records across sources.'
          : 'Look for the relationship between consent, permission/credential changes, and subsequent mailbox activity.',
    },
    {
      criterion: 'Evidence-based conclusion and uncertainty', pointsAwarded: findingsPoints, pointsPossible: 15,
      feedback: findingsPoints === 15
        ? 'Your findings cite multiple evidence IDs, acknowledge uncertainty, and compare an alternative explanation. Keep actor attribution and exfiltration claims within what the records establish.'
        : findingsPoints === 10
          ? 'Your findings cite evidence and acknowledge a limit. Compare a plausible alternative and explain what would resolve the remaining uncertainty.'
          : findingsPoints === 5
            ? 'Cite at least two event IDs and separate observable facts from inference. State what is unknown and what evidence would test an alternative.'
            : 'Write a reasoned timeline, cite specific event IDs, distinguish observation from inference, and explicitly identify uncertainty.',
    },
    {
      criterion: 'Containment and evidence preservation', pointsAwarded: actionPoints, pointsPossible: 20,
      feedback: `${matchedCriticalActions} of 5 core response actions selected. Consider app restriction, session/token invalidation, credential reset, audit preservation, and privileged/application-permission review. Check approval and impact before changes, and confirm completion afterward.`,
    },
    {
      criterion: 'Post-response validation plan', pointsAwarded: validationPoints, pointsPossible: 15,
      feedback: validationPoints === 15
        ? 'Your plan names multiple verification topics and has sufficient detail. Explicitly record expected results, time window, authoritative source, and who confirms closure.'
        : validationPoints === 10
          ? 'Your plan names relevant verification topics. Add expected post-action results, completion timestamps and an owner who accepts closure.'
          : validationPoints === 5
            ? 'Add a concrete check against an authoritative record, such as audit, session/token, consent/permission or mailbox logs.'
            : 'Describe how to verify that remediation completed and that the suspicious app or account no longer performs unexpected activity.',
    },
  ];
  return { score: rubricFeedback.reduce((total, item) => total + item.pointsAwarded, 0), rubricFeedback };
}
