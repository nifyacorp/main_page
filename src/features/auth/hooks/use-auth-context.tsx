import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { z } from 'zod';
import authService from '../services/auth-service';
import { toast } from '@/components/ui/use-toast';

// User schema for type safety
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: string, code: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for token expired flag
  useEffect(() => {
    const checkTokenExpired = () => {
      const tokenExpired = localStorage.getItem('token_expired');
      if (tokenExpired === 'true') {
        // Clear the flag
        localStorage.removeItem('token_expired');
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
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile`,
        {
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return UserSchema.parse(data.profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (authService.isAuthenticated()) {
          const userProfile = await fetchUserProfile();
          if (userProfile) {
            setUser(userProfile);
          } else {
            // If profile fetch fails but token exists, log out to ensure consistency
            authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.login(email, password);
      const userProfile = await fetchUserProfile();

      if (userProfile) {
        setUser(userProfile);
      } else {
        throw new Error('Failed to fetch user profile after login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // Social login handler
  const socialLogin = useCallback(async (provider: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.socialLogin(provider, code);
      const userProfile = await fetchUserProfile();

      if (userProfile) {
        setUser(userProfile);
      } else {
        throw new Error(`Failed to fetch user profile after ${provider} login`);
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(err instanceof Error ? err.message : `${provider} login failed`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // Logout handler
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Get auth headers for API requests
  const getAuthHeaders = useCallback(() => {
    return authService.getAuthHeaders();
  }, []);

  // Compute authentication state based on user state
  const isAuthenticated = !!user && authService.isAuthenticated();

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        socialLogin,
        logout,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export the context and hook
export default AuthContext;