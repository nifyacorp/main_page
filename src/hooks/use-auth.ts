import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to use the auth context
 * This is the only hook that should be used for authentication across the app
 * It provides consistent access to auth state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add utility functions for auth
  const authHeaders = () => {
    // Get token from localStorage
    let token = localStorage.getItem('accessToken');
    
    // Ensure token has Bearer prefix
    if (token && !token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
      localStorage.setItem('accessToken', token);
      console.log('authHeaders: Fixed token format to include Bearer prefix');
    }
    
    return {
      'Authorization': token || '',
      'Content-Type': 'application/json',
    };
  };
  
  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    // Simple permission check - in a real app, would check user roles/permissions
    return context.isAuthenticated;
  };
  
  return {
    ...context,
    authHeaders,
    hasPermission,
  };
}

export default useAuth;