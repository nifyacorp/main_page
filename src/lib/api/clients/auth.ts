import { ApiResponse } from '../types';

interface RequestConfig {
  endpoint: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

const AUTH_URL = import.meta.env.VITE_AUTH_URL;

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
    const data = await response.json();
    
    console.log('Response:', {
      status: response.status,
      ok: response.ok,
      data: { ...data, accessToken: '********', refreshToken: '********' }
    });

    if (!response.ok) {
      const error = data as { message?: string; error?: string };
      console.error('Request failed:', error);
      console.groupEnd();
      throw new Error(error.message || error.error || 'Request failed');
    }

    // Store tokens if present in response
    if ('accessToken' in data) {
      console.group('🔑 Processing Auth Tokens');
      
      // Ensure token is in Bearer format before storing
      const token = data.accessToken.startsWith('Bearer ') ? 
        data.accessToken : 
        `Bearer ${data.accessToken}`;
      
      localStorage.setItem('accessToken', token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      try {
        // Parse user ID from token and store it
        const [, payload] = token.replace('Bearer ', '').split('.');
        if (payload) {
          const decodedPayload = JSON.parse(atob(payload));
          if (decodedPayload.sub) {
            console.log('Extracted user ID from token:', decodedPayload.sub);
            localStorage.setItem('userId', decodedPayload.sub);
          }
        }
      } catch (err) {
        console.error('Failed to extract user ID from token:', err);
      }
      
      console.groupEnd();
    }

    console.groupEnd();
    return { data };
  } catch (error) {
    console.error('Request error:', error);
    console.groupEnd();
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}