import re
import unittest
from pathlib import Path

HERE = Path(__file__).resolve()
PACKAGE_ROOT = HERE.parents[1]
if (PACKAGE_ROOT / "updates/website/src/components/LiveIncidentOps.jsx").is_file():
    ROOT = PACKAGE_ROOT
    UI_PATH = ROOT / "updates/website/src/components/LiveIncidentOps.jsx"
    SERVER_PATH = ROOT / "updates/backend/src/live-drill.ts"
    ROUTE_PATH = ROOT / "updates/backend/src/caselab-routes.ts"
else:
    ROOT = next((parent for parent in HERE.parents if (parent / "backend/src/live-drill.ts").is_file()), None)
    if ROOT is None:
        raise RuntimeError("Cannot locate the incident-specific patch sources or OpenCyberPath repository root")
    UI_PATH = ROOT / "website/src/components/LiveIncidentOps.jsx"
    SERVER_PATH = ROOT / "backend/src/live-drill.ts"
    ROUTE_PATH = ROOT / "backend/src/caselab-routes.ts"
UI = UI_PATH.read_text(encoding="utf-8")
SERVER = SERVER_PATH.read_text(encoding="utf-8")
ROUTE = ROUTE_PATH.read_text(encoding="utf-8")

CASES = {
    "litellm-supply-chain": {
        "feed_ids": ["certin-ciad-2026-0053"],
        "case_type": "dependency-compromise",
        "evidence_ids": ["pkg-01", "build-02", "net-03", "secret-04", "release-05"],
        "actions": ["hold-preserve-scope", "rotate-all-blindly", "delete-evidence", "assume-all-hit"],
        "source_urls": ["docs.litellm.ai/blog/security-incident-oct-21-2026", "microsoft.com/en-us/security/blog/2026/10/23/inside-the-litellm"],
    },
    "php2shell-exposure": {
        "feed_ids": ["bc-php2shell-exploitation-reported-before-patches", "certin-ciad-2026-0052"],
        "case_type": "vulnerability",
        "evidence_ids": ["asset-01", "proxy-02", "edr-03", "change-04"],
        "actions": ["scope-patch-preserve", "exploit-production", "wipe-immediately", "ignore-no-proof"],
        "source_urls": ["cert-in.org.in/s2cMainServlet?VLCODE=CIAD-2026-0052", "php.net/archive/2026.php#2026-10-21-5", "bleepingcomputer.com/news/security/amazon-says-php2shell"],
    },
    "emudhra-certificate-compromise": {
        "feed_ids": ["certin-ciad-2026-0050"],
        "case_type": "certificate-compromise",
        "evidence_ids": ["cert-01", "ca-02", "tls-03"],
        "actions": ["scope-replace-validate", "disable-all-trust", "wait-no-exploit", "copy-chain"],
        "source_urls": ["blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra", "support.apple.com/en-us/149555"],
    },
    "pwc-third-party-incident": {
        "feed_ids": ["reuters-pwc-third-party-incident-2026-10-23"],
        "case_type": "third-party-breach",
        "evidence_ids": ["vendor-01", "access-02", "data-03"],
        "actions": ["scope-revoke-notify", "publish-unverified", "delete-vendor", "assume-no-data"],
        "source_urls": ["reuters.com/legal/litigation/pwc-confirms-cybersecurity-incident-involving-employee-learning-records-2026-10-23"],
    },
    "cisco-sdwan-auth-bypass": {
        "feed_ids": ["cisa-cve-2026-76504"],
        "case_type": "vulnerability",
        "evidence_ids": ["asset-01", "proxy-02", "edr-03", "change-04"],
        "actions": ["scope-patch-preserve", "exploit-production", "wipe-immediately", "ignore-no-proof"],
        "source_urls": ["cisco.com/c/en/us/support/docs/csa/cisco-sa-sdwan-webauth-xr8beuuU.html", "cisco.com/c/en/us/support/docs/routers/sd-wan/226384-remediate-catalyst-sd-wan-security.html"],
    },
}


