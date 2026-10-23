# OpenCyberPath Android authentication

## What this implements

- Native Android uses the system-browser Authorization Code flow with PKCE S256 through AppAuth (`@capacitor-community/generic-oauth2`).
- `org.opencyberpath.app://oauth` is the login callback and `org.opencyberpath.app.logout://logout` is the Keycloak logout return URI.
- Access and refresh tokens remain in process memory; they are not saved to `localStorage`. If Android terminates the app process, the learner may need to sign in again; the provider's browser session may make this quick.
- The same authenticated `/v1/me` and `/v1/progress` API calls are used by web and Android. The backend remains responsible for validating token signature, issuer, audience, and user access.
- Public discovery remains available without sign-in. Destinations listed in `ACCOUNT_REQUIRED_PAGES` require an authenticated session on web and Android.

## Keycloak client settings

Create a separate public Keycloak client for Android (recommended ID: `opencyberpath-android`) in the same application realm configured by `VITE_OIDC_REALM`. Keep the web client (`VITE_OIDC_CLIENT_ID`) separate. Set `VITE_NATIVE_OIDC_CLIENT_ID=opencyberpath-android` in `website/.env.local`. VITE_NATIVE_OIDC_CLIENT_ID is required and must be different from the web client ID. Never put a client secret in the APK.

1. Client authentication: **Off** (public client); Standard Flow: **On**.
2. Require PKCE with **S256** if the Keycloak version exposes that setting.
3. Add `org.opencyberpath.app://oauth` under **Valid Redirect URIs** and `org.opencyberpath.app.logout://logout` under **Valid post logout redirect URIs**. Keep existing web redirect URIs.
4. Ensure the `openid`, `profile`, and `email` scopes are available. The backend may reject users whose email is not verified.
5. If the app's Create account action should work, enable user registration for the realm. The native app opens the secure Keycloak page; the learner selects its Register link.
6. Add the same `opencyberpath-api-audience` mapper/client scope to the Android client so its access token is accepted by the existing backend.

## Vite environment required for the APK

The build requires these non-secret client settings in `website/.env.local` or the active Vite environment:

```dotenv
VITE_OIDC_URL=https://your-reachable-keycloak-host
VITE_OIDC_REALM=your-realm
VITE_OIDC_CLIENT_ID=opencyberpath-web
VITE_NATIVE_OIDC_CLIENT_ID=opencyberpath-android
VITE_API_BASE_URL=https://your-reachable-api-host
```

Both services must be reachable from the Android device. `localhost` inside an APK means the phone itself, not the development PC. The build script substitutes a laptop-local loopback URL with the detected LAN IPv4 address for this debug build and does not rewrite the `.env` files. For local phone testing, set the backend's `HOST=0.0.0.0` and include `https://localhost` in `CORS_ORIGINS` (Capacitor Android's WebView origin); restart the backend and ensure Windows Firewall permits the service ports. The backend's `OIDC_ISSUER_URL` must exactly match the `issuer` value from Keycloak's `/.well-known/openid-configuration` document and the token's `iss` claim. If loopback substitution changes the URL to a LAN IP, check the discovery document from that same reachable base URL and update `backend/.env` `OIDC_ISSUER_URL` to the returned issuer before testing API sync; restart the backend. If Keycloak uses a fixed public hostname, use that same issuer and an endpoint reachable from the phone rather than assuming a LAN-IP substitution is enough. The debug manifest permits cleartext traffic and the debug MainActivity permits mixed content only for local testing; **never ship a debug APK or HTTP endpoints to production**. Use trusted HTTPS endpoints for release APKs. The Gradle `appAuthRedirectScheme` placeholder must stay equal to `org.opencyberpath.app`; the script configures it for AppAuth.

## Required smoke test on a real device

1. Open Home and public Resources while signed out; both should remain available.
2. Open Learn, a path detail, Labs, CTF Practice, Systems Academy, CyberRange, SkillProof, or Offline Learning. The account gate should appear.
3. Tap Sign in. Chrome Custom Tabs/system browser should show Keycloak. Complete sign-in; Android should return to OpenCyberPath and open the requested destination.
4. Verify `GET /v1/me` and `GET /v1/progress` succeed in backend logs/network diagnostics. Change a module checkpoint, leave and reopen the learning screen, and verify the saved state persists.
5. Tap Sign out. The in-app session should clear and Keycloak should receive the RP-initiated logout request.
6. Repeat with an unverified email or a test account the API denies: the UI must not claim cloud sync succeeded when `/v1/me` or progress endpoints fail.

The release workflow builds a debug APK and may offer to install it through ADB. It does not prove identity-provider and backend configuration; the on-device smoke test above is required before enabling this on a production release.