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

export const authService = {
  login: (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    console.group('🔑 Login Process');
    console.log('Login attempt:', { email: data.email, password: '********' });
    
    return authClient({
      endpoint: '/api/auth/login',
      method: 'POST',
      body: data,
    }).finally(() => console.groupEnd());
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
}