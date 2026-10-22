from __future__ import annotations
import importlib.util
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "refresh_youtube_live_classes.py"
COMPONENT = ROOT / "website" / "src" / "components" / "YouTubeLiveLearning.jsx"
spec = importlib.util.spec_from_file_location("youtube_live_refresh", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

class CyberLiveTopicExpansionTests(unittest.TestCase):
    def test_profiles_are_worldwide_and_live_only(self):
        self.assertEqual({p["id"] for p in module.LANGUAGE_PROFILES}, {"en", "hi", "te"})
        for profile in module.LANGUAGE_PROFILES:
            params = module._api_search_params(profile)
            self.assertEqual(params["eventType"], "live")
            self.assertEqual(params["type"], "video")
            self.assertNotIn("regionCode", params)
            self.assertEqual(params["relevanceLanguage"], profile["relevanceLanguage"])
            self.assertLessEqual(len(profile["query"]), 500)

    def test_all_three_language_profiles_cover_multiple_domains(self):
        english, hindi, telugu = [profile["query"].lower() for profile in module.LANGUAGE_PROFILES]
        for term in ["ethical hacking", "bug bounty", "ctf", "malware analysis", "digital forensics", "ai security", "cloud security", "devsecops", "soc analyst"]:
            self.assertIn(term, english)
        self.assertTrue(any(word in hindi for word in ["साइबर सुरक्षा", "cybersecurity hindi"]))
        self.assertTrue(any(word in telugu for word in ["సైబర్ సెక్యూరిటీ", "cybersecurity telugu"]))

    def test_topic_classifier_recognises_wider_domains(self):
        examples = [
            ("Ethical hacking authorised lab", "Ethical hacking & authorised testing"),
            ("Responsible disclosure bug bounty", "Bug bounty & responsible disclosure"),
            ("Malware analysis sandbox workshop", "Malware analysis & reverse engineering"),
            ("AI security and LLM security", "AI & machine-learning security"),
            ("Cloud security IAM workshop", "Cloud, identity & containers"),
            ("Wireshark packet analysis", "Networking & protocols"),
        ]
        for title, expected in examples:
            self.assertEqual(module.classify_topic(title), expected)

    def test_frontend_has_broad_intents_and_live_search_fallbacks(self):
        component = COMPONENT.read_text(encoding="utf-8")
        for text in ["ethical-hacking", "bug-bounty", "malware-analysis", "ai-security", "mobile-iot", "devsecops", "languageLiveSearchQuery", "goalLiveSearchQuery", "sp=EgJAAQ%253D%253D", "yt-live-fallback-links"]:
            self.assertIn(text, component)
        self.assertIn("OCP-CYBER-LIVE-TOPICS-EXPANSION-V1", component)

    def test_self_test_runs(self):
        module.self_test()

if __name__ == "__main__":
    unittest.main()
