from __future__ import annotations

import sys
import unittest
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

    def test_detection_evaluation_csv_shape(self):
        csv_path = ROOT / "website/public/labs/detection-evaluation-cases.csv"
        rows, errors = quality_checks.check_csv_shape(csv_path)
        self.assertEqual(errors, [])
        self.assertEqual(rows, 9)


if __name__ == "__main__":
    unittest.main()
