import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle, Bell, Newspaper, Home, Users, Archive, BookOpen, BellRing, Info, Compass, ClipboardCheck, PieChart, Lightbulb, Zap } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingPage from './components/LoadingPage';
import Auth from './pages/Auth';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SubscriptionCatalog from './pages/SubscriptionCatalog';
import SubscriptionPrompt from './pages/SubscriptionPrompt';
import TemplateConfig from './pages/TemplateConfig';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleCallback from './components/GoogleCallback';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';

// Lazy-load the pages
const LandingPage = lazy(() => import('./pages/Landing'));

// Helper to check if the user is authenticated
const checkIsAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const features = [
  {
    title: "Notificaciones Personalizadas",
    description: "Recibe alertas solo sobre lo que realmente te interesa, sin ruido innecesario.",
    icon: Bell,
    benefit: "Ahorra tiempo filtrando solo lo relevante para ti."
  },
  {
    title: "Monitorización 24/7",
    description: "Nuestros sistemas rastrean continuamente fuentes oficiales y sitios web para ti.",
    icon: ClipboardCheck,
    benefit: "Tranquilidad: nunca te perderás información importante."
  },
  {
    title: "Análisis Inteligente",
    description: "Nuestro motor de IA contextualiza la información y la procesa según tus intereses.",
    icon: PieChart,
    benefit: "Recibe contenido procesado y listo para comprender y actuar."
  },
];

export const steps = [
  {
    title: "Crea tu cuenta",
    description: "Regístrate fácilmente y empieza a configurar tus intereses en menos de 2 minutos."
  },
  {
    title: "Selecciona fuentes de interés",
    description: "Elige entre BOE, portales inmobiliarios, o solicita la integración con otras webs."
  },
  {
    title: "Recibe notificaciones relevantes",
    description: "Te avisamos cuando aparezca algo que coincida con tus criterios establecidos."
  },
];

export const testimonials = [
  {
    quote: "NIFYA me permite estar al día con todas las publicaciones del BOE sin tener que revisar manualmente cada día. Ahorro horas semanales.",
    author: "Marta Gómez",
    role: "Abogada",
    image: "https://ik.imagekit.io/appraisily/avatars/placeholder-avatar-1.jpg"
  },
  {
    quote: "Gracias a las alertas de NIFYA pude encontrar un piso que cumplía todos mis requisitos antes que nadie. El sistema funciona de maravilla.",
    author: "Carlos Jiménez",
    role: "Empresario",
    image: "https://ik.imagekit.io/appraisily/avatars/placeholder-avatar-2.jpg"
  },
];

export default function App() {
  try {
    console.log('App: Rendering routes');
    
    return (
      <ThemeProvider defaultTheme="system" storageKey="nifya-ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
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
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
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
                <Route path="/subscriptions/new" element={
                  <ProtectedRoute>
                    <NewSubscription />
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
                  path="/subscriptions/catalog"
                  element={
                    <ProtectedRoute>
                      <SubscriptionCatalog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions/new/:typeId"
                  element={
                    <ProtectedRoute>
                      <SubscriptionPrompt mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions/:subscriptionId/edit"
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
                
                {/* 404 fallback - implement a simple inline component for now */}
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
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return <div>Something went wrong. Please try refreshing the page.</div>;
  }
}