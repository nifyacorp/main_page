/**
 * Auth Recovery Utility
 * Helps detect and recover from authentication issues
 */

/**
 * Checks if the error is an authentication error
 * @param error Any error object or message
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  // Check for string errors
  if (typeof error === 'string') {
    return (
      error.includes('MISSING_HEADERS') ||
      error.includes('Unauthorized') ||
      error.includes('Invalid token') ||
      error.includes('Token expired') ||
      error.includes('401')
    );
  }
  
  // Check for error objects
  if (typeof error === 'object') {
    const errorMessage = error.message || error.error || '';
    const errorStatus = error.status || 0;
    
    return (
      errorStatus === 401 ||
      isAuthError(errorMessage) 
    );
  }
  
  return false;
}

/**
 * Attempts to recover from authentication errors
 * @param errorData The error data
 * @returns Promise resolving to true if recovery was successful
 */
export async function recoverFromAuthError(errorData: any): Promise<boolean> {
  console.group('🔐 Auth Recovery');
  console.log('Attempting to recover from auth error:', errorData);
  
  const isAuthRelated = isAuthError(errorData);
  
  if (!isAuthRelated) {
    console.log('Not an auth error, no recovery needed');
    console.groupEnd();
    return false;
  }
  
  // Check if we have credentials to attempt recovery
  const hasAccessToken = !!localStorage.getItem('accessToken');
  const hasRefreshToken = !!localStorage.getItem('refreshToken');
  const hasUserId = !!localStorage.getItem('userId');
  
  console.log('Auth state:', { hasAccessToken, hasRefreshToken, hasUserId });
  
  if (!hasRefreshToken) {
    console.log('No refresh token available, cannot recover');
    console.groupEnd();
    return false;
  }
  
  try {
    // Try to refresh the token
    // Instead of importing refreshAccessToken directly, we'll use the auth client
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        refreshToken: localStorage.getItem('refreshToken') 
      })
    });
    
    if (!response.ok) {
      console.log('Token refresh failed with status:', response.status);
      console.groupEnd();
      return false;
    }
    
    try {
      const data = await response.json();
      
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
            const decodedPayload = JSON.parse(atob(payload));
            if (decodedPayload.sub) {
              console.log('Updated user ID from refreshed token:', decodedPayload.sub);
              localStorage.setItem('userId', decodedPayload.sub);
            }
          }
        } catch (err) {
          console.error('Failed to extract user ID from refreshed token:', err);
        }
        
        console.groupEnd();
        return true;
      }
    } catch (parseError) {
      console.error('Error parsing token refresh response:', parseError);
    }
    
    console.log('Token refresh failed - invalid response');
    console.groupEnd();
    return false;
  } catch (error) {
    console.error('Error during auth recovery:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * Function to handle authentication errors in components
 * Checks for auth errors and redirects to login if needed
 */
/**
 * Ensures token has proper Bearer prefix format
 * Updates localStorage if needed
 * @returns The formatted token or null if no token exists
 */
export function ensureProperTokenFormat(): string | null {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) return null;
  
  // Check if token already has Bearer prefix
  if (!accessToken.startsWith('Bearer ')) {
    const formattedToken = `Bearer ${accessToken}`;
    localStorage.setItem('accessToken', formattedToken);
    console.log('ensureProperTokenFormat: Fixed token format to include Bearer prefix');
    return formattedToken;
  }
  
  return accessToken;
}

/**
 * Completely reset the auth state to clean slate
 * This will clear all auth-related data from localStorage
 */
export function resetAuthState(): void {
  console.log('Completely resetting authentication state');
  
  // Save email for convenience
  const email = localStorage.getItem('email');
  
  // Clear ALL auth state
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('auth_redirect_in_progress');
  localStorage.removeItem('token_expired');
  localStorage.removeItem('auth_state');
  
  // Other potential tokens that might be stored
  localStorage.removeItem('nifya_auth_token');
  localStorage.removeItem('nifya_refresh_token');
  
  // Restore email for login convenience
  if (email) {
    localStorage.setItem('email', email);
  }
}

export function handleAuthErrorWithUI(error: any): boolean {
  if (!isAuthError(error)) return false;
  
  console.log('Authentication error detected:', error);
  
  // Show a user-friendly message
  const message = 'Your session has expired. Please log in again.';
  
  // In some cases we may want to show a toast notification
  // but for simplicity, we'll just log and redirect
  
  // Reset all auth state completely
  resetAuthState();
  
  // Set a flag to prevent infinite redirects
  localStorage.setItem('auth_redirect_in_progress', 'true');
  
  // Redirect to login after a brief delay
  setTimeout(() => {
    // Only redirect if we're not already on the auth page
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    } else {
      console.log('Already on auth page, not redirecting');
      // Just remove the redirect flag since we're already on the auth page
      localStorage.removeItem('auth_redirect_in_progress');
      // Force reload the page to reset the state
      window.location.reload();
    }
  }, 500);
  
  return true;
}

/**
 * Wraps a function to automatically handle auth errors
 * @param fn The function to wrap
 * @returns A wrapped function that attempts to recover from auth errors
 */
/**
 * Function to check auth header and fix common issues
 * Call this before making API requests
 */
export function verifyAuthHeaders(): void {
  // Check if auth is enabled
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    console.log('Not authenticated, skipping auth header verification');
    return;
  }
  
  // Check token format
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  
  // Handle missing token with auth flag set
  if (!accessToken && isAuthenticated) {
    console.warn('Auth inconsistency: isAuthenticated=true but no accessToken');
    // Don't reset auth state here, just log the issue
  }
  
  // Ensure token has Bearer prefix
  if (accessToken && !accessToken.startsWith('Bearer ')) {
    const formattedToken = `Bearer ${accessToken}`;
    localStorage.setItem('accessToken', formattedToken);
    console.log('verifyAuthHeaders: Fixed token format to include Bearer prefix');
  }
  
  // Verify we have userId
  if (!userId && accessToken) {
    console.warn('Missing userId despite having accessToken');
    try {
      // Try to extract from token
      const tokenParts = accessToken.replace('Bearer ', '').split('.');
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.sub) {
          localStorage.setItem('userId', payload.sub);
          console.log('verifyAuthHeaders: Extracted userId from token:', payload.sub);
        }
      }
    } catch (err) {
      console.error('Failed to extract userId from token:', err);
    }
  }
}

export function withAuthRecovery<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    // Verify auth headers before making request
    verifyAuthHeaders();
    
    try {
      return await fn(...args);
    } catch (error) {
      if (isAuthError(error)) {
        const recovered = await recoverFromAuthError(error);
        
        if (recovered) {
          // Retry the original function
          return await fn(...args);
        }
        
        // If recovery failed, handle with UI feedback
        handleAuthErrorWithUI(error);
      }
      
      // Re-throw if not an auth error or recovery failed
      throw error;
    }
  };
}