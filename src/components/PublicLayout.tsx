import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for public pages (non-authenticated users)
 * Provides consistent layout with header and proper styling
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header is already handled in App.tsx */}
      <main className="w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout; 