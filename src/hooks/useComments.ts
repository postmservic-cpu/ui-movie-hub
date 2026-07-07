import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import type { CreateCommentRequest } from '@/api/types';

export function useComments(movieId: number, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['comments', movieId, params],
    queryFn: () => commentsApi.getByMovieId(movieId, params?.page, params?.size),
    enabled: !!movieId,
  });
}

export function useCreateComment(movieId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.create(movieId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', movieId] }),
  });
}

export function useDeleteComment(movieId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(movieId, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', movieId] }),
  });
}
