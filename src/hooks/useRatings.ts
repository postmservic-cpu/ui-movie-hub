import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '@/api/ratings';
import type { CreateRatingRequest, MovieResponse, PageRatingResponse } from '@/api/types';

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
    onSuccess: (response, variables) => {
      // Optimistically recalculate the average rating in the cache
      const movieData = queryClient.getQueryData<MovieResponse>(['movie', movieId]);
      const ratingsData = queryClient.getQueryData<PageRatingResponse>(['ratings', movieId]);

      if (movieData) {
        const existingRating = ratingsData?.content.find((r) => r.userId === response.userId);

        if (existingRating) {
          // User is updating an existing rating: recalculate without changing count
          const oldTotal = movieData.ratingsCount * (movieData.averageRating ?? 0);
          const newAverage = (oldTotal - existingRating.score + variables.score) / movieData.ratingsCount;
          queryClient.setQueryData<MovieResponse>(['movie', movieId], {
            ...movieData,
            averageRating: newAverage,
          });
        } else {
          // User is adding a new rating: recalculate with incremented count
          const oldTotal = movieData.ratingsCount * (movieData.averageRating ?? 0);
          const newCount = movieData.ratingsCount + 1;
          const newAverage = (oldTotal + variables.score) / newCount;
          queryClient.setQueryData<MovieResponse>(['movie', movieId], {
            ...movieData,
            averageRating: newAverage,
            ratingsCount: newCount,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['ratings', movieId] });
      queryClient.invalidateQueries({ queryKey: ['movie', movieId] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
}
