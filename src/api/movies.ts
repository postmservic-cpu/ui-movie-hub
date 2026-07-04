import apiClient from './client';
import type { MovieResponse, PageMovieResponse, CreateMovieRequest, UpdateMovieRequest } from './types';

export const moviesApi = {
  getAll: (params?: {
    title?: string;
    year?: number;
    categoryId?: number;
    minRating?: number;
    maxRating?: number;
    page?: number;
    size?: number;
  }) => apiClient.get<PageMovieResponse>('/v1/movies', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<MovieResponse>(`/v1/movies/${id}`).then((r) => r.data),

  create: (data: CreateMovieRequest) =>
    apiClient.post<MovieResponse>('/v1/movies', data).then((r) => r.data),

  update: (id: number, data: UpdateMovieRequest) =>
    apiClient.put<MovieResponse>(`/v1/movies/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/v1/movies/${id}`),
};
