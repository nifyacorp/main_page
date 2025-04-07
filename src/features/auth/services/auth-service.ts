import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

// Auth response schema for validation
const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.optional(z.string()),
  token_type: z.string().default('Bearer'),
  expires_in: z.number().optional(),
  user_id: z.string().optional(),
});

type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Token interface
interface Token {
  value: string;
  expiresAt?: Date;
}

class AuthService {
  private static instance: AuthService;
  private client: AxiosInstance;
  private accessToken: Token | null = null;
  private refreshToken: Token | null = null;
  private refreshPromise: Promise<string> | null = null;
  
  private constructor() {
    // Create axios instance
    this.client = axios.create({
      baseURL: import.meta.env.VITE_AUTH_URL || '/auth',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Initialize from localStorage
    this.initializeFromStorage();
    
    // Add request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken.value}`;
        }
        // Include user ID header if available from token
        const userId = this.getUserIdFromToken();
        if (userId) {
          config.headers['x-user-id'] = userId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // If error is 401 and not already retrying, attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }
          
          try {
            originalRequest._retry = true;
            const newToken = await this.refreshPromise;
            
            // Update authorization header with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${newToken}` };
            }
            
            // Reset refresh promise after completion
            this.refreshPromise = null;
            
            // Retry the original request with the new token
            return this.client(originalRequest);
          } catch (refreshError) {
            // Reset refresh promise on error
            this.refreshPromise = null;
            
            // Handle refresh token failure by logging out
            this.logout();
            
            // Set token expired flag to show message to user
            localStorage.setItem('token_expired', 'true');
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Get singleton instance
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Initialize tokens from localStorage
  private initializeFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      // Clean up Bearer prefix if present
      const tokenValue = accessToken.startsWith('Bearer ')
        ? accessToken.substring(7)
        : accessToken;
      
      this.accessToken = {
        value: tokenValue,
        // Set expiry from payload if possible
        expiresAt: this.getExpiryFromToken(tokenValue),
      };
    }
    
    if (refreshToken) {
      this.refreshToken = {
        value: refreshToken,
        expiresAt: this.getExpiryFromToken(refreshToken),
      };
    }
  }
  
  // Extract expiry time from JWT token
  private getExpiryFromToken(token: string): Date | undefined {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return undefined;
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return undefined;
      
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Failed to parse token expiry:', error);
      return undefined;
    }
  }
  
  // Extract user ID from token
  private getUserIdFromToken(): string | null {
    if (!this.accessToken) return null;
    
    try {
      const parts = this.accessToken.value.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || null;
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }
  
  // Check if token is expired
  private isTokenExpired(token: Token): boolean {
    if (!token.expiresAt) return false;
    
    // Consider token expired 60 seconds before actual expiry for safety margin
    const safetyMargin = 60 * 1000; // 60 seconds in milliseconds
    return token.expiresAt.getTime() - safetyMargin < Date.now();
  }
  
  // Refresh access token
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    if (this.isTokenExpired(this.refreshToken)) {
      throw new Error('Refresh token expired');
    }
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/refresh`,
        { refresh_token: this.refreshToken.value },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const result = AuthResponseSchema.safeParse(response.data);
      
      if (!result.success) {
        throw new Error('Invalid response from refresh token endpoint');
      }
      
      // Update tokens
      this.setTokens(result.data);
      
      return this.accessToken?.value || '';
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  // Set tokens after successful login/refresh
  private setTokens(authResponse: AuthResponse): void {
    // Set access token
    if (authResponse.access_token) {
      const tokenValue = authResponse.access_token;
      
      this.accessToken = {
        value: tokenValue,
        expiresAt: this.getExpiryFromToken(tokenValue),
      };
      
      localStorage.setItem('accessToken', tokenValue);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Extract and store user ID
      try {
        const parts = tokenValue.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.sub) {
            localStorage.setItem('userId', payload.sub);
          }
          if (payload.email) {
            localStorage.setItem('email', payload.email);
          }
        }
      } catch (tokenError) {
        console.error('Failed to extract data from token:', tokenError);
      }
    }
    
    // Set refresh token if provided
    if (authResponse.refresh_token) {
      this.refreshToken = {
        value: authResponse.refresh_token,
        expiresAt: this.getExpiryFromToken(authResponse.refresh_token),
      };
      
      localStorage.setItem('refreshToken', authResponse.refresh_token);
    }
  }
  
  // Login with email and password
  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.client.post('/login', { email, password });
      
      const result = AuthResponseSchema.safeParse(response.data);
      
      if (!result.success) {
        throw new Error('Invalid login response format');
      }
      
      this.setTokens(result.data);
      
      return result.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  
  // Login with social provider
  public async socialLogin(provider: string, code: string): Promise<AuthResponse> {
    try {
      const response = await this.client.post(`/social/${provider}`, { code });
      
      const result = AuthResponseSchema.safeParse(response.data);
      
      if (!result.success) {
        throw new Error('Invalid social login response format');
      }
      
      this.setTokens(result.data);
      
      return result.data;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    }
  }
  
  // Logout
  public logout(): void {
    // Clear tokens
    this.accessToken = null;
    this.refreshToken = null;
    
    // Clear local storage except for email (for convenience)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    
    // Attempt to call logout endpoint if available
    this.client.post('/logout').catch((error) => {
      console.error('Logout API call failed:', error);
      // Continue logout process even if the API call fails
    });
  }
  
  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }
  
  // Get current access token
  public getAccessToken(): string | null {
    if (!this.accessToken) return null;
    
    if (this.isTokenExpired(this.accessToken) && this.refreshToken) {
      // Return current token but trigger refresh in background
      this.refreshAccessToken().catch((error) => {
        console.error('Background token refresh failed:', error);
      });
    }
    
    return this.accessToken.value;
  }
  
  // Get headers for API requests
  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken.value}`;
    }
    
    const userId = this.getUserIdFromToken();
    if (userId) {
      headers['x-user-id'] = userId;
    }
    
    return headers;
  }
}

export default AuthService.getInstance();