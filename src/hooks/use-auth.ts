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
    const token = localStorage.getItem('accessToken');
    // Ensure token has Bearer prefix
    const formattedToken = token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
    
    return {
      'Authorization': formattedToken || '',
      'Content-Type': 'application/json',
    };
  };
  
  return {
    ...context,
    authHeaders,
  };
}

export default useAuth;