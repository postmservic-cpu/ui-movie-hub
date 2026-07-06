import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const oidcStorage = sessionStorage.getItem('oidc.user');
  if (oidcStorage) {
    try {
      const user = JSON.parse(oidcStorage);
      // Use access_token for API calls (not id_token)
      // access_token is used to access protected resources (backend)
      // id_token is used to identify the user (client/UI)
      if (user?.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    } else {
      const message = error.response?.data?.detail || 'An unexpected error occurred';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
