import { useState } from 'react';
import { useAllComments, useAdminDeleteComment } from '@/hooks/useComments';
import { useMovies } from '@/hooks/useMovies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

export default function AdminCommentsPage() {
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAllComments({
    username: username || undefined,
    text: text || undefined,
    page,
    size: PAGE_SIZE,
  });
  const comments = data?.content ?? [];
  const deleteComment = useAdminDeleteComment();

  const { data: moviesData } = useMovies({ page: 0, size: 100 });
  const movies = moviesData?.content ?? [];
  const movieMap = new Map(movies.map((m) => [m.id, m.title]));

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by username..."
            value={username}
            onChange={(e) => { setUsername(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in comment text..."
            value={text}
            onChange={(e) => { setText(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
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
            ) : comments.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No comments found</TableCell></TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell>{movieMap.get(comment.movieId) ?? `#${comment.movieId}`}</TableCell>
                  <TableCell>{comment.username}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{comment.text}</TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this comment?')) {
                          deleteComment.mutate({ movieId: comment.movieId, commentId: comment.id });
                        }
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

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
    </div>
  );
}
