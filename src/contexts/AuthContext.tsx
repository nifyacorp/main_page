import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { user as userService } from '../lib/api';
import { toast } from '../components/ui/use-toast';

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
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    // Keep email for convenience
    setUser(null);
  };
  
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
    const checkAuth = async () => {
      try {
        // Check if user is authenticated via the new API client system
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
          try {
            // Try to get user profile from API
            const response = await userService.getProfile();
            if (response.data && !response.error) {
              setUser(response.data);
              console.log('AuthContext: User loaded from API', response.data);
            } else {
              // If API call fails, use basic user info from localStorage
              console.log('API returned error:', response.error);
              setUser({
                id: userId || '00000000-0000-0000-0000-000000000001',
                email: userEmail || 'user@example.com'
              });
              console.log('AuthContext: Using fallback user data', { id: userId || '00000000-0000-0000-0000-000000000001' });
            }
          } catch (apiError) {
            console.error('Error fetching user profile:', apiError);
            
            // Use fallback user data from localStorage
            setUser({
              id: userId || '00000000-0000-0000-0000-000000000001',
              email: userEmail || 'user@example.com'
            });
          }
        } else {
          console.log('AuthContext: No valid auth tokens found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (token: string) => {
    try {
      // Ensure token has Bearer prefix
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('AuthContext: Storing authentication token with proper Bearer format');
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
      
      // Set user information immediately
      const userEmail = email || localStorage.getItem('email') || 'user@example.com';
      setUser({
        id: userId || localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000001',
        email: userEmail
      });
      
      // After setting tokens, immediately try to get the user profile
      try {
        // Wait a brief moment for token to be set
        setTimeout(async () => {
          try {
            const response = await userService.getProfile();
            if (response.data && !response.error) {
              setUser(response.data);
              console.log('AuthContext: User loaded from API after login', response.data);
            }
          } catch (apiError) {
            console.warn('Failed to load user profile after login, using token data:', apiError);
          }
        }, 500);
      } catch (profileError) {
        console.warn('Error fetching profile after login, using token data:', profileError);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  // Compute authentication state from both user and localStorage
  const computeIsAuthenticated = () => {
    // If we have a user, we're definitely authenticated
    if (user) return true;
    
    // If we're still loading, check localStorage as a fallback
    if (isLoading) {
      // Check localStorage for auth flag and token
      const hasAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
      const hasToken = !!localStorage.getItem('accessToken');
      return hasAuthFlag && hasToken;
    }
    
    // If we're not loading and don't have a user, we're not authenticated
    return false;
  };

  const isAuthenticated = computeIsAuthenticated();
  
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
