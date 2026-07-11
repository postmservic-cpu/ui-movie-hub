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

export interface PageCategoryResponse {
  content: CategoryResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// === Comment ===
export const CreateCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
});

export const UpdateCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentRequest = z.infer<typeof UpdateCommentSchema>;

export interface CommentResponse {
  id: number;
  movieId: number;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageCommentResponse {
  content: CommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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

export interface PageRatingResponse {
  content: RatingResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// === Page Integer (years) ===
export interface PageInteger {
  content: number[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
