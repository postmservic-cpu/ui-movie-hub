import apiClient from './client';
import type { PageUserResponse } from './types';

export const usersApi = {
  getAll: (params?: { username?: string; email?: string; page?: number; size?: number }) =>
    apiClient.get<PageUserResponse>('/v1/users', { params }).then((r) => r.data),
};
