import { useAuth } from './AuthProvider.jsx';

export default function AccountActions() {
  const auth = useAuth();

  if (auth.status === 'disabled') return null;
  if (auth.status === 'loading') return null;
  if (auth.user) {
    return (
      <div className="ocp-account-actions">
        <span className="ocp-account-identity" title={auth.user.email || auth.user.name || 'Signed in'}>
          {auth.user.name || auth.user.email || 'Signed in'}
        </span>
        <button className="ocp-account-button ocp-account-button-secondary" type="button" onClick={() => void auth.logout()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="ocp-account-actions">
      <button className="ocp-account-button ocp-account-button-secondary" type="button" onClick={() => void auth.login()}>
        Sign in
      </button>
      <button className="ocp-account-button ocp-account-button-primary" type="button" onClick={() => void auth.register()}>
        Create account
      </button>
    </div>
  );
}
