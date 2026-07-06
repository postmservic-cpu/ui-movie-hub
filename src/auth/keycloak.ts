import { User } from 'oidc-client-ts';

const keycloakBaseUrl = import.meta.env.VITE_KEYCLOAK_URL.replace(/\/$/, '');

export const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
export const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
export const keycloakAuthority = `${keycloakBaseUrl}/realms/${keycloakRealm}`;
export const oidcStorageKey = `oidc.user:${keycloakAuthority}:${keycloakClientId}`;

type RealmAccessToken = {
  realm_access?: {
    roles?: string[];
  };
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

export function decodeJwtPayload<T>(token?: string): T | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as T;
  } catch {
    return null;
  }
}

export function getRealmRoles(accessToken?: string) {
  const payload = decodeJwtPayload<RealmAccessToken>(accessToken);
  return payload?.realm_access?.roles ?? [];
}

export function getStoredOidcUser() {
  const storage = window.localStorage.getItem(oidcStorageKey);
  if (!storage) return null;

  try {
    return User.fromStorageString(storage);
  } catch {
    return null;
  }
}
