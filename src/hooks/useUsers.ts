import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';

export function useUsers(params?: { username?: string; email?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
  });
}
