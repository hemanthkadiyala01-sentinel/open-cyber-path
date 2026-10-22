import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class AccountBasedLearningTests(unittest.TestCase):
    def read(self, path):
        return (ROOT / path).read_text(encoding="utf-8-sig")

    def test_learning_workspaces_are_explicitly_gated(self):
        app = self.read("website/src/App.jsx")
        for page in ("learning-studio", "path-detail", "labs", "ctf-lab", "systems-academy", "cyberrange", "skillproof", "offline-learning"):
            self.assertIn(f"'{page}'", app)
        self.assertIn("auth.status !== 'authenticated'", app)
        self.assertIn("page === 'learning-access'", app)

    def test_public_discovery_destinations_are_not_in_gate_set(self):
        app = self.read("website/src/App.jsx")
        gate_start = app.index('const ACCOUNT_REQUIRED_PAGES')
        gate_end = app.index(';', gate_start)
        gate = app[gate_start:gate_end]
        for page in ("'home'", "'roadmap'", "'resources'", "'certifications'", "'concepts'"):
            self.assertNotIn(page, gate)

    def test_gate_offers_real_sign_in_and_registration_actions(self):
        gate = self.read("website/src/auth/LearningAccessGate.jsx")
        self.assertIn('auth.login()', gate)
        self.assertIn('auth.register()', gate)
        self.assertIn('module checkpoints', gate)
        self.assertIn('Back to public discovery', gate)

    def test_progress_sync_uses_existing_authenticated_api_and_merge_timestamps(self):
        sync = self.read("website/src/auth/learningProgressSync.js")
        app = self.read("website/src/App.jsx")
        self.assertIn('opencyberpath-module-checkpoint', sync)
        self.assertIn('clientUpdatedAt', sync)
        self.assertIn('mergeModuleProgress', app)
        self.assertIn('/v1/progress', app)
        self.assertIn('getAccessToken()', app)
        self.assertIn('method: \'PUT\'', app)

    def test_private_progress_api_requires_authentication(self):
        server = self.read("backend/src/server.ts")
        self.assertIn("app.get('/v1/progress', { preHandler: requireAuth }", server)
        self.assertIn("'/v1/progress/:itemId'", server)
        self.assertIn("app.post<{ Body: unknown }>('/v1/notes', { preHandler: requireAuth }", server)

    def test_learning_studio_discloses_which_data_syncs(self):
        studio = self.read("website/src/components/LearningStudio.jsx")
        self.assertIn('Module checkpoints can synchronise', studio)
        self.assertIn('cloud sync for those items is not yet enabled', studio)

if __name__ == '__main__':
    unittest.main()
