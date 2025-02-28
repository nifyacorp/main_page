import { ApiResponse } from '../types';
import { authClient } from './auth';

interface RequestConfig {
  endpoint: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

// Define token response interface
interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

// Ensure we have a valid backend URL, fallback to environment or hardcoded value
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-415554190254.us-central1.run.app';
console.log('Backend URL being used:', BACKEND_URL);

// Token refresh mutex and queue implementation
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
const refreshQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}> = [];

// Process all queued promises with the refresh result
function processQueue(success: boolean, error?: any): void {
  refreshQueue.forEach(promise => {
    if (success) {
      promise.resolve(true);
    } else {
      promise.reject(error);
    }
  });
  
  // Clear the queue
  refreshQueue.length = 0;
}

// Add a utility function for consistent auth state cleanup
function clearAuthState() {
  console.log('Clearing authentication state');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAuthenticated');
}

async function refreshAccessToken(retryAttempt = 0): Promise<boolean> {
  console.group('🔄 Token Refresh');
  console.log('Attempting to refresh access token');

  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.error('No refresh token available');
    console.groupEnd();
    clearAuthState(); // Clear auth state if refresh token is missing
    return false;
  }

  // If a refresh is already in progress, queue this request
  if (isRefreshing) {
    console.log('Token refresh already in progress, adding to queue');
    return new Promise<boolean>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  // Set the mutex
  isRefreshing = true;
  refreshPromise = null;
  
  try {
    // Exponential backoff delay if this is a retry
    if (retryAttempt > 0) {
      const backoffDelay = Math.min(Math.pow(2, retryAttempt) * 1000, 10000); // Max 10 seconds
      console.log(`Retry attempt ${retryAttempt}, waiting ${backoffDelay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }

    const { data, error } = await authClient<TokenResponse>({
      endpoint: '/api/auth/refresh',
      method: 'POST',
      body: { refreshToken }
    });

    if (error) {
      console.error('Token refresh failed:', error);
      // Release mutex and notify queue of failure
      isRefreshing = false;
      processQueue(false, error);
      return false;
    }

    if (data?.accessToken) {
      console.log('Token refresh successful');
      
      // Ensure token is in Bearer format
      const token = data.accessToken.startsWith('Bearer ') ? 
        data.accessToken : 
        `Bearer ${data.accessToken}`;
        
      localStorage.setItem('accessToken', token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Set isAuthenticated flag to maintain consistency
      localStorage.setItem('isAuthenticated', 'true');
      
      // Extract and store user ID from token if possible
      try {
        const [, payload] = token.replace('Bearer ', '').split('.');
        if (payload) {
          try {
            const decodedPayload = JSON.parse(atob(payload));
            if (decodedPayload.sub) {
              console.log('Updated user ID from refreshed token:', decodedPayload.sub);
              localStorage.setItem('userId', decodedPayload.sub);
            } else {
              console.warn('Refreshed token payload does not contain sub field');
              localStorage.setItem('userId', 'refreshed-token-no-sub');
            }
          } catch (parseError) {
            console.error('Failed to parse refreshed token payload:', parseError);
            localStorage.setItem('userId', 'refreshed-token-parse-error');
          }
        } else {
          console.warn('Could not extract payload from refreshed token - invalid format');
          localStorage.setItem('userId', 'refreshed-token-invalid-format');
        }
      } catch (err) {
        console.error('Failed to extract user ID from refreshed token:', err);
        localStorage.setItem('userId', 'refreshed-token-extraction-error');
      }
      
      // Release mutex and notify queue of success
      isRefreshing = false;
      processQueue(true);
      console.groupEnd();
      return true;
    }
    
    // Release mutex and notify queue of failure
    isRefreshing = false;
    processQueue(false, new Error('Invalid token response'));
    console.groupEnd();
    return false;
  } catch (err) {
    console.error('Token refresh error:', err);
    
    // Implement retry with exponential backoff
    const maxRetries = 3;
    if (retryAttempt < maxRetries) {
      console.log(`Will retry token refresh, attempt ${retryAttempt + 1} of ${maxRetries}`);
      isRefreshing = false; // Release mutex for retry
      return refreshAccessToken(retryAttempt + 1);
    }
    
    // Release mutex and notify queue of failure after max retries
    isRefreshing = false;
    processQueue(false, err);
    console.groupEnd();
    return false;
  }
}

// Add a transformer for notification data
const processNotificationData = (data: any): any => {
  // If it's not an object or null, return as is
  if (!data || typeof data !== 'object') return data;
  
  // Process notification arrays (from list endpoint)
  if (data.notifications && Array.isArray(data.notifications)) {
    console.log(`Processing ${data.notifications.length} notifications from API response`);
    data.notifications = data.notifications
      .filter((notification: any) => notification && typeof notification === 'object')
      .map((notification: any) => {
        // Ensure entity_type is a string that can be split
        if (notification.entity_type === undefined || notification.entity_type === null) {
          notification.entity_type = '';
        } else if (typeof notification.entity_type !== 'string') {
          notification.entity_type = String(notification.entity_type);
        }
        return notification;
      });
  }
  
  // Process single notification object (from get endpoint)
  if (data && typeof data === 'object' && data.id && data.title) {
    if (data.entity_type === undefined || data.entity_type === null) {
      data.entity_type = '';
    } else if (typeof data.entity_type !== 'string') {
      data.entity_type = String(data.entity_type);
    }
  }
  
  return data;
};

export async function backendClient<T>({
  endpoint,
  method = 'GET',
  body = undefined,
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

    // Ensure token is correctly formatted for Authorization header
    // The auth client should have already stored it with Bearer prefix
    // but we'll ensure it has exactly one Bearer prefix
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    const bearerToken = `Bearer ${cleanToken}`;

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

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
    };
    
    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, requestInit);

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
          
          // Process notification data to ensure entity_type is always defined
          const processedData = processNotificationData(data);
          
          return {
            data: processedData,
            status: response.status,
          };
        }

        // Check if token expired or unauthorized
        if (response.status === 401) {
          console.log('Unauthorized request, attempting token refresh');
          
          if (retryCount < maxRetries && await refreshAccessToken()) {
            console.log('Token refreshed, retrying request');
            retryCount++;
            continue;
          }
          
          // If we can't refresh or have exceeded retries, properly clean up auth state
          console.log('Unable to refresh token, redirecting to login');
          
          // Clear all authentication state consistently
          clearAuthState();
          
          // Redirect to auth page
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