import { useState } from 'react';
import { useMovies } from '@/hooks/useMovies';
import { useComments, useDeleteComment } from '@/hooks/useComments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

export default function AdminCommentsPage() {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [page, setPage] = useState(0);
  const { data: moviesData } = useMovies({ page: 0, size: 200 });
  const movies = moviesData?.content ?? [];

  const movieId = selectedMovieId && selectedMovieId !== 'all' ? Number(selectedMovieId) : 0;
  const { data: commentsData, isLoading } = useComments(movieId, { page, size: PAGE_SIZE });
  const comments = commentsData?.content ?? [];
  const deleteComment = useDeleteComment(movieId);

  const movieItems = [
    { value: 'all', label: 'All movies' },
    ...movies.map((m) => ({ value: String(m.id), label: m.title })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedMovieId} onValueChange={(v) => { setSelectedMovieId(v === null ? '' : v); setPage(0); }} items={movieItems}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a movie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All movies</SelectItem>
            {movies.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
            ) : !selectedMovieId || selectedMovieId === 'all' ? (
              <TableRow><TableCell colSpan={6}>Select a movie to view comments</TableCell></TableRow>
            ) : comments.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No comments found</TableCell></TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell>{movies.find((m) => m.id === comment.movieId)?.title ?? comment.movieId}</TableCell>
                  <TableCell>{comment.username}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{comment.text}</TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this comment?')) deleteComment.mutate(comment.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMovieId && selectedMovieId !== 'all' && (
        <Pagination page={page} totalPages={commentsData?.totalPages ?? 0} onPageChange={setPage} />
      )}
    </div>
  );
}
