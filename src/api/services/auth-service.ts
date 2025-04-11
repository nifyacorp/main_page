import apiClient, { authClient, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../clients/axios-config';
import { User, AuthResponse, LoginRequest, RegisterRequest, ApiErrorResponse, ErrorCode } from '../types';

// Environment variables
const AUTH_URL = import.meta.env.VITE_AUTH_URL;
console.log('Auth URL being used:', AUTH_URL || '(Using Netlify redirects)');

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
  async login(credentials: LoginRequest): Promise<{ data?: AuthResponse; error?: string; errorCode?: string }> {
    try {
      console.log('🔐 Auth Service Request');
      console.log('Request Details:', {
        url: authClient.defaults.baseURL + '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: credentials.email,
          password: '********'
        }
      });

      console.log('Login attempt:', { 
        email: credentials.email, 
        password: '********' 
      });
      
      const response = await authClient.post<AuthResponse>('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      if (accessToken) this.setTokens(accessToken, refreshToken);
      
      return { data: response.data };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error has the standardized API error format
      if (error?.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        console.log('Server error response:', apiError);
        
        // Return the standardized error
        return {
          error: apiError.error.message,
          errorCode: apiError.error.code
        };
      }
      
      // Handle network errors and other non-API errors
      if (error?.response?.status === 404) {
        // Check if this is an actual API endpoint not found or a user authentication error
        if (error?.response?.data?.error?.code === 'USER_NOT_FOUND') {
          // This is a user authentication error, not a 404 endpoint error
          return {
            error: error.response.data.error.message || 'User not found. Please check your email or register.',
            errorCode: error.response.data.error.code
          };
        }
        
        console.log('📝 DEBUG: 404 Not Found Error - API endpoint not found');
        return {
          error: 'Cannot connect to authentication service. Please try again later.',
          errorCode: 'SERVER_ERROR'
        };
      }
      
      console.log('📝 DEBUG: No access token in login response:', error?.response?.data || error?.message || error);
      return {
        error: error?.message || 'Login failed. Please try again.',
        errorCode: 'SERVER_ERROR'
      };
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.post<AuthResponse>('/auth/signup', userData);
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      this.setTokens(accessToken, refreshToken);
      
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
        await authClient.post('/auth/logout', { refreshToken });
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
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
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
      const response = await authClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      });
      
      console.log('Refresh response status:', response.status);
      console.log('Refresh response data exists:', !!response.data);
      
      if (!response.data) {
        console.error('Empty response data from refresh token endpoint');
        console.groupEnd();
        throw new Error('Invalid response from token refresh endpoint');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      console.log('Received new tokens:', {
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!newRefreshToken
      });
      
      // Update tokens
      this.setTokens(accessToken, newRefreshToken);
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
  async getProfile(): Promise<{ data?: any; error?: string; errorCode?: string }> {
    console.log('🔒 User Profile Flow');
    console.log('Step 1: Checking authentication state');
    
    const token = this.getToken();
    console.log('Current auth state:', { 
      hasToken: !!token,
      isAuthenticated: this.isAuthenticated() 
    });
    
    try {
      console.log('Step 2: Fetching user profile from API');
      console.log('Making request to /api/auth/me endpoint');
      
      console.log('👤 Get User Profile');
      console.log('Fetching user profile...');
      
      const response = await authClient.get('/auth/me');
      
      console.log('Step 3: Processing API response');
      console.log('Response data:', {
        hasData: !!response.data,
        status: response.status
      });
      
      console.log('Step 3 Success: Valid profile data received');
      console.log('✅ Profile fetch completed successfully');
      
      return { data: response.data };
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Check if the error has the standardized API error format
      if (error?.response?.data?.error) {
        const apiError = error.response.data as ApiErrorResponse;
        console.log('Server error response:', apiError);
        
        // Return the standardized error
        return {
          error: apiError.error.message,
          errorCode: apiError.error.code
        };
      }
      
      return {
        error: error?.message || 'Failed to get user profile',
        errorCode: 'SERVER_ERROR'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await authClient.put<User>('/auth/profile', userData);
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
      const response = await authClient.post<{ message: string }>('/auth/change-password', data);
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
      const response = await authClient.post<{ message: string }>('/auth/forgot-password', { email });
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
      const response = await authClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export default new AuthService(); 