import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { verifyAuthHeaders } from '../../lib/utils/auth-recovery';
import { ApiError } from '../types';

// Environment variables
const useNetlifyRedirects = import.meta.env.VITE_USE_NETLIFY_REDIRECTS === 'true';
console.log('Using Netlify redirects:', useNetlifyRedirects);

// If using Netlify redirects, API requests go through the same origin
// Otherwise, use the backend URLs directly
const API_BASE_URL = useNetlifyRedirects 
  ? '/api' 
  : import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:3000/api';

// Auth URL for authentication related operations
const AUTH_URL = useNetlifyRedirects
  ? '/api'
  : import.meta.env.VITE_AUTH_URL 
    ? `${import.meta.env.VITE_AUTH_URL}/api` 
    : 'https://authentication-service-415554190254.us-central1.run.app/api';

console.log('API base URL being used:', API_BASE_URL);
console.log('Auth URL being used:', AUTH_URL);

// IMPORTANT: Use ONLY these constants for token management - DO NOT USE FALLBACKS
const AUTH_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Debug function to decode and display JWT token contents
function debugJwtToken(tokenName: string, token: string | null): void {
  console.group(`🔍 DEBUG: ${tokenName} Contents`);
  
  if (!token) {
    console.log('Token is null or empty');
    console.groupEnd();
    return;
  }
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
  
  try {
    // Split token into parts
    const parts = tokenValue.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format - should have 3 parts');
      console.groupEnd();
      return;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('Raw token (first 15 chars):', tokenValue.substring(0, 15) + '...');
    console.log('Decoded payload:', {
      sub: payload.sub,         // User ID
      type: payload.type,       // Token type (access, refresh)
      exp: payload.exp,         // Expiration timestamp
      iat: payload.iat,         // Issued at timestamp
      expiresIn: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry'
    });
    
    // Calculate expiration
    if (payload.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const timeLeft = (expiresAt.getTime() - now.getTime()) / 1000;
      
      console.log('Expiration:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        timeLeftSeconds: Math.floor(timeLeft),
        isExpired: timeLeft <= 0
      });
    }
  } catch (error) {
    console.log('Error decoding token:', error);
    console.log('Raw token value:', token);
  }
  
  console.groupEnd();
}

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Verify and fix auth headers before making the request
    verifyAuthHeaders();
    
    // Get auth token - ONLY use the primary storage key
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userId = localStorage.getItem('userId');
    
    // Debug the token being sent with this request
    console.group(`🔒 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Using token from localStorage');
    debugJwtToken('Request Token', token);
    console.groupEnd();
    
    if (!token) {
      console.log('AuthContext: No valid auth token found');
    }
    
    // Add auth headers if token exists
    if (token && config.headers) {
      // Check if token already has Bearer prefix
      if (token.startsWith('Bearer ')) {
        config.headers.Authorization = token;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add user ID header with proper case for backend compatibility
      if (userId) {
        // Ensure both header formats for maximum compatibility with different servers
        config.headers['x-user-id'] = userId;
        config.headers['X-User-ID'] = userId;
      }
    }
    
    // Ensure credentials are included for CORS requests
    config.withCredentials = true;
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    if (!error.config) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Add the _retry property to the config type
    interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
      _retry?: boolean;
    }
    
    const typedRequest = originalRequest as ExtendedAxiosRequestConfig;
    
    // Handle 401 errors (unauthorized) by redirecting to login
    if (error.response?.status === 401 && !typedRequest._retry) {
      console.group('🔄 Auth Error - Redirecting to Login');
      console.log('Auth error detected in fetch response:', error.response?.data);
      
      // No token refresh - just redirect to login
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
      
      // Set flag to indicate token expired
      localStorage.setItem('token_expired', 'true');
      
      console.log('Redirecting to login page due to auth error');
      console.groupEnd();
      
      // Redirect to login page
      window.location.href = '/auth';
      return Promise.reject(error);
    }
    
    // Format error for consistent handling across the app
    const errorData = error.response?.data || {};
    const errorMessage = typeof errorData === 'object' && errorData.message 
      ? errorData.message 
      : typeof error.message === 'string' 
        ? error.message 
        : 'An unexpected error occurred';
        
    const errorDetails = typeof errorData === 'object' && errorData.details
      ? errorData.details
      : error.toString();
      
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: errorMessage,
      details: errorDetails,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
export { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY }; 