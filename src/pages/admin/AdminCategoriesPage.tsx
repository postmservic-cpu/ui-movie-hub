import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { CreateCategorySchema, type CreateCategoryRequest } from '@/api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const { register, handleSubmit, reset } = useForm<CreateCategoryRequest>({
    resolver: zodResolver(CreateCategorySchema),
  });

  const onCreate = (data: CreateCategoryRequest) => {
    createCategory.mutate(data, { onSuccess: () => reset() });
  };

  const onUpdate = (id: number) => {
    updateCategory.mutate(
      { id, data: { name: editName } },
      { onSuccess: () => { setEditingId(null); setEditName(''); } }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      <form onSubmit={handleSubmit(onCreate)} className="flex gap-2 mb-6">
        <Input {...register('name')} placeholder="New category name" className="flex-1" />
        <Button type="submit" disabled={createCategory.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
            ) : categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>
                  {editingId === cat.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    cat.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {editingId === cat.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onUpdate(cat.id)}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this category?')) deleteCategory.mutate(cat.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
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
