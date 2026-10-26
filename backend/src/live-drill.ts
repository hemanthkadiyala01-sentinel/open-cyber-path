/** Server-side validation and formative scoring for source-linked live incident drills. */

export const LIVE_DRILL_REVISION = '1.1.0';

const DRILL_RULES = {
  'dependency-compromise': {
    evidenceIds: ['pkg-01', 'build-02', 'net-03', 'secret-04', 'release-05'],
    actions: ['hold-preserve-scope', 'rotate-all-blindly', 'delete-evidence', 'assume-all-hit'],
    bestAction: 'hold-preserve-scope',
    responseFeedback: 'Pause affected releases, preserve CI/package/artifact records, scope affected builds, and determine whether any secrets or artifacts were exposed before deciding on rotation and rebuild.',
  },
  vulnerability: {
    evidenceIds: ['asset-01', 'proxy-02', 'edr-03', 'change-04'],
    actions: ['scope-patch-preserve', 'exploit-production', 'wipe-immediately', 'ignore-no-proof'],
    bestAction: 'scope-patch-preserve',
    responseFeedback: 'Verify the advisory against actual assets and versions, preserve the exposure-window evidence, apply vendor-approved mitigation, then validate the fixed state and logs.',
  },
  'certificate-compromise': {
    evidenceIds: ['cert-01', 'ca-02', 'tls-03'],
    actions: ['scope-replace-validate', 'disable-all-trust', 'wait-no-exploit', 'copy-chain'],
    bestAction: 'scope-replace-validate',
    responseFeedback: 'Scope the affected serials and chains from the authoritative issuer notice, apply revocation/replacement guidance, and verify client trust behavior.',
  },
  'ai-agent': {
    evidenceIds: ['agent-01', 'tool-02', 'api-03', 'secret-04'],
    actions: ['stop-revoke-audit', 'give-admin', 'delete-traces', 'hack-back'],
    bestAction: 'stop-revoke-audit',
    responseFeedback: 'Pause or constrain the affected run through approved controls, revoke access as appropriate, preserve traces, and review the real scope before rotating exposed secrets.',
  },
  'api-abuse': {
    evidenceIds: ['api-01', 'auth-02', 'txn-03'],
    actions: ['restrict-preserve-reconcile', 'delete-transactions', 'public-exploit', 'assume-loss'],
    bestAction: 'restrict-preserve-reconcile',
    responseFeedback: 'Use approved rate/access controls, preserve the audit trail, and reconcile the authoritative transaction state with the service owner before declaring impact.',
  },
  'third-party-breach': {
    evidenceIds: ['vendor-01', 'access-02', 'data-03'],
    actions: ['scope-revoke-notify', 'publish-unverified', 'delete-vendor', 'assume-no-data'],
    bestAction: 'scope-revoke-notify',
    responseFeedback: 'Separate supplier-confirmed statements from unverified claims, preserve access evidence, establish data scope with the owner, and follow approved legal/privacy notification procedures.',
  },
  'identity-cloud': {
    evidenceIds: ['id-01', 'perm-02', 'resource-03'],
    actions: ['restrict-revoke-preserve', 'disable-all-users', 'ignore-success', 'erase-logs'],
    bestAction: 'restrict-revoke-preserve',
    responseFeedback: 'Correlate sign-in, permission, and resource records; verify owner/device context; then use approved controls to revoke risky sessions or permissions and validate the result.',
  },
  'malware-ransomware': {
    evidenceIds: ['edr-01', 'proc-02', 'net-03', 'backup-04'],
    actions: ['contain-preserve-recover', 'run-sample', 'wipe-no-evidence', 'restore-unchecked'],
    bestAction: 'contain-preserve-recover',
    responseFeedback: 'Contain through approved endpoint/network controls, preserve evidence, scope related systems, and validate backup integrity before recovery.',
  },
  generic: {
    evidenceIds: ['src-01', 'asset-02', 'log-03'],
    actions: ['scope-preserve-respond', 'assume-everything', 'test-target', 'do-nothing'],
    bestAction: 'scope-preserve-respond',
    responseFeedback: 'Verify the source and local asset exposure, preserve records, take proportionate approved actions, then validate the change and monitor for recurrence.',
  },
} as const;


