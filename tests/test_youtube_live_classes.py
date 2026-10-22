from __future__ import annotations

import importlib.util
import json
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
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
    def test_search_is_worldwide_and_limited_to_active_live_videos(self):
        for profile in module.LANGUAGE_PROFILES:
            params = module._api_search_params(profile)
            self.assertEqual(params["eventType"], "live")
            self.assertEqual(params["type"], "video")
            self.assertEqual(params["maxResults"], 50)
            self.assertNotIn("regionCode", params)
            self.assertEqual(params["relevanceLanguage"], profile["relevanceLanguage"])
        self.assertEqual({p["id"] for p in module.LANGUAGE_PROFILES}, {"en", "hi", "te"})

    def test_search_profiles_rotate_every_half_hour(self):
        start = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
        profiles = [module.active_search_profile(start + timedelta(minutes=30 * i))["id"] for i in range(4)]
        self.assertEqual(profiles, ["en", "hi", "te", "en"])

    def test_completed_or_scheduled_results_are_not_shown_as_live(self):
        active = {
            "id": {"videoId": "abcdefghijk"},
            "snippet": {"title": "Beginner SOC SIEM live class", "description": "Intro fundamentals", "channelTitle": "Security Learning", "liveBroadcastContent": "live", "thumbnails": {"high": {"url": "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"}}},
        }
        scheduled = {"id": {"videoId": "lmnopqrstuv"}, "snippet": {**active["snippet"], "liveBroadcastContent": "upcoming"}}
        records = module.normalise_results({"items": [active, scheduled, active]}, discovery_language="te", observed_at="2026-10-22T00:00:00Z")
        self.assertEqual([item["videoId"] for item in records], ["abcdefghijk"])
        self.assertEqual(records[0]["broadcastStatus"], "live")
        self.assertEqual(records[0]["discoveryLanguages"], ["te"])
        self.assertEqual(records[0]["lastSeenAt"], "2026-10-22T00:00:00Z")

    def test_topic_classifier_is_useful_without_overclaiming_level(self):
        self.assertEqual(module.classify_topic("SOC analyst SIEM workshop"), "SOC & SIEM")
        self.assertEqual(module.classify_topic("Cybersecurity seminar"), "Cybersecurity")

    def test_unrelated_live_streams_are_rejected(self):
        self.assertTrue(module.is_relevant_learning_class(
            "Beginner SOC analyst SIEM class LIVE",
            "A practical lesson on security event monitoring for beginners.",
        ))
        self.assertFalse(module.is_relevant_learning_class(
            "Pokemon Prismatic ETB + AWS Module 12.1",
            "Live trading-card opening stream.",
        ))
        self.assertFalse(module.is_relevant_learning_class(
            "CPCT September exam paper solution",
            "Live exam-solving stream.",
        ))

    def test_feed_normalisation_drops_unrelated_live_results(self):
        relevant = {
            "id": {"videoId": "abcdefghijk"},
            "snippet": {
                "title": "Beginner SOC analyst SIEM class LIVE",
                "description": "A practical lesson on security event monitoring.",
                "channelTitle": "Security Learning",
                "liveBroadcastContent": "live",
                "thumbnails": {"high": {"url": "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"}},
            },
        }
        unrelated = {
            "id": {"videoId": "lmnopqrstuv"},
            "snippet": {
                "title": "Pokemon Prismatic ETB + AWS Module 12.1",
                "description": "Live trading-card opening stream.",
                "channelTitle": "Example Games",
                "liveBroadcastContent": "live",
                "thumbnails": {"high": {"url": "https://i.ytimg.com/vi/lmnopqrstuv/hqdefault.jpg"}},
            },
        }
        rows = module.normalise_results({"items": [relevant, unrelated]})
        self.assertEqual([row["videoId"] for row in rows], ["abcdefghijk"])

    def test_language_merge_deduplicates_and_ages_out_old_results(self):
        at = datetime(2026, 10, 22, 0, 0, tzinfo=timezone.utc)
        previous = [{"videoId": "abcdefghijk", "title": "Live class", "discoveryLanguages": ["hi"], "lastSeenAt": "2026-10-22T00:00:00Z", "broadcastStatus": "live"}]
        fresh = [{"videoId": "abcdefghijk", "title": "Live class", "discoveryLanguages": ["en"], "lastSeenAt": "2026-10-22T00:30:00Z", "broadcastStatus": "live"}]
        merged = module.merge_recent_live_results(previous, fresh, now=at + timedelta(minutes=30))
        self.assertEqual(len(merged), 1)
        self.assertEqual(set(merged[0]["discoveryLanguages"]), {"en", "hi"})
        self.assertEqual(merged[0]["lastSeenAt"], "2026-10-22T00:30:00Z")
        self.assertEqual(module.merge_recent_live_results(previous, [], now=at + timedelta(minutes=91)), [])

    def test_initial_feed_is_explicit_about_missing_setup(self):
        payload = json.loads(FEED.read_text(encoding="utf-8"))
        self.assertIn(payload["status"], {"not-configured", "empty", "ok", "stale", "error"})
        self.assertIsInstance(payload["results"], list)
        if payload["status"] == "not-configured":
            self.assertIn("YOUTUBE_API_KEY", payload["note"])

    def test_ui_has_intent_level_language_filter_and_caption_request(self):
        component = COMPONENT.read_text(encoding="utf-8")
        for value in ["Beginner", "Intermediate", "What are you learning today?", "Search live on YouTube", "LIVE NOW", "TOP MATCH FOR YOUR GOAL", "Reload live index", "Preferred class language", "English", "Hindi", "Telugu", "Request English captions", "cc_lang_pref", "Auto-translate"]:
            self.assertIn(value, component)
        self.assertIn("data/youtube-live-classes.json", component)
        self.assertIn("isRelevantLearningVideo(video, intent)", component)
        self.assertIn("External YouTube search can still show sponsored or unrelated results", component)
        css = STYLES.read_text(encoding="utf-8")
        self.assertIn("@media(max-width:720px)", css)
        self.assertIn("yt-caption-controls", css)

    def test_schedule_reuses_secret_and_stays_under_search_call_daily_default(self):
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("cron: '7,37 * * * *'", workflow)
        self.assertIn("secrets.YOUTUBE_API_KEY", workflow)
        self.assertIn("contents: write", workflow)
        self.assertIn("git diff --cached --quiet", workflow)
        self.assertIn("worldwide", workflow.lower())

    def test_empty_index_never_displays_a_zero_counter(self):
        component = COMPONENT.read_text(encoding="utf-8")
        self.assertNotIn("<strong>{rankedVideos.length} matching", component)
        self.assertIn("Find live classes for your goal", component)
        self.assertIn("Let's find a class that's live right now.", component)
        self.assertIn("Search current live classes on YouTube", component)
        self.assertIn("yt-live-fallback-links", component)
        self.assertIn("feedStatus !== 'stale'", component)

    def test_cached_broadcasts_are_reverified_as_live(self):
        previous = [
            {"videoId": "abcdefghijk", "title": "Still live"},
            {"videoId": "lmnopqrstuv", "title": "Ended"},
        ]
        api_payload = {"items": [
            {"id": "abcdefghijk", "snippet": {"liveBroadcastContent": "live"}, "liveStreamingDetails": {}},
            {"id": "lmnopqrstuv", "snippet": {"liveBroadcastContent": "none"}, "liveStreamingDetails": {"actualEndTime": "2026-10-22T01:00:00Z"}},
        ]}
        with patch.object(module, "api_get", return_value=api_payload) as mock_api:
            remaining = module.verify_existing_live_results(previous, "test-key")
        self.assertEqual([item["videoId"] for item in remaining], ["abcdefghijk"])
        self.assertEqual(mock_api.call_count, 1)
        self.assertEqual(mock_api.call_args.args[0], "videos")

    def test_script_self_test(self):
        module.self_test()


    def test_live_fallback_uses_broad_queries_and_nested_live_filter(self):
        component = COMPONENT.read_text(encoding="utf-8")
        self.assertIn("sp=EgJAAQ%253D%253D", component)
        self.assertIn("function goalLiveSearchQuery", component)
        self.assertIn("function languageLiveSearchQuery", component)
        for term in ("cybersecurity", "cyber security", "ethical hacking", "penetration testing", "bug bounty", "infosec", "information security"):
            self.assertIn(term, component)
        self.assertIn("साइबर सुरक्षा", component)
        self.assertIn("సైబర్ సెక్యూరిటీ", component)
        self.assertIn("https://infosecstreamers.com/", component)
        self.assertNotIn("const liveSearchQuery = [intent.query, customIntent.trim(), levelId", component)

if __name__ == "__main__":
    unittest.main()
