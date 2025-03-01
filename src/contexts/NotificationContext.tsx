import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Notification, 
  notificationService, 
  NotificationApiResponse,
  enhanceNotifications 
} from '../lib/api/services/notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  deleteAllNotifications: () => Promise<boolean>;
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
      
      if (!response.error && response.data) {
        setUnreadCount(response.data.unread);
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (!response.error && response.data) {
        // Reduce unread count by 1 if successful
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (!response.error && response.data) {
        // Reset unread count to 0
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const deleteNotification = async (id: string): Promise<boolean> => {
    console.group('🗑️ NotificationContext - Delete Notification');
    console.log('Attempting to delete notification', { 
      id,
      hasId: !!id,
      idType: typeof id,
      isValid: id !== undefined && id !== null && id !== 'undefined' && id !== 'null'
    });
    
    // Validate notification ID
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid notification ID provided to deleteNotification');
      console.groupEnd();
      return false;
    }
    
    try {
      const response = await notificationService.deleteNotification(id);
      
      if (response.error) {
        console.error('Error deleting notification:', response.error);
        console.groupEnd();
        return false;
      }
      
      if (response.data && response.data.success) {
        console.log('Successfully deleted notification:', response.data);
        
        // Update the notifications state immediately to remove the deleted notification
        setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
        
        // Update total count
        setTotalCount(prevCount => Math.max(0, prevCount - 1));
        
        // Also refresh the unread count
        refreshUnreadCount();
        
        console.groupEnd();
        return true;
      }
      
      console.error('Unexpected response from deleteNotification:', response);
      console.groupEnd();
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      console.groupEnd();
      return false;
    }
  };

  const deleteAllNotifications = async (): Promise<boolean> => {
    console.group('🗑️ NotificationContext - Delete All Notifications');
    console.log('Attempting to delete all notifications');
    
    try {
      const response = await notificationService.deleteAllNotifications();
      
      if (response.error) {
        console.error('Error deleting all notifications:', response.error);
        console.groupEnd();
        return false;
      }
      
      if (response.data && response.data.success) {
        console.log('Successfully deleted all notifications:', response.data);
        // Reset unread count to 0 since all notifications are gone
        setUnreadCount(0);
        console.groupEnd();
        return true;
      }
      
      console.warn('Deletion response did not indicate success:', response.data);
      console.groupEnd();
      return false;
    } catch (error) {
      console.error('Exception when deleting all notifications:', error);
      console.groupEnd();
      return false;
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
        deleteNotification,
        deleteAllNotifications,
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