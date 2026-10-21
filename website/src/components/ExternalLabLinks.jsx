import './ExternalLabLinks.css';
import BrandIcon from './BrandIcon.jsx';
import ResourceHealthStatus from './ResourceHealthStatus.jsx';

// These links match the topics and provider destinations documented in the
// companion PDF/DOCX notes. Card labels remain generic; the exact provider
// exercise names, access steps, and concept-specific commands belong in notes.
const REAL_LABS = {
  'soc-notes': {
    heading: 'SOC & SIEM practice',
    links: [
      { title: 'Log analysis with SIEM (lab for these notes)', url: 'https://tryhackme.com/room/loganalysiswithsiem', kind: 'Hosted training room', note: 'Includes practical log-analysis tasks and a deployable lab machine. Login is required; current room access may depend on the provider tier.' },
      { title: 'Search and field analysis (lab for these notes)', url: 'https://tryhackme.com/room/splunkexploringspl', kind: 'Guided SIEM room', note: 'Practise query fields and searches in the provider environment. Login and room access conditions apply.' }
    ]
  },
  'lab-win-event': {
    heading: 'Windows process-event triage',
    links: [
      { title: 'Windows event-log analysis (lab for these notes)', url: 'https://tryhackme.com/room/windowseventlogs', kind: 'Guided Windows log room', note: 'Direct room link for Windows event logs; account and current access tier may apply.' },
      { title: 'Windows logging practice (lab for these notes)', url: 'https://tryhackme.com/room/windowsloggingforsoc', kind: 'Guided SOC room', note: 'Practice Windows logging from a defensive analyst perspective. Check provider prerequisites and access.' },
      { title: 'Process creation auditing (official companion)', url: 'https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-Audit#detailedtracking_auditprocesscreation', kind: 'Official documentation', note: 'Reference for event fields and audit policy; it does not provision a Windows VM.' }
    ]
  },
  'lab-eval': {
    heading: 'Detection rule evaluation',
    links: [
      { title: 'Detection rule practice (lab for these notes)', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/sigma-101/', kind: 'Blue-team evidence challenge', note: 'Direct challenge page. Check current status, sign-in, and evidence-download requirements before starting.' },
      { title: 'SPL search practice (lab for these notes)', url: 'https://tryhackme.com/room/splunkexploringspl', kind: 'Guided SIEM room', note: 'Practise query fields and filtering in the provider environment; access rules apply.' }
    ]
  },
  'lab-env': {
    heading: 'Set up a real practice environment',
    links: [
      { title: 'Linux fundamentals (lab for these notes)', url: 'https://tryhackme.com/room/linuxfundamentalspart1', kind: 'Guided Linux room', note: 'Beginner Linux practice. Login and current room access rules apply.' },
      { title: 'First Linux command-line challenge (lab for these notes)', url: 'https://overthewire.org/wargames/bandit/bandit0.html', kind: 'SSH wargame', note: 'A real command-line game; an SSH-capable client is required. Stay within the game account and host.' },
      { title: 'Endpoint monitoring setup guide', url: 'https://documentation.wazuh.com/current/getting-started/index.html', kind: 'Official setup documentation', note: 'Useful for building a local SIEM lab; a pre-provisioned environment is not supplied by this page.' },
      { title: 'Free SIEM training courses', url: 'https://www.splunk.com/en_us/training/free-courses/overview.html', kind: 'Guided training', note: 'Course material is available from the provider; product or hosted-lab access may have separate terms.' },
      { title: 'Cloud SIEM learning resources', url: 'https://learn.microsoft.com/en-us/azure/sentinel/skill-up-resources', kind: 'Official learning resources', note: 'Cloud exercises may require an account and can incur charges if you provision resources.' }
    ]
  },
  'lab-detection-tuning': {
    heading: 'Advanced detection tuning',
    links: [
      { title: 'Pattern-matching detection (lab for these notes)', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/yara-wizards/', kind: 'Blue-team challenge', note: 'Direct challenge page. Check current status, tool prerequisites, and evidence-download requirements.' },
      { title: 'Detection rule review (lab for these notes)', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/sigma-101/', kind: 'Blue-team evidence challenge', note: 'Practise detection-rule concepts against the supplied training task; account and availability can change.' }
    ]
  },
  'lab-threat-hunt': {
    heading: 'Threat hunting with authentication events',
    links: [
      { title: 'Authentication-log hunting (lab for these notes)', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/t1110003/', kind: 'Blue-team challenge with evidence files', note: 'Direct challenge page. Verify current status and access terms before starting.' },
      { title: 'Windows threat detection (lab for these notes)', url: 'https://tryhackme.com/room/windowsthreatdetection1', kind: 'Guided defensive room', note: 'Use the provider-hosted task and supplied evidence; login and room access rules apply.' },
      { title: 'Threat-hunting method (official companion)', url: 'https://learn.microsoft.com/en-us/defender-xdr/hunting-overview', kind: 'Official learning reference', note: 'Explains a defensive hunting workflow; it is documentation rather than a hosted VM.' }
    ]
  },
  'lab-threat-hunt-dns': {
    heading: 'DNS timeline analysis',
    links: [
      { title: 'DNS fundamentals (lab for these notes)', url: 'https://tryhackme.com/room/dnsindetail', kind: 'Guided DNS room', note: 'The room may have login or subscription requirements; check current access before starting.' },
      { title: 'Packet analysis basics (lab for these notes)', url: 'https://tryhackme.com/room/wiresharkthebasics', kind: 'Guided network-analysis room', note: 'Use the provider exercise for packet inspection; access requirements may vary.' },
      { title: 'DNS and network technique reference', url: 'https://attack.mitre.org/', kind: 'Knowledge base companion', note: 'Use ATT&CK to describe a hypothesis and defensive context; it is a reference, not a live lab.' }
    ]
  },
  'lab-bugbounty': {
    heading: 'Bug bounty scope and web security practice',
    links: [
      { title: 'Access-control testing (lab for these notes)', url: 'https://portswigger.net/web-security/access-control/lab-unprotected-admin-functionality', kind: 'Interactive web security lab', note: 'A specific Academy exercise hosted by the provider. Interact only with the assigned training target.' },
      { title: 'Program scope review (lab companion)', url: 'https://docs.hackerone.com/en/articles/8494552-defining-scope', kind: 'Responsible-testing guide', note: 'Use this to understand authorized assets and exclusions; it is a scope guide, not a virtual machine.' },
      { title: 'Web testing methodology (lab companion)', url: 'https://owasp.org/www-project-web-security-testing-guide/', kind: 'Testing guide', note: 'Use the checklist only within a system owner’s explicit authorization and programme rules.' }
    ]
  },
  'lab-bugbounty-http': {
    heading: 'HTTP request and response practice',
    links: [
      { title: 'HTTP fundamentals (lab for these notes)', url: 'https://tryhackme.com/room/httpindetail', kind: 'Guided interactive room', note: 'Direct HTTP learning room; login and current access requirements apply.' },
      { title: 'Packet inspection basics (lab for these notes)', url: 'https://tryhackme.com/room/wiresharkthebasics', kind: 'Guided network-analysis room', note: 'Use the assigned packet-analysis exercises; check provider access and prerequisites.' },
      { title: 'Web security learning labs', url: 'https://portswigger.net/web-security', kind: 'Interactive training catalogue', note: 'This provider page organizes interactive labs by topic; choose the HTTP-related exercise that matches the notes.' }
    ]
  },
  'lab-cheatsheet': {
    heading: 'Linux, CMD, and PowerShell command practice',
    links: [
      { title: 'Windows command-line practice (lab for these notes)', url: 'https://tryhackme.com/room/windowscommandline', kind: 'Guided Windows room', note: 'Use the provider’s practice tasks; sign-in and current room access rules may apply.' },
      { title: 'PowerShell practice (lab for these notes)', url: 'https://tryhackme.com/room/windowspowershell', kind: 'Guided PowerShell room', note: 'Practice commands in the assigned environment, not against machines you do not own or administer.' },
      { title: 'Linux shell challenge (lab for these notes)', url: 'https://overthewire.org/wargames/bandit/bandit0.html', kind: 'SSH command-line wargame', note: 'Real command execution is limited to the game account and host; SSH setup is required.' }
    ]
  },
  'lab-attack-patterns': {
    heading: 'Common attack patterns in controlled practice',
    links: [
      { title: 'SQL query handling (lab for these notes)', url: 'https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data', kind: 'Interactive web-security lab', note: 'A deliberately vulnerable training target; do not attempt the exercise on real websites.' },
      { title: 'Browser output handling (lab for these notes)', url: 'https://portswigger.net/web-security/cross-site-scripting/reflected/lab-html-context-nothing-encoded', kind: 'Interactive web-security lab', note: 'Use the assigned Academy target and follow the provider lab instructions.' },
      { title: 'Vulnerable practice application (lab companion)', url: 'https://github.com/juice-shop/juice-shop', kind: 'Self-hosted training app', note: 'This is a project repository, not an instant hosted VM. Deploy only in an isolated local lab.' }
    ]
  },
  'lab-dfir-timeline': {
    heading: 'DFIR evidence and timeline investigation',
    links: [
      { title: 'Disk-forensics starter exercise (lab for these notes)', url: 'https://tryhackme.com/room/btautopsye0', kind: 'Guided forensics room', note: 'Direct room for evidence examination; check login and current access requirements.' },
      { title: 'Linux log investigation (lab for these notes)', url: 'https://tryhackme.com/room/linuxloggingforsoc', kind: 'Guided DFIR/SOC room', note: 'Use the provider exercise to analyze logs and build a timeline; access rules apply.' },
      { title: 'Forensic evidence bundles (dataset companion)', url: 'https://cyberdefenders.org/blueteam-ctf-challenges/resourcepacks/', kind: 'Downloadable evidence resources', note: 'Review the evidence and tool requirements before downloading; this is not a pre-provisioned VM.' }
    ]
  },
  'lab-cloud-posture': {
    heading: 'Cloud security posture review',
    links: [
      { title: 'Cloud posture assessment (lab for these notes)', url: 'https://learn.microsoft.com/en-us/training/modules/identify-security-risks-posture-management/', kind: 'Guided cloud-security module', note: 'Direct learning module; some tasks may require an account or cloud resources. Check billing before provisioning services.' },
      { title: 'Cloud posture management (lab for these notes)', url: 'https://learn.microsoft.com/en-us/training/modules/manage-cloud-security-posture-management/', kind: 'Guided cloud-security module', note: 'Use the learning units and knowledge check. Real cloud resource creation can incur charges.' }
    ]
  },
  'lab-grc-risk-register': {
    heading: 'GRC risk register and control mapping',
    links: [
      { title: 'Risk-profile exercise (lab for these notes)', url: 'https://www.nist.gov/cyberframework/profiles', kind: 'Framework exercise and template', note: 'Use the current/target profile template to record gaps, risk rationale, and priorities. This is not a terminal or VM.' },
      { title: 'Compliance assessment (lab for these notes)', url: 'https://learn.microsoft.com/en-us/training/modules/evaluate-regulatory-compliance/', kind: 'Guided compliance module', note: 'Walk through the compliance concepts and checks; this is a learning module, not a provisioned cyber range.' }
    ]
  }
};

export function ExternalLabLinks({ labId }) {
  const resource = REAL_LABS[labId];
  if (!resource) return null;

  return <section className="external-labs" aria-label={`External practice options for ${resource.heading}`}>
    <div className="external-labs-heading">
      <span className="external-labs-icon" aria-hidden="true">↗</span>
      <span><small>EXTERNAL PRACTICE</small><strong>{resource.heading}</strong></span>
    </div>
    <p className="external-labs-guidance">Direct exercises are linked where a stable task page is available. Provider-specific task names and detailed walkthroughs are in the downloadable notes. Account tiers, prices and availability can change.</p>
    <div className="external-labs-list">
      {resource.links.map((link) => <div className="external-lab-link-wrap" key={link.url}>
        <a className="external-lab-link" href={link.url} target="_blank" rel="noopener noreferrer">
          <span className="external-lab-copy"><strong className="external-lab-title"><BrandIcon name={link.title} url={link.url} size={25} /><span>{link.title}</span></strong><small className="external-lab-kind">{link.kind}</small><small className="external-lab-note">{link.note}</small></span>
          <span className="external-lab-action">Open ↗</span>
        </a>
        <ResourceHealthStatus url={link.url} />
      </div>)}
    </div>
  </section>;
}

export default ExternalLabLinks;
