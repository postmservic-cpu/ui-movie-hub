import { useMovies, useDeleteMovie } from '@/hooks/useMovies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminMoviesPage() {
  const { data, isLoading } = useMovies({ page: 0, size: 100 });
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
