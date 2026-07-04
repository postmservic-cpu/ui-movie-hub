import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Film, LogIn, LogOut, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, isAdmin, login, logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.location.href = '/';
              }
            }}
          >
            <Film className="h-6 w-6" />
            Movie Hub
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated && isAdmin && (
              <Link to="/admin/movies">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Admin
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {(user?.profile as Record<string, string>)?.preferred_username}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={login}>
                <LogIn className="h-4 w-4 mr-1" /> Login
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
