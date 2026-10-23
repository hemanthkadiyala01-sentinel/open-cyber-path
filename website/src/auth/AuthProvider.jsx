import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Keycloak from 'keycloak-js';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import {
  beginNativeSignIn,
  getNativeAccessToken,
  isNativeLogoutRedirect,
  signOutNative,
} from './nativeKeycloakAuth.js';

const oidcConfig = {
  url: import.meta.env.VITE_OIDC_URL,
  realm: import.meta.env.VITE_OIDC_REALM,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
};
const nativeRuntime = Capacitor.isNativePlatform();
const webConfigured = Boolean(oidcConfig.url && oidcConfig.realm && oidcConfig.clientId);
const nativeConfigured = Boolean(
  oidcConfig.url && oidcConfig.realm && import.meta.env.VITE_NATIVE_OIDC_CLIENT_ID
);
const configured = nativeRuntime ? nativeConfigured : webConfigured;
// keycloak-js is used for ordinary web sessions only. Capacitor Android uses an external-browser
// Authorization Code + PKCE flow through AppAuth, then calls the same authenticated API.
const identity = webConfigured && !nativeRuntime ? new Keycloak(oidcConfig) : null;
const AuthContext = createContext(null);
let initPromise;
// A silent SSO/session check must not keep the entire app stuck in a loading state.
const AUTH_INITIALIZATION_TIMEOUT_MS = 10000;

async function initializeIdentity() {
  if (!identity) return false;
  if (!initPromise) {
    initPromise = identity.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: new URL(`${import.meta.env.BASE_URL || '/'}silent-check-sso.html`, window.location.origin).toString(),
      enableLogging: false,
    });
  }
  return initPromise;
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(configured ? (nativeRuntime ? 'anonymous' : 'loading') : 'disabled');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle');
  const [apiProfile, setApiProfile] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiRetryNonce, setApiRetryNonce] = useState(0);

  const runAuthAction = async (action) => {
    setError(false);
    try {
      await action();
    } catch {
      setError(true);
      setStatus('error');
    }
  };

  const getCurrentAccessToken = async () => {
    if (nativeRuntime) {
      try {
        return await getNativeAccessToken();
      } catch (caught) {
        setUser(null);
        setStatus('anonymous');
        setError(true);
        throw caught;
      }
    }
    if (!identity || !identity.authenticated) throw new Error('Please sign in first.');
    await identity.updateToken(30);
    if (!identity.token) throw new Error('Session expired. Please sign in again.');
    return identity.token;
  };

  const runNativeAuthAction = async () => {
    setError(false);
    try {
      const nativeUser = await beginNativeSignIn();
      setUser(nativeUser);
      setStatus('authenticated');
    } catch (caught) {
      const reason = String(caught?.message || caught || '');
      if (reason.includes('USER_CANCELLED') || reason.toLowerCase().includes('cancelled')) {
        setStatus('anonymous');
        return;
      }
      setError(true);
      setStatus('error');
    }
  };

  const runNativeLogoutAction = async () => {
    setUser(null);
    setApiProfile(null);
    setApiStatus('idle');
    setApiError(null);
    setError(false);
    setStatus('anonymous');
    try {
      await signOutNative();
    } catch {
      // The app session is cleared even if the identity-provider logout browser cannot open.
      setError(true);
    }
  };

  useEffect(() => {
    if (!nativeRuntime) return undefined;
    let active = true;
    let listenerHandle;
    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      if (!isNativeLogoutRedirect(url)) return;
      try { await Browser.close(); } catch { /* The system tab may already be closed. */ }
    }).then((handle) => {
      if (active) listenerHandle = handle;
      else void handle.remove();
    }).catch(() => { /* External logout remains best-effort if listener registration fails. */ });
    return () => {
      active = false;
      if (listenerHandle) void listenerHandle.remove();
    };
  }, []);

  useEffect(() => {
    if (!identity) return undefined;
    let active = true;
    let timeoutId;
    // Keycloak's check-sso can be delayed by browser cookie/iframe restrictions or client redirect settings.
    // Bound the waiting state so sign-in controls become available and the problem is visible to the user.
    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(
        () => reject(new Error('auth_initialization_timeout')),
        AUTH_INITIALIZATION_TIMEOUT_MS,
      );
    });

    Promise.race([initializeIdentity(), timeout])
      .then((authenticated) => {
        if (!active) return;
        const claims = identity.tokenParsed || {};
        setUser(authenticated ? {
          id: typeof claims.sub === 'string' ? claims.sub : undefined,
          name: typeof claims.name === 'string' ? claims.name : undefined,
          email: typeof claims.email === 'string' ? claims.email : undefined,
          emailVerified: claims.email_verified === true,
        } : null);
        setStatus(authenticated ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setStatus('error');
      })
      .finally(() => {
        if (timeoutId) window.clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      setApiStatus('idle');
      setApiProfile(null);
      setApiError(null);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setApiStatus('loading');
    setApiError(null);

    async function loadApiProfile() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
        if (!apiBaseUrl) throw new Error('api_base_url_missing');

        const accessToken = await getCurrentAccessToken();

        const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/v1/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
          credentials: 'omit',
          signal: controller.signal,
        });
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          const code = typeof body?.error === 'string' ? body.error : `http_${response.status}`;
          throw new Error(code);
        }

        if (!active) return;
        setApiProfile(body);
        setApiStatus('ready');
      } catch (caught) {
        if (!active || controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : 'api_request_failed';
        setApiError(message);
        setApiStatus('error');
      }
    }

    void loadApiProfile();
    return () => {
      active = false;
      controller.abort();
    };
  }, [status, user, apiRetryNonce]);

  const value = useMemo(() => ({
    status,
    user,
    configured,
    error,
    apiStatus,
    apiProfile,
    apiError,
    retryApiConnection: () => setApiRetryNonce((value) => value + 1),
    login: () => nativeRuntime ? runNativeAuthAction() : identity ? runAuthAction(() => identity.login({ redirectUri: window.location.href })) : Promise.resolve(),
    // On Android, the Keycloak system-browser page exposes its Register link when realm registration is enabled.
    register: () => nativeRuntime ? runNativeAuthAction() : identity ? runAuthAction(() => identity.register({ redirectUri: window.location.href })) : Promise.resolve(),
    logout: () => nativeRuntime ? runNativeLogoutAction() : identity ? runAuthAction(() => identity.logout({ redirectUri: window.location.origin })) : Promise.resolve(),
    getAccessToken: getCurrentAccessToken,
  }), [status, user, error, apiStatus, apiProfile, apiError, apiRetryNonce]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
