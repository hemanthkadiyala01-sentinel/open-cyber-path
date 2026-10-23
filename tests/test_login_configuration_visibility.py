import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class LoginConfigurationVisibilityTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_login_gate_remains_enabled_for_learning_workspaces(self):
        app = self.read("website/src/App.jsx")
        self.assertIn("const ACCOUNT_REQUIRED_PAGES", app)
        self.assertIn("auth.status !== 'authenticated'", app)
        self.assertIn("page === 'learning-access'", app)

    def test_missing_oidc_configuration_is_not_silently_hidden(self):
        account = self.read("website/src/auth/AccountActions.jsx")
        provider = self.read("website/src/auth/AuthProvider.jsx")
        self.assertIn("auth.status === 'disabled'", account)
        self.assertIn("VITE_OIDC_URL", account)
        self.assertIn("VITE_OIDC_REALM", account)
        self.assertIn("VITE_OIDC_CLIENT_ID", account)
        self.assertIn("identity.login", provider)
        self.assertIn("pkceMethod: 'S256'", provider)
        self.assertIn("auth.error", account)

    def test_silent_session_check_has_timeout_and_releases_login_ui(self):
        provider = self.read("website/src/auth/AuthProvider.jsx")
        account = self.read("website/src/auth/AccountActions.jsx")
        gate = self.read("website/src/auth/LearningAccessGate.jsx")
        self.assertIn("AUTH_INITIALIZATION_TIMEOUT_MS = 10000", provider)
        self.assertIn("Promise.race([initializeIdentity(), timeout])", provider)
        self.assertIn("setStatus('error')", provider)
        self.assertIn("if (auth.status === 'loading')", account)
        self.assertIn("auth.error &&", account)
        self.assertIn("Sign in", account)
        self.assertIn("configured && !checking", gate)
        self.assertIn("auth.login()", gate)


if __name__ == "__main__":
    unittest.main()
