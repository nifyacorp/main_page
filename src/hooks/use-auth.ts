import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

import authService, {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '@/services/api/auth-service';

// Create AuthContext type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
        variant: 'default',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Register function
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully',
        variant: 'default',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not create your account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        variant: 'default',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out properly',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Update profile function
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update your profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Create context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 