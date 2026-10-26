# Incident-specific live investigations — revision 0.3.1

## Why this change exists

The live feed previously used category-matched generic practice profiles for every signal in a category. This update maps six feed IDs (five distinct incident/vulnerability investigations; PHP2Shell has two source records) to case-specific practice, evidence, source references, public-fact statements, open investigation questions and response guidance. Unknown/new feed records continue to use the clearly labelled related-skills drill.

## Included incident dossiers

- LiteLLM 1.107.0 software supply-chain compromise.
- PHP2Shell exposure and patch validation (CERT-In, PHP.net upstream fix guidance, and BleepingComputer exploitation-timeline report).
- eMudhra intermediate certificate-authority compromise and trust remediation.
- PwC third-party learning-records incident with explicit fact-versus-claim handling.
- Cisco Catalyst SD-WAN Manager CVE-2026-76504 authentication-bypass response.

## Source-quality note (checked 2026-10-24)

The CERT-In PHP2Shell page currently lists “PHP 8.2 versions prior to 8.2.3” in its affected-version bullets, but its remediation instructions say 8.2.35 and PHP.net identifies 8.2.35 as the fixed upstream release for CVE-2026-109618 and CVE-2026-109619. The UI explicitly flags the inconsistent statement and links the upstream advisory. Do not use that bullet alone to determine whether an installation is patched; verify the actual runtime, distribution/vendor package and backport status.

## Data integrity and safety

Public facts and source links are separated from synthetic local lab evidence. Every training artifact uses fictional identities and no real victim telemetry. The scenarios do not instruct learners to exploit live targets. The Cisco scenario follows vendor guidance to preserve diagnostic bundles before upgrade and seek vendor-assisted review. Certificate-remediation exercises use fictional certificate inventory rows and do not teach certificate forgery.

The server checks that mapped incident identifiers use the appropriate drill family and returns incident-specific response guidance. Existing authenticated submissions continue to use the existing append-only, row-level-secured `case_submissions` table; no schema migration is required. Live drill revision is incremented to `1.1.0` so attempts are not silently treated as the same assessment revision.

## Known limitations

This adds five case-specific investigation profiles, not full reconstructions of private victim environments. Evidence is synthetic and must be labelled as such. A source report does not prove an arbitrary learner's environment is affected. New incidents remain a related-skills drill until a specific source-backed profile is reviewed and tested. All vendor instructions should be rechecked before operational use.
