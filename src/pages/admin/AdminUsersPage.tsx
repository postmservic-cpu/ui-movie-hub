import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useUsers({
    username: username || undefined,
    email: email || undefined,
    page,
    size: PAGE_SIZE,
  });
  const users = data?.content ?? [];

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
            placeholder="Filter by email..."
            value={email}
            onChange={(e) => { setEmail(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Keycloak ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4}>No users found</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{user.keycloakId}</TableCell>
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
