from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import quality_checks  # noqa: E402

EXPECTED = {
    "grqz-ssl-imp-tls-fingerprint-research": ("Network Security", "https://github.com/grqz/ssl_imp"),
    "stevietv-bearly-secure-go-web-security-lab": ("Application Security", "https://github.com/stevietv/learn-web-security-golang-starter"),
    "witherornot-warbird-obfuscation-documentation": ("Reverse Engineering", "https://github.com/WitherOrNot/warbird-docs"),
    "smarttube-supply-chain-disclosure-case-study": ("Security Engineering & DevSecOps", "https://github.com/yuliskov/SmartTube"),
}


class FourRepoResourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = quality_checks.parse_js_records(ROOT / "website/src/data/resources.js", "resources")
        cls.by_id = {record["id"]: record for record in cls.records}

    def test_four_repositories_have_complete_safe_resource_records(self):
        self.assertTrue(set(EXPECTED).issubset(self.by_id))
        required = ("name", "provider", "category", "kind", "level", "description", "skills", "url", "account", "note", "image", "icon")
        for resource_id, (category, url) in EXPECTED.items():
            with self.subTest(resource_id=resource_id):
                record = self.by_id[resource_id]
                for field in required:
                    self.assertIn(field, record, f"{resource_id} missing {field}")
                    self.assertTrue(record[field], f"{resource_id}.{field} is empty")
                self.assertEqual(record["category"], category)
                self.assertEqual(record["url"], url)
                self.assertTrue(quality_checks.valid_https_url(record["url"]))
                image = ROOT / "website/public" / record["image"].lstrip("/")
                self.assertTrue(image.is_file(), f"missing local artwork: {record['image']}")
                self.assertIsInstance(record["skills"], list)
                self.assertGreater(len(record["skills"]), 0)

    def test_resource_json_mirror_matches_the_runtime_catalogue(self):
        import json
        json_records = json.loads((ROOT / "data/resources.json").read_text(encoding="utf-8"))
        self.assertEqual(self.records, json_records)

    def test_intentionally_vulnerable_lab_and_supply_chain_case_study_are_clearly_labelled(self):
        bearly = self.by_id["stevietv-bearly-secure-go-web-security-lab"]["note"].lower()
        smarttube = self.by_id["smarttube-supply-chain-disclosure-case-study"]["note"].lower()
        tls = self.by_id["grqz-ssl-imp-tls-fingerprint-research"]["note"].lower()
        warbird = self.by_id["witherornot-warbird-obfuscation-documentation"]["note"].lower()
        self.assertIn("isolated", bearly)
        self.assertIn("not a security tool", smarttube)
        self.assertIn("not permission to evade", tls)
        self.assertIn("not official microsoft documentation", warbird)


if __name__ == "__main__":
    unittest.main()
