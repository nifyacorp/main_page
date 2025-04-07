import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingPage from '@/features/common/components/LoadingPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ErrorFallback from '@/features/common/components/ErrorFallback';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/features/common/pages/Landing'));
const AuthPage = lazy(() => import('@/features/auth/pages/Auth'));
const GoogleCallback = lazy(() => import('@/features/auth/components/GoogleCallback'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const SubscriptionsPage = lazy(() => import('@/features/subscriptions/pages/Subscriptions'));
const NewSubscriptionPage = lazy(() => import('@/features/subscriptions/pages/NewSubscription'));
const SubscriptionDetailPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionDetail'));
const SubscriptionPromptPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionPrompt'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/Notifications'));
const SettingsPage = lazy(() => import('@/features/settings/pages/Settings'));
const TemplateConfigPage = lazy(() => import('@/features/templates/pages/TemplateConfig'));
const DebugPage = lazy(() => import('@/features/common/pages/Debug'));
const NotFoundPage = lazy(() => import('@/features/common/pages/NotFound'));

// Helper to wrap a component with Suspense and ErrorBoundary
const withSuspense = (Component: React.ComponentType, fallback: React.ReactNode = <LoadingPage />) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Helper to wrap a component with ProtectedRoute
const withProtection = (Component: React.ComponentType) => {
  return (
    <ProtectedRoute>
      {withSuspense(Component)}
    </ProtectedRoute>
  );
};

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: withSuspense(LandingPage),
  },
  {
    path: '/auth',
    element: withSuspense(AuthPage),
  },
  {
    path: '/login',
    element: withSuspense(AuthPage),
  },
  {
    path: '/auth/google/callback',
    element: withSuspense(GoogleCallback),
  },
  
  // Protected routes
  {
    path: '/dashboard',
    element: withProtection(DashboardPage),
  },
  {
    path: '/subscriptions',
    element: withProtection(SubscriptionsPage),
  },
  {
    path: '/subscriptions/create',
    element: withProtection(NewSubscriptionPage),
  },
  {
    path: '/subscriptions/new',
    element: withProtection(NewSubscriptionPage),
  },
  {
    path: '/subscriptions/:id',
    element: withProtection(SubscriptionDetailPage),
  },
  {
    path: '/subscriptions/create/:typeId',
    element: withProtection(SubscriptionPromptPage),
  },
  {
    path: '/subscriptions/edit/:id',
    element: withProtection(SubscriptionPromptPage),
  },
  {
    path: '/notifications',
    element: withProtection(NotificationsPage),
  },
  {
    path: '/settings',
    element: withProtection(SettingsPage),
  },
  {
    path: '/templates/:templateId/configure',
    element: withProtection(TemplateConfigPage),
  },
  
  // Debug route
  {
    path: '/debug',
    element: withSuspense(DebugPage),
  },
  
  // 404 fallback
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
];

export default routes;