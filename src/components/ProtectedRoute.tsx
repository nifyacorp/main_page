import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from './LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      // Use /auth path instead of /login - this is the correct route for authentication
      navigate('/auth', { state: { isLogin: true }, replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking auth status
  if (isLoading) {
    return <LoadingPage />;
  }

  // Only render the children if authenticated
  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : null;
};

export default ProtectedRoute;