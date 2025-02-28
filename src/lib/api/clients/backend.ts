import { ApiResponse } from '../types';
import { authClient } from './auth';

interface RequestConfig {
  endpoint: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log('Backend URL from environment:', BACKEND_URL);

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

  async function executeRequest(): Promise<{ response: Response; data: any }> {
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
      'Accept': 'application/json, text/plain, */*',
      ...headers,
    };

    console.log('Making request with headers:', {
      ...requestHeaders,
      Authorization: 'Bearer ***' // Mask token in logs
    });

    const fullUrl = `${BACKEND_URL}${endpoint}`;
    console.log('Full request URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.log('Received non-JSON response:', text);
        // Try to parse it as JSON anyway in case content-type is wrong
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If it's not valid JSON, create a simple object
          data = { message: text || 'No response body' };
        }
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      data = { 
        error: 'Could not parse server response',
        status: response.status,
        statusText: response.statusText
      };
    }

    return { response, data };
  }

  console.group('🔄 Backend Service Request');
  console.log(`Making ${method} request to ${endpoint}`);
  
  try {
    while (retryCount <= maxRetries) {
      console.log(`Attempt ${retryCount + 1} of ${maxRetries + 1}`);
  
      try {
        const { response, data } = await executeRequest();
  
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

        // For 4xx and 5xx errors, include more details in the error
        if (response.status >= 400) {
          const errorMessage = data.error || data.message || `HTTP Error: ${response.status} ${response.statusText}`;
          console.error('Request failed with status', response.status, errorMessage);
          return { error: errorMessage };
        }

        // If we got here, it's an unexpected response
        throw new Error(data.error || data.message || 'Request failed with unexpected response');
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