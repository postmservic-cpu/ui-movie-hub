import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { keycloakAuthority, keycloakClientId } from '@/auth/keycloak';

const keycloakConfig = {
  authority: keycloakAuthority,
  client_id: keycloakClientId,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...keycloakConfig}>{children}</AuthProvider>;
}
