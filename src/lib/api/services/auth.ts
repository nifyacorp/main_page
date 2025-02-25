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

  signup: (email: string, password: string, name: string) =>
    console.group('📝 Signup Process') &&
    authClient({
      endpoint: '/api/auth/signup',
      method: 'POST',
      body: { email, password, name },
    }).finally(() => console.groupEnd()),

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