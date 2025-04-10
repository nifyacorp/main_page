import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ClipboardCheck, PieChart } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import AuthErrorHandler from './components/App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SubscriptionDetail from './pages/SubscriptionDetail';
import SubscriptionPrompt from './pages/SubscriptionPrompt';
import TemplateConfig from './pages/TemplateConfig';
import Notifications from './pages/Notifications';
import NewSubscription from './pages/NewSubscription';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleCallback from './components/GoogleCallback';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Debug from './components/Debug';
import LoadingPage from './components/LoadingPage';
import SubscriptionTypes from './pages/SubscriptionTypes';

// Lazy-load the pages
const LandingPage = lazy(() => import('./pages/Landing'));

// Helper to check if the user is authenticated - REMOVED as ProtectedRoute uses useAuth context
/*
const checkIsAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};
*/

// Moved to src/data/landingContent.ts
// ... existing code ...

// Create a component to handle auth route redirection
const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    navigate(mode === 'signup' ? '/signup' : '/login', { replace: true });
  }, [location.search, navigate]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Redirigiendo...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default function App() {
  try {
    return (
      <ThemeProvider defaultTheme="system" storageKey="nifya-ui-theme">
        <AuthProvider>
          <NotificationProvider>
            <AuthErrorHandler>
              <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main>
                  <Suspense fallback={<LoadingPage />}>
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ErrorBoundary fallbackComponent={
                            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                              <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
                                <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                                <p className="mb-4">We encountered an error while loading the landing page.</p>
                                <p className="text-sm text-gray-600 mb-6">Please try refreshing the page or contact support if the problem persists.</p>
                                <button 
                                  onClick={() => window.location.reload()}
                                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
                                >
                                  Refresh Page
                                </button>
                              </div>
                            </div>
                          }>
                            <LandingPage />
                          </ErrorBoundary>
                        }
                      />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/auth" element={<AuthRedirect />} />
                      
                      {/* Protected routes with lazy loaded components */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions" element={
                        <ProtectedRoute>
                          <Subscriptions />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions/types" element={
                        <ProtectedRoute>
                          <SubscriptionTypes />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions/create/:typeId" element={
                        <ProtectedRoute>
                          <SubscriptionPrompt mode="create" />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions/create" element={
                        <ProtectedRoute>
                          <Navigate to="/subscriptions/types" replace />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions/new" element={
                        <ProtectedRoute>
                          <Navigate to="/subscriptions/types" replace />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscriptions/catalog" element={
                        <ProtectedRoute>
                          <Navigate to="/subscriptions/types" replace />
                        </ProtectedRoute>
                      } />
                      <Route path="/notifications" element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/auth/google/callback" element={<GoogleCallback />} />
                      <Route
                        path="/subscriptions/:id"
                        element={
                          <ProtectedRoute>
                            <SubscriptionDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subscriptions/edit/:id"
                        element={
                          <ProtectedRoute>
                            <SubscriptionPrompt mode="edit" />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/templates/:templateId/configure"
                        element={
                          <ProtectedRoute>
                            <TemplateConfig />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Debug page for API troubleshooting */}
                      <Route path="/debug" element={
                        <ErrorBoundary>
                          <Debug />
                        </ErrorBoundary>
                      } />
                      
                      {/* 404 fallback */}
                      <Route path="*" element={
                        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
                          <div className="max-w-md">
                            <h1 className="text-6xl font-black mb-6">404</h1>
                            <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
                            <p className="mb-8 text-muted-foreground">
                              La página que estás buscando no existe o ha sido movida.
                            </p>
                            <a
                              href="/"
                              className="inline-block btn-neobrutalism-primary px-6 py-3 text-white font-medium"
                            >
                              Volver al inicio
                            </a>
                          </div>
                        </div>
                      } />
                    </Routes>
                  </Suspense>
                </main>
                <Toaster />
              </div>
            </AuthErrorHandler>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return <div>Something went wrong. Please try refreshing the page.</div>;
  }
}