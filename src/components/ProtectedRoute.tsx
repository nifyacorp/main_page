import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from './LoadingPage';
import { detectAndBreakAuthRedirectLoop } from '@/lib/utils/auth-recovery';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check if we're already on the auth page to prevent redirect loops
    const isOnAuthPage = window.location.pathname === '/auth';
    
    // Check for redirect in progress flag to break potential infinite loops
    const redirectInProgress = localStorage.getItem('auth_redirect_in_progress') === 'true';
    
    // Only redirect if auth check is complete, user is not authenticated, not already on auth page, and we're not already redirecting
    if (!isLoading && !isAuthenticated && !isOnAuthPage && !redirectInProgress) {
      console.log('User not authenticated, redirecting to auth');
      
      // Check for redirect loops before proceeding
      if (detectAndBreakAuthRedirectLoop()) {
        console.log('Auth redirect loop detected and broken');
        window.location.href = '/auth'; // Force a full page refresh
        return;
      }
      
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

  // Show loading while checking auth status or preparing redirect
  if (isLoading || (!isAuthenticated && !isLoading)) {
    // If not authenticated and not loading, we should be redirecting.
    // Show loading indicator until navigation happens.
    return <LoadingPage />;
  }

  // Only render the children if authenticated
  // This line should only be reached if isLoading is false AND isAuthenticated is true
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;