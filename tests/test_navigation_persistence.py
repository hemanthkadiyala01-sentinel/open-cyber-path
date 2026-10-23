import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class NavigationPersistenceTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_last_screen_and_selected_path_are_saved_per_tab(self):
        app = self.read("website/src/App.jsx")
        self.assertIn("opencyberpath-current-navigation-v1", app)
        self.assertIn("window.sessionStorage.setItem(NAVIGATION_STATE_STORAGE_KEY", app)
        self.assertIn("useState(() => readSavedNavigation())", app)
        self.assertIn("useState(initialNavigation.activeLearningPathId)", app)
        self.assertIn("useState(initialNavigation.academyPathId)", app)

    def test_protected_screen_is_restored_through_gate_until_auth_is_known(self):
        app = self.read("website/src/App.jsx")
        self.assertIn("if (ACCOUNT_REQUIRED_PAGES.has(requestedPage)", app)
        self.assertIn("page: 'learning-access', pendingLearningDestination", app)
        self.assertIn("readStoredPendingLearningDestination()", app)
        self.assertIn("auth.status !== 'authenticated'", app)

    def test_unknown_or_invalid_saved_page_falls_back_safely(self):
        app = self.read("website/src/App.jsx")
        self.assertIn("const requestedPage = NAVIGABLE_PAGES.has(saved.page) ? saved.page : 'home';", app)
        self.assertIn("if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback;", app)


if __name__ == "__main__":
    unittest.main()
