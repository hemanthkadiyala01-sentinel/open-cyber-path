import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class NativeMobileAuthTests(unittest.TestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8-sig")

    def test_native_login_uses_authorization_code_pkce_and_no_client_secret(self):
        auth = self.read("website/src/auth/nativeKeycloakAuth.js")
        self.assertIn("GenericOAuth2.authenticate(oauthOptions())", auth)
        self.assertIn("responseType: 'code'", auth)
        self.assertIn("pkceEnabled: true", auth)
        self.assertNotIn("client_secret", auth.lower())
        self.assertIn("openid profile email", auth)
        self.assertIn("clientId: import.meta.env.VITE_NATIVE_OIDC_CLIENT_ID", auth)

    def test_native_redirects_are_registered_in_android_manifest(self):
        manifest = self.read("website/android/app/src/main/AndroidManifest.xml")
        self.assertIn('android:host="oauth"', manifest)
        self.assertIn('android:host="logout"', manifest)
        self.assertIn('android:scheme="@string/custom_url_scheme"', manifest)
        gradle = self.read("website/android/app/build.gradle")
        self.assertIn("appAuthRedirectScheme: 'org.opencyberpath.app'", gradle)

    def test_local_http_debug_exceptions_are_not_in_release_source_manifest(self):
        debug_manifest = self.read("website/android/app/src/debug/AndroidManifest.xml")
        activity = self.read("website/android/app/src/main/java/org/opencyberpath/app/MainActivity.java")
        self.assertIn('usesCleartextTraffic="true"', debug_manifest)
        self.assertIn('BuildConfig.DEBUG', activity)
        self.assertIn('WebSettings.MIXED_CONTENT_ALWAYS_ALLOW', activity)

    def test_gated_workspaces_require_authentication_on_android_and_web(self):
        app = self.read("website/src/App.jsx")
        self.assertIn("if (ACCOUNT_REQUIRED_PAGES.has(next) && auth.status !== 'authenticated')", app)
        self.assertNotIn("if (!Capacitor.isNativePlatform() && ACCOUNT_REQUIRED_PAGES.has(next)", app)

    def test_native_and_web_share_authenticated_api_access_token(self):
        provider = self.read("website/src/auth/AuthProvider.jsx")
        self.assertIn("getNativeAccessToken()", provider)
        self.assertIn("getCurrentAccessToken", provider)
        self.assertIn("/v1/me", provider)
        sync = self.read("website/src/auth/learningProgressSync.js")
        self.assertIn("/v1/progress", self.read("website/src/App.jsx"))
        self.assertIn("clientUpdatedAt", sync)

    def test_logout_clears_native_memory_session(self):
        auth = self.read("website/src/auth/nativeKeycloakAuth.js")
        self.assertIn("export async function signOutNative()", auth)
        self.assertIn("post_logout_redirect_uri", auth)
        self.assertIn("NATIVE_LOGOUT_REDIRECT", auth)


if __name__ == "__main__":
    unittest.main()