// Incident-specific validation and response guidance. IDs are from the monitored feed;
// evidence IDs/actions remain in the corresponding category rule so saved submissions
// continue to use the existing append-only and RLS-protected table.
const INCIDENT_GUIDES: Record<string, {
  caseType: DrillType;
  responseFeedback: string;
  positiveFeedback: string;
  negativeFeedback: string;
  responseGuide: string[];
}> = {
  'certin-ciad-2026-0053': {
    caseType: 'dependency-compromise',
    responseFeedback: 'Pause affected release paths, preserve lockfiles, build logs and image digests, scope which builds used the affected package/tags, then rotate credentials supported by the exposure review and rebuild from trusted inputs.',
    positiveFeedback: 'Good first response for a supply-chain investigation: preserve package/CI/artifact evidence, scope affected versions and digests, then make credential decisions from the exposure evidence.',
    negativeFeedback: 'For a supply-chain case, do not delete build evidence or declare all users compromised. Preserve provenance records, scope exact package/image use and verify trusted rebuilds.',
    responseGuide: ['Compare lockfiles and resolved versions with the vendor advisory.', 'Scope CI jobs, image tags and immutable digests across build and deployment records.', 'Preserve audit evidence before cleanup; rotate credentials indicated by the exposure assessment.', 'Rebuild from reviewed dependencies and trusted images, compare digests and document sign-off.'],
  },
  'bc-php2shell-exploitation-reported-before-patches': {
    caseType: 'vulnerability',
    responseFeedback: 'Verify the exact PHP branch/version against primary vendor guidance, scope external exposure and the reported risk window, preserve proxy/application/endpoint logs, then patch and verify the fixed version.',
    positiveFeedback: 'Good first response for PHP2Shell: verify affected versions and exposure, preserve logs for the risk window, apply the correct vendor fix and investigate credible signals without live exploitation.',
    negativeFeedback: 'For PHP2Shell, an advisory or anomalous request does not prove compromise. Verify exact versions, preserve the exposure-window records and confirm the fixed version after remediation.',
    responseGuide: ['Use CERT-In and current primary PHP release guidance to map exact affected and fixed versions.', 'Scope internet exposure and preserve reverse-proxy, application and endpoint evidence.', 'Apply the supported fixed release or vendor-approved mitigation with change control.', 'Verify installed versions and review the exposure window for correlated activity.'],
  },
  'certin-ciad-2026-0052': {
    caseType: 'vulnerability',
    responseFeedback: 'Use CERT-In and primary vendor guidance to verify the affected PHP branch/version, scope exposure, preserve records and validate the installed fixed release after patching.',
    positiveFeedback: 'Good first response: you tied version applicability to asset scope and patch verification instead of attempting an exploit against a live service.',
    negativeFeedback: 'The PHP advisory requires exact version and exposure checks. Preserve relevant logs, apply the appropriate fix and verify the result before closure.',
    responseGuide: ['Map each asset’s exact PHP version to current official affected/fixed-version guidance.', 'Preserve logs for the possible exposure window.', 'Apply the vendor-supported fix and validate installed version and service health.', 'Document any remaining uncertainty about suspicious activity.'],
  },
  'certin-ciad-2026-0050': {
    caseType: 'certificate-compromise',
    responseFeedback: 'Scope certificates and issuer chains using authoritative affected serial/SPKI lists, follow each platform/vendor trust action, replace affected certificates and test browser, system and application trust stores.',
    positiveFeedback: 'Good trust-remediation decision: scope affected chains precisely and validate the result per client platform rather than disabling all trust indiscriminately.',
    negativeFeedback: 'For a certificate-authority incident, do not assume every certificate is affected or wait for abuse. Match the inventory to official identifiers, follow the applicable distrust/replacement guidance and verify client behavior.',
    responseGuide: ['Compare local issuer, serial and SPKI inventory with official affected-certificate lists.', 'Identify separate browser, OS, command-line, container and application trust stores.', 'Follow platform guidance for distrust/revocation and replace affected leaf certificates from a trusted hierarchy.', 'Validate chain behavior and service continuity from representative clients.'],
  },
  'reuters-pwc-third-party-incident-2026-10-23': {
    caseType: 'third-party-breach',
    responseFeedback: 'Separate the company-acknowledged incident from the extortion group’s unverified volume claim, preserve vendor access evidence, scope affected records with accountable owners, and coordinate notification decisions through approved legal/privacy procedures.',
    positiveFeedback: 'Good first response: you distinguished confirmed incident reporting from unverified impact claims and kept evidence, scope and notification decisions accountable.',
    negativeFeedback: 'For the reported third-party incident, do not repeat an extortion claim as confirmed fact or assume no data was affected. Preserve access records and establish scope with the supplier and data owner.',
    responseGuide: ['Create a fact/claim/unknown matrix from the original report and vendor statements.', 'Preserve the vendor notice, sessions, access logs and data inventories.', 'Scope affected identities and records with accountable owners; do not treat claimed volumes as confirmed.', 'Coordinate proportionate access controls and legal/privacy notifications and verify supplier remediation.'],
  },
  'cisa-cve-2026-76504': {
    caseType: 'vulnerability',
    responseFeedback: 'Inventory every Cisco Catalyst SD-WAN Manager, cluster and DR node, preserve admin-tech diagnostics before upgrading, apply the appropriate fixed release, then follow Cisco’s vendor-assisted compromise review.',
    positiveFeedback: 'Good first response: you prioritised full manager/cluster inventory and diagnostic preservation before an upgrade, then linked remediation to a fixed-release check and vendor-assisted review.',
    negativeFeedback: 'For this actively exploited management-plane vulnerability, do not probe a live target or erase diagnostics. Inventory every node, preserve required admin-tech evidence, upgrade to the appropriate fixed release and request vendor scanning.',
    responseGuide: ['Map every manager, cluster member and disaster-recovery node to Cisco’s current affected/fixed release table.', 'Collect and preserve admin-tech diagnostic bundles before upgrade following Cisco’s workflow.', 'Upgrade to the appropriate fixed release; remain within the current major-release guidance.', 'Open a Cisco TAC case for diagnostic scanning and follow additional remediation if indicators are identified.'],
  },
};