def object_block(source: str, label: str, key: str | None = None) -> str:
    assignment = re.search(re.escape(label) + r"[\s\S]*?=\s*\{", source)
    parent = source[assignment.end() - 1:] if assignment else source
    if key:
        marker = re.search(r"(?:['\"])?" + re.escape(key) + r"(?:['\"])?\s*:\s*\{", parent)
        if not marker:
            raise AssertionError(f"Object entry not found: {label}/{key}")
        start = parent.index("{", marker.start())
    else:
        if not assignment:
            raise AssertionError(f"Object block not found: {label}/{key}")
        start = 0
    depth = 0
    quote = None
    escape = False
    for i in range(start, len(parent)):
        ch = parent[i]
        if quote:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ("'", '"', '`'):
            quote = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return parent[start:i + 1]
    raise AssertionError(f"Unclosed object: {label}/{key}")


class IncidentSpecificContractTests(unittest.TestCase):
    def test_every_exact_incident_id_maps_to_a_case_profile(self):
        mapping = object_block(UI, "INCIDENT_CASE_BY_ID")
        for key, config in CASES.items():
            for feed_id in config["feed_ids"]:
                with self.subTest(feed_id=feed_id):
                    self.assertRegex(mapping, r"['\"]" + re.escape(feed_id) + r"['\"]\s*:\s*['\"]" + re.escape(key) + r"['\"]")
                    self.assertRegex(SERVER, r"['\"]" + re.escape(feed_id) + r"['\"]\s*:\s*\{")

    def test_profiles_have_sources_facts_questions_and_local_evidence(self):
        registry = object_block(UI, "INCIDENT_CASES")
        for key, config in CASES.items():
            block = object_block(registry, "INCIDENT_CASES", key)
            with self.subTest(case=key):
                for field in ["caseTitle", "mission", "publicFacts", "openQuestions", "references", "evidenceNote", "evidence", "actions", "validation"]:
                    self.assertIn(field + ":", block)
                self.assertIn("essential: true", block)
                self.assertGreaterEqual(block.count("publisher:"), 1)
                for source_url in config["source_urls"]:
                    self.assertIn(source_url, block)
                for evidence_id in config["evidence_ids"]:
                    self.assertIn("id: '" + evidence_id + "'", block)
                for action_id in config["actions"]:
                    self.assertIn("id: '" + action_id + "'", block)
                self.assertRegex(block, r"synthetic|fictional|simulated")

    def test_php2shell_flags_version_range_discrepancy_and_links_phpnet_guidance(self):
        registry = object_block(UI, "INCIDENT_CASES")
        block = object_block(registry, "INCIDENT_CASES", "php2shell-exposure")
        self.assertIn("prior to 8.2.3", block)
        self.assertIn("8.2.35", block)
        self.assertIn("inconsistent source statement", block)
        self.assertIn("CVE-2026-109618", block)
        self.assertIn("CVE-2026-109619", block)
        self.assertIn("https://www.php.net/archive/2026.php#2026-10-21-5", block)

    def test_ui_and_server_case_type_rules_match(self):
        registry = object_block(UI, "INCIDENT_CASES")
        for key, config in CASES.items():
            block = object_block(registry, "INCIDENT_CASES", key)
            self.assertIn("role:", block)
            self.assertIn("skills:", block)
            # Each evidence/action ID must exist in the appropriate existing server-side category rule.
            rule = object_block(SERVER, "DRILL_RULES", config["case_type"])
            for evidence_id in config["evidence_ids"]:
                self.assertIn("'" + evidence_id + "'", rule)
            for action_id in config["actions"]:
                self.assertIn("'" + action_id + "'", rule)

    def test_incident_specific_guidance_and_revision_are_wired_server_side(self):
        self.assertIn("LIVE_DRILL_REVISION = '1.1.0'", SERVER)
        for key, config in CASES.items():
            incident_rules = object_block(SERVER, "INCIDENT_GUIDES")
            for feed_id in config["feed_ids"]:
                self.assertIn("'" + feed_id + "'", incident_rules)
        self.assertIn("getLiveDrillResponseGuide(answer.caseType, answer.incidentId)", ROUTE)
        self.assertIn("incidentGuide.caseType !== value.caseType", SERVER)

    def test_reports_export_related_sources_and_separate_facts_from_simulation(self):
        self.assertIn("relatedSources: profile.references || []", UI)
        self.assertIn("WHAT THE PUBLIC SOURCES ESTABLISH", UI)
        self.assertIn("SOURCE / SIMULATION BOUNDARY", UI)
        self.assertIn("Incident-specific investigation · simulated training evidence", UI)


if __name__ == "__main__":
    unittest.main(verbosity=2)
