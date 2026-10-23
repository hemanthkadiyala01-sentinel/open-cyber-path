import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class LiveDataFreshnessTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_mutable_data_uses_network_first_and_bypasses_http_cache(self):
        worker = self.read("website/public/service-worker.js")
        self.assertIn(r"const isMutableData = /\.(?:json|csv|txt|xml|rss|ndjson)$/i.test(url.pathname);", worker)
        self.assertIn("event.respondWith(handleMutableData(request));", worker)
        self.assertIn("new Request(request, { cache: 'no-store' })", worker)
        self.assertIn("X-OpenCyberPath-Data-Source', 'offline-cache'", worker)
        handler = worker[worker.index("async function handleMutableData") : worker.index("async function handleNavigation")]
        self.assertLess(handler.index("fetch(freshRequest)"), handler.index("const cached = await cache.match(request)"))

    def test_live_panels_disclose_offline_cached_feeds(self):
        cyberpulse = self.read("website/src/components/CyberPulse.jsx")
        liveops = self.read("website/src/components/LiveOps.jsx")
        self.assertIn("X-OpenCyberPath-Data-Source", cyberpulse)
        self.assertIn("Offline cached snapshot", cyberpulse)
        self.assertIn("X-OpenCyberPath-Data-Source", liveops)
        self.assertIn("Offline cached source feed", liveops)


if __name__ == "__main__":
    unittest.main()
