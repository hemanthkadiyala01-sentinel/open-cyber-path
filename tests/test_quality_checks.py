from __future__ import annotations

import sys
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import quality_checks  # noqa: E402


class QualityCheckTests(unittest.TestCase):
    def test_resource_module_has_unique_ids(self):
        records = quality_checks.parse_js_records(ROOT / "website/src/data/resources.js", "resources")
        ids = [row["id"] for row in records]
        self.assertGreaterEqual(len(records), 1)
        self.assertEqual(len(ids), len(set(ids)))

    def test_resource_json_mirror_matches_runtime_catalogue(self):
        errors, _, counts = quality_checks.run_quality_checks(ROOT)
        self.assertEqual(errors, [])
        self.assertGreaterEqual(counts["resources"], 1)

    def test_https_url_policy(self):
        self.assertTrue(quality_checks.valid_https_url("https://example.com/docs"))
        self.assertFalse(quality_checks.valid_https_url("http://example.com/docs"))
        self.assertFalse(quality_checks.valid_https_url("javascript:alert(1)"))

    def test_ten_canonical_career_visions(self):
        errors, _, counts = quality_checks.run_quality_checks(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(counts["career_paths"], 10)

    def test_career_toolkit_structure(self):
        errors, counts = quality_checks.check_career_toolkit(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(counts["career_directions"], 10)
        self.assertEqual(counts["hacker_hat_terms"], 6)
        self.assertEqual(counts["beginner_stages"], 6)
        self.assertGreaterEqual(counts["job_sources"], 5)
        self.assertGreaterEqual(counts["employer_portals"], 3)


    def test_cursive_handwritten_notes_have_10_plus_pages_and_diagrams(self):
        errors, count = quality_checks.check_handwritten_notes(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(count, 2)

    def test_tools_threats_and_movie_case_studies(self):
        errors, counts = quality_checks.check_tools_threats(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(counts["security_tools"], 33)
        self.assertEqual(counts["movie_cases"], 3)
        self.assertGreaterEqual(counts["safe_practice_links"], 45)

    def test_catalogue_curation_and_privacy_exclusions(self):
        curation = (ROOT / "TOOLS-CATALOGUE-CURATION.md").read_text(encoding="utf-8").lower()
        component = (ROOT / "website/src/components/ToolsThreats.jsx").read_text(encoding="utf-8").lower()
        self.assertIn("learner-first tool catalogue review", curation)
        self.assertIn("people-finder", curation)
        self.assertIn("breach-data", curation)
        self.assertIn("start here", component)
        self.assertIn("first safe task", component)
        self.assertIn("cisa cybersecurity advisories", component)
        self.assertIn("threatfox", component)
        self.assertNotIn("pimeyes.com", component)
        self.assertNotIn("snusbase.com", component)

    def test_eight_pillar_map_links_to_ten_career_visions(self):
        errors, counts = quality_checks.check_cybersecurity_pillars(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(counts["cybersecurity_pillars"], 8)
        self.assertEqual(counts["domain_specializations"], 31)
        self.assertEqual(counts["isc2_cissp_domains"], 8)

    def test_detection_evaluation_csv_shape(self):
        csv_path = ROOT / "website/public/labs/detection-evaluation-cases.csv"
        rows, errors = quality_checks.check_csv_shape(csv_path)
        self.assertEqual(errors, [])
        self.assertEqual(rows, 9)


if __name__ == "__main__":
    unittest.main()

    def test_all_local_svg_artwork_is_well_formed(self):
        images = ROOT / "website/public/images"
        svgs = sorted(images.rglob("*.svg"))
        self.assertGreaterEqual(len(svgs), 20)
        invalid = []
        for svg in svgs:
            try:
                ET.parse(svg)
            except ET.ParseError as exc:
                invalid.append(f"{svg.relative_to(ROOT)}: {exc}")
        self.assertEqual(invalid, [])

    def test_image_fallback_and_quote_spotlight_are_wired(self):
        app = (ROOT / "website/src/App.jsx").read_text(encoding="utf-8")
        css = (ROOT / "website/src/styles.css").read_text(encoding="utf-8")
        self.assertGreaterEqual(app.count("onError={handleArtworkError}"), 6)
        self.assertIn('className="quote-spotlight"', app)
        self.assertIn(".quote-spotlight {", css)
        self.assertIn(".gratitude-card:after", css)
