# Wiring the auth UI into the existing site

This guide deliberately does not replace your existing app shell.

## A. Add the OIDC provider in `website/src/main.jsx`

Import:

```jsx
import { AuthProvider } from './auth/AuthProvider.jsx';
```

Wrap the **existing** `App` element in your existing render tree. For example, if the current render contains `<App />`, make it `<AuthProvider><App /></AuthProvider>`. Preserve existing `StrictMode`, providers and render options. Do not create a second React root.

## B. Place account actions in the existing header

In `website/src/App.jsx`, add:

```jsx
import AccountActions from './auth/AccountActions.jsx';
import './auth/auth.css';
```

Then place `<AccountActions />` inside the existing desktop header/navigation container and the mobile menu if appropriate. Do not remove or replace existing navigation items. The best insertion point depends on the exact current header markup, so review it in your local file rather than blindly replacing a block.

## C. Use the authenticated API

From a component under `AuthProvider`:

```jsx
import { useAuth } from './auth/AuthProvider.jsx';

const { getAccessToken } = useAuth();
const token = await getAccessToken();
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/progress`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
const data = await response.json();
```

Keep the token in memory; do not put it in `localStorage`, URLs, query parameters, logs, or analytics. Use parameterized SQL server-side. The server picks the user identity from the verified token, never from the request body.

## D. Important UX contract

- Guest browsing remains available.
- If Keycloak is offline, existing learning screens must not crash.
- This UI only supplies account actions. It does not automatically migrate existing browser-local progress into cloud rows; implement and test an explicit, conflict-aware merge before enabling sync.
- The included account UI works with browser OIDC. A separate secure external-browser OIDC adapter is required for production Capacitor Android authentication.
