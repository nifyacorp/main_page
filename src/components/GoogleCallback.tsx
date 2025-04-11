import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Check for errors
        if (error) {
          throw new Error(`Google auth error: ${error}`);
        }

        // Verify state matches
        const storedState = sessionStorage.getItem('oauth_state');
        if (!state || state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Exchange code for tokens
        const { data, error: authError } = await authService.googleCallback(code as string, state);
        if (authError) throw new Error(authError);

        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('isAuthenticated', 'true');
          
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }

          // Clean up OAuth state
          sessionStorage.removeItem('oauth_state');
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('No access token received');
        }
      } catch (err) {
        console.error('Google callback handling failed:', err);
        navigate('/auth?error=google-auth-failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completando inicio de sesión</h2>
        <p className="text-muted-foreground">Por favor, espera un momento...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;