type DrillType = keyof typeof DRILL_RULES;
type DrillRule = (typeof DRILL_RULES)[DrillType];

export interface LiveDrillSubmissionInput {
  incidentId: string;
  caseType: DrillType;
  evidenceRefs: string[];
  actionId: string;
  findings: string;
  validationPlan: string;
}

export interface LiveDrillRubricCriterion {
  criterion: string;
  pointsAwarded: number;
  pointsPossible: number;
  feedback: string;
}

const CASE_TYPES = new Set<string>(Object.keys(DRILL_RULES));
const INCIDENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,109})$/;
const VALIDATION_TERMS = [
  'verify', 'audit', 'log', 'patch', 'revoke', 'rotate', 'monitor', 'digest',
  'rebuild', 'restore', 'scope', 'confirm', 'validate', 'certificate', 'token', 'backup',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function validateLiveDrillSubmission(value: unknown):
  | { ok: true; value: LiveDrillSubmissionInput }
  | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: 'body_must_be_object' };
  const allowed = ['incidentId', 'caseType', 'evidenceRefs', 'actionId', 'findings', 'validationPlan'];
  if (Object.keys(value).some((key) => !allowed.includes(key))) return { ok: false, error: 'unexpected_property' };
  if (typeof value.incidentId !== 'string' || value.incidentId.length > 110 || !INCIDENT_ID.test(value.incidentId)) {
    return { ok: false, error: 'invalid_incident_id' };
  }
  if (typeof value.caseType !== 'string' || !CASE_TYPES.has(value.caseType)) return { ok: false, error: 'invalid_case_type' };
  const rule = DRILL_RULES[value.caseType as DrillType] as DrillRule;
  const incidentGuide = INCIDENT_GUIDES[value.incidentId];
  if (incidentGuide && incidentGuide.caseType !== value.caseType) return { ok: false, error: 'invalid_case_type' };
  if (!Array.isArray(value.evidenceRefs) || value.evidenceRefs.length > rule.evidenceIds.length) {
    return { ok: false, error: 'invalid_evidence_refs' };
  }
  const evidenceRefs: string[] = [];
  for (const reference of value.evidenceRefs) {
    if (typeof reference !== 'string' || !(rule.evidenceIds as readonly string[]).includes(reference) || evidenceRefs.includes(reference)) {
      return { ok: false, error: 'invalid_or_duplicate_evidence_ref' };
    }
    evidenceRefs.push(reference);
  }
  if (typeof value.actionId !== 'string' || !(rule.actions as readonly string[]).includes(value.actionId)) {
    return { ok: false, error: 'invalid_action' };
  }
  if (typeof value.findings !== 'string' || value.findings.trim().length < 40 || value.findings.length > 4000) {
    return { ok: false, error: 'invalid_findings' };
  }
  if (typeof value.validationPlan !== 'string' || value.validationPlan.trim().length < 20 || value.validationPlan.length > 2000) {
    return { ok: false, error: 'invalid_validation_plan' };
  }
  return {
    ok: true,
    value: {
      incidentId: value.incidentId,
      caseType: value.caseType as DrillType,
      evidenceRefs,
      actionId: value.actionId,
      findings: value.findings.trim(),
      validationPlan: value.validationPlan.trim(),
    },
  };
}

