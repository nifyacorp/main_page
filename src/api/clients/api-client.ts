import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import authService from '@/features/auth/services/auth-service';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private retryQueue: Array<() => Promise<AxiosResponse>> = [];
  private isRefreshing = false;

  private constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        // Add auth headers if authenticated
        const headers = authService.getAuthHeaders();
        Object.entries(headers).forEach(([key, value]) => {
          config.headers[key] = value;
        });
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Only retry once
        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !this.isRefreshing) {
          originalRequest._retry = true;
          
          try {
            this.isRefreshing = true;
            
            // Add request to queue
            const retryOriginalRequest = new Promise<AxiosResponse>((resolve, reject) => {
              this.retryQueue.push(() => {
                try {
                  // Update headers with fresh tokens
                  const headers = authService.getAuthHeaders();
                  Object.entries(headers).forEach(([key, value]) => {
                    if (originalRequest.headers) {
                      originalRequest.headers[key] = value;
                    }
                  });
                  
                  resolve(this.client(originalRequest));
                } catch (err) {
                  reject(err);
                }
              });
            });
            
            // Check if we're truly unauthorized (not just token expired)
            if (!authService.isAuthenticated()) {
              // Clear queue and reject all pending requests
              this.retryQueue.forEach((retry) => retry());
              this.retryQueue = [];
              this.isRefreshing = false;
              
              // Set token expired flag
              localStorage.setItem('token_expired', 'true');
              return Promise.reject(error);
            }
            
            // Process queue after successful refresh
            this.retryQueue.forEach((retry) => retry());
            this.retryQueue = [];
            this.isRefreshing = false;
            
            return retryOriginalRequest;
          } catch (refreshError) {
            this.retryQueue = [];
            this.isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(baseURL?: string): ApiClient {
    if (!ApiClient.instance) {
      const url = baseURL || import.meta.env.VITE_BACKEND_URL || '/api';
      ApiClient.instance = new ApiClient(url);
    }
    return ApiClient.instance;
  }

  private formatError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response?.data && typeof response.data === 'object' && 'message' in response.data) {
        return {
          message: String(response.data.message),
          code: response.data.code as string,
          status: response.status,
        };
      }
      return {
        message: error.message || 'Unknown API error',
        status: response?.status || 500,
      };
    }
    
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }

  private handleAxiosError<T>(error: unknown): ApiResponse<T> {
    const formattedError = this.formatError(error);
    
    // Log detailed error for debugging
    console.error('API Error:', formattedError);
    
    return {
      data: null,
      error: formattedError.message,
      status: formattedError.status,
      success: false,
    };
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, { params });
      return {
        data: response.data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleAxiosError<T>(error);
    }
  }

  public async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data);
      return {
        data: response.data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleAxiosError<T>(error);
    }
  }

  public async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data);
      return {
        data: response.data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleAxiosError<T>(error);
    }
  }

  public async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data);
      return {
        data: response.data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleAxiosError<T>(error);
    }
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url);
      return {
        data: response.data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      return this.handleAxiosError<T>(error);
    }
  }
}

export default ApiClient.getInstance();