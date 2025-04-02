import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add a utility function to get auth headers
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
  
  return {
    ...context,
    authHeaders,
  };
}

export default useAuth;