import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { verifyAuthHeaders } from '../../lib/utils/auth-recovery';

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

const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'nifya_auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'nifya_refresh_token';

// Error types
export interface ApiError {
  status: number;
  message: string;
  details?: any;
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
    
    // Get auth token with fallbacks
    const token = localStorage.getItem('accessToken') || localStorage.getItem(AUTH_TOKEN_KEY);
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      console.log('AuthContext: No valid auth tokens found');
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
    
    // Handle 401 errors (unauthorized) by attempting token refresh
    if (error.response?.status === 401 && !typedRequest._retry) {
      console.log('Auth error detected in fetch response:', error.response?.data);
      typedRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          // No refresh token, user needs to login again
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userId');
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/auth';
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint using the AUTH_URL instead of API_BASE_URL
        const response = await axios.post(`${AUTH_URL}/v1/auth/token/refresh`, {
          token: refreshToken,
        });
        
        if (response.data.token || response.data.accessToken) {
          // Get the new token
          let newToken = response.data.token || response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;
          
          // Ensure token has Bearer prefix
          if (newToken && !newToken.startsWith('Bearer ')) {
            newToken = `Bearer ${newToken}`;
          }
          
          // Support both storage mechanisms for maximum compatibility
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem(AUTH_TOKEN_KEY, newToken);
          
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          
          localStorage.setItem('isAuthenticated', 'true');
          
          // Try to extract user ID from token if possible
          try {
            const [, payload] = newToken.replace('Bearer ', '').split('.');
            if (payload) {
              const decodedPayload = JSON.parse(atob(payload));
              if (decodedPayload.sub) {
                console.log('Updated user ID from refreshed token:', decodedPayload.sub);
                localStorage.setItem('userId', decodedPayload.sub);
              }
            }
          } catch (err) {
            console.error('Failed to extract user ID from refreshed token:', err);
          }
          
          // Update authorization header and retry original request
          apiClient.defaults.headers.common['Authorization'] = newToken;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh token failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userId');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
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