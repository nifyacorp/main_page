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
    // Check for redirect in progress flag to break potential infinite loops
    const redirectInProgress = localStorage.getItem('auth_redirect_in_progress') === 'true';
    
    // Only redirect if auth check is complete, user is not authenticated, and we're not already redirecting
    if (!isLoading && !isAuthenticated && !redirectInProgress) {
      console.log('User not authenticated, redirecting to auth');
      // Set a flag to avoid redirect loops
      localStorage.setItem('auth_redirect_in_progress', 'true');
      // Clear any existing auth tokens that might be invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuthenticated');
      // Use /auth path instead of /login - this is the correct route for authentication
      navigate('/auth', { state: { isLogin: true }, replace: true });
    }
    
    // Clean up redirect flag once authenticated
    if (isAuthenticated && redirectInProgress) {
      localStorage.removeItem('auth_redirect_in_progress');
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