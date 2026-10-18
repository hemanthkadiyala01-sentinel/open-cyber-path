import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.weekly_resource_discovery import normalise_url, parse_date, parse_feed


class WeeklyResourceDiscoveryTests(unittest.TestCase):
    def test_youtube_url_variants_deduplicate(self):
        first = normalise_url("https://www.youtube.com/watch?v=abc123&t=30")
        second = normalise_url("https://youtu.be/abc123")
        self.assertEqual(first, second)

    def test_normalise_url_removes_fragment_and_trailing_slash(self):
        self.assertEqual(
            normalise_url("https://www.example.org/guide/#section"),
            "https://example.org/guide",
        )

    def test_parse_date_supports_rfc_and_iso(self):
        self.assertIsNotNone(parse_date("Mon, 19 Oct 2026 08:00:00 GMT"))
        self.assertIsNotNone(parse_date("2026-10-19T08:00:00Z"))
        self.assertIsNone(parse_date("not a date"))

    def test_feed_candidates_are_learning_related_and_recent(self):
        xml = b'''<?xml version="1.0"?><rss><channel>
          <item><title>Hands-on threat hunting tutorial</title><link>https://example.org/hunt</link><pubDate>Mon, 19 Oct 2026 08:00:00 GMT</pubDate><description>A practical beginner guide to hunting telemetry.</description></item>
          <item><title>Quarterly security financial results</title><link>https://example.org/results</link><pubDate>Mon, 19 Oct 2026 08:00:00 GMT</pubDate><description>Quarterly market update.</description></item>
          <item><title>Old beginner training guide</title><link>https://example.org/old</link><pubDate>Mon, 01 Jan 2020 08:00:00 GMT</pubDate><description>Learn old material.</description></item>
        </channel></rss>'''
        cutoff = datetime(2026, 10, 1, tzinfo=timezone.utc)
        source = {"name": "Test feed", "category": "Threat Hunting", "trust": "test"}
        candidates, error = parse_feed(xml, source, cutoff)
        self.assertIsNone(error)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["title"], "Hands-on threat hunting tutorial")
        self.assertIn("Threat Hunting", candidates[0]["suggestedTopics"])

    def test_malformed_feed_returns_error_not_exception(self):
        candidates, error = parse_feed(b"<rss><item>", {"name": "bad"}, datetime.now(timezone.utc))
        self.assertEqual(candidates, [])
        self.assertIn("XML parse error", error)


if __name__ == "__main__":
    unittest.main()
