import React, { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { handleAuthErrorWithUI, ensureProperTokenFormat } from '../lib/utils/auth-recovery';

/**
 * Authentication error handler component 
 * Wraps the app and provides global auth error handling
 */
const AuthErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // First ensure proper token format on component mount
  useEffect(() => {
    // Ensure proper Bearer token format in localStorage
    ensureProperTokenFormat();
  }, []);
  
  useEffect(() => {
    // Function to intercept and handle global fetch errors
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      // Before each fetch request, ensure token has proper format
      ensureProperTokenFormat();
      
      try {
        const response = await originalFetch.apply(this, args);
        
        // Check for auth errors in responses
        if (response.status === 401) {
          const clonedResponse = response.clone();
          
          try {
            const data = await clonedResponse.json();
            if (data?.error === 'MISSING_HEADERS') {
              console.warn('Auth error detected in fetch response:', data);
              
              // Check if we're in a redirect loop
              const redirectInProgress = localStorage.getItem('auth_redirect_in_progress') === 'true';
              
              // Only show the auth error UI if user should be authenticated
              // and we're not already in a redirect
              if (isAuthenticated && !redirectInProgress) {
                // Try to fix token format one more time
                if (ensureProperTokenFormat()) {
                  console.log('Fixed token format, refreshing page to retry');
                  // Instead of showing error UI immediately, refresh the page to try with fixed token
                  window.location.reload();
                  return response;
                }
                
                // If token is already formatted correctly or missing, show auth error UI
                handleAuthErrorWithUI(data);
              }
            }
          } catch (e) {
            // If response isn't JSON, continue normally
          }
        }
        
        return response;
      } catch (error: any) {
        // For network errors, check if it's auth-related
        if (isAuthenticated && error.message?.includes('Unauthorized')) {
          handleAuthErrorWithUI(error);
        }
        throw error;
      }
    };
    
    // Clean up the override when the component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated]);
  
  return <>{children}</>;
};

export default AuthErrorHandler;