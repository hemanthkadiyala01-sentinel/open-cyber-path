import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import './LiveIncidentOps.css';
import HISTORICAL_INCIDENT_LIBRARY from '../data/historical-incident-library.json';

const BASE_PATH = String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
const FEED_URL = `${BASE_PATH}live-case-intelligence.json`;
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const GLYPHS = {
  'dependency-compromise': '📦', vulnerability: '🛡️', 'certificate-compromise': '🔏',
  'ai-agent': '🤖', 'api-abuse': '🔌', 'third-party-breach': '🏢',
  'identity-cloud': '🪪', 'malware-ransomware': '🧬', generic: '🔎',
};
const TYPE_LABELS = {
  'dependency-compromise': 'Software supply chain', vulnerability: 'Vulnerability response',
  'certificate-compromise': 'Certificate trust', 'ai-agent': 'AI agent security',
  'api-abuse': 'API abuse', 'third-party-breach': 'Third-party incident',
  'identity-cloud': 'Identity / cloud', 'malware-ransomware': 'Malware / ransomware', generic: 'Incident response',
};
const RECORD_CLASS_LABELS = {
  'historical-precursor': 'Historical precursor · not a modern cyberattack',
  'security-demonstration': 'Security demonstration · not a destructive attack',
  'defensive-history': 'Defensive / resistance history · not a cyberattack',
  'telecom-security-precursor': 'Telecom-security precursor · approximate date',
  'cyber-incident': 'Documented cyber incident',
  'contested-historical-account': 'Contested historical account',
  'cybercrime-tool-history': 'Cybercrime-tool history',
  'cyber-intrusion-campaign': 'Intrusion campaign · details attributed to sources',
  'reported-ai-agent-intrusion': 'Reported AI-agent-assisted intrusion',
  'reported-data-exposure': 'Reported data exposure · scope under investigation',
};

// The feed links to real public reporting; these blueprints state the exact skill drill
// attached to each signal family. They are not claims that synthetic logs are victim telemetry.
const PRACTICE_BLUEPRINTS = {
  'dependency-compromise': {
    role: 'Software supply-chain incident responder',
    skills: ['Dependency provenance', 'CI/CD event correlation', 'Secret-exposure scoping'],
    deliverable: 'A scoped list of affected builds, an artifact-integrity finding, and a validated rebuild/secret-rotation plan.',
  },
  vulnerability: {
    role: 'Vulnerability response analyst',
    skills: ['Affected-version mapping', 'Exploit-signal triage', 'Patch verification'],
    deliverable: 'An asset-scoped exposure decision, remediation priority, and evidence that the fix or approved mitigation is active.',
  },
  'certificate-compromise': {
    role: 'PKI and trust incident responder',
    skills: ['Certificate-chain review', 'Affected serial/issuer scoping', 'Trust-store validation'],
    deliverable: 'An affected certificate scope, a controlled replace/revoke plan, and client-side trust validation.',
  },
  'ai-agent': {
    role: 'AI-system security analyst',
    skills: ['Agent tool-permission review', 'Audit-trail correlation', 'Least-privilege containment'],
    deliverable: 'A record of out-of-scope agent actions, a proportionate tool/access restriction, and a tested policy change.',
  },
  'api-abuse': {
    role: 'API security incident analyst',
    skills: ['Request-pattern analysis', 'Token and privilege scoping', 'Control validation'],
    deliverable: 'A timeline of suspicious API activity, the affected identities/resources, and a validated remediation plan.',
  },
  'third-party-breach': {
    role: 'Third-party incident coordinator',
    skills: ['Supplier-impact scoping', 'Data sensitivity assessment', 'Evidence and notification planning'],
    deliverable: 'A fact/claim matrix, affected-data scope with gaps, and an accountable vendor-response and verification checklist.',
  },
  'identity-cloud': {
    role: 'Cloud identity incident responder',
    skills: ['Sign-in timeline correlation', 'OAuth permission analysis', 'Session/token validation'],
    deliverable: 'An evidence-linked account/app timeline, a scoped containment decision, and proof that access was revoked or restricted.',
  },
  'malware-ransomware': {
    role: 'Endpoint incident responder',
    skills: ['Endpoint timeline reconstruction', 'Process/network correlation', 'Recovery-point verification'],
    deliverable: 'An affected-host scope, preserved forensic records, and a recovery plan with verified clean restore points.',
  },
  generic: {
    role: 'Incident triage analyst',
    skills: ['Source-claim verification', 'Asset exposure scoping', 'Response validation'],
    deliverable: 'A fact-versus-claim summary, evidence-backed scope, and a proportionate response with measurable closure checks.',
  },
};

