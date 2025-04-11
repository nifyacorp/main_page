import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authService } from '../api';
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
  console.log('🔍 AuthContext.tsx: AuthProvider initialized');
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null); // State to track auth errors
  
  const logout = useCallback(() => {
    console.log('🔍 AuthContext.tsx: logout called');
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    // Keep email for convenience
    setUser(null);
  }, []);
  
  // Check for token expired flag
  useEffect(() => {
    console.log('🔍 AuthContext.tsx: token expiry check effect');
    const checkTokenExpired = () => {
      const tokenExpired = localStorage.getItem('token_expired');
      if (tokenExpired === 'true') {
        console.log('🔍 AuthContext.tsx: token_expired flag found, logging out');
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
    console.log('🔍 AuthContext.tsx: auth check effect');
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const checkAuth = async () => {
      console.log('🔍 AuthContext.tsx: checkAuth function running');
      setIsLoading(true); // Start loading
      setAuthError(null); // Clear previous errors
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        let accessToken = localStorage.getItem('accessToken');
        let userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('email');
        
        console.log('🔍 AuthContext.tsx: Loading auth state from localStorage');
        console.log('AuthContext: Checking auth state', { 
          isAuthenticated, 
          hasAccessToken: !!accessToken,
          userId,
          email: userEmail
        });
        
        // Log token contents for debugging
        if (accessToken) {
          console.log('🔍 AuthContext.tsx: Validating token format');
          debugJwtToken('Stored Access Token', accessToken);
        }
        
        // Fix token format if needed - ensure it has Bearer prefix
        if (accessToken && !accessToken.startsWith('Bearer ')) {
          console.log('🔍 AuthContext.tsx: Fixing token format (adding Bearer prefix)');
          accessToken = `Bearer ${accessToken}`;
          localStorage.setItem('accessToken', accessToken);
          console.log('AuthContext: Fixed token format to include Bearer prefix');
        }
        
        // Extract userId from token if it's missing
        if (!userId && accessToken) {
          console.log('🔍 AuthContext.tsx: Extracting userId from token');
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
          // Profile fetch is required for authentication
          console.log('🔍 AuthContext.tsx: Fetching user profile for authenticated user');
          console.log('AuthContext: Attempting to load user profile for authenticated user');
          try {
            console.log('🔍 AuthContext.tsx: Calling userService.getProfile()');
            const response = await authService.getProfile();
            if (isMounted) {
              if (response.data && !response.error) {
                console.log('🔍 AuthContext.tsx: User profile loaded successfully');
                setUser(response.data.profile);
                console.log('AuthContext: User profile loaded successfully', response.data.profile);
              } else {
                console.log('🔍 AuthContext.tsx: Failed to load user profile, logging out');
                console.error('AuthContext: Failed to load user profile, logging out.', response.error);
                setAuthError('Failed to load user profile. Please try logging in again.');
                // Show error to the user
                toast({
                  title: "Error de sesión",
                  description: "No se pudo cargar tu perfil de usuario. Por favor, inicia sesión nuevamente.",
                  variant: "destructive",
                  duration: 5000,
                });
                logout(); // Log out if profile fetch fails
              }
            }
          } catch (apiError) {
            console.log('🔍 AuthContext.tsx: Exception during profile fetch');
            console.error('AuthContext: Error fetching user profile during initial check:', apiError);
            if (isMounted) {
              setAuthError('An error occurred while verifying your session. Please try logging in again.');
              // Show error to the user
              toast({
                title: "Error de verificación",
                description: "Ocurrió un error al verificar tu sesión. Por favor, inicia sesión nuevamente.",
                variant: "destructive",
                duration: 5000,
              });
              logout(); // Log out on critical API error
            }
          }
        } else {
          console.log('🔍 AuthContext.tsx: No valid auth tokens found');
          console.log('AuthContext: No valid auth tokens/state found, user is logged out.');
          if (isMounted) {
            setUser(null); // Ensure user state is null if not authenticated
          }
        }
      } catch (error) {
        console.log('🔍 AuthContext.tsx: Catastrophic failure during auth check');
        console.error('AuthContext: Auth check failed catastrophically:', error);
        if (isMounted) {
          setAuthError('An unexpected error occurred during authentication check.');
          // Show error to the user
          toast({
            title: "Error de autenticación",
            description: "Ocurrió un error inesperado durante la verificación de autenticación.",
            variant: "destructive",
            duration: 5000,
          });
          logout();
        }
      } finally {
        if (isMounted) {
          console.log('🔍 AuthContext.tsx: Auth check complete, setting loading to false');
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
    console.log('🔍 AuthContext.tsx: login function called');
    setIsLoading(true);
    setAuthError(null);
    try {
      // Ensure token has Bearer prefix
      console.log('🔍 AuthContext.tsx: Validating token format');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('🔍 AuthContext.tsx: Storing authentication token');
      console.log('AuthContext: Storing authentication token with proper Bearer format');
      debugJwtToken('Login Access Token', formattedToken);
      
      localStorage.setItem('accessToken', formattedToken);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Extract user ID and email from token - CRITICAL for backend communication
      console.log('🔍 AuthContext.tsx: Extracting user data from token');
      let userId = null;
      let email = null;
      let userName = null;
      
      try {
        const tokenParts = formattedToken.replace('Bearer ', '').split('.');
        if (tokenParts.length >= 2) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Decoded token payload:', payload);
          
          // Extract user ID (sub claim)
          if (payload.sub) {
            userId = payload.sub;
            localStorage.setItem('userId', payload.sub);
            console.log('AuthContext: Extracted userId from token:', userId);
          } else {
            console.warn('Token payload does not contain sub (user ID) claim');
          }
          
          // Extract email
          if (payload.email) {
            email = payload.email;
            localStorage.setItem('email', payload.email);
            console.log('AuthContext: Extracted email from token:', email);
          }
          
          // Extract name if available
          if (payload.name) {
            userName = payload.name;
            console.log('AuthContext: Extracted name from token:', userName);
          }
        }
      } catch (tokenError) {
        console.error('Failed to extract data from login token:', tokenError);
      }
      
      if (!userId) {
        console.warn('Could not extract user ID from token. This will cause backend authentication issues.');
      }
      
      // After setting tokens, fetch the user profile to get full details
      console.log('🔍 AuthContext.tsx: Fetching complete user profile');
      console.log('AuthContext: Fetching profile immediately after login');
      const response = await authService.getProfile();
      
      if (response.data && !response.error) {
        console.log('🔍 AuthContext.tsx: User profile loaded successfully');
        setUser(response.data.profile);
        console.log('AuthContext: User profile loaded successfully after login', response.data.profile);
      } else {
        console.log('🔍 AuthContext.tsx: Failed to load profile, login failed');
        console.error('AuthContext: Profile retrieval failed:', response.error);
        const errorMessage = response.error || 'Failed to retrieve user profile';
        setAuthError(errorMessage);
        // Show error to the user
        toast({
          title: "Error de autenticación",
          description: "No se pudo obtener el perfil de usuario. Por favor, intenta iniciar sesión nuevamente.",
          variant: "destructive",
          duration: 5000,
        });
        // Log out user since profile retrieval is required
        logout();
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.log('🔍 AuthContext.tsx: Login failed with error');
      console.error('AuthContext: Login failed:', error);
      setAuthError('Login process failed.');
      logout(); // Ensure cleanup on login failure
      throw error;
    } finally {
      console.log('🔍 AuthContext.tsx: Login process complete, setting loading to false');
      setIsLoading(false);
    }
  }, [logout]);
  
  // Compute authentication state based ONLY on the user state
  const isAuthenticated = !!user;
  
  // Effect to log authentication state changes for debugging
  useEffect(() => {
    console.log('🔍 AuthContext.tsx: Auth state change detected');
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
