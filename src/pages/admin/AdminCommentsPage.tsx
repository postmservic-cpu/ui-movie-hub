import { useState } from 'react';
import { useAllComments } from '@/hooks/useComments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
              <TableHead>Movie ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
            ) : comments.length === 0 ? (
              <TableRow><TableCell colSpan={5}>No comments found</TableCell></TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell>{comment.movieId}</TableCell>
                  <TableCell>{comment.username}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{comment.text}</TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
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
