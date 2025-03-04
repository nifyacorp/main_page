import React from 'react';
import MainLayout from '../components/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const Landing: React.FC = () => {
  console.log('Landing: Component rendering');
  
  return (
    <ErrorBoundary section="Landing page">
      <MainLayout hideNav={true}>
        <div className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-8">
                <img 
                  src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" 
                  alt="NIFYA Logo" 
                  className="w-24 h-24 mx-auto border-4 border-primary rounded-full shadow-lg"
                />
              </div>
              <h1 className="text-4xl font-bold sm:text-6xl">
                NIFYA
              </h1>
              <p className="mt-4 text-xl font-medium text-primary">
                Notificaciones inteligentes impulsadas por IA
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl">
                Descubre información relevante antes que nadie: BOE, inmobiliarias y todo lo que necesites.
              </p>
              <div className="mt-10">
                <a 
                  href="/auth" 
                  className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-md shadow-md hover:bg-primary/90 transition-colors"
                >
                  Empezar ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default Landing; 