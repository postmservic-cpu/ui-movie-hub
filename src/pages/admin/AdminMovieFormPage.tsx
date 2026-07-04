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
