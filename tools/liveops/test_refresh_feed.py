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
        from datetime import datetime, timezone

        row = {"publishedAt": "2026-10-18T00:00:00Z", "updatedAt": "2026-10-18T00:00:00Z", "contentHash": "abc"}
        fixed_now = datetime(2026, 10, 20, tzinfo=timezone.utc)
        with patch.object(rf, "now_utc", return_value=fixed_now):
            self.assertEqual(rf.calc_status(row, None), "NEW")

    def test_status_marks_publication_outside_new_window_active(self):
        from datetime import datetime, timezone

        row = {"publishedAt": "2026-10-18T00:00:00Z", "updatedAt": "2026-10-18T00:00:00Z", "contentHash": "abc"}
        fixed_now = datetime(2026, 11, 1, tzinfo=timezone.utc)
        with patch.object(rf, "now_utc", return_value=fixed_now):
            self.assertEqual(rf.calc_status(row, None), "ACTIVE")

    def test_all_source_failures_preserve_previous_records_and_feed_mode(self):
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
            self.assertEqual(result["feedMode"], original_feed["feedMode"])
            self.assertTrue(all(source["status"] == "error" for source in result["sources"]))

    def test_validator_rejects_identity_fields(self):
        data = {"schemaVersion": 1, "sources": [], "items": [{
            "id": "test:item", "sourceUrl": "https://example.org/advisory", "status": "ACTIVE", "author": "hidden"
        }]}
        with self.assertRaisesRegex(ValueError, "identity fields"):
            rf.validate_feed(data)

    def test_validator_accepts_existing_feed(self):
        feed = rf.read_existing()
        rf.validate_feed(feed)
        self.assertGreaterEqual(len(feed["items"]), 3)
        self.assertIn(feed["feedMode"], {"starter-snapshot", "manual-refresh", "automated-refresh"})


    def test_source_failure_counter_defaults_to_zero(self):
        self.assertEqual(rf.consecutive_failure_count({}), 0)
        self.assertEqual(rf.consecutive_failure_count({"consecutiveFailures": "invalid"}), 0)
        self.assertEqual(rf.consecutive_failure_count({"consecutiveFailures": -4}), 0)

    def test_source_failure_increments_and_preserves_last_success(self):
        previous = {"itemsSeen": 29, "lastSuccessAt": "2026-11-02T00:00:00Z", "consecutiveFailures": 2}
        result = rf.make_source_failure_health(
            {"id": "debian", "name": "Debian Security Advisories"},
            previous,
            "2026-11-02T06:00:00Z",
            "Refresh failed: URLError",
            True,
        )
        self.assertEqual(result["consecutiveFailures"], 3)
        self.assertEqual(result["lastFailureAt"], "2026-11-02T06:00:00Z")
        self.assertEqual(result["lastSuccessAt"], previous["lastSuccessAt"])
        self.assertEqual(result["itemsSeen"], 29)

    def test_source_success_resets_failure_counter(self):
        previous = {"lastFailureAt": "2026-11-02T00:00:00Z", "consecutiveFailures": 2}
        result = rf.make_source_success_health(
            {"id": "debian", "name": "Debian Security Advisories"},
            [{"id": "debian:DSA-1"}],
            "2026-11-02T06:00:00Z",
            previous,
        )
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["consecutiveFailures"], 0)
        self.assertEqual(result["lastFailureAt"], previous["lastFailureAt"])

    def test_partial_source_failure_is_warning_not_a_failure_gate(self):
        sources = [
            {"id": "a", "status": "ok", "consecutiveFailures": 0},
            {"id": "b", "status": "error", "consecutiveFailures": 1},
            {"id": "c", "status": "ok", "consecutiveFailures": 0},
        ]
        self.assertEqual(rf.health_gate_exit_code(sources), 0)

    def test_three_consecutive_source_failures_trigger_gate(self):
        sources = [
            {"id": "a", "status": "ok", "consecutiveFailures": 0},
            {"id": "b", "status": "error", "consecutiveFailures": 3},
        ]
        self.assertEqual(rf.health_gate_exit_code(sources), 1)

    def test_total_source_outage_triggers_gate_immediately(self):
        sources = [
            {"id": "a", "status": "error", "consecutiveFailures": 1},
            {"id": "b", "status": "error", "consecutiveFailures": 1},
        ]
        self.assertEqual(rf.health_gate_exit_code(sources), 1)

    def test_health_summary_lists_sources_and_escapes_markdown_cells(self):
        feed = {
            "generatedAt": "2026-11-02T06:00:00Z",
            "items": [{"id": "one"}],
            "sources": [{
                "id": "debian",
                "name": "Debian | security",
                "status": "error",
                "itemsSeen": 29,
                "lastSuccessAt": "2026-11-02T00:00:00Z",
                "consecutiveFailures": 1,
                "message": "temporary <network> issue",
            }],
        }
        summary = rf.build_health_summary(feed)
        self.assertIn("Debian \\| security", summary)
        self.assertIn("temporary &lt;network&gt; issue", summary)
        self.assertIn("1 degraded", summary)

    def test_health_summary_marks_three_failures_critical(self):
        feed = {
            "generatedAt": "2026-11-02T06:00:00Z",
            "items": [],
            "sources": [{"id": "debian", "name": "Debian", "status": "error", "consecutiveFailures": 3}],
        }
        summary = rf.build_health_summary(feed)
        self.assertIn("critical", summary)
        self.assertIn("at least one source has failed three consecutive runs", summary)

    def test_all_source_failures_can_defer_exit_until_health_report(self):
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
                 patch.object(sys, "argv", ["refresh_feed.py", "--defer-health-failure"]):
                exit_code = rf.main()
            result = json.loads(test_path.read_text(encoding="utf-8"))
            self.assertEqual(exit_code, 0)
            self.assertEqual(len(result["items"]), len(original_feed["items"]))
            self.assertTrue(all(source["status"] == "error" for source in result["sources"]))
            self.assertTrue(all(source["consecutiveFailures"] >= 1 for source in result["sources"]))


if __name__ == "__main__":
    unittest.main(verbosity=2)
