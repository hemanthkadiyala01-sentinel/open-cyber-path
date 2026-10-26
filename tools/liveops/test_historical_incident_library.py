import json
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "website" / "src" / "data" / "historical-incident-library.json"
ART = ROOT / "website" / "public"
ALLOWED_CASE_TYPES = {
    "dependency-compromise", "vulnerability", "certificate-compromise", "ai-agent",
    "api-abuse", "third-party-breach", "identity-cloud", "malware-ransomware", "generic",
}

class HistoricalIncidentLibraryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DATA.read_text(encoding="utf-8"))
        cls.items = cls.doc["items"]

    def test_archive_has_a_broad_nonempty_starter_set(self):
        self.assertGreaterEqual(len(self.items), 20)
        countries = {item["country"] for item in self.items}
        sectors = {item["sector"] for item in self.items}
        self.assertGreaterEqual(len(countries), 8)
        for sector in ("Healthcare", "K-12 education", "Banking and payments", "Energy and fuel distribution"):
            # This checks the intended sector coverage by record fields, not the visual labels.
            self.assertTrue(any(sector.lower() in item["sector"].lower() for item in self.items), sector)

    def test_ids_unique_and_core_fields_populated(self):
        ids = [item["id"] for item in self.items]
        self.assertEqual(len(ids), len(set(ids)))
        for item in self.items:
            with self.subTest(case=item.get("id")):
                for key in ("title", "summary", "incidentDate", "publishedAt", "country", "sector", "sourceStatusLabel", "publisher", "url", "facts", "resources", "tags", "illustration"):
                    self.assertTrue(item.get(key), f"{item.get('id')} missing {key}")
                self.assertIn(item["caseType"], ALLOWED_CASE_TYPES)
                self.assertGreaterEqual(len(item["facts"]), 2)
                self.assertGreaterEqual(len(item["resources"]), 1)

    def test_all_sources_use_https_and_have_titles(self):
        for item in self.items:
            refs = [{"url": item["url"], "title": item["title"], "publisher": item["publisher"]}, *item["resources"]]
            for ref in refs:
                with self.subTest(case=item["id"], ref=ref.get("url")):
                    parsed = urlparse(ref["url"])
                    self.assertEqual(parsed.scheme, "https")
                    self.assertTrue(parsed.netloc)
                    self.assertTrue(ref.get("title"))
                    self.assertTrue(ref.get("publisher"))

    def test_each_case_art_exists_and_is_explicitly_illustrative(self):
        for item in self.items:
            path = ART / item["illustration"]
            with self.subTest(case=item["id"]):
                self.assertTrue(path.is_file(), str(path))
                svg = path.read_text(encoding="utf-8")
                self.assertIn("Not a photograph of a real incident", svg)

    def test_uncertain_claims_are_not_rendered_as_confirmed_facts(self):
        by_id = {item["id"]: item for item in self.items}
        pwc = by_id["pwc-third-party-2026"]
        self.assertTrue(any(term in " ".join(pwc["facts"]).lower() for term in ("unverified", "not independently verified")))
        php = by_id["php2shell-2026"]
        self.assertIn("not proof", " ".join(php["facts"]).lower())
        cedge = by_id["c-edge-india-banks-2024"]
        self.assertIn("reported", " ".join(cedge["facts"]).lower())

    def test_ui_searches_archive_and_avoids_stale_or_empty_results(self):
        ui = (ROOT / "website" / "src" / "components" / "LiveIncidentOps.jsx").read_text(encoding="utf-8")
        self.assertIn("HISTORICAL_INCIDENT_LIBRARY", ui)
        self.assertIn("terms.every((term) => searchText.includes(term))", ui)
        self.assertIn("archiveUsingFallback", ui)
        self.assertIn("No exact archive result", ui)
        self.assertIn("setActiveItem(null)", ui)

if __name__ == "__main__":
    unittest.main()
