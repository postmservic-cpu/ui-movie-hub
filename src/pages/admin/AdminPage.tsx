import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminMoviesPage from './AdminMoviesPage';
import AdminCategoriesPage from './AdminCategoriesPage';
import AdminCommentsPage from './AdminCommentsPage';
import { Film, FolderTree, MessageSquare } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="movies">
        <TabsList>
          <TabsTrigger value="movies">
            <Film className="h-4 w-4 mr-2" />
            Movies
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movies">
          <AdminMoviesPage />
        </TabsContent>

        <TabsContent value="categories">
          <AdminCategoriesPage />
        </TabsContent>

        <TabsContent value="comments">
          <AdminCommentsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
