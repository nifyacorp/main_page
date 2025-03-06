import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment variables
const useNetlifyRedirects = import.meta.env.VITE_USE_NETLIFY_REDIRECTS === 'true';
console.log('Using Netlify redirects:', useNetlifyRedirects);

// If using Netlify redirects, API requests go through the same origin
// Otherwise, use the backend URLs directly
const API_BASE_URL = useNetlifyRedirects 
  ? '/api' 
  : import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:3000/api';

console.log('API base URL being used:', API_BASE_URL);

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
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request details:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    
    console.log('Auth headers:', {
      Authorization: config.headers?.Authorization ? 'Bearer [token]' : 'None'
    });
    
    console.log('Final request options:', {
      url: config.url,
      baseURL: config.baseURL,
      hasAuth: !!config.headers?.Authorization,
      method: config.method
    });
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
    });
    
    console.log('Parsed JSON response:', {
      type: typeof response.data,
      hasData: !!response.data
    });
    
    console.log('Final API response object:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });
    
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized) by attempting token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          // No refresh token, user needs to login again
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
          
          // Update authorization header and retry original request
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Format error for consistent handling across the app
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected error occurred',
      details: error.response?.data?.details || error.message,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;