import apiClient from './client';
import type { PageRatingResponse, RatingResponse, CreateRatingRequest } from './types';

export const ratingsApi = {
  getByMovieId: (movieId: number, page = 0, size = 100) =>
    apiClient.get<PageRatingResponse>(`/v1/movies/${movieId}/ratings`, { params: { page, size } }).then((r) => r.data),

  create: (movieId: number, data: CreateRatingRequest) =>
    apiClient.post<RatingResponse>(`/v1/movies/${movieId}/ratings`, data).then((r) => r.data),
};
