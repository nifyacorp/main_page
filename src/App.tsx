import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Brain, Building2, FileText, Github, Twitter } from 'lucide-react';
import Auth from './pages/Auth';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SubscriptionCatalog from './pages/SubscriptionCatalog';
import SubscriptionPrompt from './pages/SubscriptionPrompt';
import TemplateConfig from './pages/TemplateConfig';
import Notifications from './pages/Notifications';
import DashboardLayout from './components/DashboardLayout';
import GoogleCallback from './components/GoogleCallback';
import { SplashCursor } from './components/SplashCursor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : null;
};

const features = [
  {
    title: 'Vigilancia del BOE',
    description: 'Recibe un aviso cada vez que se publica algo relevante para tu sector o intereses.',
    benefit: 'Ahorra tiempo y no te pierdas subvenciones, oposiciones u oportunidades.',
    icon: FileText,
  },
  {
    title: 'Alertas inmobiliarias personalizadas',
    description: 'Filtra y monitoriza el mercado en Idealista y Fotocasa según tus criterios (precio, ubicación, etc.).',
    benefit: 'Localiza antes que nadie la vivienda o local que necesitas.',
    icon: Building2,
  },
  {
    title: 'IA que aprende de ti',
    description: 'Nuestro sistema analiza tus hábitos para afinar los avisos y descartar información irrelevante.',
    benefit: 'Disfruta de una experiencia más precisa con cada uso.',
    icon: Brain,
  },
];

const steps = [
  {
    title: 'Configura tus preferencias',
    description: 'Elige fuentes y palabras clave.',
  },
  {
    title: 'Recibe alertas al instante',
    description: 'Notificaciones directas en tu email.',
  },
  {
    title: 'Refina tu perfil',
    description: 'Ajusta o descarta alertas para optimizar las siguientes búsquedas.',
  },
];

const testimonials = [
  {
    quote: 'Gracias a NIFYA me enteré de una convocatoria de ayudas para mi negocio antes que mi competencia.',
    author: 'Sofía G.',
    role: 'Emprendedora',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
  },
  {
    quote: 'Encontré mi nuevo piso en una semana y por debajo del precio medio de la zona.',
    author: 'Raúl T.',
    role: 'Freelance',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
  },
];

const MainLayout = () => {
  const handleDebugLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Button */}
      <button
        onClick={handleDebugLogin}
        className="fixed bottom-4 right-4 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity"
        title="Debug: Login as admin"
      >
        <Bell className="h-6 w-6" />
      </button>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" alt="NIFYA" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">NIFYA</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                state={{ isLogin: true }}
              >
                Iniciar sesión
              </Link>
              <div className="gradient-border">
                <Link
                  to="/auth"
                  state={{ isLogin: false }}
                  className="block px-4 py-2 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary transition-colors"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-32 pb-48 bg-background cursor-pointer" id="hero-section">
        <SplashCursor 
          SIM_RESOLUTION={128}
          DYE_RESOLUTION={1024}
          DENSITY_DISSIPATION={0.97}
          VELOCITY_DISSIPATION={0.98}
          SPLAT_RADIUS={0.6}
          COLOR={[0.19, 0.0, 0.95]}
          containerId="hero-section"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-12">
              <img 
                src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" 
                alt="NIFYA" 
                className="h-24 w-24 border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              NIFYA
            </h1>
            <p className="mt-6 text-xl font-bold text-primary">
              Notificaciones inteligentes impulsadas por IA
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Descubre información relevante antes que nadie: BOE, inmobiliarias y todo lo que necesites.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="gradient-border">
                <Link to="/auth" className="block px-8 py-4 text-lg font-bold text-primary bg-white hover:bg-primary hover:text-white transition-colors">
                  Quiero saber más
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="relative py-24 border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Cansado de revisar docenas de webs buscando la información que te importa?
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              NIFYA simplifica tu día a día con alertas inteligentes diseñadas solo para ti.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="feature-card flex flex-col p-6 rounded-lg border bg-card hover:bg-muted/50">
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-foreground">
                    <div className="p-2 rounded-md border-2 border-black bg-primary">
                      <feature.icon className="h-6 w-6 flex-none text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-4 text-sm italic text-primary">{feature.benefit}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tu asistente de notificaciones en 3 pasos
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 lg:gap-x-8">
              {steps.map((step, index) => (
                <div key={step.title} className="relative pl-16">
                  <div className="step-number absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg">
                    <span className="text-xl font-semibold text-primary-foreground">{index + 1}</span>
                  </div>
                  <div className="text-xl font-semibold leading-7 text-foreground">{step.title}</div>
                  <div className="mt-2 text-base leading-7 text-muted-foreground">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-16 text-center text-lg text-muted-foreground">
            Así de sencillo: olvídate de revisar manualmente cientos de páginas y deja que NIFYA te avise en el momento oportuno.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Lo que dicen quienes ya usan NIFYA
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mt-20 lg:max-w-none lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="testimonial-card flex flex-col gap-y-6 border rounded-lg p-8 bg-card hover:bg-muted/50 transition-colors">
                <p className="text-lg leading-8 text-muted-foreground">{testimonial.quote}</p>
                <div className="flex items-center gap-x-4">
                  <div className="ring-1 ring-primary/20 rounded-full p-0.5">
                    <img src={testimonial.image} alt="" className="h-12 w-12 rounded-full" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm leading-6 text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Listo para no perderte nada importante?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              NIFYA te ayuda a tomar decisiones informadas y a aprovechar oportunidades clave en el momento justo.
            </p>
            <div className="mt-10">
              <a
                href="/auth"
                className="inline-block rounded-lg border-4 border-black bg-primary px-8 py-4 text-lg font-bold text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
              >
                Prueba NIFYA Gratis
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="pt-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">&copy; 2024 NIFYA. Todos los derechos reservados.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">GitHub</span>
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            <nav className="mt-8">
              <ul className="flex justify-center space-x-8">
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  const isAuthPage = window.location.hash === '#/auth';

  if (isAuthPage) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;