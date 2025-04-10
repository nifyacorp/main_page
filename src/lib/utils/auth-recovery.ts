/**
 * Auth Recovery Utility
 * Helps detect and recover from authentication issues
 */

// IMPORTANT: Use ONLY these constants for token management - DO NOT USE FALLBACKS
const AUTH_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Ensures the access token has the proper Bearer format
 * @returns true if a fix was applied, false if no change was needed
 */
export function ensureProperTokenFormat(): boolean {
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!accessToken) {
    return false;
  }
  
  // If token doesn't have Bearer prefix, add it
  if (!accessToken.startsWith('Bearer ')) {
    const formattedToken = `Bearer ${accessToken}`;
    localStorage.setItem(AUTH_TOKEN_KEY, formattedToken);
    console.log('ensureProperTokenFormat: Fixed token format to include Bearer prefix');
    return true;
  }
  
  return false;
}

/**
 * Debug function to decode and display JWT token contents
 */
function debugJwtToken(tokenName: string, token: string | null): void {
  console.group(`🔍 DEBUG: ${tokenName} Contents`);
  
  if (!token) {
    console.log('Token is null or empty');
    console.groupEnd();
    return;
  }
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
  
  try {
    // Split token into parts
    const parts = tokenValue.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format - should have 3 parts');
      console.groupEnd();
      return;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('Raw token (first 15 chars):', tokenValue.substring(0, 15) + '...');
    console.log('Decoded payload:', {
      sub: payload.sub,         // User ID
      type: payload.type,       // Token type (access, refresh)
      exp: payload.exp,         // Expiration timestamp
      iat: payload.iat,         // Issued at timestamp
      expiresIn: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry'
    });
    
    // Calculate expiration
    if (payload.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const timeLeft = (expiresAt.getTime() - now.getTime()) / 1000;
      
      console.log('Expiration:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        timeLeftSeconds: Math.floor(timeLeft),
        isExpired: timeLeft <= 0
      });
    }
  } catch (error) {
    console.log('Error decoding token:', error);
    console.log('Raw token value:', token);
  }
  
  console.groupEnd();
}

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
  console.log('Authentication error detected:', errorData);
  
  const isAuthRelated = isAuthError(errorData);
  
  if (!isAuthRelated) {
    console.log('Not an auth error, no recovery needed');
    console.groupEnd();
    return false;
  }
  
  console.log('Auth error requires re-login');
  
  // Reset auth state
  resetAuthState();
  
  // Set flag for UI notification
  localStorage.setItem('token_expired', 'true');
  
  // No recovery possible without refresh tokens
  console.log('Auth session expired, redirecting to login');
  console.groupEnd();
  
  return false;
}

/**
 * Completely reset the auth state to clean slate
 * This will clear all auth-related data from localStorage
 */
export function resetAuthState(): void {
  console.log('Completely resetting authentication state');
  
  // Save email for convenience
  const email = localStorage.getItem('email');
  
  // Clear ALL auth state - Use consistent key names
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('userId');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('auth_redirect_in_progress');
  localStorage.removeItem('token_expired');
  localStorage.removeItem('auth_state');
  
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
 * Function to check if a URL is a public path that doesn't require authentication
 */
export function isPublicPath(path: string): boolean {
  const publicPaths = ['/', '/auth'];
  // Check if the path is in the public paths list or starts with any of them
  return publicPaths.some(prefix => 
    path === prefix || 
    path.startsWith(`${prefix}/`) ||
    path.startsWith(`${prefix}?`)
  );
}

/**
 * Detects and breaks auth redirect loops
 * Call this whenever redirecting to the auth page
 * @returns true if a loop was detected and broken
 */
export function detectAndBreakAuthRedirectLoop(): boolean {
  // Get the last redirect time
  const lastRedirectTime = parseInt(localStorage.getItem('auth_redirect_timestamp') || '0');
  const currentTime = Date.now();
  
  // Get the redirect count
  const redirectCount = parseInt(localStorage.getItem('auth_redirect_count') || '0');
  
  // If we've had multiple redirects in a short time, we're in a loop
  const isInLoop = (currentTime - lastRedirectTime < 2000) && redirectCount > 2;
  
  // Update the timestamp and count
  localStorage.setItem('auth_redirect_timestamp', currentTime.toString());
  localStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
  
  // If we detect a loop, reset everything
  if (isInLoop) {
    console.error('Auth redirect loop detected! Breaking the loop.');
    resetAuthState();
    // Reset the loop detection counters
    localStorage.removeItem('auth_redirect_timestamp');
    localStorage.removeItem('auth_redirect_count');
    
    return true;
  }
  
  return false;
}

/**
 * Function to check auth header and fix common issues
 * Call this before making API requests
 */
export function verifyAuthHeaders(): void {
  // Check if auth is enabled
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // If we're on a public path, we shouldn't need auth headers
  const currentPath = window.location.pathname;
  if (isPublicPath(currentPath)) {
    console.log(`On public path ${currentPath}, authentication optional`);
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, skipping auth header verification');
    return;
  }
  
  // Check token format
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = localStorage.getItem('userId');
  
  console.group('🔒 Verifying Auth Headers');
  console.log('Current auth state:', {
    isAuthenticated,
    hasAccessToken: !!accessToken,
    hasUserId: !!userId
  });
  
  // Debug the token
  debugJwtToken('Current Access Token', accessToken);
  
  // Handle missing token with auth flag set
  if (!accessToken && isAuthenticated) {
    console.warn('Auth inconsistency: isAuthenticated=true but no accessToken');
    // Don't reset auth state here, just log the issue
  }
  
  // Ensure token has Bearer prefix
  if (accessToken && !accessToken.startsWith('Bearer ')) {
    const formattedToken = `Bearer ${accessToken}`;
    localStorage.setItem(AUTH_TOKEN_KEY, formattedToken);
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
  
  console.groupEnd();
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