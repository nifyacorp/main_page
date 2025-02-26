import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <div className="max-w-md">
        <h1 className="text-6xl font-black mb-6">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="mb-8 text-muted-foreground">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-block btn-neobrutalism-primary px-6 py-3 text-white font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 