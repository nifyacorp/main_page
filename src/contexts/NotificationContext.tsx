import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, notificationService } from '../lib/api/services/notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUnreadCount = async () => {
    setLoading(true);
    try {
      const response = await notificationService.list({
        page: 1,
        limit: 1,
        unread: true
      });
      
      if (response.data) {
        setUnreadCount(response.data.unread);
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.data) {
        // Reduce unread count by 1 if successful
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.data) {
        // Reset unread count to 0
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    
    // Poll for new notifications every 3 minutes
    const interval = setInterval(refreshUnreadCount, 3 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}; 