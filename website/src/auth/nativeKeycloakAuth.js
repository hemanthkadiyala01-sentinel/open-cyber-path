import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { GenericOAuth2 } from '@capacitor-community/generic-oauth2';

const config = {
  url: import.meta.env.VITE_OIDC_URL,
  realm: import.meta.env.VITE_OIDC_REALM,
  clientId: import.meta.env.VITE_NATIVE_OIDC_CLIENT_ID,
};

// These reverse-domain callbacks must be registered exactly in the public Keycloak client.
export const NATIVE_OAUTH_REDIRECT = 'org.opencyberpath.app://oauth';
export const NATIVE_LOGOUT_REDIRECT = 'org.opencyberpath.app.logout://logout';

let session = {
  accessToken: null,
  refreshToken: null,
  idToken: null,
  expiresAt: 0,
};

function endpoints() {
  const base = String(config.url || '').trim().replace(/\/+$/, '');
  const realm = String(config.realm || '').trim();
  if (!base || !realm || !config.clientId) {
    throw new Error('Native sign-in is not configured. Set VITE_OIDC_URL, VITE_OIDC_REALM, and VITE_NATIVE_OIDC_CLIENT_ID.');
  }
  const root = `${base}/realms/${encodeURIComponent(realm)}/protocol/openid-connect`;
  return { authorization: `${root}/auth`, token: `${root}/token`, logout: `${root}/logout` };
}

function oauthOptions() {
  if (!Capacitor.isNativePlatform()) throw new Error('Native OAuth can only run inside the installed app.');
  const endpoint = endpoints();
  const common = {
    appId: config.clientId,
    authorizationBaseUrl: endpoint.authorization,
    accessTokenEndpoint: endpoint.token,
    responseType: 'code',
    redirectUrl: NATIVE_OAUTH_REDIRECT,
    scope: 'openid profile email',
    pkceEnabled: true,
    logsEnabled: false,
  };
  return {
    ...common,
    android: {
      ...common,
      // AppAuth verifies state and uses S256 PKCE; no client secret is packaged in the app.
      handleResultOnActivityResult: true,
      handleResultOnNewIntent: false,
    },
  };
}

function decodeJwtClaims(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function expiresAtFrom(tokenResponse) {
  const absolute = Number(tokenResponse?.expires_at);
  if (Number.isFinite(absolute) && absolute > 0) return absolute < 1000000000000 ? absolute * 1000 : absolute;
  const seconds = Number(tokenResponse?.expires_in);
  return Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds : 300) * 1000;
}

function normalizeTokens(result, existing = {}) {
  const tokenResponse = result?.access_token_response || result?.token_response || result || {};
  const accessToken = result?.access_token || tokenResponse?.access_token || null;
  const idToken = tokenResponse?.id_token || result?.id_token || existing.idToken || null;
  return {
    accessToken,
    refreshToken: tokenResponse?.refresh_token || result?.refresh_token || existing.refreshToken || null,
    idToken,
    expiresAt: expiresAtFrom(tokenResponse),
  };
}

function userFromTokens(tokens) {
  const claims = decodeJwtClaims(tokens.idToken) || decodeJwtClaims(tokens.accessToken);
  if (!claims || typeof claims.sub !== 'string' || !claims.sub) {
    throw new Error('The identity provider did not return a usable signed-in user profile.');
  }
  return {
    id: claims.sub,
    name: typeof claims.name === 'string' && claims.name.trim()
      ? claims.name
      : (typeof claims.preferred_username === 'string' ? claims.preferred_username : undefined),
    email: typeof claims.email === 'string' ? claims.email : undefined,
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
  };
}

export async function beginNativeSignIn() {
  const result = await GenericOAuth2.authenticate(oauthOptions());
  const next = normalizeTokens(result);
  if (!next.accessToken) throw new Error('The identity provider did not return an access token.');
  const user = userFromTokens(next);
  session = next;
  return user;
}

export async function getNativeAccessToken() {
  if (!Capacitor.isNativePlatform()) throw new Error('Native access tokens are unavailable in a web browser.');
  if (!session.accessToken) throw new Error('Please sign in first.');
  if (session.expiresAt > Date.now() + 30000) return session.accessToken;
  if (!session.refreshToken) {
    session = { accessToken: null, refreshToken: null, idToken: null, expiresAt: 0 };
    throw new Error('Your mobile session expired. Please sign in again.');
  }

  try {
    const result = await GenericOAuth2.refreshToken({
      appId: config.clientId,
      accessTokenEndpoint: endpoints().token,
      refreshToken: session.refreshToken,
      scope: 'openid profile email',
    });
    const next = normalizeTokens(result, session);
    if (!next.accessToken) throw new Error('No access token in refresh response.');
    session = next;
    return session.accessToken;
  } catch {
    session = { accessToken: null, refreshToken: null, idToken: null, expiresAt: 0 };
    throw new Error('Your mobile session expired. Please sign in again.');
  }
}

export function isNativeLogoutRedirect(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'org.opencyberpath.app.logout:' && url.hostname === 'logout';
  } catch {
    return false;
  }
}

export async function signOutNative() {
  const idToken = session.idToken;
  session = { accessToken: null, refreshToken: null, idToken: null, expiresAt: 0 };
  // If no ID token exists, finish local sign-out. Otherwise also end the Keycloak browser session.
  if (!idToken) return;
  const url = new URL(endpoints().logout);
  url.searchParams.set('id_token_hint', idToken);
  url.searchParams.set('post_logout_redirect_uri', NATIVE_LOGOUT_REDIRECT);
  url.searchParams.set('client_id', String(config.clientId));
  await Browser.open({ url: url.toString(), toolbarColor: '#07111f' });
}