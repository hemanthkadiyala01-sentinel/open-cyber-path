import json
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "website" / "src" / "data" / "historical-incident-library.json"
UI = ROOT / "website" / "src" / "components" / "LiveIncidentOps.jsx"
ART = ROOT / "website" / "public"
ALLOWED = {"dependency-compromise", "vulnerability", "certificate-compromise", "ai-agent", "api-abuse", "third-party-breach", "identity-cloud", "malware-ransomware", "generic"}
EXPECTED_NEW_IDS = {
    "blanc-brothers-telegraph-fraud-1836",
    "maskelyne-wireless-interception-1903",
    "rene-carmille-data-resistance-1943",
    "joybubbles-phone-phreaking-1950s",
    "mit-ctss-password-printout-1962",
    "att-billing-clock-account-1981",
    "aohell-phishing-tool-1994",
    "kevin-mitnick-intrusion-campaign-1994",
    "jonathan-james-nasa-dod-1999",
    "mafiaboy-ddos-2000",
    "heartland-payment-intrusion-2007",
    "huggingface-ai-agent-intrusion-2026",
    "sbi-suspected-dark-web-data-exposure-2026",
}

class ExpandedHistoricalArchiveV112Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DATA.read_text(encoding="utf-8"))
        cls.items = cls.doc["items"]
        cls.by_id = {item["id"]: item for item in cls.items}

    def test_archive_contains_115_plus_cases_across_history(self):
        self.assertGreaterEqual(len(self.items), 115)
        years = {item["incidentDate"][:4] for item in self.items}
        for year in ("1836", "1903", "1950", "1962", "1971", "1986", "1994", "1988", "2025", "2026"):
            self.assertIn(year, years)
        self.assertGreaterEqual(len({item["country"] for item in self.items}), 12)
        self.assertGreaterEqual(len({item["sector"] for item in self.items}), 12)

    def test_pasted_timeline_missing_cases_are_added_once(self):
        ids = [item["id"] for item in self.items]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(EXPECTED_NEW_IDS.issubset(set(ids)))
        self.assertEqual(self.doc["schemaVersion"], "1.1.1")

    def test_ids_and_core_fields_are_valid(self):
        for item in self.items:
            with self.subTest(case=item["id"]):
                for key in ("title", "summary", "incidentDate", "publishedAt", "country", "sector", "sourceStatusLabel", "publisher", "url", "facts", "resources", "tags", "illustration"):
                    self.assertTrue(item.get(key), f"missing {key}")
                self.assertIn(item["caseType"], ALLOWED)
                self.assertGreaterEqual(len(item["facts"]), 2)
                self.assertGreaterEqual(len(item["resources"]), 1)

    def test_all_links_are_https_and_titled(self):
        for item in self.items:
            refs = [{"url": item["url"], "title": item["title"], "publisher": item["publisher"]}, *item["resources"]]
            for ref in refs:
                with self.subTest(case=item["id"], url=ref.get("url")):
                    parsed = urlparse(ref["url"])
                    self.assertEqual(parsed.scheme, "https")
                    self.assertTrue(parsed.netloc)
                    self.assertTrue(ref.get("title"))
                    self.assertTrue(ref.get("publisher"))

    def test_artwork_exists_and_is_labelled_illustrative(self):
        for item in self.items:
            art = ART / item["illustration"]
            with self.subTest(case=item["id"]):
                self.assertTrue(art.is_file(), str(art))
                self.assertIn("Not a photograph of a real incident", art.read_text(encoding="utf-8"))

    def test_publication_date_and_approximate_date_are_not_fabricated(self):
        ui = UI.read_text(encoding="utf-8")
        self.assertIn("Publication date not listed", ui)
        self.assertIn("function incidentDateLabel(item)", ui)
        self.assertIn("incidentDatePrecision === 'decade'", ui)
        self.assertIn("RECORD_CLASS_LABELS", ui)
        unknown = [x for x in self.items if x.get("publicationDateKnown") is False]
        self.assertGreaterEqual(len(unknown), 10)
        self.assertTrue(all("Publication date" in x.get("sourceNote", "") for x in unknown))
        self.assertEqual(self.by_id["creeper-worm-1971"].get("incidentDatePrecision"), "year")
        self.assertEqual(self.by_id["brain-virus-1986"].get("incidentDatePrecision"), "year")
        self.assertEqual(self.by_id["citibank-1994-bank-hack"].get("incidentDatePrecision"), "month")
        self.assertEqual(self.by_id["joybubbles-phone-phreaking-1950s"].get("incidentDatePrecision"), "decade")

    def test_historical_precursors_and_disputed_claims_are_labeled(self):
        expected_classes = {
            "blanc-brothers-telegraph-fraud-1836": "historical-precursor",
            "maskelyne-wireless-interception-1903": "security-demonstration",
            "rene-carmille-data-resistance-1943": "defensive-history",
            "joybubbles-phone-phreaking-1950s": "telecom-security-precursor",
            "att-billing-clock-account-1981": "contested-historical-account",
            "aohell-phishing-tool-1994": "cybercrime-tool-history",
            "huggingface-ai-agent-intrusion-2026": "reported-ai-agent-intrusion",
            "sbi-suspected-dark-web-data-exposure-2026": "reported-data-exposure",
        }
        for case_id, record_class in expected_classes.items():
            self.assertEqual(self.by_id[case_id].get("recordClass"), record_class)
        self.assertIn("not a modern cyberattack", self.by_id["blanc-brothers-telegraph-fraud-1836"]["signalType"])
        self.assertIn("not a cyberattack", self.by_id["rene-carmille-data-resistance-1943"]["signalType"])
        att_text = (" ".join(self.by_id["att-billing-clock-account-1981"]["facts"]) + self.by_id["att-billing-clock-account-1981"]["sourceNote"]).lower()
        self.assertIn("disput", att_text)
        hf_text = " ".join(self.by_id["huggingface-ai-agent-intrusion-2026"]["facts"]).lower()
        self.assertIn("narrower label", hf_text)
        sbi_text = (" ".join(self.by_id["sbi-suspected-dark-web-data-exposure-2026"]["facts"]) + self.by_id["sbi-suspected-dark-web-data-exposure-2026"]["sourceNote"]).lower()
        self.assertIn("under investigation", sbi_text)

    def test_current_live_refresh_and_incident_specific_cases_are_preserved(self):
        ui = UI.read_text(encoding="utf-8")
        self.assertIn("useCallback", ui)
        self.assertIn("/v1/live-intelligence/refresh", ui)
        self.assertIn("/v1/live-intelligence", ui)
        self.assertIn("Refresh sources now", ui)
        self.assertIn("INCIDENT_CASES", ui)
        self.assertIn("pwc-third-party-incident", ui)
        self.assertIn("cisco-sdwan-auth-bypass", ui)

    def test_existing_sensitive_claim_labels_are_preserved(self):
        self.assertTrue(any(t in " ".join(self.by_id["pwc-third-party-2026"]["facts"]).lower() for t in ("unverified", "not independently verified")))
        self.assertIn("not proof", " ".join(self.by_id["php2shell-2026"]["facts"]).lower())
        railyatri_text = (" ".join(self.by_id["railyatri-breach-2022"]["facts"]) + " " + self.by_id["railyatri-breach-2022"].get("sourceNote", "")).lower()
        self.assertTrue(any(t in railyatri_text for t in ("not independently verified", "not independently")))

if __name__ == "__main__":
    unittest.main()
