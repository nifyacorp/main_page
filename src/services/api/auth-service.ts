import apiClient, { ApiError } from './axios-config';

// Environment variables
const AUTH_URL = import.meta.env.VITE_AUTH_URL;
console.log('Auth URL being used:', AUTH_URL || '(Using Netlify redirects)');

const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'nifya_auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'nifya_refresh_token';

// Type definitions
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Service for handling authentication-related API calls
 */
class AuthService {
  /**
   * Store authentication tokens in localStorage
   */
  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear authentication tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      this.setTokens(token, refreshToken);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      this.setTokens(token, refreshToken);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      // Only call the API if we have a refresh token to invalidate
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
      
      // Clear tokens regardless of API call success
      this.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear tokens even if API call fails
      this.clearTokens();
      
      throw error;
    }
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    try {
      console.group('🔄 Auth Service - Refresh Token');
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.error('No refresh token found in storage');
        console.groupEnd();
        throw new Error('No refresh token found');
      }
      
      console.log('Found refresh token (first 10 chars):', refreshToken.substring(0, 10) + '...');
      console.log('Is token valid JWT format:', 
        refreshToken.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/) ? 'Yes' : 'No');
      
      console.log('Making token refresh request...');
      const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      });
      
      console.log('Refresh response status:', response.status);
      console.log('Refresh response data exists:', !!response.data);
      
      if (!response.data) {
        console.error('Empty response data from refresh token endpoint');
        console.groupEnd();
        throw new Error('Invalid response from token refresh endpoint');
      }
      
      const { token, refreshToken: newRefreshToken } = response.data;
      
      console.log('Received new tokens:', {
        hasAccessToken: !!token, 
        hasRefreshToken: !!newRefreshToken
      });
      
      // Update tokens
      this.setTokens(token, newRefreshToken);
      console.log('Tokens successfully updated in storage');
      console.groupEnd();
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Try to get any network response details
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        console.error('Response status:', errorResponse.status);
        console.error('Response data:', errorResponse.data);
      }
      
      // Clear tokens on refresh failure
      this.clearTokens();
      console.log('Cleared tokens due to refresh failure');
      console.groupEnd();
      
      throw error;
    }
  }

  /**
   * Get the current user profile
   */
  async getCurrentUser(): Promise<User> {
    console.log('🔒 User Profile Flow');
    console.log('Step 1: Checking authentication state');
    
    const token = this.getToken();
    console.log('Current auth state:', { 
      hasToken: !!token,
      isAuthenticated: this.isAuthenticated() 
    });
    
    try {
      console.log('Step 2: Fetching user profile from API');
      console.log('Making request to /api/users/me endpoint');
      
      console.log('👤 Get User Profile');
      console.log('Fetching user profile...');
      
      const response = await apiClient.get<User>('/v1/users/me');
      
      console.log('Step 3: Processing API response');
      console.log('Response data:', {
        hasData: !!response.data,
        status: response.status
      });
      
      console.log('Step 3 Success: Valid profile data received');
      console.log('✅ Profile fetch completed successfully');
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export default new AuthService();