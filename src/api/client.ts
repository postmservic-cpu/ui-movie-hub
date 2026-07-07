import axios from 'axios';
import { toast } from 'sonner';
import { User } from 'oidc-client-ts';
import { oidcStorageKey } from '@/auth/keycloak';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const oidcStorage = localStorage.getItem(oidcStorageKey);
  if (oidcStorage) {
    try {
      const user = User.fromStorageString(oidcStorage);
      if (user?.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } catch {
      // ignore malformed OIDC payloads
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasAuthHeader = Boolean(error.config?.headers?.Authorization);
      if (hasAuthHeader) {
        localStorage.removeItem(oidcStorageKey);
        window.location.replace('/');
      }
    } else {
      const message = error.response?.data?.detail || 'An unexpected error occurred';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
