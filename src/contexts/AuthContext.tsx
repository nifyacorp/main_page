import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { user as userService, auth } from '../lib/api';
import { toast } from '../components/ui/use-toast';

/**
 * Debug function to decode and display JWT token contents
 */
function debugJwtToken(tokenName: string, token: string | null | undefined): void {
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

type User = {
  id: string;
  email: string;
  name?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null); // State to track auth errors
  
  const logout = useCallback(() => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    // Keep email for convenience
    setUser(null);
  }, []);
  
  // Check for token expired flag
  useEffect(() => {
    const checkTokenExpired = () => {
      const tokenExpired = localStorage.getItem('token_expired');
      if (tokenExpired === 'true') {
        // Clear the flag
        localStorage.removeItem('token_expired');
        // Logout user
        console.log('Session expired. Logging out user due to expired token.');
        logout();
        // Show toast notification
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    // Check on mount
    checkTokenExpired();

    // Set up interval to check periodically
    const intervalId = setInterval(checkTokenExpired, 5000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [logout]);

  // Check for existing auth on mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const checkAuth = async () => {
      setIsLoading(true); // Start loading
      setAuthError(null); // Clear previous errors
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        let accessToken = localStorage.getItem('accessToken');
        let userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('email');
        
        console.log('AuthContext: Checking auth state', { 
          isAuthenticated, 
          hasAccessToken: !!accessToken,
          userId,
          email: userEmail
        });
        
        // Log token contents for debugging
        if (accessToken) {
          debugJwtToken('Stored Access Token', accessToken);
        }
        
        // Fix token format if needed - ensure it has Bearer prefix
        if (accessToken && !accessToken.startsWith('Bearer ')) {
          accessToken = `Bearer ${accessToken}`;
          localStorage.setItem('accessToken', accessToken);
          console.log('AuthContext: Fixed token format to include Bearer prefix');
        }
        
        // Extract userId from token if it's missing
        if (!userId && accessToken) {
          try {
            const tokenParts = accessToken.replace('Bearer ', '').split('.');
            if (tokenParts.length >= 2) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.sub) {
                userId = payload.sub;
                localStorage.setItem('userId', userId);
                console.log('AuthContext: Extracted userId from token:', userId);
              }
            }
          } catch (tokenError) {
            console.error('Failed to extract userId from token:', tokenError);
          }
        }
        
        if (isAuthenticated && accessToken) {
          // Profile fetch is now primary source of truth after initial check
          console.log('AuthContext: Attempting to load user profile for authenticated user');
          try {
            const response = await userService.getProfile();
            if (isMounted) {
              if (response.data && !response.error) {
                setUser(response.data.profile);
                console.log('AuthContext: User profile loaded successfully', response.data.profile);
              } else {
                console.error('AuthContext: Failed to load user profile, logging out.', response.error);
                console.log('📝 DEBUG: Profile fetch failed - accessToken:', accessToken ? accessToken.substring(0, 15) + '...' : 'null');
                setAuthError('Failed to load user profile. Please try logging in again.');
                logout(); // Log out if profile fetch fails
              }
            }
          } catch (apiError) {
            console.error('AuthContext: Error fetching user profile during initial check:', apiError);
            console.log('📝 DEBUG: Profile fetch exception - accessToken:', accessToken ? accessToken.substring(0, 15) + '...' : 'null');
            if (isMounted) {
              setAuthError('An error occurred while verifying your session. Please try logging in again.');
              logout(); // Log out on critical API error
            }
          }
        } else {
          console.log('AuthContext: No valid auth tokens/state found, user is logged out.');
          if (isMounted) {
             setUser(null); // Ensure user state is null if not authenticated
          }
        }
      } catch (error) {
        console.error('AuthContext: Auth check failed catastrophically:', error);
        if (isMounted) {
          setAuthError('An unexpected error occurred during authentication check.');
          logout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // Stop loading
        }
      }
    };
    
    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [logout]);
  
  const login = useCallback(async (token: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Ensure token has Bearer prefix
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('AuthContext: Storing authentication token with proper Bearer format');
      debugJwtToken('Login Access Token', formattedToken);
      
      localStorage.setItem('accessToken', formattedToken);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Try to extract user ID from token
      let userId = null;
      let email = null;
      try {
        const tokenParts = formattedToken.replace('Bearer ', '').split('.');
        if (tokenParts.length >= 2) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.sub) {
            userId = payload.sub;
            localStorage.setItem('userId', payload.sub);
            console.log('AuthContext: Extracted userId from token:', userId);
          }
          if (payload.email) {
            email = payload.email;
            localStorage.setItem('email', payload.email);
            console.log('AuthContext: Extracted email from token:', email);
          }
        }
      } catch (tokenError) {
        console.error('Failed to extract userId from login token:', tokenError);
      }
      
      // Set user information immediately based on token (temporary)
      const tempUser: User = {
        id: userId || 'unknown-id',
        email: email || 'unknown-email'
      };
      setUser(tempUser);
      console.log('AuthContext: Set temporary user data from token', tempUser);
      
      // After setting tokens, fetch the user profile to get full details
      try {
        console.log('AuthContext: Fetching profile immediately after login');
        const response = await userService.getProfile();
        if (response.data && !response.error) {
          setUser(response.data.profile);
          console.log('AuthContext: User profile loaded successfully after login', response.data.profile);
        } else {
          console.warn('AuthContext: Failed to load profile immediately after login, using token data.', response.error);
          console.log('📝 DEBUG: Profile fetch failed during login - using token fallback');
          // Keep the temporary user data from token but still consider the user logged in
          console.log('AuthContext: Using fallback user data from token to maintain login state');
          // Don't set auth error as this prevents the user from proceeding
        }
      } catch (profileError) {
        console.error('AuthContext: Error fetching profile after login:', profileError);
        console.log('📝 DEBUG: Profile fetch exception during login - using token fallback');
        // Keep the temporary user data from token and maintain login state
        console.log('AuthContext: Using fallback user data from token due to profile fetch error');
        // Don't show error to user to allow them to proceed with basic functionality
      }
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setAuthError('Login process failed.');
      logout(); // Ensure cleanup on login failure
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);
  
  // Compute authentication state based ONLY on the user state
  const isAuthenticated = !!user;
  
  // Effect to log authentication state changes for debugging
  useEffect(() => {
    console.log('Auth state in header updated:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
