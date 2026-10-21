"""Offline, deterministic tests for the LiveOps source collector. No network calls."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools.liveops import refresh_feed as rf


class RefreshFeedTests(unittest.TestCase):
    def test_cert_in_parser_extracts_public_record_without_personal_identity(self):
        html = '''<!doctype html><html><body>
        <a href="/s2cMainServlet?VLCODE=CIAD-2026-0049&pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0049</a>
        (October 15, 2026) AI Agents as Attack Vectors: Unauthorized Access by Agents under Evaluation
        <a href="/s2cMainServlet?VLCODE=CIAD-2026-0048&pageid=PUBVLNOTES02">CERT-In Advisory CIAD-2026-0048</a>
        (October 14, 2026) Multiple Vulnerabilities in SAP Products
        </body></html>'''.encode()
        with patch.object(rf, "http_get", return_value=(html, {})):
            rows = rf.parse_cert_in({}, "2026-10-20T00:00:00Z")
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["reference"], "CIAD-2026-0049")
        self.assertEqual(rows[0]["publishedAt"], "2026-10-15T00:00:00Z")
        self.assertTrue(rows[0]["sourceUrl"].startswith("https://www.cert-in.org.in/"))
        self.assertNotIn("author", rows[0])

    def test_cert_in_feed_year_automatically_tracks_current_year(self):
        from datetime import datetime, timezone
        self.assertIn(f"year={datetime.now(timezone.utc).year}", rf.SOURCE_DEFS["cert-in"]["url"])

    def test_cisa_keV_adapter_normalizes_only_public_fields(self):
        payload = {"dateReleased": "2026-10-20", "vulnerabilities": [{
            "cveID": "CVE-2026-12345", "vendorProject": "Sample Vendor", "product": "Sample App",
            "vulnerabilityName": "Access control weakness", "dateAdded": "2026-10-18",
            "shortDescription": "A synthetic test description for a public feed fixture.",
            "requiredAction": "Apply vendor mitigations.", "author": {"login": "must-not-copy"}
        }]}
        with patch.object(rf, "http_get", return_value=(json.dumps(payload).encode(), {})):
            rows = rf.parse_cisa({}, "2026-10-20T00:00:00Z")
        self.assertEqual(rows[0]["reference"], "CVE-2026-12345")
        self.assertTrue(rows[0]["isKEV"])
        self.assertNotIn("author", rows[0])
        self.assertEqual(rows[0]["updatedAt"], "2026-10-18T00:00:00Z")

    def test_github_advisory_adapter_does_not_copy_author_fields(self):
        payload = [{
            "ghsa_id": "GHSA-abcd-efgh-ijkl", "cve_id": "CVE-2026-12345",
            "summary": "Sample package authorization issue", "description": "Public advisory details.",
            "published_at": "2026-10-18T00:00:00Z", "updated_at": "2026-10-19T00:00:00Z",
            "html_url": "https://github.com/advisories/GHSA-abcd-efgh-ijkl", "severity": "high",
            "author": {"login": "reporter-name"}, "references": [], "vulnerabilities": []
        }]
        with patch.object(rf, "http_get", return_value=(json.dumps(payload).encode(), {})):
            rows = rf.parse_github({}, "2026-10-20T00:00:00Z")
        self.assertEqual(rows[0]["reference"], "CVE-2026-12345")
        self.assertNotIn("author", rows[0])
        self.assertNotIn("reporter-name", json.dumps(rows[0]))

    def test_github_public_issue_signal_never_copies_body_or_submitter(self):
        payload = {"items": [{
            "id": 321, "number": 42, "title": "Security issue reported by @example-user",
            "html_url": "https://github.com/example-project/example-repo/issues/42",
            "created_at": "2026-10-18T00:00:00Z", "updated_at": "2026-10-19T00:00:00Z",
            "body": "This should never be copied.", "user": {"login": "reporter-name", "email": "private@example.invalid"}
        }]}
        with patch.object(rf, "http_get", return_value=(json.dumps(payload).encode(), {})), patch.object(rf.time, "sleep", return_value=None):
            rows = rf.parse_github_signals({}, "2026-10-20T00:00:00Z")
        self.assertEqual(len(rows), 1)
        serialized = json.dumps(rows[0])
        self.assertNotIn("reporter-name", serialized)
        self.assertNotIn("private@example.invalid", serialized)
        self.assertNotIn("This should never be copied", serialized)
        self.assertIn("contributor omitted", rows[0]["title"])
        self.assertIn("not confirmed vulnerability evidence", rows[0]["confidence"])

    def test_debian_rss_adapter_parses_dsa_records(self):
        xml = b'''<?xml version="1.0"?><rss version="2.0"><channel><item>
          <title>DSA-6571-1 xen security update</title><link>https://lists.debian.org/debian-security-announce/2026/msg00000.html</link>
          <pubDate>Sun, 18 Oct 2026 10:00:00 +0000</pubDate><description>Update advisory</description>
        </item></channel></rss>'''
        with patch.object(rf, "http_get", return_value=(xml, {})):
            rows = rf.parse_debian({}, "2026-10-20T00:00:00Z")
        self.assertEqual(rows[0]["reference"], "DSA-6571-1")
        self.assertEqual(rows[0]["publishedAt"], "2026-10-18T10:00:00Z")
        self.assertNotIn("author", rows[0])

    def test_status_does_not_mark_old_first_discovery_as_new(self):
        row = {"publishedAt": "2026-06-01T00:00:00Z", "updatedAt": "2026-06-01T00:00:00Z", "contentHash": "abc"}
        self.assertEqual(rf.calc_status(row, None), "ARCHIVED")

    def test_status_marks_recent_publication_new(self):
        row = {"publishedAt": "2026-10-18T00:00:00Z", "updatedAt": "2026-10-18T00:00:00Z", "contentHash": "abc"}
        self.assertEqual(rf.calc_status(row, None), "NEW")

    def test_all_source_failures_preserve_previous_records_and_snapshot_mode(self):
        original_feed = rf.read_existing()
        with tempfile.TemporaryDirectory() as temp_dir:
            test_path = Path(temp_dir) / "liveops-feed.json"
            test_path.write_text(json.dumps(original_feed), encoding="utf-8")
            with patch.object(rf, "FEED_PATH", test_path), \
                 patch.object(rf, "parse_cert_in", side_effect=RuntimeError("offline")), \
                 patch.object(rf, "parse_cisa", side_effect=RuntimeError("offline")), \
                 patch.object(rf, "parse_github", side_effect=RuntimeError("offline")), \
                 patch.object(rf, "parse_debian", side_effect=RuntimeError("offline")), \
                 patch.object(rf, "parse_github_signals", side_effect=RuntimeError("offline")), \
                 patch.object(sys, "argv", ["refresh_feed.py"]):
                exit_code = rf.main()
            result = json.loads(test_path.read_text(encoding="utf-8"))
            self.assertEqual(exit_code, 1)
            self.assertEqual(len(result["items"]), len(original_feed["items"]))
            self.assertEqual(result["feedMode"], "starter-snapshot")
            self.assertTrue(all(source["status"] == "error" for source in result["sources"]))

    def test_validator_rejects_identity_fields(self):
        data = {"schemaVersion": 1, "sources": [], "items": [{
            "id": "test:item", "sourceUrl": "https://example.org/advisory", "status": "ACTIVE", "author": "hidden"
        }]}
        with self.assertRaisesRegex(ValueError, "identity fields"):
            rf.validate_feed(data)

    def test_validator_accepts_seed_feed(self):
        feed = rf.read_existing()
        rf.validate_feed(feed)
        self.assertGreaterEqual(len(feed["items"]), 3)
        self.assertEqual(feed["feedMode"], "starter-snapshot")


if __name__ == "__main__":
    unittest.main(verbosity=2)
