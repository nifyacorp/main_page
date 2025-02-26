import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Archive, BookOpen, Bell, BellRing, Info, Compass, ClipboardCheck, PieChart, Lightbulb, Zap } from 'lucide-react';
import Auth from './pages/Auth';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SubscriptionCatalog from './pages/SubscriptionCatalog';
import SubscriptionPrompt from './pages/SubscriptionPrompt';
import TemplateConfig from './pages/TemplateConfig';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import GoogleCallback from './components/GoogleCallback';

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/auth" element={<Auth />} />
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
      </Routes>
    </Router>
  );
}

export default App;