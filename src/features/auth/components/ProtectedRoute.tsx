import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth-context';
import LoadingPage from '@/features/common/components/LoadingPage';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Save the attempted URL for redirecting after login
    if (!isAuthenticated && !isLoading) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [isAuthenticated, isLoading, location]);

  if (isLoading) {
    return <LoadingPage message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;