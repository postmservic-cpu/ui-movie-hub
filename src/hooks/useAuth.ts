import { useAuth as useOidcAuth } from 'react-oidc-context';

export function useAuth() {
  const auth = useOidcAuth();

  const isAdmin = (auth.user?.profile?.realm_access as Record<string, string[]>)?.roles?.includes('admin') ?? false;
  const isAuthenticated = auth.isAuthenticated;
  // Use access_token for API authorization (not id_token)
  const token = auth.user?.access_token;

  const login = () => auth.signinRedirect();
  const logout = () => auth.signoutRedirect();

  const register = () => {
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const redirectUri = window.location.origin;

    const registerUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid&kc_action=register`;

    window.location.href = registerUrl;
  };

  return { ...auth, isAdmin, isAuthenticated, token, login, logout, register };
}
