from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = ROOT / "website" / "src" / "components" / "LearningStudio.jsx"
STYLE = ROOT / "website" / "src" / "components" / "LearningStudio.css"
APP = ROOT / "website" / "src" / "App.jsx"
GUIDE = ROOT / "website" / "src" / "components" / "SiteGuideAssistant.jsx"


class LearningStudioIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.component = COMPONENT.read_text(encoding="utf-8")
        cls.style = STYLE.read_text(encoding="utf-8")
        cls.app = APP.read_text(encoding="utf-8")
        cls.guide = GUIDE.read_text(encoding="utf-8")

    def test_learning_studio_is_integrated_into_navigation_and_home(self):
        self.assertIn("import LearningStudio from './components/LearningStudio.jsx'", self.app)
        self.assertIn("['learning-studio','Learn']", self.app)
        self.assertIn("navigate('learning-studio')", self.app)
        self.assertIn("page === 'learning-studio'", self.app)

    def test_studio_uses_existing_path_modules_and_shared_checkpoints(self):
        self.assertIn("selectedPath?.modules", self.component)
        self.assertIn("onCheckpointChange(selectedPath.id, selectedModule.title, field, checked)", self.component)
        self.assertIn("understood", self.component)
        self.assertIn("practised", self.component)
        self.assertIn("evidence", self.component)

    def test_local_preferences_and_journal_disclose_device_only_storage(self):
        self.assertIn("opencyberpath-learning-studio-profile-v1", self.component)
        self.assertIn("opencyberpath-learning-studio-reflections-v1", self.component)
        self.assertIn("not synced to an online account", self.component)
        self.assertIn("do not synchronise to a cloud account", self.component)

    def test_all_ten_existing_career_paths_have_formative_checks(self):
        expected = [
            "soc-blue-team", "threat-hunting-detection-engineering",
            "digital-forensics-incident-response", "application-security-bug-bounty",
            "cloud-security", "grc-security-fundamentals",
            "penetration-testing-red-team", "security-engineering-devsecops-iam",
            "threat-intelligence-ethical-osint", "malware-analysis-reverse-engineering",
        ]
        for path_id in expected:
            with self.subTest(path_id=path_id):
                self.assertIn(f"'{path_id}'", self.component)

    def test_scoped_responsive_styles_and_site_guide_route_exist(self):
        self.assertIn("@media(max-width:600px)", self.style)
        self.assertIn(".learning-studio", self.style)
        self.assertIn("page: 'learning-studio'", self.guide)


if __name__ == "__main__":
    unittest.main()
