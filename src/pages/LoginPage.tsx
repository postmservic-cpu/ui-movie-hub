import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Movie Hub</h1>
      <p className="text-muted-foreground mb-8">Sign in to rate movies and leave comments</p>
      <Button size="lg" onClick={login}>
        <LogIn className="h-5 w-5 mr-2" /> Sign in with Keycloak
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button onClick={register} className="text-primary hover:underline">
          Register here
        </button>
      </p>
    </div>
  );
}
