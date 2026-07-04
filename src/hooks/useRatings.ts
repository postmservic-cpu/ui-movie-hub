import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '@/api/ratings';
import type { CreateRatingRequest } from '@/api/types';

export function useRatings(movieId: number) {
  return useQuery({
    queryKey: ['ratings', movieId],
    queryFn: () => ratingsApi.getByMovieId(movieId),
    enabled: !!movieId,
  });
}

export function useCreateRating(movieId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRatingRequest) => ratingsApi.create(movieId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', movieId] });
      queryClient.invalidateQueries({ queryKey: ['movie', movieId] });
    },
  });
}
