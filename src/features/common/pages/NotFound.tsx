import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';

const NotFound: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-black mb-6">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="mb-8 text-muted-foreground">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link to={isAuthenticated ? '/dashboard' : '/'}>
            Volver al {isAuthenticated ? 'dashboard' : 'inicio'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;