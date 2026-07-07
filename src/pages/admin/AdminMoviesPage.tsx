import { useState } from 'react';
import { useMovies, useMovieYears, useDeleteMovie } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function AdminMoviesPage() {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data, isLoading } = useMovies({
    title: search || undefined,
    year: selectedYear && selectedYear !== 'all' ? Number(selectedYear) : undefined,
    categoryId: selectedCategory && selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
    page: 0,
    size: 200,
  });
  const deleteMovie = useDeleteMovie();

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.content ?? [];
  const { data: yearsData } = useMovieYears();
  const years = yearsData?.content ?? [];

  const yearItems = [
    { value: 'all', label: 'All years' },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  const categoryItems = [
    { value: 'all', label: 'All categories' },
    ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Movies</h2>
        <Link to="/admin/movies/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Add Movie</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v === 'all' || v === null ? '' : v)} items={yearItems}>
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
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v === 'all' || v === null ? '' : v)} items={categoryItems}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
