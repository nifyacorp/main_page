import React from 'react';
import { FallbackProps } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <div className="max-w-md p-6 bg-card rounded-lg shadow-lg border border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h1>
        <p className="mb-4">Se produjo un error al cargar esta página.</p>
        <div className="p-4 bg-muted rounded-md mb-6 text-left overflow-auto max-h-48">
          <p className="text-sm font-mono text-destructive">
            {error.message || 'Error desconocido'}
          </p>
        </div>
        <div className="flex space-x-4 justify-center">
          <button 
            onClick={resetErrorBoundary}
            className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
          >
            Intentar de nuevo
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;