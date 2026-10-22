import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Keycloak from 'keycloak-js';

const oidcConfig = {
  url: import.meta.env.VITE_OIDC_URL,
  realm: import.meta.env.VITE_OIDC_REALM,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
};
const configured = Boolean(oidcConfig.url && oidcConfig.realm && oidcConfig.clientId);

const identity = configured ? new Keycloak(oidcConfig) : null;
const AuthContext = createContext(null);
let initPromise;

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
  const [status, setStatus] = useState(configured ? 'loading' : 'disabled');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle');
  const [apiProfile, setApiProfile] = useState(null);
  const [apiError, setApiError] = useState(null);

  const runAuthAction = async (action) => {
    setError(false);
    try {
      await action();
    } catch {
      setError(true);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!identity) return undefined;
    let active = true;
    initializeIdentity()
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
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !identity) {
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

        await identity.updateToken(30);
        if (!identity.token) throw new Error('access_token_missing');

        const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/v1/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${identity.token}`,
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
  }, [status, user]);

  const value = useMemo(() => ({
    status,
    user,
    configured,
    error,
    apiStatus,
    apiProfile,
    apiError,
    login: () => identity ? runAuthAction(() => identity.login({ redirectUri: window.location.href })) : Promise.resolve(),
    register: () => identity ? runAuthAction(() => identity.register({ redirectUri: window.location.href })) : Promise.resolve(),
    logout: () => identity ? runAuthAction(() => identity.logout({ redirectUri: window.location.origin })) : Promise.resolve(),
    getAccessToken: async () => {
      if (!identity || !identity.authenticated) throw new Error('Please sign in first.');
      // Tokens stay in the adapter's memory; do not write them to localStorage.
      await identity.updateToken(30);
      if (!identity.token) throw new Error('Session expired. Please sign in again.');
      return identity.token;
    },
  }), [status, user, error, apiStatus, apiProfile, apiError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
