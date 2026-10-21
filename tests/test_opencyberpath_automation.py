from __future__ import annotations

import importlib.util
import json
import os
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "tools" / "opencyberpath_automation" / "refresh_discovery.py"
spec = importlib.util.spec_from_file_location("ocp_refresh_discovery", MODULE_PATH)
assert spec and spec.loader
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)


class PublicDiscoveryAutomationTests(unittest.TestCase):
    def test_self_test_passes_offline(self):
        with patch.object(engine.sys, "argv", [str(MODULE_PATH), "--self-test"]):
            self.assertEqual(engine.self_test(), 0)

    def test_rejects_non_http_urls_and_credentials(self):
        self.assertIsNone(engine.safe_url("javascript:alert(1)"))
        self.assertIsNone(engine.safe_url("file:///etc/passwd"))
        self.assertIsNone(engine.safe_url("https://user:secret@example.com/path"))

    def test_removes_fragment_and_preserves_query(self):
        self.assertEqual(engine.safe_url("https://example.org/guide?q=network#part"), "https://example.org/guide?q=network")

    def test_personal_fields_and_contact_details_are_not_added_to_public_items(self):
        record = engine.item_record(
            kind="community", title="Public security discussion from @sampleuser", url="https://x.com/i/web/status/123",
            source="Public community", summary="Contact analyst@example.org or call +1 555 123 4567",
            extra={"username": "should-not-appear", "email": "private@example.org", "language": "en"},
        )
        self.assertIsNotNone(record)
        self.assertNotIn("username", record)
        self.assertNotIn("email", record)
        self.assertNotIn("@sampleuser", record["title"])
        self.assertNotIn("analyst@example.org", record["summary"])
        self.assertNotIn("555 123 4567", record["summary"])
        self.assertEqual(record["language"], "en")

    def test_deduplication_canonicalizes_fragment_and_order(self):
        one = engine.item_record(kind="job", title="Security intern", url="https://jobs.example.org/role#details", source="Example")
        two = engine.item_record(kind="job", title="Same listing", url="https://jobs.example.org/role", source="Example")
        self.assertEqual(len(engine.deduplicate([one, two])), 1)

    def test_public_item_requires_absolute_http_url(self):
        self.assertIsNone(engine.item_record(kind="repository", title="Project", url="javascript:alert(1)", source="Example"))

    def test_output_config_is_present_and_bounded(self):
        config = json.loads((ROOT / "tools" / "opencyberpath_automation" / "sources.json").read_text(encoding="utf-8"))
        self.assertTrue(config["githubQueries"])
        self.assertTrue(config["remoteJobKeywords"])
        self.assertGreaterEqual(config["maxOutputItems"], 50)
        self.assertLessEqual(config["maxOutputItems"], 700)

    def test_social_connectors_report_access_limits_without_secrets(self):
        names = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USER_AGENT", "X_BEARER_TOKEN", "INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_IG_USER_ID", "LINKEDIN_ACCESS_TOKEN", "LINKEDIN_ORG_URN"]
        with patch.dict(os.environ, {name: "" for name in names}, clear=False):
            _, reddit_status = engine.fetch_reddit({"redditQueries": []})
            _, x_status = engine.fetch_x_public_posts({"xQueries": []})
            _, instagram_status = engine.fetch_instagram_public_hashtags({"instagramHashtags": []})
            _, linkedin_status = engine.fetch_linkedin_authorized_org_posts()
        self.assertEqual(reddit_status["status"], "needs-approved-access")
        self.assertEqual(x_status["status"], "needs-provider-access")
        self.assertEqual(instagram_status["status"], "needs-approved-access")
        self.assertEqual(linkedin_status["status"], "needs-approved-access")

    def test_source_snapshot_never_claims_everything_is_indexed(self):
        # The snapshot note is generated in a fully offline mocked run.
        cfg = json.loads((ROOT / "tools" / "opencyberpath_automation" / "sources.json").read_text(encoding="utf-8"))
        with patch.object(engine, "read_existing_snapshots", return_value=([], [])), \
             patch.object(engine, "fetch_public_rss_sources", return_value=([], engine.source_status("feeds", "Configured feeds", "unavailable"))), \
             patch.object(engine, "fetch_configured_job_boards", return_value=([], engine.source_status("boards", "Job boards", "not-configured"))), \
             patch.object(engine, "fetch_github_repositories", return_value=([], engine.source_status("gh", "GitHub", "unavailable"))), \
             patch.object(engine, "fetch_remoteok_jobs", return_value=([], engine.source_status("jobs", "Jobs", "unavailable"))), \
             patch.object(engine, "fetch_ctftime_events", return_value=([], engine.source_status("ctf", "CTFtime", "unavailable"))), \
             patch.object(engine, "fetch_reddit", return_value=([], engine.source_status("reddit", "Reddit", "needs-approved-access"))), \
             patch.object(engine, "fetch_x_public_posts", return_value=([], engine.source_status("x", "X", "needs-provider-access"))), \
             patch.object(engine, "fetch_instagram_public_hashtags", return_value=([], engine.source_status("ig", "Instagram", "needs-approved-access"))), \
             patch.object(engine, "fetch_linkedin_authorized_org_posts", return_value=([], engine.source_status("linkedin", "LinkedIn", "needs-approved-access"))), \
             patch.object(engine, "load_previous_items", return_value=[]):
            snapshot, status = engine.build_snapshot(cfg)
        self.assertIn("does not claim complete coverage of the internet", snapshot["note"])
        self.assertFalse(status["privacy"]["personalProfilesStored"])
        self.assertFalse(status["privacy"]["privateOrLoginGatedContentScraped"])


if __name__ == "__main__":
    unittest.main()
