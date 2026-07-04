import { useState } from 'react';
import { useMovies, useMovieYears } from '@/hooks/useMovies';
import { useCategories } from '@/hooks/useCategories';
import MovieCard from '@/components/MovieCard';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(0);
  const size = 12;

  const { data, isLoading } = useMovies({
    title: search || undefined,
    year: selectedYear && selectedYear !== 'all' ? Number(selectedYear) : undefined,
    categoryId: selectedCategory && selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
    page,
    size,
  });

  const { data: categories = [] } = useCategories();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movies</h1>

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
        <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v === 'all' || v === null ? '' : v); setPage(0); }} items={yearItems}>
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
        <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v === 'all' || v === null ? '' : v); setPage(0); }} items={categoryItems}>
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
