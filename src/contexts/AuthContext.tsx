import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { user as userService } from '../lib/api';

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
  
  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated via the new API client system
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('email');
        
        console.log('AuthContext: Checking auth state', { 
          isAuthenticated, 
          hasAccessToken: !!accessToken,
          userId,
          email: userEmail
        });
        
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
      // This function is for backward compatibility
      // New logins should go through the API client which sets localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Mock user data for now, this will be replaced by API call in useEffect
      const email = localStorage.getItem('email') || 'user@example.com';
      setUser({
        id: '00000000-0000-0000-0000-000000000001',
        email: email
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    // Keep email for convenience
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};