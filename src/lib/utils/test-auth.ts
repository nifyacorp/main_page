/**
 * Test utility to diagnose token refresh issues
 */

/**
 * Checks the current token state and attempts a refresh
 * Can be used to diagnose refresh token issues
 */
export async function testTokenRefresh(): Promise<void> {
  console.group('🧪 Testing Token Refresh');
  
  // Check current state
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  console.log('Current auth state:', {
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken,
    isAuthenticated,
  });
  
  if (refreshToken) {
    console.log('Refresh token first 10 chars:', refreshToken.substring(0, 10) + '...');
    console.log('Is token valid JWT format:', 
      refreshToken.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/) ? 'Yes' : 'No');
  } else {
    console.log('No refresh token available to test');
    console.groupEnd();
    return;
  }
  
  try {
    console.log('Attempting manual token refresh...');
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    console.log('Refresh response status:', response.status);
    
    if (!response.ok) {
      console.error('Token refresh failed');
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.log('No JSON error details available');
      }
      console.groupEnd();
      return;
    }
    
    try {
      const data = await response.json();
      console.log('Refresh successful:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn
      });
      
      // Update token storage with new tokens
      if (data.accessToken) {
        const token = data.accessToken.startsWith('Bearer ')
          ? data.accessToken
          : `Bearer ${data.accessToken}`;
        
        localStorage.setItem('accessToken', token);
        console.log('Updated access token in storage');
      }
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('Updated refresh token in storage');
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      console.log('Token refresh test completed successfully');
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
    }
  } catch (error) {
    console.error('Error testing token refresh:', error);
  }
  
  console.groupEnd();
}

// Function to manually trigger refresh token testing
export function setupTokenRefreshTest(): void {
  // Add a global method to diagnose token issues
  (window as any).testAuth = {
    testTokenRefresh,
    getAuthState: () => ({
      accessToken: localStorage.getItem('accessToken')?.substring(0, 15) + '...',
      refreshToken: localStorage.getItem('refreshToken')?.substring(0, 15) + '...',
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      userId: localStorage.getItem('userId')
    })
  };
  
  console.log('Auth test utilities loaded. Call window.testAuth.testTokenRefresh() to test token refresh.');
} 