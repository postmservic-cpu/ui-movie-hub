import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import type { MovieResponse } from '@/api/types';

interface MovieCardProps {
  movie: MovieResponse;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movies/${movie.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{movie.categoryName}</Badge>
            <span className="text-sm text-muted-foreground">{movie.releaseYear}</span>
          </div>
          {movie.averageRating && (
            <p className="text-sm text-muted-foreground mt-2">
              ★ {movie.averageRating.toFixed(1)} ({movie.ratingsCount} votes)
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
