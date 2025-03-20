/**
 * Diagnostic utilities for debugging API issues
 */

interface DiagnosticInfo {
  environment: {
    authUrl: string;
    backendUrl: string;
    subscriptionWorkerUrl: string;
    useNetlifyRedirects: boolean;
    environment: string;
    enableLogging: boolean;
  };
  authentication: {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    hasUserId: boolean;
    accessTokenFormat: string;
    userId: string;
  };
  network: {
    currentUrl: string;
    isLocalhost: boolean;
    protocol: string;
    host: string;
  };
  cors: {
    corsHeadersPresent: boolean;
    accessControlAllowOrigin: string | null;
    accessControlAllowMethods: string | null;
    accessControlAllowHeaders: string | null;
  };
  navigator: {
    userAgent: string;
    connection: any;
    onLine: boolean;
  };
}

/**
 * Collects diagnostic information about the current environment
 */
export function collectDiagnosticInfo(): DiagnosticInfo {
  const info: DiagnosticInfo = {
    environment: {
      authUrl: import.meta.env.VITE_AUTH_URL || 'Not configured',
      backendUrl: import.meta.env.VITE_BACKEND_URL || 'Not configured',
      subscriptionWorkerUrl: import.meta.env.VITE_SUBSCRIPTION_WORKER || 'Not configured',
      useNetlifyRedirects: import.meta.env.VITE_USE_NETLIFY_REDIRECTS === 'true',
      environment: import.meta.env.VITE_ENV || 'Not configured',
      enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
    },
    authentication: {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      hasAccessToken: !!localStorage.getItem('accessToken'),
      hasRefreshToken: !!localStorage.getItem('refreshToken'),
      hasUserId: !!localStorage.getItem('userId'),
      accessTokenFormat: formatToken(localStorage.getItem('accessToken')),
      userId: localStorage.getItem('userId') || 'Not available',
    },
    network: {
      currentUrl: window.location.href,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      protocol: window.location.protocol,
      host: window.location.host,
    },
    cors: {
      corsHeadersPresent: false,
      accessControlAllowOrigin: null,
      accessControlAllowMethods: null,
      accessControlAllowHeaders: null,
    },
    navigator: {
      userAgent: navigator.userAgent,
      connection: getConnectionInfo(),
      onLine: navigator.onLine,
    },
  };

  return info;
}

/**
 * Get connection information from the Navigator API
 */
function getConnectionInfo() {
  const nav: any = navigator;
  if (nav.connection) {
    return {
      effectiveType: nav.connection.effectiveType || 'unknown',
      downlink: nav.connection.downlink || 'unknown',
      rtt: nav.connection.rtt || 'unknown',
      saveData: nav.connection.saveData || false,
    };
  }
  return 'Not available';
}

/**
 * Format token for display, masking most of it
 */
function formatToken(token: string | null): string {
  if (!token) return 'Not present';
  
  // Handle Bearer format
  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }
  
  // Check if it's a JWT
  const parts = token.split('.');
  if (parts.length === 3) {
    return `JWT: ${token.substring(0, 10)}...${token.substring(token.length - 5)} (valid format)`;
  }
  
  // Just mask a regular token
  return `${token.substring(0, 5)}...${token.substring(token.length - 5)} (${token.length} chars)`;
}

/**
 * Test backend connectivity and gather CORS information
 */
export async function testBackendConnectivity(): Promise<{success: boolean, message: string, details: any}> {
  try {
    const url = import.meta.env.VITE_BACKEND_URL || 'Not configured';
    
    // Skip test if using Netlify redirects (since we'd be making a local request)
    if (import.meta.env.VITE_USE_NETLIFY_REDIRECTS === 'true') {
      return {
        success: false,
        message: 'Cannot test CORS with Netlify redirects enabled',
        details: { netlifyCorsNote: 'Netlify redirects bypass CORS entirely' }
      };
    }
    
    // Test with a harmless health endpoint
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check for CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    
    const corsHeadersPresent = !!corsHeaders['Access-Control-Allow-Origin'];
    
    // Process response
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawText: text.slice(0, 100) + (text.length > 100 ? '...' : '') };
    }
    
    return {
      success: response.ok,
      message: response.ok ? 'Backend connectivity test successful' : `Error: ${response.status} ${response.statusText}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        corsHeaders,
        corsHeadersPresent,
        data,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Backend connectivity test failed: ${error.message}`,
      details: { error: error.message, stack: error.stack }
    };
  }
}

/**
 * Formats diagnostic information for display
 */
export function formatDiagnosticInfo(info: DiagnosticInfo): string {
  return `
# NIFYA Diagnostic Information

## Environment
- Auth URL: ${info.environment.authUrl}
- Backend URL: ${info.environment.backendUrl}
- Subscription Worker URL: ${info.environment.subscriptionWorkerUrl}
- Using Netlify Redirects: ${info.environment.useNetlifyRedirects ? 'Yes' : 'No'}
- Environment: ${info.environment.environment}
- Logging Enabled: ${info.environment.enableLogging ? 'Yes' : 'No'}

## Authentication
- Is Authenticated: ${info.authentication.isAuthenticated ? 'Yes' : 'No'}
- Has Access Token: ${info.authentication.hasAccessToken ? 'Yes' : 'No'}
- Access Token Format: ${info.authentication.accessTokenFormat}
- Has Refresh Token: ${info.authentication.hasRefreshToken ? 'Yes' : 'No'}
- User ID: ${info.authentication.userId}

## Network
- Current URL: ${info.network.currentUrl}
- Is Localhost: ${info.network.isLocalhost ? 'Yes' : 'No'}
- Protocol: ${info.network.protocol}
- Host: ${info.network.host}

## CORS
- CORS Headers Present: ${info.cors.corsHeadersPresent ? 'Yes' : 'No'}
- Access-Control-Allow-Origin: ${info.cors.accessControlAllowOrigin || 'Not present'}
- Access-Control-Allow-Methods: ${info.cors.accessControlAllowMethods || 'Not present'}
- Access-Control-Allow-Headers: ${info.cors.accessControlAllowHeaders || 'Not present'}

## Browser
- User Agent: ${info.navigator.userAgent}
- Connection: ${JSON.stringify(info.navigator.connection)}
- Online: ${info.navigator.onLine ? 'Yes' : 'No'}
  `;
}

/**
 * Log diagnostic information to the console
 */
export function logDiagnosticInfo() {
  const info = collectDiagnosticInfo();
  console.group('🔍 NIFYA Diagnostic Information');
  console.log('Environment:', info.environment);
  console.log('Authentication:', info.authentication);
  console.log('Network:', info.network);
  console.log('CORS:', info.cors);
  console.log('Navigator:', info.navigator);
  console.groupEnd();
  return info;
}