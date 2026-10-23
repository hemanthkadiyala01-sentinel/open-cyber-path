import { useAuth } from './AuthProvider.jsx';

export default function AccountActions() {
  const auth = useAuth();

  if (auth.status === 'disabled') {
    return <div className="ocp-account-actions" role="status"><span className="ocp-account-status">Sign-in is not configured on this deployment. Configure VITE_OIDC_URL, VITE_OIDC_REALM, and VITE_OIDC_CLIENT_ID.</span></div>;
  }
  if (auth.status === 'loading') {
    return <div className="ocp-account-actions" role="status"><span className="ocp-account-status">Checking account session...</span></div>;
  }
  if (auth.user) {
    return (
      <div className="ocp-account-actions">
        <span className="ocp-account-identity" title={auth.user.email || auth.user.name || 'Signed in'}>
          {auth.user.name || auth.user.email || 'Signed in'}
        </span>
        {auth.apiStatus === 'error' && <span className="ocp-account-api-status ocp-account-api-status-error" role="status">Account API unavailable</span>}
        {auth.apiStatus === 'error' && <button className="ocp-account-button ocp-account-button-secondary" type="button" onClick={() => auth.retryApiConnection()}>Retry API</button>}
        <button className="ocp-account-button ocp-account-button-secondary" type="button" onClick={() => void auth.logout()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="ocp-account-actions">
      {auth.error && <span className="ocp-account-status" role="alert">Sign-in did not complete. Check the identity provider and this app's allowed redirect URI/web origin, then try again.</span>}
      <button className="ocp-account-button ocp-account-button-secondary" type="button" onClick={() => void auth.login()}>
        Sign in
      </button>
      <button className="ocp-account-button ocp-account-button-primary" type="button" onClick={() => void auth.register()}>
        Create account
      </button>
    </div>
  );
}
