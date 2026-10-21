from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "refresh_youtube_live_classes.py"
COMPONENT = ROOT / "website" / "src" / "components" / "YouTubeLiveLearning.jsx"
STYLES = ROOT / "website" / "src" / "components" / "YouTubeLiveLearning.css"
WORKFLOW = ROOT / ".github" / "workflows" / "youtube-live-classes-refresh.yml"
FEED = ROOT / "website" / "public" / "data" / "youtube-live-classes.json"

spec = importlib.util.spec_from_file_location("youtube_live_refresh", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


class YouTubeLiveClassTests(unittest.TestCase):
    def test_search_is_limited_to_active_live_videos(self):
        params = module._api_search_params()
        self.assertEqual(params["eventType"], "live")
        self.assertEqual(params["type"], "video")
        self.assertEqual(params["maxResults"], 50)
        self.assertEqual(params["regionCode"], "IN")
        self.assertIn("cybersecurity", str(params["q"]))

    def test_completed_or_scheduled_results_are_not_shown_as_live(self):
        active = {
            "id": {"videoId": "abcdefghijk"},
            "snippet": {"title": "Beginner SOC SIEM live class", "description": "Intro fundamentals", "channelTitle": "Security Learning", "liveBroadcastContent": "live", "thumbnails": {"high": {"url": "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"}}},
        }
        scheduled = {"id": {"videoId": "lmnopqrstuv"}, "snippet": {**active["snippet"], "liveBroadcastContent": "upcoming"}}
        records = module.normalise_results({"items": [active, scheduled, active]})
        self.assertEqual([item["videoId"] for item in records], ["abcdefghijk"])
        self.assertEqual(records[0]["broadcastStatus"], "live")

    def test_topic_classifier_is_useful_without_overclaiming_level(self):
        self.assertEqual(module.classify_topic("SOC analyst SIEM workshop"), "SOC & SIEM")
        self.assertEqual(module.classify_topic("Cybersecurity seminar"), "Cybersecurity")

    def test_initial_feed_is_explicit_about_missing_setup(self):
        payload = json.loads(FEED.read_text(encoding="utf-8"))
        self.assertEqual(payload["status"], "not-configured")
        self.assertEqual(payload["results"], [])
        self.assertIn("YOUTUBE_API_KEY", payload["note"])

    def test_ui_has_user_intent_level_direct_search_and_live_cards(self):
        component = COMPONENT.read_text(encoding="utf-8")
        for text in ["Beginner", "Intermediate", "What are you learning today?", "Search live on YouTube", "LIVE NOW", "TOP MATCH FOR YOUR GOAL", "Reload live index"]:
            self.assertIn(text, component)
        self.assertIn("data/youtube-live-classes.json", component)
        self.assertIn("@media(max-width:720px)", STYLES.read_text(encoding="utf-8"))

    def test_schedule_reuses_the_existing_repository_secret(self):
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("cron: '7,37 * * * *'", workflow)
        self.assertIn("secrets.YOUTUBE_API_KEY", workflow)
        self.assertIn("contents: write", workflow)
        self.assertIn("git diff --cached --quiet", workflow)

    def test_script_self_test(self):
        module.self_test()


if __name__ == "__main__":
    unittest.main()
