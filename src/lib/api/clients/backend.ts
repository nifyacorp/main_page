import { ApiResponse } from '../types';
import { authClient } from './auth';

interface RequestConfig {
  endpoint: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function refreshAccessToken() {
  console.group('🔄 Token Refresh');
  console.log('Attempting to refresh access token');

  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    console.groupEnd();
    return false;
  }

  try {
    const { data, error } = await authClient({
      endpoint: '/api/auth/refresh',
      method: 'POST',
      body: { refreshToken }
    });

    if (error) {
      console.error('Token refresh failed:', error);
      return false;
    }

    if (data?.accessToken) {
      console.log('Token refresh successful');
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return true;
    }
  } catch (err) {
    console.error('Token refresh error:', err);
  }
  
  console.groupEnd();
  return false;
}

export async function backendClient<T>({
  endpoint,
  method = 'GET',
  body,
  headers = {}
}: RequestConfig): Promise<ApiResponse<T>> {
  let retryCount = 0;
  const maxRetries = 1;

  async function executeRequest(): Promise<Response> {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      throw new Error('Not authenticated');
    }

    // Ensure token is in Bearer format
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': bearerToken,
      'X-User-ID': userId,
      ...headers,
    };

    console.log('Making request with headers:', {
      ...requestHeaders,
      Authorization: 'Bearer ***' // Mask token in logs
    });

    return fetch(`${BACKEND_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });
  }

  console.group('🔄 Backend Service Request');
  
  try {
    while (retryCount <= maxRetries) {
      console.log(`Attempt ${retryCount + 1} of ${maxRetries + 1}`);
  
      try {
        const response = await executeRequest();
        const data = await response.json();
  
        if (response.ok) {
          console.log('Request successful');
          console.groupEnd();
          return { data };
        }

        // Check if token expired or unauthorized
        if (response.status === 401) {
          console.log('Unauthorized request, attempting token refresh');
          
          if (retryCount < maxRetries && await refreshAccessToken()) {
            console.log('Token refreshed, retrying request');
            retryCount++;
            continue;
          }
          
          // If we can't refresh or have exceeded retries, redirect to login
          console.log('Unable to refresh token, redirecting to login');
          localStorage.clear();
          window.location.href = '/auth';
          return { error: 'Session expired' };
        }

        // For 500 errors, include more details in the error
        if (response.status === 500) {
          const errorMessage = data.error || data.message || 'Internal server error';
          throw new Error(`Server error: ${errorMessage}`);
        }

        // For other errors, throw them
        throw new Error(data.error || data.message || 'Request failed');
      } catch (err) {
        if (retryCount >= maxRetries) {
          throw err;
        }
        retryCount++;
      }
    }

    throw new Error('Max retries exceeded');
  } catch (error) {
    console.error('Request error:', error);
    console.groupEnd();
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}