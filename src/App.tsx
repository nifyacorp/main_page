import React from 'react';
import { Routes, Route, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/features/auth';
import { NotificationProvider } from '@/features/notifications';
import { ThemeProvider } from '@/design-system';
import Header from '@/features/common/components/Header';
import routes from './routes';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function App() {
  // Use routes configuration
  const routeElements = useRoutes(routes);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="nifya-ui-theme">
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Header />
              <main className="container mx-auto px-4 py-8">
                {routeElements}
              </main>
              <Toaster />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}