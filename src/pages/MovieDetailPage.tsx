import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMovie } from '@/hooks/useMovies';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments';
import { useCreateRating, useRatings } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCommentSchema, UpdateCommentSchema, type CreateCommentRequest, type UpdateCommentRequest } from '@/api/types';
import { ArrowLeft, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);
  const { isAuthenticated, isAdmin, userId } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const { data: movie, isLoading: movieLoading } = useMovie(movieId);
  const { data: commentsData } = useComments(movieId);
  const comments = commentsData?.content ?? [];
  const { data: ratingsData } = useRatings(movieId);

  const createComment = useCreateComment(movieId);
  const updateComment = useUpdateComment(movieId);
  const deleteComment = useDeleteComment(movieId);
  const createRating = useCreateRating(movieId);

  useEffect(() => {
    if (ratingsData?.content && userId) {
      const myRating = ratingsData.content.find((r) => r.userId === userId);
      if (myRating) {
        setSelectedRating(myRating.score);
      }
    }
  }, [ratingsData, userId]);

  const { register, handleSubmit, reset } = useForm<CreateCommentRequest>({
    resolver: zodResolver(CreateCommentSchema),
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setEditValue } = useForm<UpdateCommentRequest>({
    resolver: zodResolver(UpdateCommentSchema),
  });

  const onSubmitComment = (data: CreateCommentRequest) => {
    if (createComment.isPending) return;
    createComment.mutate(data, { onSuccess: () => reset() });
  };

  const startEditing = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditValue('text', currentText);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    resetEdit();
  };

  const onSubmitEdit = (commentId: number, data: UpdateCommentRequest) => {
    if (updateComment.isPending) return;
    updateComment.mutate({ commentId, data }, {
      onSuccess: () => {
        setEditingCommentId(null);
        resetEdit();
      },
    });
  };

  const handleRate = (score: number) => {
    if (createRating.isPending) return;
    setSelectedRating(score);
    createRating.mutate({ score });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  if (movieLoading) return <div className="container mx-auto p-8">Loading...</div>;
  if (!movie) return <div className="container mx-auto p-8">Movie not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="pl-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to movies
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">{movie.categoryName}</Badge>
            <Badge variant="outline">{movie.releaseYear}</Badge>
          </div>
          {movie.description && (
            <p className="text-muted-foreground mb-6">{movie.description}</p>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Rate this movie</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRating !== null && (
                <p className="mb-3 text-sm text-muted-foreground">
                  Selected rating: <span className="font-medium text-foreground">{selectedRating}/10</span>
                </p>
              )}
              {createRating.isPending && (
                <p className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving your rating...
                </p>
              )}
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                  <Button
                    key={score}
                    variant={selectedRating === score ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRate(score)}
                    disabled={!isAuthenticated || createRating.isPending}
                    aria-pressed={selectedRating === score}
                    className={selectedRating === score ? 'ring-2 ring-primary/30 shadow-sm' : ''}
                  >
                    {createRating.isPending && selectedRating === score ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      score
                    )}
                  </Button>
                ))}
              </div>
              {movie.averageRating && (
                <p className="text-sm text-muted-foreground mt-2">
                  Average: {movie.averageRating.toFixed(1)}/10 ({movie.ratingsCount} votes)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated && (
                <form onSubmit={handleSubmit(onSubmitComment)} className="mb-6">
                  <Textarea
                    {...register('text')}
                    placeholder="Write a comment..."
                    className="mb-2"
                    disabled={createComment.isPending}
                  />
                  <Button type="submit" disabled={createComment.isPending}>
                    {createComment.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Post Comment'
                    )}
                  </Button>
                </form>
              )}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <span className="text-sm text-muted-foreground ml-2">(edited)</span>
                        )}
                      </div>
                      {(isAdmin || comment.userId === userId) && (
                        <div className="flex gap-1">
                          {comment.userId === userId && editingCommentId !== comment.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(comment.id, comment.text)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this comment?')) {
                                deleteComment.mutate(comment.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <form onSubmit={handleSubmitEdit((data) => onSubmitEdit(comment.id, data))} className="mt-2">
                        <Textarea
                          {...registerEdit('text')}
                          className="mb-2"
                          disabled={updateComment.isPending}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={updateComment.isPending}>
                            {updateComment.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Save
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={cancelEditing} disabled={updateComment.isPending}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-1">{comment.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
