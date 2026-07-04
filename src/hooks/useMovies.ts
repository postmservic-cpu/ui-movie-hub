import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies';
import type { CreateMovieRequest, UpdateMovieRequest } from '@/api/types';

export function useMovies(params?: {
  title?: string;
  year?: number;
  categoryId?: number;
  minRating?: number;
  maxRating?: number;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => moviesApi.getAll(params),
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMovieRequest) => moviesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMovieRequest }) => moviesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => moviesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
  });
}
