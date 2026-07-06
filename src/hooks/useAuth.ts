import { useEffect, useState } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { getRealmRoles } from '@/auth/keycloak';

export function useAuth() {
  const auth = useOidcAuth();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const bump = () => forceUpdate((value) => value + 1);

    const removeUserLoaded = auth.events.addUserLoaded(bump);
    const removeUserUnloaded = auth.events.addUserUnloaded(bump);
    const removeUserSignedOut = auth.events.addUserSignedOut(bump);
    const removeSilentRenewError = auth.events.addSilentRenewError(bump);

    return () => {
      removeUserLoaded();
      removeUserUnloaded();
      removeUserSignedOut();
      removeSilentRenewError();
    };
  }, [auth.events]);

  const isAdmin = getRealmRoles(auth.user?.access_token).includes('admin');
  const isAuthenticated = auth.isAuthenticated;
  const token = auth.user?.access_token;
  const userId = auth.user?.profile?.sub;
  const displayName = auth.user?.profile?.preferred_username ?? auth.user?.profile?.email ?? '';

  const login = () => auth.signinRedirect();
  const logout = () => auth.signoutRedirect();

  return {
    ...auth,
    displayName,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    token,
    userId,
  };
}