export function scoreLiveDrillSubmission(input: LiveDrillSubmissionInput): {
  score: number;
  rubricFeedback: LiveDrillRubricCriterion[];
} {
  const rule = DRILL_RULES[input.caseType] as DrillRule;
  const selected = new Set(input.evidenceRefs);
  const evidenceScore = Math.round((rule.evidenceIds.filter((id) => selected.has(id)).length / rule.evidenceIds.length) * 35);
  const responseCorrect = input.actionId === rule.bestAction;
  const responseScore = responseCorrect ? 30 : 5;
  const analysisScore = input.findings.trim().length >= 100 ? 20 : input.findings.trim().length >= 40 ? 12 : 0;
  const planText = input.validationPlan.toLowerCase();
  const validationCount = VALIDATION_TERMS.filter((term) => planText.includes(term)).length;
  const validationScore = input.validationPlan.trim().length >= 60 && validationCount >= 2 ? 15 : validationCount >= 1 ? 8 : 0;

  const rubricFeedback: LiveDrillRubricCriterion[] = [
    {
      criterion: 'Evidence coverage', pointsAwarded: evidenceScore, pointsPossible: 35,
      feedback: evidenceScore === 35
        ? 'You selected every key record supplied for this exercise. Cite the records explicitly and explain which fact each one supports.'
        : 'Correlate more of the supplied evidence. Use the source record and all relevant local logs before concluding impact.',
    },
    {
      criterion: 'Initial response', pointsAwarded: responseScore, pointsPossible: 30,
      feedback: responseCorrect
        ? (INCIDENT_GUIDES[input.incidentId]?.positiveFeedback || 'Your chosen first action is proportionate and preserves an investigation path. Continue to scope impact and verify the action.')
        : (INCIDENT_GUIDES[input.incidentId]?.negativeFeedback || 'Revisit scoping, business impact, and evidence preservation before making destructive, unverified, or unauthorised changes.'),
    },
    {
      criterion: 'Written analysis', pointsAwarded: analysisScore, pointsPossible: 20,
      feedback: analysisScore === 20
        ? 'Your findings are detailed enough for formative review. Cite event IDs, distinguish observations from inference, and state what remains unknown.'
        : 'Expand your reasoning: cite evidence IDs, explain relationships, and state what is supported and what remains unknown.',
    },
    {
      criterion: 'Validation plan', pointsAwarded: validationScore, pointsPossible: 15,
      feedback: validationScore === 15
        ? 'Your plan names multiple verification themes. State expected outcomes and who confirms closure where relevant.'
        : 'Name concrete records or control checks and state what result would prove remediation worked.',
    },
  ];
  return { score: rubricFeedback.reduce((sum, item) => sum + item.pointsAwarded, 0), rubricFeedback };
}

export function getLiveDrillResponseGuide(caseType: string, incidentId?: string): string[] {
  const incidentGuide = incidentId ? INCIDENT_GUIDES[incidentId] : undefined;
  if (incidentGuide && incidentGuide.caseType === caseType) return [incidentGuide.responseFeedback, ...incidentGuide.responseGuide];
  if (!CASE_TYPES.has(caseType)) return DRILL_RULES.generic.responseFeedback.split('. ').filter(Boolean);
  const rule = DRILL_RULES[caseType as DrillType] as DrillRule;
  return [rule.responseFeedback];
}
