import { authClient } from '../clients/auth';
import type { ApiResponse } from '../types';

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
  } | null;
  session: {
    issuedAt: string;
    expiresAt: string;
    remainingTime: number;
  } | null;
  error?: string;
}

export const authService = {
  login: (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    console.group('🔑 Login Process');
    console.log('Login attempt:', { email: data.email, password: '********' });
    
    return authClient({
      endpoint: '/api/auth/login',
      method: 'POST',
      body: data,
    })
    .then(response => {
      // Process the token to ensure it has Bearer prefix
      if (response.ok && response.data?.accessToken) {
        // Ensure token has Bearer prefix
        const accessToken = response.data.accessToken;
        if (!accessToken.startsWith('Bearer ')) {
          console.log('Adding Bearer prefix to token from auth service');
          response.data.accessToken = `Bearer ${accessToken}`;
        }
        
        // Store this token immediately for subsequent requests
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Store email for convenience
        localStorage.setItem('email', data.email);
      }
      return response;
    })
    .finally(() => console.groupEnd());
  },

  signup: (email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> => {
    console.group('📝 Signup Process');
    console.log('Signup attempt:', { email, name, password: '********' });
    
    return authClient({
      endpoint: '/api/auth/signup',
      method: 'POST',
      body: { email, password, name },
    })
    .catch(error => {
      console.error('Signup request failed:', error);
      // Ensure we always return an object with an error property
      return { error: error instanceof Error ? error.message : 'Failed to connect to authentication service' };
    })
    .finally(() => console.groupEnd());
  },

  googleLogin: () =>
    console.group('🔑 Google Login Process') &&
    authClient({
      endpoint: '/api/auth/google/login',
      method: 'POST',
    }).finally(() => console.groupEnd()),

  googleCallback: (code: string, state: string) =>
    console.group('🔑 Google Callback Process') &&
    authClient({
      endpoint: '/api/auth/google/callback',
      method: 'POST',
      body: { code, state },
    }).finally(() => console.groupEnd()),
    
  getSession: (): Promise<ApiResponse<SessionResponse>> => {
    console.group('🔑 Session Check');
    console.log('Validating current session');
    
    return authClient({
      endpoint: '/api/auth/session',
      method: 'GET',
      // The auth token will be automatically included from localStorage
    })
    .then(response => {
      console.log('Session response:', response);
      
      // If authenticated, update local state
      if (response.data?.authenticated) {
        localStorage.setItem('isAuthenticated', 'true');
        if (response.data.user) {
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('email', response.data.user.email);
        }
      } else {
        // If not authenticated and we have tokens, clear them
        const hasTokens = !!localStorage.getItem('accessToken');
        if (hasTokens) {
          console.log('Session invalid but tokens exist - clearing auth state');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isAuthenticated');
          // Keep userId and email for convenience
        }
      }
      
      return response;
    })
    .catch(error => {
      console.error('Session check failed:', error);
      return { error: 'Failed to validate session' };
    })
    .finally(() => console.groupEnd());
  }
}