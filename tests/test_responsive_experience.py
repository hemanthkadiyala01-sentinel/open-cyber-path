from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "website" / "src" / "App.jsx"
MAIN = ROOT / "website" / "src" / "main.jsx"
INDEX = ROOT / "website" / "index.html"
STYLE = ROOT / "website" / "src" / "styles" / "responsive-experience.css"


class ResponsiveExperienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = APP.read_text(encoding="utf-8")
        cls.main = MAIN.read_text(encoding="utf-8")
        cls.index = INDEX.read_text(encoding="utf-8")
        cls.style = STYLE.read_text(encoding="utf-8")

    def test_platform_aware_root_separates_android_from_web(self):
        self.assertIn("Capacitor.isNativePlatform()", self.app)
        self.assertIn("native-app-shell", self.app)
        self.assertIn("web-app-shell", self.app)

    def test_responsive_css_loads_after_global_css(self):
        self.assertLess(self.main.index("import './styles.css';"), self.main.index("import './styles/responsive-experience.css';"))

    def test_viewport_allows_android_safe_areas(self):
        self.assertIn("viewport-fit=cover", self.index)

    def test_more_menu_has_real_dropdown_and_mobile_bottom_sheet_rules(self):
        self.assertIn(".nav-more-menu[open] > .nav-more-panel", self.style)
        self.assertIn("position: fixed", self.style)
        self.assertIn("max-height: min(62dvh, 500px)", self.style)

    def test_breakpoints_cover_desktop_laptop_tablet_and_phone(self):
        for marker in ("min-width: 1440px", "max-width: 1439px", "max-width: 900px", "max-width: 640px", "max-width: 380px"):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.style)

    def test_native_mobile_uses_compact_five_destination_tab_bar(self):
        self.assertIn("nav-key-home::before", self.style)
        self.assertIn("nav-key-learning-studio::before", self.style)
        self.assertIn("nav-key-roadmap::before", self.style)
        self.assertIn("nav-key-labs::before", self.style)
        self.assertIn("nav-key-resources", self.style)
        self.assertIn("nav-key-ctf-lab", self.style)
        self.assertIn("nav-key-liveops", self.style)
        self.assertIn("var(--ocp-mobile-nav-height)", self.style)

    def test_safe_area_and_assistant_fab_do_not_cover_mobile_navigation(self):
        self.assertIn("env(safe-area-inset-bottom, 0px)", self.style)
        self.assertIn(".native-app-shell .ocp-guide-assistant", self.style)
        self.assertIn(".native-app-shell main", self.style)

    def test_mobile_home_uses_compact_layout_and_content_grids(self):
        self.assertIn(".native-app-shell .hero-visual { display: none; }", self.style)
        self.assertIn("grid-template-columns: repeat(2, minmax(0, 1fr))", self.style)
        self.assertIn("overflow-wrap: anywhere", self.style)

    def test_respects_reduced_motion_preferences(self):
        self.assertIn("prefers-reduced-motion: reduce", self.style)


if __name__ == "__main__":
    unittest.main()
