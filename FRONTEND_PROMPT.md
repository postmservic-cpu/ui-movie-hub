# REST Movie Hub — React Frontend Prompt

## Overview

Build a complete React frontend for the Movie Hub REST API. The app allows users to browse movies by category, search/filter, leave comments, and rate movies. Admin users can manage movies and categories via a dashboard.

**Backend API**: `https://rest-api-movie-hub-latest.onrender.com` (production) / `http://localhost:8080` (local)

**API Spec**: `src/main/resources/openapi/api/api-v1-movie-hub.yaml` — source of truth for TypeScript types, Zod schemas, and endpoint signatures

**Swagger UI**: `https://rest-api-movie-hub-latest.onrender.com/swagger-ui/index.html` — interactive testing of the deployed API

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18+ |
| Language | TypeScript |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| State/Data | TanStack Query (React Query) |
| Validation | Zod + React Hook Form |
| Auth | Keycloak (react-oidc-context) |
| HTTP Client | Axios with interceptors |
| Routing | React Router v6+ |
| Icons | Lucide React |

---

## Project Setup

### 1. Initialize Vite Project

```bash
npm create vite@latest movie-hub-ui -- --template react-ts
cd movie-hub-ui
npm install
```

### 2. Install Dependencies

```bash
# Core
npm install react-router-dom axios @tanstack/react-query zod react-hook-form @hookform/resolvers

# Keycloak
npm install react-oidc-context

# UI
npm install tailwindcss @tailwindcss/vite lucide-react
npx shadcn@latest init
npx shadcn@latest add button card input label select dialog table badge avatar dropdown-menu sheet separator tabs toast textarea
```

### 3. Tailwind Config

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=movie-hub
VITE_KEYCLOAK_CLIENT_ID=movie-hub-client
```

---

## Keycloak Integration

### Auth Provider Setup

```tsx
// src/providers/AuthProvider.tsx
import { AuthProvider } from 'react-oidc-context';

const keycloakConfig = {
  authority: import.meta.env.VITE_KEYCLOAK_URL,
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...keycloakConfig}>{children}</AuthProvider>;
}
```

### Auth Hook

```tsx
// src/hooks/useAuth.ts
import { useAuth } from 'react-oidc-context';

