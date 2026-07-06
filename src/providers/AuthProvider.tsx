import { AuthProvider } from 'react-oidc-context';

const keycloakBaseUrl = import.meta.env.VITE_KEYCLOAK_URL.replace(/\/$/, '');
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
const keycloakAuthority = `${keycloakBaseUrl}/realms/${keycloakRealm}`;

const keycloakConfig = {
  authority: keycloakAuthority,
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
