import apiClient from './client';
import type { PageCategoryResponse, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from './types';

export const categoriesApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<PageCategoryResponse>('/v1/categories', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CategoryResponse>(`/v1/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<CategoryResponse>('/v1/categories', data).then((r) => r.data),

  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.put<CategoryResponse>(`/v1/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/v1/categories/${id}`),
};
