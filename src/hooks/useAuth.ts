import { useAuth as useOidcAuth } from 'react-oidc-context';

export function useAuth() {
  const auth = useOidcAuth();

  const isAdmin = (auth.user?.profile?.realm_access as Record<string, string[]>)?.roles?.includes('admin') ?? false;
  const isAuthenticated = auth.isAuthenticated;
  const token = auth.user?.id_token;

  const login = () => auth.signinRedirect();
  const logout = () => auth.signoutRedirect();

  return { ...auth, isAdmin, isAuthenticated, token, login, logout };
}
