import { ApiResponse } from '../types';

interface RequestConfig {
  endpoint: string;
  method?: string;
  body?: {
    email?: string;
    password?: string;
    refreshToken?: string;
    name?: string;
    [key: string]: any;
  };
  headers?: Record<string, string>;
}

// Ensure we have a valid auth URL, fallback to environment or hardcoded value
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://authentication-service-415554190254.us-central1.run.app';
console.log('Auth URL being used:', AUTH_URL);

export async function authClient<T>({
  endpoint,
  method = 'GET',
  body,
  headers = {}
}: RequestConfig): Promise<ApiResponse<T>> {
  console.group('🔐 Auth Service Request');
  console.log('Request Details:', {
    url: `${AUTH_URL}${endpoint}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? { ...body, password: body.password ? '********' : undefined } : undefined
  });

  const url = `${AUTH_URL}${endpoint}`;
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(url, requestOptions);
    
    // Handle network errors or non-JSON responses
    if (!response.ok) {
      try {
        const data = await response.json();
        console.error('Server error response:', data);
        console.groupEnd();
        return { 
          error: data.message || data.error || `Request failed with status ${response.status}`
        };
      } catch (jsonError) {
        console.error('Failed to parse error response:', jsonError);
        console.groupEnd();
        return { 
          error: `Request failed with status ${response.status}`
        };
      }
    }
    
    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      console.groupEnd();
      return { 
        error: 'Invalid response format from server'
      };
    }
    
    console.log('Response:', {
      status: response.status,
      ok: response.ok,
      data: { ...data, accessToken: data.accessToken ? '********' : undefined, refreshToken: data.refreshToken ? '********' : undefined }
    });

    // Store tokens if present in response
    if (data.accessToken) {
      console.group('🔑 Processing Auth Tokens');
      
      // Ensure token is in Bearer format before storing
      const token = data.accessToken.startsWith('Bearer ') ? 
        data.accessToken : 
        `Bearer ${data.accessToken}`;
      
      localStorage.setItem('accessToken', token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Set isAuthenticated flag consistently across all auth flows
      localStorage.setItem('isAuthenticated', 'true');
      
      try {
        // Parse user ID from token and store it
        const [, payload] = token.replace('Bearer ', '').split('.');
        if (payload) {
          try {
            const decodedPayload = JSON.parse(atob(payload));
            if (decodedPayload.sub) {
              console.log('Extracted user ID from token:', decodedPayload.sub);
              localStorage.setItem('userId', decodedPayload.sub);
            } else {
              console.warn('Token payload does not contain sub field:', decodedPayload);
              // If we can't get a user ID, auth will fail later, but we set a placeholder
              // This helps identify the issue in logs when API calls fail
              localStorage.setItem('userId', 'invalid-token-no-sub');
            }
          } catch (parseError) {
            console.error('Failed to parse token payload JSON:', parseError);
            localStorage.setItem('userId', 'invalid-token-payload');
          }
        } else {
          console.warn('Could not extract payload from token - invalid format');
          localStorage.setItem('userId', 'invalid-token-format');
        }
      } catch (err) {
        console.error('Failed to extract user ID from token:', err);
        localStorage.setItem('userId', 'token-extraction-error');
      }
      
      console.groupEnd();
    }

    console.groupEnd();
    return { data };
  } catch (error) {
    console.error('Network or request error:', error);
    console.groupEnd();
    return { 
      error: error instanceof Error ? error.message : 'Network error connecting to authentication service'
    };
  }
}