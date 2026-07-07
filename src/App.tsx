import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProviderWrapper } from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/admin/AdminPage';
import AdminMovieFormPage from './pages/admin/AdminMovieFormPage';
import AdminRoute from './components/AdminRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderWrapper>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="movies/:id" element={<MovieDetailPage />} />
              <Route path="login" element={<LoginPage />} />

              <Route path="admin" element={<AdminRoute />}>
                <Route index element={<AdminPage />} />
                <Route path="movies/new" element={<AdminMovieFormPage />} />
                <Route path="movies/:id/edit" element={<AdminMovieFormPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProviderWrapper>
    </QueryClientProvider>
  );
}
