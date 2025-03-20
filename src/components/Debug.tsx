import React from 'react';
import { Navigate } from 'react-router-dom';
import DebugPage from '@/pages/Debug';

/**
 * Debug component that redirects to the dedicated debug page
 */
export default function Debug() {
  // For security, check if the user should have access to the debug page
  // In a production system, you might want to limit this to admins or developers
  const allowDebug = import.meta.env.MODE === 'development' || 
                     import.meta.env.VITE_ALLOW_DEBUG === 'true';

  if (!allowDebug) {
    console.warn('Debug page access blocked in production. Use development mode or set VITE_ALLOW_DEBUG=true');
    return <Navigate to="/dashboard" />;
  }

  return <DebugPage />;
}