import { AuthProvider } from 'react-oidc-context';

const keycloakConfig = {
  authority: import.meta.env.VITE_KEYCLOAK_URL,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...keycloakConfig}>{children}</AuthProvider>;
}
