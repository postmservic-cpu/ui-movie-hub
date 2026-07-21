import { useParams, useNavigate } from 'react-router-dom';
import { useMovie, useCreateMovie, useUpdateMovie } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import { CreateMovieSchema, UpdateMovieSchema, type CreateMovieRequest } from '@/api/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminMovieFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: movie, isLoading: movieLoading } = useMovie(Number(id));
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.content ?? [];
  const isDataReady = isEdit ? !movieLoading && !categoriesLoading : !categoriesLoading;
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();

  const [imgError, setImgError] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<CreateMovieRequest>({
    resolver: zodResolver(isEdit ? UpdateMovieSchema : CreateMovieSchema),
    values: isDataReady && movie
      ? {
          title: movie.title,
          imageUrl: movie.imageUrl,
          description: movie.description ?? '',
          releaseYear: movie.releaseYear,
          categoryId: movie.categoryId,
        }
      : undefined,
  });

  const imageUrl = watch('imageUrl');

  const onSubmit = (data: CreateMovieRequest) => {
    if (isEdit) {
      updateMovie.mutate(
        { id: Number(id), data },
        { onSuccess: () => toast.success('Movie updated successfully') }
      );
    } else {
      createMovie.mutate(data, { onSuccess: () => navigate('/admin') });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/movies')}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Movie' : 'Add Movie'}
        </h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          {!isDataReady ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input {...register('title')} />
            </div>
            <div>
              <Label>Image URL *</Label>
              <Input {...register('imageUrl')} placeholder="https://..." />
              {imageUrl && (
                <div className="mt-2 relative w-full max-w-sm overflow-hidden rounded-lg border">
                  {imgError ? (
                    <div className="flex items-center justify-center h-40 bg-muted text-muted-foreground text-sm">
                      Failed to load image
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-60 object-contain"
                      onError={() => setImgError(true)}
                      onLoad={() => setImgError(false)}
                    />
                  )}
                </div>
              )}
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
                  key={watch('categoryId')?.toString() || '_'}
                  value={watch('categoryId')?.toString()}
                  onValueChange={(v) => setValue('categoryId', Number(v))}
                  items={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
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
              <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMovie.isPending || updateMovie.isPending}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