export function useAuth() {
  const auth = useAuth();

  const isAdmin = auth.user?.profile?.realm_access?.roles?.includes('admin') ?? false;
  const isAuthenticated = auth.isAuthenticated;
  const token = auth.user?.id_token;

  const login = () => auth.signinRedirect();
  const logout = () => auth.signoutRedirect();

  return { ...auth, isAdmin, isAuthenticated, token, login, logout };
}
```

---

## API Layer

### Axios Instance with JWT Interceptor

```tsx
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const oidcStorage = sessionStorage.getItem('oidc.user');
  if (oidcStorage) {
    const user = JSON.parse(oidcStorage);
    if (user?.id_token) {
      config.headers.Authorization = `Bearer ${user.id_token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Functions

```tsx
// src/api/movies.ts
import apiClient from './client';
import { MovieResponse, PageMovieResponse, CreateMovieRequest, UpdateMovieRequest } from './types';

export const moviesApi = {
  getAll: (params?: {
    title?: string;
    year?: number;
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
```

```tsx
// src/api/categories.ts
import apiClient from './client';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from './types';

export const categoriesApi = {
  getAll: () =>
    apiClient.get<CategoryResponse[]>('/v1/categories').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CategoryResponse>(`/v1/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<CategoryResponse>('/v1/categories', data).then((r) => r.data),

  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.put<CategoryResponse>(`/v1/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/v1/categories/${id}`),
};
```

```tsx
// src/api/comments.ts
import apiClient from './client';
import { CommentResponse, CreateCommentRequest } from './types';

export const commentsApi = {
  getByMovieId: (movieId: number) =>
    apiClient.get<CommentResponse[]>(`/v1/movies/${movieId}/comments`).then((r) => r.data),

  create: (movieId: number, data: CreateCommentRequest) =>
    apiClient.post<CommentResponse>(`/v1/movies/${movieId}/comments`, data).then((r) => r.data),

  delete: (movieId: number, commentId: number) =>
    apiClient.delete(`/v1/movies/${movieId}/comments/${commentId}`),
};
```

```tsx
// src/api/ratings.ts
import apiClient from './client';
import { RatingResponse, CreateRatingRequest } from './types';

export const ratingsApi = {
  getByMovieId: (movieId: number) =>
    apiClient.get<RatingResponse[]>(`/v1/movies/${movieId}/ratings`).then((r) => r.data),

  create: (movieId: number, data: CreateRatingRequest) =>
    apiClient.post<RatingResponse>(`/v1/movies/${movieId}/ratings`, data).then((r) => r.data),
};
```

---

## TypeScript Types (Zod Schemas)

```tsx
// src/api/types.ts
import { z } from 'zod';

// === Movie ===
export const CreateMovieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  releaseYear: z.number().int().min(1900).max(2100),
  categoryId: z.number().int().positive(),
});

export const UpdateMovieSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  description: z.string().optional(),
  releaseYear: z.number().int().min(1900).max(2100),
  categoryId: z.number().int().positive(),
});

export type CreateMovieRequest = z.infer<typeof CreateMovieSchema>;
export type UpdateMovieRequest = z.infer<typeof UpdateMovieSchema>;

export interface MovieResponse {
  id: number;
  title: string;
  imageUrl: string;
  description: string | null;
  releaseYear: number;
  categoryId: number;
  categoryName: string;
  averageRating: number | null;
  ratingsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageMovieResponse {
  content: MovieResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// === Category ===
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;

export interface CategoryResponse {
  id: number;
  name: string;
}

// === Comment ===
export const CreateCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;

export interface CommentResponse {
  id: number;
  movieId: number;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

// === Rating ===
export const CreateRatingSchema = z.object({
  score: z.number().int().min(1).max(10),
});

export type CreateRatingRequest = z.infer<typeof CreateRatingSchema>;

export interface RatingResponse {
  id: number;
  movieId: number;
  userId: string;
  username: string;
  score: number;
  createdAt: string;
}
```

---

## TanStack Query Hooks

```tsx
// src/hooks/useMovies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies';
import { CreateMovieRequest, UpdateMovieRequest } from '@/api/types';

export function useMovies(params?: {
  title?: string;
  year?: number;
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
```

```tsx
// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/api/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) => categoriesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
```

```tsx
// src/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { CreateCommentRequest } from '@/api/types';

export function useComments(movieId: number) {
  return useQuery({
    queryKey: ['comments', movieId],
    queryFn: () => commentsApi.getByMovieId(movieId),
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
```

```tsx
// src/hooks/useRatings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '@/api/ratings';
import { CreateRatingRequest } from '@/api/types';

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
```

---

## Routing

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProviderWrapper } from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminMovieFormPage from './pages/admin/AdminMovieFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderWrapper>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="movies/:id" element={<MovieDetailPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* Admin Routes */}
              <Route path="admin" element={<AdminRoute />}>
                <Route path="movies" element={<AdminMoviesPage />} />
                <Route path="movies/new" element={<AdminMovieFormPage />} />
                <Route path="movies/:id/edit" element={<AdminMovieFormPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProviderWrapper>
    </QueryClientProvider>
  );
}
```

---

## Pages

### Home Page — Movie Grid with Filters

```tsx
// src/pages/HomePage.tsx
import { useState } from 'react';
import { useMovies } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import MovieCard from '@/components/MovieCard';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [page, setPage] = useState(0);
  const size = 12;

  const { data, isLoading } = useMovies({
    title: search || undefined,
    year: selectedYear ? Number(selectedYear) : undefined,
    page,
    size,
  });

  const years = Array.from({ length: 20 }, (_, i) => 2026 - i);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movies</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setPage(0); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.content.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Movie Detail Page

```tsx
// src/pages/MovieDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useMovie } from '@/hooks/useMovies';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useRatings, useCreateRating } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCommentSchema, CreateCommentRequest, CreateRatingRequest } from '@/api/types';
import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { isAuthenticated, isAdmin, user } = useAuth();

  const { data: movie, isLoading: movieLoading } = useMovie(movieId);
  const { data: comments = [] } = useComments(movieId);
  const { data: ratings = [] } = useRatings(movieId);

  const createComment = useCreateComment(movieId);
  const deleteComment = useDeleteComment(movieId);
  const createRating = useCreateRating(movieId);

  const { register, handleSubmit, reset } = useForm<CreateCommentRequest>({
    resolver: zodResolver(CreateCommentSchema),
  });

  const onSubmitComment = (data: CreateCommentRequest) => {
    createComment.mutate(data, { onSuccess: () => reset() });
  };

  const handleRate = (score: number) => {
    createRating.mutate({ score });
  };

  if (movieLoading) return <div className="container mx-auto p-8">Loading...</div>;
  if (!movie) return <div className="container mx-auto p-8">Movie not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="md:col-span-1">
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">{movie.categoryName}</Badge>
            <Badge variant="outline">{movie.releaseYear}</Badge>
          </div>
          {movie.description && (
            <p className="text-muted-foreground mb-6">{movie.description}</p>
          )}

          {/* Rating Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Rate this movie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                  <Button
                    key={score}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRate(score)}
                    disabled={!isAuthenticated}
                  >
                    {score}
                  </Button>
                ))}
              </div>
              {movie.averageRating && (
                <p className="text-sm text-muted-foreground mt-2">
                  Average: {movie.averageRating.toFixed(1)}/5 ({movie.ratingsCount} votes)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated && (
                <form onSubmit={handleSubmit(onSubmitComment)} className="mb-6">
                  <Textarea {...register('text')} placeholder="Write a comment..." className="mb-2" />
                  <Button type="submit" disabled={createComment.isPending}>
                    {createComment.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              )}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {(isAdmin || comment.userId === user?.sub) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### Admin — Movie List

```tsx
// src/pages/admin/AdminMoviesPage.tsx
import { useMovies, useDeleteMovie } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminMoviesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMovies({ page, size: 20 });
  const deleteMovie = useDeleteMovie();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Movies</h1>
        <Link to="/admin/movies/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Movie</Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
            ) : data?.content.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell className="font-medium">{movie.title}</TableCell>
                <TableCell><Badge variant="secondary">{movie.categoryName}</Badge></TableCell>
                <TableCell>{movie.releaseYear}</TableCell>
                <TableCell>{movie.averageRating?.toFixed(1) ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link to={`/admin/movies/${movie.id}/edit`}>
                      <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this movie?')) deleteMovie.mutate(movie.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### Admin — Movie Form (Create/Edit)

```tsx
// src/pages/admin/AdminMovieFormPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useMovie, useCreateMovie, useUpdateMovie } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import { CreateMovieSchema, UpdateMovieSchema, CreateMovieRequest } from '@/api/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

export default function AdminMovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: movie } = useMovie(Number(id));
  const { data: categories = [] } = useCategories();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();

  const { register, handleSubmit, setValue, watch, reset } = useForm<CreateMovieRequest>({
    resolver: zodResolver(isEdit ? UpdateMovieSchema : CreateMovieSchema),
  });

  useEffect(() => {
    if (movie) {
      reset({
        title: movie.title,
        imageUrl: movie.imageUrl,
        description: movie.description ?? '',
        releaseYear: movie.releaseYear,
        categoryId: movie.categoryId,
      });
    }
  }, [movie, reset]);

  const onSubmit = (data: CreateMovieRequest) => {
    if (isEdit) {
      updateMovie.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/admin/movies') }
      );
    } else {
      createMovie.mutate(data, { onSuccess: () => navigate('/admin/movies') });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Edit Movie' : 'Add Movie'}
      </h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input {...register('title')} />
            </div>
            <div>
              <Label>Image URL *</Label>
              <Input {...register('imageUrl')} placeholder="https://..." />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Release Year *</Label>
                <Input type="number" {...register('releaseYear', { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select
                  value={watch('categoryId')?.toString()}
                  onValueChange={(v) => setValue('categoryId', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/movies')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMovie.isPending || updateMovie.isPending}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Admin — Categories

```tsx
// src/pages/admin/AdminCategoriesPage.tsx
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { CreateCategorySchema, CreateCategoryRequest } from '@/api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const { register, handleSubmit, reset } = useForm<CreateCategoryRequest>({
    resolver: zodResolver(CreateCategorySchema),
  });

  const onCreate = (data: CreateCategoryRequest) => {
    createCategory.mutate(data, { onSuccess: () => reset() });
  };

  const onUpdate = (id: number) => {
    updateCategory.mutate(
      { id, data: { name: editName } },
      { onSuccess: () => { setEditingId(null); setEditName(''); } }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      {/* Add Form */}
      <form onSubmit={handleSubmit(onCreate)} className="flex gap-2 mb-6">
        <Input {...register('name')} placeholder="New category name" className="flex-1" />
        <Button type="submit" disabled={createCategory.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {/* Category List */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
            ) : categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>
                  {editingId === cat.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    cat.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {editingId === cat.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onUpdate(cat.id)}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this category?')) deleteCategory.mutate(cat.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## Reusable Components

### MovieCard

```tsx
// src/components/MovieCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MovieResponse } from '@/api/types';

interface MovieCardProps {
  movie: MovieResponse;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movies/${movie.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{movie.categoryName}</Badge>
            <span className="text-sm text-muted-foreground">{movie.releaseYear}</span>
          </div>
          {movie.averageRating && (
            <p className="text-sm text-muted-foreground mt-2">
              ★ {movie.averageRating.toFixed(1)} ({movie.ratingsCount} votes)
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Layout with Navigation

```tsx
// src/components/Layout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Film, LogIn, LogOut, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, isAdmin, login, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Film className="h-6 w-6" />
            Movie Hub
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated && isAdmin && (
              <Link to="/admin/movies">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user?.profile?.preferred_username}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={login}>
                <LogIn className="h-4 w-4 mr-1" /> Login
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

### Protected Route / Admin Route

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

```tsx
// src/components/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

---

## API Source & Endpoints

**Three resources to reference:**

| Resource | Purpose |
|----------|---------|
| `src/main/resources/openapi/api/api-v1-movie-hub.yaml` | Source of truth — read this for exact field names, types, required fields, and endpoint signatures |
| `https://rest-api-movie-hub-latest.onrender.com/swagger-ui/index.html` | Interactive Swagger UI — test endpoints live against deployed backend |
| `https://rest-api-movie-hub-latest.onrender.com` | Base URL for all API calls in the frontend |

**Workflow:** Read the local `.yaml` file to generate TypeScript types and Zod schemas. Use the Swagger UI to verify responses match your types. Configure the frontend to call the deployed API.

### API Endpoints (14 total)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/movies` | Public | List movies (paginated, filterable) |
| GET | `/v1/movies/{id}` | Public | Get movie detail |
| POST | `/v1/movies` | Admin | Create movie |
| PUT | `/v1/movies/{id}` | Admin | Update movie |
| DELETE | `/v1/movies/{id}` | Admin | Delete movie |
| GET | `/v1/categories` | Public | List all categories |
| GET | `/v1/categories/{id}` | Public | Get category |
| POST | `/v1/categories` | Admin | Create category |
| PUT | `/v1/categories/{id}` | Admin | Update category |
| DELETE | `/v1/categories/{id}` | Admin | Delete category |
| GET | `/v1/movies/{id}/comments` | Public | Get comments |
| POST | `/v1/movies/{id}/comments` | Auth | Add comment |
| DELETE | `/v1/movies/{movieId}/comments/{commentId}` | Admin/Author | Delete comment |
| POST | `/v1/movies/{id}/ratings` | Auth | Rate movie (1-10) |

---

## Error Handling

All API errors use RFC 9457 `ProblemDetail` format:

```json
{
  "type": "string",
  "title": "string",
  "status": 400,
  "detail": "string",
  "instance": "string"
}
```

Use a global error handler in Axios interceptor and display errors via shadcn/ui Toast:

```tsx
// src/api/client.ts — error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);
```
