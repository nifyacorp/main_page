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
export function handleAuthErrorWithUI(error: any): boolean {
  if (!isAuthError(error)) return false;
  
  console.log('Authentication error detected:', error);
  
  // Show a user-friendly message
  const message = 'Your session has expired. Please log in again.';
  
  // In some cases we may want to show a toast notification
  // but for simplicity, we'll just log and redirect
  
  // Clear auth state
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAuthenticated');
  
  // Redirect to login after a brief delay
  setTimeout(() => {
    window.location.href = '/auth';
  }, 500);
  
  return true;
}

/**
 * Wraps a function to automatically handle auth errors
 * @param fn The function to wrap
 * @returns A wrapped function that attempts to recover from auth errors
 */
export function withAuthRecovery<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
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