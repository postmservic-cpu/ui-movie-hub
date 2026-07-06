import apiClient from './client';
import type { PageCommentResponse, CommentResponse, CreateCommentRequest } from './types';

export const commentsApi = {
  getByMovieId: (movieId: number, page = 0, size = 100) =>
    apiClient.get<PageCommentResponse>(`/v1/movies/${movieId}/comments`, { params: { page, size } }).then((r) => r.data),

  create: (movieId: number, data: CreateCommentRequest) =>
    apiClient.post<CommentResponse>(`/v1/movies/${movieId}/comments`, data).then((r) => r.data),

  delete: (movieId: number, commentId: number) =>
    apiClient.delete(`/v1/movies/${movieId}/comments/${commentId}`),
};