const PROFILES = {
  'dependency-compromise': {
    mission: 'Determine whether a fictional build or deployment consumed an untrusted dependency, what systems used it, and whether secrets or artifacts may have been exposed.',
    evidence: [
      { id: 'pkg-01', timestampUtc: '2026-10-24T09:02:11Z', sourceType: 'Package manifest', eventType: 'dependency.resolved', principal: 'build-runner-lab', source: 'local evidence bundle', result: 'Unexpected transitive version', detail: 'A fictional service lockfile resolves a transitive package that is absent from the approved dependency inventory.', essential: true },
      { id: 'build-02', timestampUtc: '2026-10-24T09:04:38Z', sourceType: 'CI build log', eventType: 'build.package-download', principal: 'pipeline-lab-04', source: 'local evidence bundle', result: 'Download observed', detail: 'The build job downloaded the dependency before the release artifact was produced. The record alone does not establish malicious execution.', essential: true },
      { id: 'net-03', timestampUtc: '2026-10-24T09:05:10Z', sourceType: 'Egress telemetry', eventType: 'network.connection', principal: 'build-runner-lab', source: '198.51.100.23', result: 'Connection observed', detail: 'A fictional runner contacted a documentation-only IP shortly after package installation. Treat it as a lead to correlate, not attribution.', essential: true },
      { id: 'secret-04', timestampUtc: '2026-10-24T09:06:01Z', sourceType: 'Secrets audit', eventType: 'ci.secret-read', principal: 'pipeline-lab-04', source: 'local evidence bundle', result: 'Secret access logged', detail: 'The job could read a deployment secret. This does not prove that the secret left the environment; inspect exposure paths and related egress evidence.', essential: true },
      { id: 'release-05', timestampUtc: '2026-10-24T09:07:45Z', sourceType: 'Artifact registry', eventType: 'release.digest-mismatch', principal: 'release-lab-04', source: 'local evidence bundle', result: 'Digest mismatch', detail: 'The stored artifact digest differs from the approved build record and needs independent verification.', essential: true },
    ],
    actions: [
      { id: 'hold-preserve-scope', label: 'Pause affected releases, preserve CI/package/artifact records, and scope every build that resolved the dependency.', best: true },
      { id: 'rotate-all-blindly', label: 'Rotate every secret immediately without identifying exposure or preserving evidence first.', best: false },
      { id: 'delete-evidence', label: 'Delete the build logs and package cache before investigating.', best: false },
      { id: 'assume-all-hit', label: 'Declare every user of the package compromised without checking versions or exposure.', best: false },
    ],
    evidenceNote: 'Correlate the lockfile, build log, artifact digest, secret-read event and egress records. Treat each as a clue; no individual record proves exfiltration.',
    validation: ['Rebuild from a reviewed dependency lockfile', 'Compare artifact hashes to a trusted build', 'Audit CI secret access and rotate exposed secrets', 'Monitor egress and redeploy only after verification'],
  },
  vulnerability: {
    mission: 'Establish whether your fictional assets run an affected component, whether they were exposed during the risk window, and how to remediate and verify safely.',
    evidence: [
      { id: 'asset-01', timestampUtc: '2026-10-24T10:01:00Z', sourceType: 'Asset inventory', eventType: 'software.version-observed', principal: 'service-lab-01', source: 'local evidence bundle', result: 'Version needs verification', detail: 'The inventory lists a software branch that may fall within the advisory scope. Consult the linked vendor guidance to determine applicability.', essential: true },
      { id: 'proxy-02', timestampUtc: '2026-10-24T10:03:12Z', sourceType: 'Reverse-proxy log', eventType: 'request-pattern-anomaly', principal: 'service-lab-01', source: 'local evidence bundle', result: 'Requests require review', detail: 'Several requests match a broad anomaly rule. The payload is intentionally omitted; these records are not proof of successful exploitation.', essential: true },
      { id: 'edr-03', timestampUtc: '2026-10-24T10:03:14Z', sourceType: 'Endpoint telemetry', eventType: 'child-process-alert', principal: 'service-lab-01', source: 'local evidence bundle', result: 'Alert raised', detail: 'A child process alert occurred near the request window. Confirm process lineage and host context before attributing causality.', essential: true },
      { id: 'change-04', timestampUtc: '2026-10-24T10:08:50Z', sourceType: 'Change record', eventType: 'patch.status', principal: 'service-owner-lab', source: 'local evidence bundle', result: 'Change pending', detail: 'The recorded remediation change is pending approval and no completed-version check is attached.', essential: true },
    ],
    actions: [
      { id: 'scope-patch-preserve', label: 'Verify affected versions and exposure, preserve relevant logs, apply vendor-approved remediation, then validate.', best: true },
      { id: 'exploit-production', label: 'Run exploit attempts against the public production service to see whether it is vulnerable.', best: false },
      { id: 'wipe-immediately', label: 'Wipe every server immediately without preserving evidence or assessing impact.', best: false },
      { id: 'ignore-no-proof', label: 'Ignore the advisory because the current logs do not prove exploitation.', best: false },
    ],
    evidenceNote: 'Map the vendor advisory to asset versions and exposure. Investigate suspicious telemetry, but do not infer successful exploitation from an anomaly alone.',
    validation: ['Record affected asset/version inventory', 'Confirm the fixed version or mitigation is active', 'Review logs across the exposure window', 'Monitor for recurrence and document owner sign-off'],
  },
  'certificate-compromise': {
    mission: 'Assess the scope of a reported certificate/trust incident in a fictional organisation and make a safe, verifiable trust-remediation plan.',
    evidence: [
      { id: 'cert-01', timestampUtc: '2026-10-24T08:10:00Z', sourceType: 'Certificate inventory', eventType: 'certificate.serial-match', principal: 'gateway-lab-01', source: 'local evidence bundle', result: 'Serial needs comparison', detail: 'A fictional service certificate serial must be compared with the issuer notice. The training value is not a real-world certificate indicator.', essential: true },
      { id: 'ca-02', timestampUtc: '2026-10-24T08:12:00Z', sourceType: 'Trust-store audit', eventType: 'issuer-chain-observed', principal: 'service-lab-02', source: 'local evidence bundle', result: 'Trust chain present', detail: 'A service trust store contains an issuer chain that requires comparison to the authoritative vendor instructions.', essential: true },
      { id: 'tls-03', timestampUtc: '2026-10-24T08:15:00Z', sourceType: 'TLS monitoring', eventType: 'certificate-validation', principal: 'gateway-lab-01', source: 'local evidence bundle', result: 'Validation not yet confirmed', detail: 'Monitoring has not recorded a post-remediation trust validation result.', essential: true },
    ],
    actions: [
      { id: 'scope-replace-validate', label: 'Identify affected serials/chains from the authoritative notice, replace/revoke as directed, and validate relying systems.', best: true },
      { id: 'disable-all-trust', label: 'Remove every trusted certificate and root from all systems without checking scope.', best: false },
      { id: 'wait-no-exploit', label: 'Take no action unless a service outage or attack is independently observed.', best: false },
      { id: 'copy-chain', label: 'Copy the old chain to other services to standardise configuration.', best: false },
    ],
    evidenceNote: 'Use the source notice and affected serials/chains to scope action; do not invent affected certificates or assume every service is impacted.',
    validation: ['Verify affected serial and chain scope', 'Apply issuer/vendor revocation and replacement guidance', 'Test certificate validation on representative clients', 'Monitor failures and document trust-store verification'],
  },
  'ai-agent': {
    mission: 'Investigate whether a fictional AI agent operated outside its authorised scope. Establish which tools and resources it accessed, then contain and validate without destroying audit evidence.',
    evidence: [
      { id: 'agent-01', timestampUtc: '2026-10-24T11:00:00Z', sourceType: 'Agent policy', eventType: 'tool-scope-config', principal: 'research-agent-lab', source: 'local evidence bundle', result: 'Scope appears broad', detail: 'The fictional agent is granted a tool scope wider than the mission brief requires. Confirm approved policy and the owner before concluding misuse.', essential: true },
      { id: 'tool-02', timestampUtc: '2026-10-24T11:02:30Z', sourceType: 'Agent audit', eventType: 'tool-call-out-of-scope', principal: 'research-agent-lab', source: 'local evidence bundle', result: 'Needs investigation', detail: 'An agent tool invocation points to a resource outside the expected scope. Review the policy, user intent and tool-call trace.', essential: true },
      { id: 'api-03', timestampUtc: '2026-10-24T11:03:00Z', sourceType: 'API gateway log', eventType: 'resource-read', principal: 'agent-token-lab', source: 'local evidence bundle', result: 'Read recorded', detail: 'A fictional API read followed the tool invocation. The record does not identify the data sensitivity or prove onward disclosure.', essential: true },
      { id: 'secret-04', timestampUtc: '2026-10-24T11:05:40Z', sourceType: 'Secrets audit', eventType: 'credential-scope-check', principal: 'agent-token-lab', source: 'local evidence bundle', result: 'Scope review required', detail: 'Review whether the credential could reach additional resources and whether any secret exposure is evidenced.', essential: true },
    ],
    actions: [
      { id: 'stop-revoke-audit', label: 'Pause the affected agent run through the approved control, revoke scoped access as appropriate, preserve traces, and assess impact.', best: true },
      { id: 'give-admin', label: 'Grant administrator permission so the agent can finish and investigate itself.', best: false },
      { id: 'delete-traces', label: 'Delete agent traces and API logs to prevent further data exposure.', best: false },
      { id: 'hack-back', label: 'Attempt to access the suspected attacker or external system in retaliation.', best: false },
    ],
    evidenceNote: 'Correlate the agent’s declared policy, tool-call trace, API audit log and credential scope. The logs are synthetic and do not represent the real incident’s internal records.',
    validation: ['Verify agent execution is paused or constrained', 'Confirm token and tool scopes are least-privilege', 'Review access logs for further activity', 'Rotate secrets if exposure is supported by evidence'],
  },
  'api-abuse': {
    mission: 'Respond to a reported API abuse pattern in a fictional service. Determine whether the events show anomalous attempts, unauthorised transactions, or a confirmed impact.',
    evidence: [
      { id: 'api-01', timestampUtc: '2026-10-24T12:01:00Z', sourceType: 'API gateway', eventType: 'request-rate-anomaly', principal: 'client-lab-17', source: 'local evidence bundle', result: 'Spike observed', detail: 'Request rate rises above the synthetic baseline. A traffic spike alone does not prove a successful transaction.', essential: true },
      { id: 'auth-02', timestampUtc: '2026-10-24T12:01:15Z', sourceType: 'Identity audit', eventType: 'token-risk-signal', principal: 'client-lab-17', source: 'local evidence bundle', result: 'Risk signal raised', detail: 'A credential risk signal appears around the same time. Correlate session, client and authorisation records.', essential: true },
      { id: 'txn-03', timestampUtc: '2026-10-24T12:02:10Z', sourceType: 'Transaction audit', eventType: 'operation-status', principal: 'transaction-lab', source: 'local evidence bundle', result: 'Review pending', detail: 'The transaction status is ambiguous in this excerpt. Confirm authoritative ledger state before declaring financial impact.', essential: true },
    ],
    actions: [
      { id: 'restrict-preserve-reconcile', label: 'Apply approved rate/access controls, preserve audit trails, and reconcile authorised transaction state with the service owner.', best: true },
      { id: 'delete-transactions', label: 'Delete transaction records to stop further abuse.', best: false },
      { id: 'public-exploit', label: 'Try the attack pattern against a real payment endpoint to confirm it works.', best: false },
      { id: 'assume-loss', label: 'Declare financial loss based only on a request-volume anomaly.', best: false },
    ],
    evidenceNote: 'Correlate rate, identity, authorisation and transaction records. Use the authoritative transaction ledger and approved response procedures to establish impact.',
    validation: ['Confirm credential and policy state', 'Reconcile operations against the authoritative ledger', 'Review rate-limit and authorisation logs', 'Monitor recurrence and obtain owner sign-off'],
  },
  'third-party-breach': {
    mission: 'Scope a reported third-party incident affecting a fictional organisation. Determine what the supplier has confirmed, what remains a claim, which data paths are involved and what actions are proportionate.',
    evidence: [
      { id: 'vendor-01', timestampUtc: '2026-10-24T07:30:00Z', sourceType: 'Vendor notification', eventType: 'incident-notice', principal: 'vendor-lab', source: 'local evidence bundle', result: 'Initial notice received', detail: 'The supplier confirms an incident but the affected customer data and time window are not fully scoped.', essential: true },
      { id: 'access-02', timestampUtc: '2026-10-24T07:40:00Z', sourceType: 'Access audit', eventType: 'vendor-session', principal: 'vendor-support-lab', source: 'local evidence bundle', result: 'Session found', detail: 'A vendor session overlaps the potential exposure period. Verify owner, purpose, source and data accessed.', essential: true },
      { id: 'data-03', timestampUtc: '2026-10-24T07:45:00Z', sourceType: 'Data inventory', eventType: 'data-classification', principal: 'learning-records-lab', source: 'local evidence bundle', result: 'Classification check needed', detail: 'The system holds fictional employee learning records. Determine the actual scope before notification or impact claims.', essential: true },
    ],
    actions: [
      { id: 'scope-revoke-notify', label: 'Preserve supplier/access evidence, restrict affected access if appropriate, scope records with the data owner, and follow incident-notification policy.', best: true },
      { id: 'publish-unverified', label: 'Publish the supplier’s unverified claims as confirmed facts.', best: false },
      { id: 'delete-vendor', label: 'Delete all supplier evidence before establishing the scope.', best: false },
      { id: 'assume-no-data', label: 'Assume no customer data was affected because details are not yet available.', best: false },
    ],
    evidenceNote: 'Separate the supplier’s confirmed statements from allegations and unknowns. Establish access and data scope before declaring impact.',
    validation: ['Confirm affected systems and data categories', 'Review/revoke vendor access where authorised', 'Preserve notification and audit records', 'Follow privacy/legal notification and recovery procedures'],
  },
  'identity-cloud': {
    mission: 'Investigate possible identity or cloud access misuse in a fictional tenant. Establish the relationship between sign-in, permission, session and resource-access records.',
    evidence: [
      { id: 'id-01', timestampUtc: '2026-10-24T13:01:00Z', sourceType: 'Sign-in log', eventType: 'sign-in-sequence', principal: 'user-lab-04', source: 'local evidence bundle', result: 'Failures followed by success', detail: 'A successful sign-in follows failures. Validate MFA, device, location, session and user confirmation; sequence alone is not proof of compromise.', essential: true },
      { id: 'perm-02', timestampUtc: '2026-10-24T13:03:00Z', sourceType: 'Directory audit', eventType: 'permission-change', principal: 'app-lab-07', source: 'local evidence bundle', result: 'Permission change recorded', detail: 'A fictional application permission change needs owner and approved-change validation.', essential: true },
      { id: 'resource-03', timestampUtc: '2026-10-24T13:06:00Z', sourceType: 'Resource audit', eventType: 'resource-access', principal: 'app-lab-07', source: 'local evidence bundle', result: 'Access recorded', detail: 'Correlate the access with permissions and the principal; the excerpt does not establish the data impact.', essential: true },
    ],
    actions: [
      { id: 'restrict-revoke-preserve', label: 'Verify ownership and scope, preserve identity/audit logs, and use approved controls to revoke risky sessions or permissions.', best: true },
      { id: 'disable-all-users', label: 'Disable every account in the tenant without scoping or an impact review.', best: false },
      { id: 'ignore-success', label: 'Ignore the sign-in sequence because authentication eventually succeeded.', best: false },
      { id: 'erase-logs', label: 'Erase audit logs before changing access.', best: false },
    ],
    evidenceNote: 'Correlate identity, permission and resource records. Verify user/device context and actual access scope before attributing an actor.',
    validation: ['Verify session/token revocation status', 'Confirm the approved permission set', 'Review subsequent sign-ins and resource activity', 'Document account owner and responder closure'],
  },
  'malware-ransomware': {
    mission: 'Respond to a fictional endpoint alert associated with a reported malware/ransomware threat. Preserve useful evidence, contain risk and validate recovery safely.',
    evidence: [
      { id: 'edr-01', timestampUtc: '2026-10-24T14:01:00Z', sourceType: 'Endpoint protection', eventType: 'suspicious-process-alert', principal: 'endpoint-lab-02', source: 'local evidence bundle', result: 'Quarantined by policy', detail: 'An endpoint alert was quarantined. Review the alert metadata and process lineage; do not execute or obtain live malware.', essential: true },
      { id: 'proc-02', timestampUtc: '2026-10-24T14:01:08Z', sourceType: 'Process telemetry', eventType: 'process-chain', principal: 'endpoint-lab-02', source: 'local evidence bundle', result: 'Parent chain available', detail: 'The parent process chain is available for analysis. Names are fictional and are not malware indicators from the real incident.', essential: true },
      { id: 'net-03', timestampUtc: '2026-10-24T14:02:15Z', sourceType: 'Network telemetry', eventType: 'outbound-connection', principal: 'endpoint-lab-02', source: '198.51.100.44', result: 'Connection observed', detail: 'A documentation-only address appears in the synthetic telemetry; correlate host context and policy decisions.', essential: true },
      { id: 'backup-04', timestampUtc: '2026-10-24T14:05:00Z', sourceType: 'Recovery status', eventType: 'backup-integrity', principal: 'backup-lab', source: 'local evidence bundle', result: 'Not yet verified', detail: 'A recovery point is listed, but its integrity and restore test status have not been confirmed.', essential: true },
    ],
    actions: [
      { id: 'contain-preserve-recover', label: 'Use approved EDR/network controls to contain the affected host, preserve evidence, scope related systems and validate clean recovery.', best: true },
      { id: 'run-sample', label: 'Execute an unknown sample on the everyday workstation to see what happens.', best: false },
      { id: 'wipe-no-evidence', label: 'Wipe the endpoint immediately and discard forensic records.', best: false },
      { id: 'restore-unchecked', label: 'Restore from the most recent backup without validating its integrity.', best: false },
    ],
    evidenceNote: 'Use safe, supplied telemetry only. Separate detection/quarantine from confirmed impact, preserve records, and verify backups before recovery.',
    validation: ['Confirm containment and affected-system scope', 'Preserve endpoint and network evidence', 'Verify backup integrity and test restoration', 'Monitor for recurrence and close with documented approval'],
  },
  generic: {
    mission: 'A current public cybersecurity report requires triage. Validate what the source actually confirms, scope local exposure, preserve evidence and plan an accountable defensive response.',
    evidence: [
      { id: 'src-01', timestampUtc: '2026-10-24T15:00:00Z', sourceType: 'Public source review', eventType: 'incident-claim', principal: 'source-record', source: 'source link', result: 'Claim recorded', detail: 'Record the source’s exact claim and date; distinguish it from independent confirmation.', essential: true },
      { id: 'asset-02', timestampUtc: '2026-10-24T15:02:00Z', sourceType: 'Asset inventory', eventType: 'exposure-check', principal: 'asset-lab-01', source: 'local evidence bundle', result: 'Scope pending', detail: 'The fictional asset inventory requires validation against authoritative product/version guidance.', essential: true },
      { id: 'log-03', timestampUtc: '2026-10-24T15:05:00Z', sourceType: 'Audit log', eventType: 'activity-review', principal: 'service-lab-01', source: 'local evidence bundle', result: 'Review required', detail: 'Review the defined exposure window and preserve the relevant records before remediation changes.', essential: true },
    ],
    actions: [
      { id: 'scope-preserve-respond', label: 'Verify the source and asset exposure, preserve records, then take proportionate approved response actions.', best: true },
      { id: 'assume-everything', label: 'Assume all assets and users are compromised before collecting evidence.', best: false },
      { id: 'test-target', label: 'Probe an external live target to verify the report.', best: false },
      { id: 'do-nothing', label: 'Ignore the report and wait for confirmed damage.', best: false },
    ],
    evidenceNote: 'Separate source facts, local observations and open questions. Use authorised inventories and records to establish exposure.',
    validation: ['Confirm affected asset scope', 'Preserve source and audit records', 'Apply approved mitigation', 'Verify the change and monitor for recurrence'],
  },
};


