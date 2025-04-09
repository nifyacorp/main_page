import { ApiResponse } from '../types';
import { authClient } from './auth';
import { 
  CONTENT_TYPE,
  JSON_CONTENT_TYPE, 
  getAuthHeaders,
  formatBearerToken,
  AUTH_HEADER,
  USER_ID_HEADER
} from '../../constants/headers';

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
const BACKEND_URL = import.meta.env.VITE_USE_NETLIFY_REDIRECTS === 'true'
  ? ''  // Empty string for using Netlify redirects (relative URLs)
  : (import.meta.env.VITE_BACKEND_URL || 'https://backend-415554190254.us-central1.run.app');
console.log('Backend URL being used:', BACKEND_URL || '(Using Netlify redirects)');

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
  
  // Add log here to see the token value
  console.log('📝 DEBUG: Refresh token from localStorage:', refreshToken ? `${refreshToken.substring(0, 5)}...` : 'null');
  
  // Check localStorage for all auth-related items
  console.log('📝 DEBUG: Authentication state in localStorage:', {
    refreshToken: refreshToken ? `${refreshToken.substring(0, 5)}...` : 'null',
    accessToken: localStorage.getItem('accessToken') ? `${localStorage.getItem('accessToken')?.substring(0, 15)}...` : 'null',
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    userId: localStorage.getItem('userId'),
    email: localStorage.getItem('email')
  });
    
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

    console.log('📝 DEBUG: Sending refresh token request to auth service');
    const { data, error } = await authClient<TokenResponse>({
      endpoint: '/api/v1/auth/refresh',
      method: 'POST',
      body: { refreshToken }
    });

    if (error) {
      console.error('Token refresh failed:', error);
      console.log('📝 DEBUG: Server responded with error during refresh');
      // Add cleanup if refresh fails
      clearAuthState(); 
      // Release mutex and notify queue of failure
      isRefreshing = false;
      processQueue(false, error);
      return false;
    }

    if (data?.accessToken) {
      console.log('Token refresh successful');
      console.log('📝 DEBUG: Received new access token from server');
      
      // Log if we got a new refresh token too
      if (data.refreshToken) {
        console.log('📝 DEBUG: Received new refresh token from server');
      } else {
        console.log('📝 DEBUG: No new refresh token received, keeping existing one');
      }
      
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
    console.log('📝 DEBUG: Exception occurred during token refresh');
    
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

// Add this debug function to inspect responses
function logResponseDebug(response: Response, text: string, data: any) {
  console.group('🔍 API Response Debug');
  console.log('Response status:', response.status);
  console.log('Content-Type:', response.headers.get('Content-Type'));
  console.log('Raw response text (first 200 chars):', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
  
  try {
    // Log the parsed data structure
    console.log('Parsed data structure:', data);
    
    // If this is a notifications response, log more details
    if (data && data.notifications) {
      console.log('Notifications count:', data.notifications.length);
      if (data.notifications.length > 0) {
        console.log('First notification keys:', Object.keys(data.notifications[0]));
        console.log('First notification sample:', data.notifications[0]);
      }
    }
  } catch (err) {
    console.error('Error analyzing response:', err);
  }
  
  console.groupEnd();
}

// Helper to ensure endpoint has the correct prefix
function ensureV1Prefix(endpoint: string): string {
  // If the endpoint already starts with /api/v1, leave it as is
  if (endpoint.startsWith('/api/v1')) {
    return endpoint;
  }
  
  // If the endpoint already starts with /v1, add /api prefix
  if (endpoint.startsWith('/v1')) {
    return `/api${endpoint}`;
  }
  
  // If the endpoint has no prefix, add the full /api/v1 prefix
  // But avoid adding it to auth endpoints which might have a different structure
  if (endpoint.startsWith('/auth/')) {
    return `/api${endpoint}`;
  }
  
  // For all other endpoints, add the full prefix
  return `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export async function backendClient<T>({
  endpoint,
  method = 'GET',
  body = undefined,
  headers = {}
}: RequestConfig): Promise<ApiResponse<T>> {
  let retryCount = 0;
  const maxRetries = 1;
  
  // Ensure endpoint has the proper prefix
  const prefixedEndpoint = ensureV1Prefix(endpoint);
  
  // Debug logging for request
  console.group(`🌐 API Request: ${method} ${prefixedEndpoint}`);
  console.log('Request details:', { method, originalEndpoint: endpoint, prefixedEndpoint, headers: { ...headers, Authorization: headers.Authorization ? '***' : undefined } });
  if (body) console.log('Request body:', typeof body === 'string' ? body.substring(0, 100) + '...' : body);
  
  async function attemptRequest(): Promise<ApiResponse<T>> {
    try {
      // Prepare request options
      const options: RequestInit = {
        method,
        headers: {
          [CONTENT_TYPE]: JSON_CONTENT_TYPE,
          ...headers
        },
        credentials: 'include'
      };

      // Always add authentication headers when available
      let accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      // If we say we're authenticated but don't have a token, that's a problem
      if (isAuthenticated && !accessToken) {
        console.warn('Auth state inconsistency detected: isAuthenticated=true but no accessToken');
        localStorage.setItem('auth_state_inconsistent', 'true');
      }
      
      // Ensure token is in correct Bearer format
      if (accessToken && !accessToken.startsWith('Bearer ')) {
        accessToken = `Bearer ${accessToken}`;
        // Update the stored token to maintain consistency
        localStorage.setItem('accessToken', accessToken);
        console.log('Applied Bearer prefix to token before request');
      }
      
      // Debug the auth headers
      console.log('Auth headers:', { 
        hasAccessToken: !!accessToken, 
        hasUserId: !!userId,
        tokenFormat: accessToken ? `${accessToken.substring(0, 10)}...` : 'none'
      });

      // Add authentication headers using our utility function
      // Ensure token has Bearer prefix
      if (accessToken && !accessToken.startsWith('Bearer ')) {
        accessToken = `Bearer ${accessToken}`;
        localStorage.setItem('accessToken', accessToken);
        console.log('Fixed token format to include Bearer prefix');
      }
      
      const authHeaders = getAuthHeaders(accessToken, userId);
      Object.assign(options.headers as Record<string, string>, authHeaders);

      // Add body if provided
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      console.log('Final request options:', { 
        ...options, 
        headers: {
          ...Object.entries(options.headers as Record<string, string>)
            .reduce((acc, [key, value]) => ({
              ...acc,
              [key]: key === AUTH_HEADER ? '***' : value
            }), {})
        }
      });

      // Make the request
      const response = await fetch(`${BACKEND_URL}${prefixedEndpoint}`, options);
      
      // Debug response details
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      
      // If we got a 401 Unauthorized and we have a refresh token, try to refresh and retry
      if (response.status === 401 && localStorage.getItem('refreshToken') && retryCount < 1) {
        console.log('Received 401, attempting token refresh and retry');
        
        try {
          // Try to refresh the token
          const refreshSuccessful = await refreshAccessToken();
          
          // If refresh was successful, retry the request with new token
          if (refreshSuccessful) {
            console.log('Token refresh successful, retrying original request');
            retryCount++;
            return attemptRequest();
          } else {
            console.warn('Token refresh failed, but continuing with current token');
            // Even if refresh fails, continue with request processing
            // This is a fallback mechanism to allow some functionality when 
            // refresh is failing but the user still has a valid original token
          }
        } catch (refreshError) {
          console.error('Error during token refresh attempt:', refreshError);
          // Continue with request processing even if refresh fails completely
        }
      }
      
      // Handle different response types
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      
      if (contentType.includes('application/json')) {
        // Parse JSON response
        const text = await response.text();
        try {
          data = JSON.parse(text);
          console.log('Parsed JSON response:', {
            dataType: typeof data,
            isArray: Array.isArray(data),
            keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
          });
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          console.log('Raw response text:', text.substring(0, 200) + '...');
          throw new Error('Invalid JSON response from server');
        }
      } else {
        // Handle non-JSON responses
        console.warn(`Received non-JSON response: ${contentType}`);
        const text = await response.text();
        console.log('Raw response text:', text.substring(0, 200) + '...');
        
        // Try to parse as JSON anyway (some servers send JSON with wrong content type)
        try {
          data = JSON.parse(text);
          console.log('Attempted JSON parse succeeded despite content type');
        } catch (parseError) {
          console.log('Could not parse as JSON, using text response');
          data = { text };
        }
      }
      
      // Special handling for notification responses
      if (endpoint.includes('/notifications') && data && data.notifications) {
        console.log('Processing notification response:', {
          count: data.notifications.length,
          sample: data.notifications.length > 0 ? 
            JSON.stringify(data.notifications[0]).substring(0, 100) + '...' : 'none'
        });
        
        // Check for malformed notifications (only containing entity_type)
        const malformedNotifications = data.notifications.filter(
          (n: any) => n && typeof n === 'object' && Object.keys(n).length === 1 && 'entity_type' in n
        );
        
        if (malformedNotifications.length > 0) {
          console.warn(`Found ${malformedNotifications.length} malformed notifications with only entity_type`);
          console.log('Example malformed notification:', malformedNotifications[0]);
          
          // Filter out malformed notifications
          data.notifications = data.notifications.filter(
            (n: any) => !(n && typeof n === 'object' && Object.keys(n).length === 1 && 'entity_type' in n)
          );
          
          console.log(`Filtered out ${malformedNotifications.length} malformed notifications`);
        }
      }
      
      // Construct the response object
      const result: ApiResponse<T> = {
        status: response.status,
        ok: response.ok,
        data: data as T
      };
      
      // Add error information if response is not OK
      if (!response.ok) {
        result.error = data?.error || data?.message || response.statusText || 'Unknown error';
        console.error('API error response:', result.error);
        
        // Handle TOKEN_EXPIRED error
        if (result.error === 'TOKEN_EXPIRED') {
          // Trigger a token refresh (will be handled in the calling component)
          console.log('Token expired, notifying application');
          // Store information about expired token
          localStorage.setItem('token_expired', 'true');
          // We'll use this flag to show a notification to the user
        }
      }
      
      console.log('Final API response object:', {
        status: result.status,
        ok: result.ok,
        error: result.error,
        dataPresent: !!result.data
      });
      console.groupEnd();
      return result;
    } catch (error: any) {
      // Handle network or other errors
      console.error('API request failed:', error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying request (${retryCount}/${maxRetries})...`);
        return attemptRequest();
      }
      
      // Construct error response
      const errorResponse: ApiResponse<T> = {
        status: 0,
        ok: false,
        error: error.message || 'Network error',
        data: null as unknown as T
      };
      
      console.groupEnd();
      return errorResponse;
    }
  }
  
  return attemptRequest();
}

// Add HTTP method helpers as properties of an extended backendClient object
export const backendClientWithMethods = {
  async get<T>(endpoint: string, headers = {}): Promise<ApiResponse<T>> {
    return backendClient<T>({
      endpoint,
      method: 'GET',
      headers
    });
  },

  async post<T>(endpoint: string, body?: any, headers = {}): Promise<ApiResponse<T>> {
    return backendClient<T>({
      endpoint,
      method: 'POST',
      body,
      headers
    });
  },

  async put<T>(endpoint: string, body?: any, headers = {}): Promise<ApiResponse<T>> {
    return backendClient<T>({
      endpoint,
      method: 'PUT',
      body,
      headers
    });
  },

  async patch<T>(endpoint: string, body?: any, headers = {}): Promise<ApiResponse<T>> {
    return backendClient<T>({
      endpoint,
      method: 'PATCH',
      body,
      headers
    });
  },

  async delete<T>(endpoint: string, body?: any, headers = {}): Promise<ApiResponse<T>> {
    return backendClient<T>({
      endpoint,
      method: 'DELETE',
      body,
      headers
    });
  }
};

// Replace the exported function with an object that has both the function properties
// and the HTTP method helpers
Object.assign(backendClient, backendClientWithMethods);