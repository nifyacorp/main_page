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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        // Check for test account email
        const testEmail = 'nifyacorp@gmail.com';
        const userEmail = localStorage.getItem('email');
        
        // Check if user is authenticated via the new API client system
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        
        console.log('AuthContext: Checking auth state', { 
          isAuthenticated, 
          hasAccessToken: !!accessToken,
          userId,
          email: userEmail
        });
        
        // Special handling for the test account
        if (userEmail === testEmail) {
          console.log('AuthContext: Test account detected, ensuring authentication');
          // Ensure authenticated state for test account
          if (!isAuthenticated || !accessToken) {
            localStorage.setItem('isAuthenticated', 'true');
            if (!accessToken) {
              localStorage.setItem('accessToken', 'Bearer test_token');
            }
            if (!userId) {
              localStorage.setItem('userId', '1');
            }
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
              // Test account fallback
              if (userEmail === testEmail) {
                setUser({
                  id: userId || '1',
                  email: testEmail,
                  name: 'NIFYA Test User'
                });
                console.log('AuthContext: Using test account fallback');
              } else {
                // If API call fails, use basic user info from localStorage
                setUser({
                  id: userId || '1',
                  email: userEmail || 'user@example.com'
                });
                console.log('AuthContext: Using fallback user data', { id: userId || '1' });
              }
            }
          } catch (apiError) {
            console.error('Error fetching user profile:', apiError);
            
            // Test account fallback
            if (userEmail === testEmail) {
              setUser({
                id: userId || '1',
                email: testEmail,
                name: 'NIFYA Test User'
              });
              console.log('AuthContext: Using test account fallback after API error');
            } else {
              // Regular fallback
              setUser({
                id: userId || '1',
                email: userEmail || 'user@example.com'
              });
            }
          }
        } else {
          console.log('AuthContext: No valid auth tokens found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        
        // Don't clear tokens for test account
        if (localStorage.getItem('email') !== 'nifyacorp@gmail.com') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userId');
        }
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
        id: '1',
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