// Exact incident mappings prevent distinct public incidents from silently sharing the
// same generic category scenario. The records below remain synthetic training telemetry.
const INCIDENT_CASE_BY_ID = {
  'certin-ciad-2026-0053': 'litellm-supply-chain',
  'bc-php2shell-exploitation-reported-before-patches': 'php2shell-exposure',
  'certin-ciad-2026-0052': 'php2shell-exposure',
  'certin-ciad-2026-0050': 'emudhra-certificate-compromise',
  'reuters-pwc-third-party-incident-2026-10-23': 'pwc-third-party-incident',
  'cisa-cve-2026-76504': 'cisco-sdwan-auth-bypass',
};

const INCIDENT_CASES = {
  'litellm-supply-chain': {
    caseId: 'litellm-supply-chain',
    caseTitle: 'LiteLLM 1.107.0 Supply-Chain Response',
    incidentStatus: 'Publicly reported package and container-image compromise',
    practice: {
      role: 'Software supply-chain incident responder',
      skills: ['Package provenance', 'CI/CD artifact correlation', 'Secret-exposure scoping', 'Trusted rebuild validation'],
      deliverable: 'An affected build/image scope, evidence-preservation record, credential-exposure decision and verified rebuild plan.',
    },
    mission: 'You are the responder for a fictional AI platform that depends on LiteLLM. A dependency and container-image review flags a potentially affected release. Determine which local builds and image tags require action, whether the records support a credential-exposure path, and what must be preserved before rebuild and recovery.',
    publicFacts: [
      'CERT-In reported a supply-chain compromise involving the LiteLLM 1.107.0 PyPI release and container images. Confirm affected package versions and image tags against the latest vendor advisory before applying the scenario to any real environment.',
      'LiteLLM’s canonical incident report describes the affected publication windows and subsequent removal or redirection of affected artifacts. The report is the primary source for incident-specific scope and remediation.',
      'Microsoft’s research describes malicious Python startup files and credential collection paths. The public analysis does not make these synthetic lab records evidence of compromise in any learner’s environment.',
    ],
    openQuestions: [
      'Which fictional builds resolved the affected version, and which deployed images use affected tags or digests?',
      'Which secrets were accessible to the affected build identity, and is there evidence of access or exfiltration beyond a secret-read event?',
      'Were artifacts rebuilt from reviewed inputs and independently verified after remediation?',
    ],
    references: [
      { publisher: 'CERT-In', title: 'Compromise of LiteLLM PyPI Package and Docker Images', publishedAt: '2026-10-23', url: 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0053&pageid=PUBVLNOTES02', supports: 'Official advisory summary and affected software context.' },
      { publisher: 'LiteLLM', title: 'Contained: Oct 21, 2026 LiteLLM release v1.107.0 compromised', publishedAt: '2026-10-21', url: 'https://docs.litellm.ai/blog/security-incident-oct-21-2026', supports: 'Canonical vendor incident timeline, affected package/container windows and recommended actions.' },
      { publisher: 'LiteLLM', title: 'The attack chain behind the Oct 21, 2026 release compromise', publishedAt: '2026-10-23', url: 'https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain', supports: 'Vendor’s post-investigation account of the release pipeline compromise.' },
      { publisher: 'Microsoft Security Research', title: 'Inside the LiteLLM 1.107.0 supply-chain compromise', publishedAt: '2026-10-23', url: 'https://www.microsoft.com/en-us/security/blog/2026/10/23/inside-the-litellm-1-107-0-supply-chain-compromise-credential-theft-through-python-startup-hooks/', supports: 'Independent technical analysis of the Python startup-hook and credential collection behavior.' },
    ],
    evidenceNote: 'Correlate package lock/resolution, CI job, container tag/digest, secret-access audit and egress. A dependency download or secret read is not by itself proof of execution or exfiltration. All records and identities in this pack are synthetic.',
    evidence: [
      { id: 'pkg-01', timestampUtc: '2026-10-24T09:02:11Z', sourceType: 'Package lockfile', eventType: 'dependency.resolved', principal: 'build-runner-lab', source: 'local evidence bundle', result: 'Affected version candidate', detail: 'A fictional build resolves litellm==1.107.0. Confirm exact package and lockfile provenance; this record alone does not show the dependency executed.', essential: true },
      { id: 'build-02', timestampUtc: '2026-10-24T09:04:38Z', sourceType: 'CI build log', eventType: 'build.package-download', principal: 'pipeline-lab-04', source: 'local evidence bundle', result: 'Download observed', detail: 'A synthetic CI job downloads the candidate package before creating an image. Establish whether the resulting artifact was released or deployed.', essential: true },
      { id: 'net-03', timestampUtc: '2026-10-24T09:05:10Z', sourceType: 'Egress telemetry', eventType: 'network.connection', principal: 'build-runner-lab', source: '198.51.100.23', result: 'Connection observed', detail: 'A fictional runner contacts a documentation-only IP after package resolution. Correlate process and DNS context; this is not a real indicator.', essential: true },
      { id: 'secret-04', timestampUtc: '2026-10-24T09:06:01Z', sourceType: 'Secrets audit', eventType: 'ci.secret-read', principal: 'pipeline-lab-04', source: 'local evidence bundle', result: 'Secret access logged', detail: 'The build identity could read a deployment secret. Assess scope and related telemetry before concluding that the secret left the environment.', essential: true },
      { id: 'release-05', timestampUtc: '2026-10-24T09:07:45Z', sourceType: 'Artifact registry', eventType: 'release.digest-mismatch', principal: 'release-lab-04', source: 'local evidence bundle', result: 'Digest mismatch', detail: 'The stored image digest differs from the approved record. Verify the digest against an independently trusted build and the vendor’s current artifact guidance.', essential: true },
    ],
    actions: [
      { id: 'hold-preserve-scope', label: 'Pause affected releases, preserve package/CI/artifact records, scope affected builds and tags, then decide on secret rotation and trusted rebuilds.', best: true },
      { id: 'rotate-all-blindly', label: 'Rotate every secret immediately without scoping access or preserving build evidence.', best: false },
      { id: 'delete-evidence', label: 'Delete build logs and package caches before investigating.', best: false },
      { id: 'assume-all-hit', label: 'Declare every user of the package compromised without checking exact versions and exposure.', best: false },
    ],
    validation: ['Inventory exact package versions, image tags and immutable digests across build and deployment records', 'Preserve CI, registry, identity and egress evidence before cleanup', 'Rebuild from reviewed dependencies and trusted images; compare artifact digests', 'Rotate credentials supported by the exposure assessment and verify old credentials no longer work', 'Monitor new builds and document owner approval for closure'],
  },
  'php2shell-exposure': {
    caseId: 'php2shell-exposure',
    caseTitle: 'PHP2Shell Exposure and Patch Validation',
    incidentStatus: 'Official vulnerability advisory plus a separately reported exploitation timeline',
    practice: {
      role: 'Vulnerability and incident-response analyst',
      skills: ['Affected-version verification', 'Exposure-window reconstruction', 'Exploit-signal triage', 'Patch validation'],
      deliverable: 'An asset-scoped exposure decision, preserved evidence for the risk window, and a verified remediation report.',
    },
    mission: 'A fictional organization uses PHP across several services. A high-risk PHP advisory and separate reporting about exploitation timing have arrived. Determine which local assets are in scope, whether the available records indicate suspicious activity, what must be preserved, and how to verify the correct fixed version without attempting an exploit against a live service.',
    publicFacts: [
      'CERT-In’s PHP2Shell advisory describes high-risk remote-code-execution vulnerabilities. As checked on 2026-10-24, its PHP 8.2 affected-version bullet says “prior to 8.2.3”, while its remediation instructions and PHP.net identify 8.2.35 as the fixed release. Treat that as an inconsistent source statement and verify each deployed runtime against PHP.net and the operating-system/vendor package guidance.',
      'PHP.net’s 2026-10-21 security advisory identifies PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35 as releases fixing CVE-2026-109618 and CVE-2026-109619. Distribution vendors may backport fixes; validate the actual package provenance and support status rather than comparing only a version string.',
      'BleepingComputer reported, citing Amazon, that exploitation began before patches were available. Treat this as a reported timeline, not proof that a particular learner’s or organization’s server was exploited.',
      'The training records below are synthetic. They illustrate asset scoping, log preservation and remediation validation; they are not real PHP server logs or indicators from the reported activity.',
    ],
    openQuestions: [
      'Which assets run affected versions, and which were reachable during the relevant window?',
      'Do proxy, process and endpoint records corroborate suspicious activity, or are there benign explanations?',
      'Has each affected service reached a vendor-fixed version, and what evidence demonstrates that the change is effective?',
    ],
    references: [
      { publisher: 'CERT-In', title: 'Advisory to MSME — Remote code execution vulnerabilities in PHP (PHP2Shell)', publishedAt: '2026-10-22', url: 'https://www.cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0052&pageid=PUBVLNOTES02', supports: 'Official advisory, risk summary and recommendations; its PHP 8.2 affected-range bullet conflicts with its own fixed-version recommendation and is explicitly flagged above.' },
      { publisher: 'PHP.net', title: 'Security advisory: Critical remote code execution vulnerabilities, update now', publishedAt: '2026-10-21', url: 'https://www.php.net/archive/2026.php#2026-10-21-5', supports: 'Upstream fix releases for CVE-2026-109618 and CVE-2026-109619; check distribution backports and support status.' },
      { publisher: 'BleepingComputer', title: 'Amazon says PHP2Shell exploitation began 4 days before patches', publishedAt: '2026-10-22', url: 'https://www.bleepingcomputer.com/news/security/amazon-says-php2shell-exploitation-began-4-days-before-patches/', supports: 'Secondary reporting about exploitation timing; claims should be corroborated where possible.' },
    ],
    evidenceNote: 'Match the authoritative affected-version range to the asset inventory, then correlate reverse-proxy and endpoint records. An anomalous request or nearby child-process alert does not independently prove successful exploitation. The records are synthetic.',
    evidence: [
      { id: 'asset-01', timestampUtc: '2026-10-24T10:01:00Z', sourceType: 'Asset inventory', eventType: 'software.version-observed', principal: 'php-service-lab-01', source: 'local evidence bundle', result: 'Version needs verification', detail: 'A fictional service runs a PHP branch that may fall within the advisory scope. Match its exact version to current primary vendor guidance.', essential: true },
      { id: 'proxy-02', timestampUtc: '2026-10-24T10:03:12Z', sourceType: 'Reverse-proxy log', eventType: 'request-pattern-anomaly', principal: 'php-service-lab-01', source: 'local evidence bundle', result: 'Requests require review', detail: 'Several synthetic requests match a broad anomaly rule during the modelled exposure window. The payload is omitted; these records do not prove code execution.', essential: true },
      { id: 'edr-03', timestampUtc: '2026-10-24T10:03:14Z', sourceType: 'Endpoint telemetry', eventType: 'child-process-alert', principal: 'php-service-lab-01', source: 'local evidence bundle', result: 'Alert raised', detail: 'A synthetic child-process alert appears near the request window. Confirm process lineage, service account and host context before attributing causality.', essential: true },
      { id: 'change-04', timestampUtc: '2026-10-24T10:08:50Z', sourceType: 'Change record', eventType: 'patch.status', principal: 'php-service-owner-lab', source: 'local evidence bundle', result: 'Change pending', detail: 'The remediation change is pending and no post-change version verification is attached.', essential: true },
    ],
    actions: [
      { id: 'scope-patch-preserve', label: 'Verify affected versions and exposure, preserve logs, apply the vendor-approved fix, then validate the fixed state and investigate the risk window.', best: true },
      { id: 'exploit-production', label: 'Send exploit attempts to a public production service to see whether it is vulnerable.', best: false },
      { id: 'wipe-immediately', label: 'Wipe every server immediately without preserving evidence or assessing impact.', best: false },
      { id: 'ignore-no-proof', label: 'Ignore the advisory because the current logs do not prove exploitation.', best: false },
    ],
    validation: ['Map inventory versions to the current official affected/fixed-version guidance', 'Preserve proxy, application, process and endpoint logs for the exposure window', 'Apply the supported fixed version or vendor-approved mitigation with change control', 'Verify installed version and service health after the change', 'Review the window for credible exploitation evidence and record unresolved gaps'],
  },
  'emudhra-certificate-compromise': {
    caseId: 'emudhra-certificate-compromise',
    caseTitle: 'eMudhra Intermediate CA Trust Remediation',
    incidentStatus: 'Publicly reported certificate-authority compromise and vendor distrust actions',
    practice: {
      role: 'PKI and trust incident responder',
      skills: ['Certificate inventory and chain mapping', 'Issuer/serial/SPKI scoping', 'Trust-store validation', 'Controlled certificate replacement'],
      deliverable: 'Affected certificate inventory, a client-specific trust-remediation plan and proof that replacement chains validate correctly.',
    },
    mission: 'Your fictional organization operates public websites, internal services and automation clients. Public advisories report a certificate-authority incident. Determine which local certificate chains need review, which clients may still trust affected intermediates, and how to replace or distrust certificates while managing service continuity.',
    publicFacts: [
      'Google’s Chrome Security Team reported that eight eMudhra subordinate CA private keys were affected by insufficient randomness; Google described blocking the affected SPKI hashes and additional Chrome Root Store action.',
      'Apple’s advisory states it began blocking the affected intermediate certificates on Apple devices in October 2026 and calls out command-line tooling that may rely on separate certificate stores.',
      'CERT-In and Cisco also published materials on the incident. Their scope and product guidance are not identical; follow the applicable official instructions for each affected client and trust store.',
      'This scenario does not supply real affected certificate identifiers or teach certificate forgery. It uses fictional certificate inventory rows to practise defensive scoping and validation.',
    ],
    openQuestions: [
      'Which fictional services chain to the listed affected intermediates, and which clients consume separate trust stores?',
      'Have replacements been issued from an unaffected trusted hierarchy, and have dependent services actually deployed them?',
      'Do browsers, command-line tools, containers and application runtimes behave consistently after the trust change?',
    ],
    references: [
      { publisher: 'CERT-In', title: 'Compromise of eMudhra Intermediate CA Certificates', publishedAt: '2026-10-21', url: 'https://www.cert-in.org.in/s2cMainServlet?CACODE=CICA-2026-3649&pageid=PUBADV01', supports: 'Official CERT-In notice for the reported certificate compromise.' },
      { publisher: 'Google Security', title: 'Protecting Chrome and Android Users from Compromised eMudhra Intermediate CA Certificates', publishedAt: '2026-10-20', url: 'https://blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra-intermediate-ca-certificates/', supports: 'Chrome Root Program response, affected subordinate CA context and trust-store mitigations.' },
      { publisher: 'Apple Support', title: 'About the compromised eMudhra intermediate CAs', publishedAt: '2026-10-23', url: 'https://support.apple.com/en-us/149555', supports: 'Apple certificate blocking, affected TLS certificate counts and command-line trust-store caveats.' },
      { publisher: 'Cisco', title: 'Informational for Emergency Distrust of eMudhra Root and Intermediate Certificate Authorities', publishedAt: '2026-10-23', url: 'https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-emudhra-info-ScS22A1r', supports: 'Cisco product-specific trust advisory and scope caveats.' },
    ],
    evidenceNote: 'Compare local issuer/serial/SPKI fields to official published lists; these training identifiers are fictional and are not real affected certificate indicators. Plan trust changes per client platform and verify actual chain behavior after replacement.',
    evidence: [
      { id: 'cert-01', timestampUtc: '2026-10-24T08:10:00Z', sourceType: 'Certificate inventory', eventType: 'certificate.serial-match', principal: 'gateway-lab-01', source: 'local evidence bundle', result: 'Serial needs comparison', detail: 'A fictional server certificate chains to an intermediate that must be compared with the official affected-certificate list. The supplied serial is synthetic.', essential: true },
      { id: 'ca-02', timestampUtc: '2026-10-24T08:12:00Z', sourceType: 'Trust-store audit', eventType: 'issuer-chain-observed', principal: 'service-lab-02', source: 'local evidence bundle', result: 'Trust chain present', detail: 'A second fictional service uses a related issuer chain. Determine whether it shares an affected SPKI/issuer and which client trust store applies.', essential: true },
      { id: 'tls-03', timestampUtc: '2026-10-24T08:15:00Z', sourceType: 'TLS monitoring', eventType: 'certificate-validation', principal: 'gateway-lab-01', source: 'local evidence bundle', result: 'Post-change check missing', detail: 'No successful post-remediation chain validation is attached for browser and command-line clients.', essential: true },
    ],
    actions: [
      { id: 'scope-replace-validate', label: 'Scope affected chains against official lists, follow applicable distrust/revocation guidance, replace impacted certificates and validate all relevant client trust stores.', best: true },
      { id: 'disable-all-trust', label: 'Disable every certificate authority across the organization without scope or continuity planning.', best: false },
      { id: 'wait-no-exploit', label: 'Wait for evidence of abuse before reviewing an affected trust chain.', best: false },
      { id: 'copy-chain', label: 'Copy an affected certificate chain to another service without verifying trust or key status.', best: false },
    ],
    validation: ['Compare certificate issuer, serial and SPKI inventory with official affected lists', 'Identify browser, operating-system, command-line, container and application trust stores', 'Replace impacted leaf certificates through an approved unaffected hierarchy and follow issuer revocation/distrust instructions', 'Verify certificate chain and service availability from each important client type', 'Record remaining compatibility gaps and owner sign-off'],
  },
  'pwc-third-party-incident': {
    caseId: 'pwc-third-party-incident',
    caseTitle: 'PwC Third-Party Learning-Records Incident Triage',
    incidentStatus: 'Company-acknowledged vendor incident; some impact claims remain unverified',
    practice: {
      role: 'Third-party incident coordinator',
      skills: ['Fact-versus-claim analysis', 'Vendor access scoping', 'Data classification', 'Evidence and notification planning'],
      deliverable: 'A fact/claim matrix, a scoped list of potentially affected data, and a verified vendor-remediation and notification plan.',
    },
    mission: 'Your fictional organization uses a third-party learning platform. The supplier acknowledges an incident and a threat actor makes a large data-theft claim. Separate confirmed information from allegations, investigate local vendor access and data scope, preserve evidence, and decide what must be validated before external notification or closure.',
    publicFacts: [
      'Reuters reported that PwC acknowledged a cybersecurity incident involving a third-party vendor hosting employee learning records.',
      'The same report described a threat actor’s claim that 590 GB of data had been stolen. Reuters said the claim was not independently verified in that report; a claim is not the same as a confirmed exfiltration volume.',
      'The report included PwC’s statement that the affected site did not house client data, sensitive personal data or financial information, and that the incident did not affect PwC’s network or operations. Do not infer more than the published statement supports.',
    ],
    openQuestions: [
      'Which vendor identity, service account and data store were actually involved?',
      'What data was accessed or exported, and which records confirm the scope?',
      'Which legal, privacy, contractual and customer communications are required after scope is validated?',
    ],
    references: [
      { publisher: 'Reuters', title: 'PwC confirms cybersecurity incident involving employee learning records', publishedAt: '2026-10-23', url: 'https://www.reuters.com/legal/litigation/pwc-confirms-cybersecurity-incident-involving-employee-learning-records-2026-10-23/', supports: 'Reported company acknowledgment and distinction between the incident and unverified extortion-group claims.' },
    ],
    evidenceNote: 'Use a fact/claim/unknown matrix. Correlate vendor notice, authenticated sessions, access logs and data classification. The lab evidence is fictional and does not establish the real incident’s affected vendor, data volume or exfiltration.',
    evidence: [
      { id: 'vendor-01', timestampUtc: '2026-10-24T07:30:00Z', sourceType: 'Vendor notification', eventType: 'incident-notice', principal: 'vendor-lab', source: 'local evidence bundle', result: 'Initial notice received', detail: 'A fictional supplier acknowledges an incident but the affected customer data and time window are not yet scoped.', essential: true },
      { id: 'access-02', timestampUtc: '2026-10-24T07:40:00Z', sourceType: 'Access audit', eventType: 'vendor-session', principal: 'vendor-support-lab', source: 'local evidence bundle', result: 'Session found', detail: 'A fictional vendor session overlaps the potential exposure window. Verify source, owner, authorization and records accessed.', essential: true },
      { id: 'data-03', timestampUtc: '2026-10-24T07:45:00Z', sourceType: 'Data inventory', eventType: 'data-classification', principal: 'learning-records-lab', source: 'local evidence bundle', result: 'Classification check needed', detail: 'The fictional service contains employee training records. Determine data types and scope before making disclosure or notification claims.', essential: true },
    ],
    actions: [
      { id: 'scope-revoke-notify', label: 'Preserve vendor and access evidence, verify the affected scope with accountable owners, restrict access proportionately and follow approved notification decisions.', best: true },
      { id: 'publish-unverified', label: 'Publish the alleged stolen-data volume as a confirmed fact before verification.', best: false },
      { id: 'delete-vendor', label: 'Delete the vendor integration and evidence immediately without scoping dependencies or preserving records.', best: false },
      { id: 'assume-no-data', label: 'Assume no data is affected because the vendor’s initial scope is incomplete.', best: false },
    ],
    validation: ['Preserve vendor notice, access logs, contracts and data inventories', 'Confirm the vendor identity, time window, identities and records accessed', 'Separate supplier-confirmed facts from threat-actor claims in the report', 'Coordinate access restriction and legal/privacy notification with accountable owners', 'Require written evidence of vendor containment and independently validate the local integration state'],
  },
  'cisco-sdwan-auth-bypass': {
    caseId: 'cisco-sdwan-auth-bypass',
    caseTitle: 'Cisco SD-WAN Manager Authentication-Bypass Response',
    incidentStatus: 'Vendor-confirmed actively exploited vulnerability; remediation guidance available',
    practice: {
      role: 'Network security incident responder',
      skills: ['Management-plane asset scoping', 'Authentication-log review', 'Evidence preservation before upgrade', 'Fixed-version verification'],
      deliverable: 'A complete manager/cluster inventory, preserved diagnostic bundle checklist, fixed-version verification and vendor-assisted exposure review plan.',
    },
    mission: 'You are responsible for a fictional Cisco Catalyst SD-WAN Manager deployment. A high-severity authentication-bypass vulnerability has a public exploitation notice. Determine which management instances are in scope, preserve the diagnostic material required for investigation, prioritize the fixed release, and define what would establish whether the environment was compromised.',
    publicFacts: [
      'Cisco’s advisory describes CVE-2026-76504 as an authentication-bypass issue involving URI-encoding handling in the API session mechanism, potentially allowing unauthenticated access with administrative privileges on affected systems.',
      'Cisco reported awareness of active exploitation in September 2026 and recommends upgrading to a fixed release. Its remediation guidance says to collect admin-tech diagnostic bundles across managers, clusters and disaster-recovery deployments before upgrade, then request vendor scanning.',
      'A vulnerable version is evidence of exposure, not proof that every installation was compromised. Use the current Cisco affected/fixed-version table and your own approved asset inventory.',
    ],
    openQuestions: [
      'Which managers, cluster members and disaster-recovery nodes are on affected releases and exposed management interfaces?',
      'Are there unexpected administrative sessions or API activity in logs and diagnostic bundles?',
      'Has each instance reached the fixed release, and has the vendor-assisted review found indicators requiring additional response?',
    ],
    references: [
      { publisher: 'Cisco PSIRT', title: 'Cisco Catalyst SD-WAN Manager API Authentication Bypass Vulnerability — CVE-2026-76504', publishedAt: '2026-09-30', url: 'https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-sdwan-webauth-xr8beuuU.html', supports: 'Primary vulnerability description, active exploitation note and fixed-version guidance.' },
      { publisher: 'Cisco', title: 'Remediate Catalyst SD-WAN Security Advisory — September 2026', publishedAt: '2026-10-02', url: 'https://www.cisco.com/c/en/us/support/docs/routers/sd-wan/226384-remediate-catalyst-sd-wan-security.html', supports: 'Operational remediation workflow: preserve admin-techs, upgrade, then request vendor scanning.' },
      { publisher: 'CISA', title: 'Known Exploited Vulnerabilities Catalog', publishedAt: 'Continuously updated', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', supports: 'Official catalogue to confirm current KEV listing and due-date metadata when applicable.' },
    ],
    evidenceNote: 'This case exercises authorized asset inventory, evidence preservation and patch verification. No exploit request or external probing is needed. The telemetry below is fictional and is not a Cisco customer diagnostic bundle.',
    evidence: [
      { id: 'asset-01', timestampUtc: '2026-10-24T10:01:00Z', sourceType: 'Management inventory', eventType: 'software.version-observed', principal: 'sdwan-manager-lab-01', source: 'local evidence bundle', result: 'Release needs verification', detail: 'A fictional manager runs a release that must be checked against Cisco’s exact affected/fixed release table.', essential: true },
      { id: 'proxy-02', timestampUtc: '2026-10-24T10:03:12Z', sourceType: 'Management API log', eventType: 'uri-encoding-anomaly', principal: 'sdwan-manager-lab-01', source: 'local evidence bundle', result: 'Request requires review', detail: 'A fictional management API request has unusual URI encoding. The request body is omitted; determine from authorized logs whether it reached a sensitive endpoint.', essential: true },
      { id: 'edr-03', timestampUtc: '2026-10-24T10:03:14Z', sourceType: 'Admin session audit', eventType: 'privileged-session-anomaly', principal: 'sdwan-admin-lab', source: 'local evidence bundle', result: 'Session context missing', detail: 'A privileged session was recorded close to the API anomaly, but source, authentication context and operator intent are not included.', essential: true },
      { id: 'change-04', timestampUtc: '2026-10-24T10:08:50Z', sourceType: 'Change record', eventType: 'upgrade.status', principal: 'network-owner-lab', source: 'local evidence bundle', result: 'Upgrade pending', detail: 'No fixed-release verification is attached, and the diagnostic bundle collection checklist is incomplete.', essential: true },
    ],
    actions: [
      { id: 'scope-patch-preserve', label: 'Inventory all managers/cluster/DR nodes, preserve admin-tech diagnostics before upgrade, apply the appropriate fixed release, then arrange vendor-assisted compromise checks.', best: true },
      { id: 'exploit-production', label: 'Send crafted authentication-bypass requests to the live management interface to see whether it is vulnerable.', best: false },
      { id: 'wipe-immediately', label: 'Wipe management nodes before collecting diagnostic evidence.', best: false },
      { id: 'ignore-no-proof', label: 'Ignore the advisory because the synthetic logs do not prove exploitation.', best: false },
    ],
    validation: ['Inventory every manager including cluster and disaster-recovery nodes and map exact releases to the current Cisco advisory', 'Collect and preserve admin-tech diagnostic bundles before upgrading, following the vendor procedure', 'Upgrade to the appropriate fixed release without crossing major-release boundaries outside approved guidance', 'Open the vendor support case and obtain the diagnostic scan result', 'If indicators are found, follow vendor remediation; otherwise record the upgrade and validation evidence'],
  },
};

function getIncidentCase(item) {
  const caseKey = INCIDENT_CASE_BY_ID[item?.id];
  return caseKey ? INCIDENT_CASES[caseKey] || null : null;
}

function dateLabel(value) {
  if (!value) return 'Publication date not supplied';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
function incidentDateLabel(item) {
  if (!item?.incidentDate) return 'Event date not supplied';
  const value = String(item.incidentDate);
  if (item.incidentDatePrecision === 'year') return value.slice(0, 4);
  if (item.incidentDatePrecision === 'decade') return `${value.slice(0, 3)}0s (approx.)`;
  const date = new Date(value);
  if (item.incidentDatePrecision === 'month' && !Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
  }
  return dateLabel(value);
}

function ageLabel(value) {
  const delta = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(delta) || delta < 0) return 'Time not verified';
  const hours = Math.floor(delta / 3600000);
  if (hours < 1) return 'Updated within the last hour';
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}

function exportReport(report) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `opencyberpath-live-drill-${String(report.incidentId).replace(/[^a-z0-9-]/gi, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function LiveResponseDrill({ item, onClose, auth, onSaved }) {
  const incidentCase = getIncidentCase(item);
  const profile = incidentCase || PROFILES[item.caseType] || PROFILES.generic;
  const practice = incidentCase?.practice || PRACTICE_BLUEPRINTS[item.caseType] || PRACTICE_BLUEPRINTS.generic;
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [actionId, setActionId] = useState('');
  const [findings, setFindings] = useState('');
  const [validationPlan, setValidationPlan] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  function assess() {
    const essential = profile.evidence.filter((event) => event.essential).map((event) => event.id);
    const evidenceScore = Math.round((essential.filter((id) => selectedEvidence.includes(id)).length / Math.max(1, essential.length)) * 35);
    const action = profile.actions.find((candidate) => candidate.id === actionId);
    const responseScore = action?.best ? 30 : action ? 5 : 0;
    const analysisScore = findings.trim().length >= 100 ? 20 : findings.trim().length >= 45 ? 12 : 0;
    const validationText = validationPlan.toLowerCase();
    const validationTerms = ['verify', 'audit', 'log', 'patch', 'revoke', 'rotate', 'monitor', 'digest', 'rebuild', 'restore', 'scope', 'confirm', 'validate', 'certificate', 'token', 'backup'];
    const validationsMatched = validationTerms.filter((term) => validationText.includes(term)).length;
    const validationScore = validationPlan.trim().length >= 60 && validationsMatched >= 2 ? 15 : validationsMatched >= 1 ? 8 : 0;
    const total = evidenceScore + responseScore + analysisScore + validationScore;
    const results = {
      total,
      criteria: [
        { label: 'Evidence coverage', score: evidenceScore, possible: 35, feedback: evidenceScore === 35 ? 'You selected all key records supplied for this exercise.' : 'Correlate more of the supplied evidence. Use the source record and all relevant local logs before concluding impact.' },
        { label: 'Initial response', score: responseScore, possible: 30, feedback: action?.best ? 'Your chosen first action is proportionate and preserves an investigation path.' : 'Revisit scope, business impact and evidence preservation before making destructive or unverified changes.' },
        { label: 'Written analysis', score: analysisScore, possible: 20, feedback: analysisScore === 20 ? 'Your findings are detailed enough for formative review. Make sure they cite event IDs and separate facts from assumptions.' : 'Expand your reasoning: cite evidence IDs, explain what each supports, and state what remains unknown.' },
        { label: 'Validation plan', score: validationScore, possible: 15, feedback: validationScore === 15 ? 'Your plan names multiple verification themes. Add expected outcomes and who signs off where relevant.' : 'Name concrete records or control checks and state what result would prove remediation worked.' },
      ],
      instructorNotes: profile.validation,
      evidenceReference: selectedEvidence,
      actionId,
      findings,
      validationPlan,
    };
    setAssessment(results);
  }

  function exportAttempt() {
    if (!assessment) return;
    exportReport({
      title: `OpenCyberPath live incident response drill: ${item.title}`,
      incidentId: item.id,
      caseType: item.caseType,
      source: { publisher: item.publisher, publishedAt: item.publishedAt, url: item.url, summary: item.summary, status: item.signalType },
      scenarioNotice: 'The public source describes the reported incident/advisory. All event records in this drill are fictional synthetic training evidence and are not actual victim telemetry. This report is formative, not certification.',
      evidence: profile.evidence,
      assessment,
      practice,
      publicFacts: profile.publicFacts || [],
      openQuestions: profile.openQuestions || [],
      relatedSources: profile.references || [],
      exportedAt: new Date().toISOString(),
    });
  }

  async function saveAttempt() {
    if (!assessment || saving) return;
    if (auth.status !== 'authenticated') {
      setSaveError('Sign in to save this investigation to your account.');
      return;
    }
    if (!API_BASE) {
      setSaveError('The API base URL is not configured in this website build. You can still export your report locally.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    try {
      const token = await auth.getAccessToken();
      const response = await fetch(`${API_BASE}/v1/live-drills/submissions`, {
        method: 'POST',
        credentials: 'omit',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: item.id,
          caseType: item.caseType,
          evidenceRefs: selectedEvidence,
          actionId,
          findings,
          validationPlan,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const code = typeof body?.error === 'string' ? body.error : `http_${response.status}`;
        const message = {
          authentication_required: 'Sign in again before saving this attempt.',
          invalid_or_expired_token: 'Your session expired. Sign in again and retry.',
          verified_email_required: 'Verify your account email before saving an attempt.',
          invalid_incident_id: 'This incident identifier cannot be saved safely.',
          invalid_case_type: 'This drill type is not supported by the server yet.',
        }[code] || `The attempt could not be saved (${code}). You can export the report locally.`;
        throw new Error(message);
      }
      const saved = body?.submission;
      if (!saved?.submissionId || !Array.isArray(saved?.rubricFeedback)) {
        throw new Error('The API did not confirm a saved assessment. Export your report locally and retry later.');
      }
      const serverCriteria = saved.rubricFeedback.map((criterion) => ({
        label: criterion.criterion,
        score: criterion.pointsAwarded,
        possible: criterion.pointsPossible,
        feedback: criterion.feedback,
      }));
      setAssessment((current) => current ? {
        ...current,
        total: Number(saved.score) || 0,
        criteria: serverCriteria,
        responseGuide: Array.isArray(body.responseGuide) ? body.responseGuide : [],
        savedAttempt: { submissionId: saved.submissionId, attemptNo: saved.attemptNo, submittedAt: saved.submittedAt },
      } : current);
      setSaveMessage(`Attempt ${saved.attemptNo} saved to your account.`);
      onSaved?.();
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : 'The attempt could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return <section className="lio-drill" aria-labelledby="lio-drill-title">
    <div className="lio-drill-head"><div><span className="lio-kicker">{incidentCase ? 'INCIDENT-SPECIFIC INVESTIGATION' : 'RELATED-SKILLS DEFENSIVE DRILL'} · {practice.role}</span><h3 id="lio-drill-title">{incidentCase?.caseTitle || item.title}</h3><p>{profile.mission}</p></div><button type="button" className="lio-quiet-button" onClick={onClose}>Close drill ×</button></div>
    <section className="lio-practice-brief" aria-label="Skills practised in this drill"><div className="lio-practice-brief-heading"><span className="lio-kicker">WHAT YOU ARE PRACTISING</span><span>{practice.skills.length} core competencies</span></div><div className="lio-practice-chips">{practice.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p><strong>Your work product:</strong> {practice.deliverable}</p><small>This is a category-matched training drill for the reported issue, not a reconstruction of the affected organisation’s private environment. The incident-specific record remains the linked public source; all local evidence below is synthetic.</small></section>
    <div className="lio-integrity"><strong>SOURCE / SIMULATION BOUNDARY</strong><p>The public report is the incident context. The evidence timeline below is synthetic, fictional training telemetry created to practise the response workflow; it is not evidence taken from the affected organisation. This drill does not contact or test a live target.</p><a href={item.url} target="_blank" rel="noreferrer">Read source report ↗</a></div>
    {profile.publicFacts?.length > 0 && <section className="lio-public-context" aria-label="Source-backed incident facts"><div className="lio-panel-heading"><span className="lio-kicker">WHAT THE PUBLIC SOURCES ESTABLISH</span><span>{profile.incidentStatus}</span></div><ul>{profile.publicFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>{profile.openQuestions?.length > 0 && <><h4>Questions your investigation must resolve</h4><ul>{profile.openQuestions.map((question) => <li key={question}>{question}</li>)}</ul></>}</section>}
    {profile.references?.length > 0 && <section className="lio-reference-dossier" aria-label="Incident source dossier"><div className="lio-panel-heading"><span className="lio-kicker">INCIDENT SOURCE DOSSIER</span><span>{profile.references.length} references</span></div><div className="lio-reference-list">{profile.references.map((reference) => <article className="lio-reference-item" key={reference.url}><div><small>{reference.publisher} · {reference.publishedAt}</small><strong>{reference.title}</strong><p>{reference.supports}</p></div><a href={reference.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div></section>}
    <div className="lio-drill-grid">
      <div className="lio-evidence-panel"><div className="lio-panel-heading"><span className="lio-kicker">SYNTHETIC EVIDENCE ROOM</span><span>{profile.evidence.length} records</span></div><div className="lio-events">{profile.evidence.map((event) => <label className={`lio-event ${selectedEvidence.includes(event.id) ? 'is-selected' : ''}`} key={event.id}><input type="checkbox" checked={selectedEvidence.includes(event.id)} onChange={() => setSelectedEvidence((current) => current.includes(event.id) ? current.filter((id) => id !== event.id) : [...current, event.id])} /><span className="lio-event-main"><span><b>{event.id}</b><time>{event.timestampUtc.slice(11, 19)} UTC</time></span><strong>{event.eventType}</strong><p>{event.detail}</p><small>{event.sourceType} · {event.result} · SYNTHETIC</small></span></label>)}</div><p className="lio-muted">{profile.evidenceNote}</p><button type="button" className="lio-quiet-button" onClick={() => exportReport({ title: item.title, incidentId: item.id, classification: 'synthetic-training-evidence', notice: 'These records are simulated training artifacts, not live telemetry.', evidence: profile.evidence, exportedAt: new Date().toISOString() })}>Export synthetic evidence JSON ↧</button></div>
      <div className="lio-decision-panel"><div className="lio-panel-heading"><span className="lio-kicker">YOUR DECISION LOG</span><span>Independent analysis</span></div><label className="lio-field"><span>1. Which response would you take first?</span><select value={actionId} onChange={(event) => { setActionId(event.target.value); setAssessment(null); }}><option value="">Choose your action</option>{profile.actions.map((action) => <option key={action.id} value={action.id}>{action.label}</option>)}</select></label><label className="lio-field"><span>2. Explain your current hypothesis</span><textarea value={findings} onChange={(event) => { setFindings(event.target.value); setAssessment(null); }} rows={5} placeholder="Cite evidence IDs. Explain what is supported, what remains uncertain, and what additional record would change your view." /></label><label className="lio-field"><span>3. How will you validate the response?</span><textarea value={validationPlan} onChange={(event) => { setValidationPlan(event.target.value); setAssessment(null); }} rows={4} placeholder="Name concrete logs, version/digest/permission checks, expected results, and who confirms closure." /></label><div className="lio-submit"><button type="button" className="lio-primary-button" onClick={assess} disabled={!actionId || findings.trim().length < 40 || validationPlan.trim().length < 20}>Assess my response</button><span className="lio-muted">Formative rubric · maximum 100</span></div>
        {assessment && <div className="lio-assessment" aria-live="polite"><div className="lio-assessment-score"><span className="lio-kicker">YOUR DRILL RESULT</span><strong>{assessment.total}<small>/100</small></strong></div>{assessment.criteria.map((criterion) => <article className="lio-criterion" key={criterion.label}><div><b>{criterion.label}</b><span>{criterion.score}/{criterion.possible}</span></div><p>{criterion.feedback}</p></article>)}<section className="lio-instructor-notes"><h4>Validation checklist for this scenario</h4><ol>{assessment.instructorNotes.map((step) => <li key={step}>{step}</li>)}</ol><p>Review the source report for confirmed incident facts. These synthetic records illustrate the investigation, not the real organisation’s private logs.</p></section>{assessment.responseGuide?.length > 0 && <section className="lio-instructor-notes"><h4>Server-side response principles</h4><ul>{assessment.responseGuide.map((step) => <li key={step}>{step}</li>)}</ul></section>}{assessment.savedAttempt && <p className="lio-save-status" role="status">Saved attempt #{assessment.savedAttempt.attemptNo} · {dateLabel(assessment.savedAttempt.submittedAt)}</p>}{saveMessage && <p className="lio-save-status" role="status">{saveMessage}</p>}{saveError && <p className="lio-save-error" role="alert">{saveError}</p>}<div className="lio-assessment-actions"><button type="button" className="lio-primary-button" onClick={auth.status === 'authenticated' ? saveAttempt : () => void auth.login()} disabled={saving || !API_BASE || auth.status === 'loading' || Boolean(assessment.savedAttempt) || (auth.status !== 'authenticated' && !auth.configured)}>{saving ? 'Saving attempt…' : assessment.savedAttempt ? 'Saved to account ✓' : auth.status === 'authenticated' ? 'Save attempt to my account' : auth.configured ? 'Sign in to save attempt' : 'Account save unavailable'}</button><button type="button" className="lio-quiet-button" onClick={exportAttempt}>Export assessment report ↧</button></div></div>}
    </div>
    </div>
  </section>;
}

export default function LiveIncidentOps() {
  const auth = useAuth();
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [activeItem, setActiveItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [archiveVisibleCount, setArchiveVisibleCount] = useState(8);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [historyNonce, setHistoryNonce] = useState(0);
  const [refreshState, setRefreshState] = useState(null);
  const [refreshNotice, setRefreshNotice] = useState('');
  const [refreshBusy, setRefreshBusy] = useState(false);

  const loadLatestFeed = useCallback(async ({ force = false, signal } = {}) => {
    setRefreshBusy(true);
    let manualNotice = '';
    try {
      if (!API_BASE) throw new Error('on-demand refresh API is not configured');
      if (force) {
        const request = await fetch(`${API_BASE}/v1/live-intelligence/refresh`, {
          method: 'POST', cache: 'no-store', credentials: 'omit',
          headers: { Accept: 'application/json' }, signal,
        });
        const action = await request.json().catch(() => null);
        if (request.status === 429) {
          const seconds = Number(action?.retryAfterSeconds ?? request.headers.get('Retry-After') ?? 60);
          manualNotice = `A source refresh ran recently. Showing the latest snapshot; try again in about ${Math.max(1, seconds)} seconds.`;
        } else if (!request.ok && request.status !== 503) {
          throw new Error(typeof action?.error === 'string' ? action.error : `refresh_http_${request.status}`);
        } else if (request.status === 503) {
          throw new Error('on-demand refresh is unavailable in this deployment');
        }
      }

      let latest = null;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (signal?.aborted) return;
        const response = await fetch(`${API_BASE}/v1/live-intelligence`, {
          cache: 'no-store', credentials: 'omit', headers: { Accept: 'application/json' }, signal,
        });
        if (!response.ok) throw new Error(`live_api_http_${response.status}`);
        const body = await response.json();
        if (!Array.isArray(body?.items) || !Array.isArray(body?.sources)) throw new Error('feed_schema_invalid');
        latest = body;
        setFeed(body);
        setRefreshState(body.refreshState || null);
        setError('');
        if (body.refreshState?.status !== 'refreshing') break;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
      if (manualNotice) setRefreshNotice(manualNotice);
      else if (latest?.refreshState?.status === 'error') setRefreshNotice(`A source refresh failed. Showing the last saved snapshot. ${latest.refreshState.lastError || ''}`.trim());
      else if (latest?.refreshState?.status === 'partial') setRefreshNotice('The snapshot is available, but one or more sources are stale or unavailable. Check the source status labels.');
      else if (latest?.refreshState?.status === 'stale') setRefreshNotice('Showing the last snapshot while a source refresh is due.');
      else if (latest?.refreshState?.status === 'snapshot-only') setRefreshNotice('On-demand source refresh is unavailable here; this is the latest published snapshot.');
      else if (latest?.refreshState?.status === 'refreshing') setRefreshNotice('Source refresh is still running. The latest saved snapshot remains visible and this panel will update on the next page load or manual refresh.');
      else setRefreshNotice('');
    } catch (caught) {
      if (signal?.aborted) return;
      try {
        // Safe fallback for static hosting or deployments where the API refresh endpoint is not configured.
        const response = await fetch(FEED_URL, { cache: 'no-store', signal });
        if (!response.ok) throw new Error(`feed_http_${response.status}`);
        const body = await response.json();
        if (!Array.isArray(body?.items) || !Array.isArray(body?.sources)) throw new Error('feed_schema_invalid');
        setFeed(body);
        setRefreshState(null);
        setError('');
        const reason = caught instanceof Error ? caught.message : 'live refresh unavailable';
        setRefreshNotice(`On-demand refresh unavailable (${reason}); showing the latest published snapshot from the feed file.`);
      } catch (fallbackError) {
        if (!signal?.aborted) setError(fallbackError instanceof Error ? fallbackError.message : 'Live incident feed unavailable.');
      }
    } finally {
      if (!signal?.aborted) setRefreshBusy(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadLatestFeed({ signal: controller.signal });
    return () => controller.abort();
  }, [loadLatestFeed]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || !API_BASE) {
      setHistory([]);
      setHistoryError('');
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    async function loadHistory() {
      try {
        const token = await auth.getAccessToken();
        const response = await fetch(`${API_BASE}/v1/me/cases`, {
          credentials: 'omit',
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(typeof body?.error === 'string' ? body.error : `http_${response.status}`);
        if (!active) return;
        setHistory((Array.isArray(body?.submissions) ? body.submissions : []).filter((row) => String(row.caseId || '').startsWith('live-')));
        setHistoryError('');
      } catch (caught) {
        if (!active || controller.signal.aborted) return;
        setHistoryError(caught instanceof Error ? caught.message : 'Saved live investigations could not be loaded.');
      }
    }
    void loadHistory();
    return () => { active = false; controller.abort(); };
  }, [auth.status, historyNonce]);

  useEffect(() => {
    if (activeItem) {
      document.getElementById('lio-drill-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeItem]);

  const items = useMemo(() => {
    const all = [...(feed?.items || [])].sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
    const query = search.trim().toLowerCase();
    return all.filter((item) => (kind === 'all' || item.caseType === kind) && (!query || [item.title, item.summary, item.publisher, item.caseType, item.signalType].some((value) => String(value || '').toLowerCase().includes(query))));
  }, [feed, search, kind]);

  const archiveItems = useMemo(() => {
    const all = [...(HISTORICAL_INCIDENT_LIBRARY?.items || [])].sort((a, b) => (Date.parse(b.incidentDate) || 0) - (Date.parse(a.incidentDate) || 0));
    const query = search.trim().toLowerCase();
    return all.filter((item) => {
      if (kind !== 'all' && item.caseType !== kind) return false;
      if (!query) return true;
      const searchValues = [item.id, item.title, item.summary, item.publisher, item.caseType, item.recordClass, item.signalType, item.country, item.region, item.sector, item.sourceStatusLabel, ...(item.tags || []), ...(item.facts || []), ...((item.resources || []).flatMap((resource) => [resource.title, resource.publisher, resource.purpose]))];
      const searchText = searchValues.map((value) => String(value || '').toLowerCase()).join(' ');
      const terms = query.split(/\s+/).filter(Boolean);
      return searchText.includes(query) || terms.every((term) => searchText.includes(term));
    });
  }, [search, kind]);

  const archiveFallbackItems = useMemo(() => {
    if (!search.trim() || archiveItems.length) return [];
    return [...(HISTORICAL_INCIDENT_LIBRARY?.items || [])]
      .filter((item) => kind === 'all' || item.caseType === kind)
      .sort((a, b) => (Date.parse(b.incidentDate) || 0) - (Date.parse(a.incidentDate) || 0))
      .slice(0, 6);
  }, [search, kind, archiveItems]);
  const archiveDisplayItems = archiveItems.length ? archiveItems : archiveFallbackItems;
  const archiveUsingFallback = Boolean(search.trim() && !archiveItems.length && archiveFallbackItems.length);
  const refreshAge = feed?.generatedAt ? ageLabel(feed.generatedAt) : 'Refresh time unknown';
  const refreshStatusLabel = refreshBusy || refreshState?.status === 'refreshing' ? 'Checking sources…'
    : refreshState?.status === 'fresh' ? 'Source check complete'
      : refreshState?.status === 'partial' ? 'Some sources stale'
        : refreshState?.status === 'error' ? 'Refresh failed'
          : refreshState?.status === 'stale' ? 'Snapshot stale'
            : refreshState?.status === 'snapshot-only' ? 'Published snapshot mode'
              : 'Latest published snapshot';
  return <section className="lio-section" aria-labelledby="lio-title">
    <div className="lio-section-head"><div><span className="lio-kicker"><span className="lio-live-dot" /> LIVE INCIDENT OPERATIONS</span><h2 id="lio-title">Current attacks. Real decisions.</h2><p>Investigate public incident reporting through a local defensive-response drill. Each page load requests the newest available snapshot; the API checks upstream sources when due. No drill probes or contacts real targets.</p></div><div className="lio-refresh"><span>INTELLIGENCE FEED</span><strong>{feed?.items?.length ?? '—'}</strong><small>{refreshAge} · {refreshStatusLabel}</small><button type="button" className="lio-quiet-button lio-refresh-button" onClick={() => void loadLatestFeed({ force: true })} disabled={refreshBusy}>{refreshBusy ? 'Checking sources…' : 'Refresh sources now'}</button></div></div>
    {auth.status === 'authenticated' && <section className="lio-history" aria-labelledby="lio-history-title"><div className="lio-panel-heading"><span id="lio-history-title" className="lio-kicker">YOUR LIVE INVESTIGATION RECORD</span><span>{history.length} saved attempts</span></div>{historyError && <p className="lio-save-error" role="status">Saved history unavailable: {historyError}</p>}{history.length > 0 ? <div className="lio-history-list">{history.slice(0, 8).map((attempt) => { const incidentId = String(attempt.caseId || '').replace(/^live-/, ''); const sourceItem = (feed?.items || []).find((candidate) => candidate.id === incidentId); return <article className="lio-history-row" key={attempt.submissionId}><div><strong>{sourceItem?.title || incidentId}</strong><small>Attempt {attempt.attemptNo} · {dateLabel(attempt.submittedAt)}</small></div><b>{attempt.score}/100</b></article>; })}</div> : <p className="lio-muted">Your saved live-investigation attempts will appear here after you submit a drill while signed in.</p>}</section>}
    <div className="lio-source-strip">{(feed?.sources || []).map((source) => <span key={source.id} className={`lio-source-status is-${source.status || 'seeded'}`} title={source.description}>{source.name}: {source.status || 'seeded'}</span>)}</div>
    {error && <div className="lio-feed-warning" role="status"><strong>Live feed could not be loaded.</strong> {error}. The feature will not invent a current incident; run the refresh job or restore the last feed snapshot.</div>}
    {refreshNotice && <div className="lio-refresh-message" role="status">{refreshNotice}</div>}
    {feed && <><div className="lio-controls"><label><span>Search incidents</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(12); setArchiveVisibleCount(8); setActiveItem(null); }} placeholder="AIIMS, PowerSchool, MOVEit, bank, hospital…" /></label><label><span>Case type</span><select value={kind} onChange={(event) => { setKind(event.target.value); setVisibleCount(12); setArchiveVisibleCount(8); setActiveItem(null); }}><option value="all">All current and archived cases</option>{Object.entries(TYPE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
      <div className="lio-card-grid">{items.slice(0, visibleCount).map((item) => { const incidentCase = getIncidentCase(item); const practice = incidentCase?.practice || PRACTICE_BLUEPRINTS[item.caseType] || PRACTICE_BLUEPRINTS.generic; return <article className={`lio-incident-card ${activeItem?.id === item.id ? 'is-active' : ''}`} key={item.id}><div className={`lio-visual lio-visual-${item.caseType || 'generic'}`}><span aria-hidden="true">{GLYPHS[item.caseType] || GLYPHS.generic}</span><small>{TYPE_LABELS[item.caseType] || TYPE_LABELS.generic}</small></div><div className="lio-incident-content"><div className="lio-meta"><span>{item.signalType || 'Reported cybersecurity incident'}</span><time>{dateLabel(item.publishedAt)}</time></div><h3>{item.title}</h3><p>{item.summary || 'Open the source report to review the documented claims and limitations.'}</p><section className="lio-practice-preview" aria-label="What this drill teaches"><div><span className="lio-kicker">WHAT YOU’LL PRACTISE</span><small>{practice.role}</small></div><div className="lio-practice-chips">{practice.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p><strong>Outcome:</strong> {practice.deliverable}</p><small className="lio-drill-scope-note">{incidentCase ? 'Incident-specific investigation · simulated training evidence' : 'Related-skills drill · synthetic training evidence'}</small></section><div className="lio-incident-footer"><span>{item.publisher}</span><span className="lio-source-actions"><a href={item.url} target="_blank" rel="noreferrer">Source report ↗</a>{item.sourceCatalogUrl && <a href={item.sourceCatalogUrl} target="_blank" rel="noreferrer">CISA catalog ↗</a>}</span></div><button type="button" className="lio-launch" onClick={() => setActiveItem(item)}>Practise these skills <span aria-hidden="true">→</span></button></div></article>; })}</div>
      {!items.length && <p className="lio-empty">No current feed signals match this search. The Historical Incident Archive below uses the same search and case-type filters; if there is no exact archive match, it will show source-backed cases to explore.</p>}
      {items.length > visibleCount && <button type="button" className="lio-quiet-button lio-more" onClick={() => setVisibleCount((count) => count + 12)}>Load more live signals ({items.length - visibleCount} remaining)</button>}
      <p className="lio-footnote">Coverage is limited to the monitored sources below; it cannot include every global cyber incident. A source report is not automatically proof of compromise. New source records are triaged into a practice drill; the scenario evidence remains synthetic unless the card explicitly links to a licensed public dataset.</p>
      <div className="lio-source-links">{(feed.sources || []).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}</div></>}
    <section className="lio-archive" aria-labelledby="lio-archive-title">
      <div className="lio-archive-head">
        <div><span className="lio-kicker">SOURCE-BACKED HISTORICAL CASES</span><h2 id="lio-archive-title">Real incidents. Linked sources. Lessons that last.</h2><p>Search the curated archive alongside the current feed. Each card includes a paraphrased summary, source-status label, key facts and links to original reporting or official guidance. Images are original illustrative artwork—not photographs from the incident.</p></div>
        <div className="lio-archive-count"><strong>{HISTORICAL_INCIDENT_LIBRARY?.items?.length || 0}</strong><span>ARCHIVED CASES</span></div>
      </div>
      {archiveUsingFallback && <p className="lio-empty" role="status">No exact archive result for “{search.trim()}”. To avoid an empty results area, these recent source-backed cases are shown instead. Clear the search or try a sector, country, organisation or incident type.</p>}
      {!archiveDisplayItems.length && <p className="lio-empty">No archive cases match this case type. Switch to all current and archived cases to view the archive.</p>}
      <div className="lio-archive-grid">{archiveDisplayItems.slice(0, archiveVisibleCount).map((item) => <article className="lio-archive-card" key={item.id}>
        <div className="lio-archive-art"><img src={`${BASE_PATH}${item.illustration}`} alt={`${item.sector} cybersecurity incident illustration. Original artwork, not a photograph of the real incident.`} loading="lazy" /><span>{item.country}</span><small>ILLUSTRATIVE ART</small></div>
        <div className="lio-archive-body">
          <div className="lio-archive-meta"><span>{item.sourceStatusLabel}</span><time>Event / advisory date: {incidentDateLabel(item)}</time></div>
          <h3>{item.title}</h3><p>{item.summary}</p>
          <div className="lio-archive-tags"><span>{item.sector}</span><span>{TYPE_LABELS[item.caseType] || TYPE_LABELS.generic}</span>{item.recordClass && <span>{RECORD_CLASS_LABELS[item.recordClass] || item.recordClass}</span>}</div>
          <div className="lio-archive-primary"><a href={item.url} target="_blank" rel="noreferrer">Read source report ↗</a><span>{item.publisher} · {item.publicationDateKnown === false ? 'Publication date not listed' : <>Published {dateLabel(item.publishedAt)}</>}</span></div>
          <details className="lio-archive-details"><summary>Key facts & learning resources ({(item.facts || []).length} facts · {(item.resources || []).length} resources)</summary>
            <h4>What the linked sources establish</h4><ul>{(item.facts || []).map((fact) => <li key={fact}>{fact}</li>)}</ul>
            <h4>Related articles and defensive resources</h4><div className="lio-archive-resource-list">{(item.resources || []).map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><strong>{resource.title}</strong><small>{resource.publisher} — {resource.purpose}</small><span>Open resource ↗</span></a>)}</div>
          </details>
        </div>
      </article>)}</div>
      {archiveDisplayItems.length > archiveVisibleCount && <button type="button" className="lio-quiet-button lio-more" onClick={() => setArchiveVisibleCount((count) => count + 8)}>Load more historical cases ({archiveDisplayItems.length - archiveVisibleCount} remaining)</button>}
      <p className="lio-archive-footnote">Coverage note: this is a curated starter archive, not a complete list of every cyber incident worldwide. An official advisory can establish a vulnerability without proving that a named organisation was compromised. Attribution, affected counts and claims retain the framing of the cited source. Local drill telemetry, if opened, remains synthetic and separate from the real incident.</p>
    </section>
    {activeItem && <div id="lio-drill-anchor"><LiveResponseDrill key={activeItem.id} item={activeItem} auth={auth} onSaved={() => setHistoryNonce((value) => value + 1)} onClose={() => setActiveItem(null)} /></div>}
  </section>;
}
