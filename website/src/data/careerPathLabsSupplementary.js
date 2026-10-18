// Supplemental recommendations for career-path modules that previously had no external practice mapping.
// Guided exercises are labelled honestly; they are not represented as hosted VMs.
export const supplementaryCareerPathLabs = {
  "digital-forensics-incident-response": [
    {
      "id": "dfir-scope-nist-sp80086",
      "title": "NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response",
      "provider": "NIST",
      "url": "https://csrc.nist.gov/pubs/sp/800/86/final",
      "format": "Official guidance + local evidence worksheet",
      "tier": "Core",
      "module": "Scope before touching evidence",
      "objective": "Use the official guide to prepare a scope statement for the fictional evidence pack: record authority, purpose, sources, exclusions, collection window, provenance, and handling steps before examining anything.",
      "access": "Free official publication. This is guided practice, not a hosted VM. Use only the supplied fictional/sample evidence and follow your lab's authorization rules.",
      "linkLabel": "Open official guidance",
      "providerTask": "SP 800-86: Guide to Integrating Forensic Techniques into Incident Response",
      "displayTitle": "Evidence scope and handling checklist (lab for these notes)"
    }
  ],
  "application-security-bug-bounty": [
    {
      "id": "appsec-scope-hackerone",
      "title": "Defining Scope",
      "provider": "HackerOne Help Center",
      "url": "https://docs.hackerone.com/en/articles/8494552-defining-scope",
      "format": "Guided scope-review exercise",
      "tier": "Core",
      "module": "Read scope and rules",
      "objective": "Using the fictional scope worksheet in the notes, mark assets that are in scope, explicitly excluded, require clarification, and subject to special handling; write a stop condition for ambiguity.",
      "access": "Public documentation. It is not a hosted security lab; complete the worksheet using a fictional training program or an authorized program's published rules.",
      "linkLabel": "Open official scope guidance",
      "providerTask": "Defining Scope",
      "displayTitle": "Scope and rules review (lab for these notes)"
    }
  ],
  "penetration-testing-red-team": [
    {
      "id": "pentest-permission-hackerone-scope",
      "title": "Defining Scope",
      "provider": "HackerOne Help Center",
      "url": "https://docs.hackerone.com/en/articles/8494552-defining-scope",
      "format": "Guided authorization and rules-of-engagement exercise",
      "tier": "Core",
      "module": "Permission before testing",
      "objective": "Build a pre-engagement checklist covering written permission, exact assets, exclusions, allowed techniques, rate limits, data handling, time window, and stop/report conditions.",
      "access": "Public documentation. No live target is provided. Use the fictional scope statement in the notes; never infer permission from public reachability.",
      "linkLabel": "Open official scope guidance",
      "providerTask": "Defining Scope",
      "displayTitle": "Authorization and scope checklist (lab for these notes)"
    },
    {
      "id": "pentest-quality-report-hackerone",
      "title": "Quality Reports",
      "provider": "HackerOne Help Center",
      "url": "https://docs.hackerone.com/en/articles/8475116-quality-reports",
      "format": "Guided report-writing exercise",
      "tier": "Core",
      "module": "Write findings that help owners",
      "objective": "Turn one finding from an authorized training lab into a concise report with a clear title, reproducible steps, observed-versus-expected behavior, impact, minimal evidence, remediation, and limitations.",
      "access": "Public guidance. Submit only to the training exercise or program that explicitly permits submissions; this activity does not authorize testing any real target.",
      "linkLabel": "Open official report guidance",
      "providerTask": "Quality Reports",
      "displayTitle": "Reproducible finding report (lab for these notes)"
    },
    {
      "id": "pentest-portswigger-sqli-capstone",
      "title": "Lab: SQL injection vulnerability allowing login bypass",
      "provider": "PortSwigger Web Security Academy",
      "url": "https://portswigger.net/web-security/sql-injection/lab-login-bypass",
      "format": "Interactive hosted training lab",
      "tier": "Extension",
      "module": "Capstone and review",
      "objective": "Complete the deliberately vulnerable Academy exercise, then submit a capstone report that states scope, evidence, impact, remediation, retest criteria, and limitations. Keep all testing inside the Academy lab instance.",
      "access": "PortSwigger Academy account may be used for progress tracking. This is an intentionally vulnerable training target; do not transfer the test to real websites.",
      "linkLabel": "Open exact training lab",
      "providerTask": "SQL injection vulnerability allowing login bypass",
      "displayTitle": "Final training-lab assessment and report (lab for these notes)"
    }
  ],
  "security-engineering-devsecops-iam": [
    {
      "id": "devsecops-scorecard-design-review",
      "title": "OpenSSF Scorecard project security checks",
      "provider": "OpenSSF",
      "url": "https://github.com/ossf/scorecard",
      "format": "Guided repository-security design review",
      "tier": "Core",
      "module": "Capstone design review",
      "objective": "Review documented Scorecard checks such as branch protection, dependency pinning, CI tests, token permissions, and security policy; turn the results for your own or supplied example repository into prioritized remediations and a retest plan.",
      "access": "Public source and documentation. A real CLI/CI run is optional; only evaluate repositories you own or are permitted to assess. The repository page itself is not a hosted VM.",
      "linkLabel": "Open official project",
      "providerTask": "OpenSSF Scorecard",
      "displayTitle": "Repository security design review (lab for these notes)"
    }
  ],
  "threat-intelligence-ethical-osint": [
    {
      "id": "intel-attack-navigator-capstone",
      "title": "ATT&CK Navigator",
      "provider": "MITRE ATT&CK",
      "url": "https://mitre-attack.github.io/attack-navigator/",
      "format": "Browser-based technique-mapping exercise",
      "tier": "Core",
      "module": "Capstone and peer review",
      "objective": "Use a public vendor advisory and supplied fictional observations to build an ATT&CK layer, cite sources for each mapping, label confidence, and ask a peer to distinguish sourced facts from analyst assessment.",
      "access": "Browser-based tool; no lab VM is created. Work from public advisories and supplied fictional evidence, not personal profiling or unsupported attribution.",
      "linkLabel": "Open browser-based tool",
      "providerTask": "ATT&CK Navigator",
      "displayTitle": "Threat-intelligence mapping and peer review (lab for these notes)"
    }
  ],
  "malware-analysis-reverse-engineering": [
    {
      "id": "mal-capa-report-capstone",
      "title": "capa usage and output interpretation",
      "provider": "Mandiant capa",
      "url": "https://github.com/mandiant/capa/blob/master/doc/usage.md",
      "format": "Guided report exercise using precomputed output",
      "tier": "Core",
      "module": "Capstone report",
      "objective": "Use benign sample metadata or instructor-provided capa output to write a report separating observed rule matches, inferred capabilities, defensive implications, confidence, and unknowns. Include safe-handling and provenance notes.",
      "access": "Public usage guide. This mapping does not require downloading or executing unknown binaries; use precomputed output or a benign fixture unless you have a properly isolated, authorized lab.",
      "linkLabel": "Open official usage guide",
      "providerTask": "capa usage and output interpretation",
      "displayTitle": "Capability-analysis report (lab for these notes)"
    }
  ]
};
