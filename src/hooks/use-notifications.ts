import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { 
  notificationService,
  Notification,
  NotificationListParams,
  NotificationApiResponse,
  NotificationsResponse,
  NotificationFilterOptions
} from '../api';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for working with notifications
 * This is the central access point for notification functionality
 */
export function useNotifications() {
  // Get the core notification context
  const notificationContext = useContext(NotificationContext);
  
  if (!notificationContext) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  /**
   * Fetch a paginated list of notifications
   */
  const getNotifications = (params: NotificationListParams = { page: 1, limit: 10 }) => {
    return useQuery({
      queryKey: ['notifications', params],
      queryFn: () => notificationService.list(params),
      staleTime: 60000, // 1 minute
    });
  };
  
  /**
   * Get notification details by ID
   */
  const getNotificationById = (id: string | null) => {
    return useQuery({
      queryKey: ['notification', id],
      queryFn: () => notificationService.getById(id || ''),
      enabled: !!id,
      staleTime: 60000, // 1 minute
    });
  };
  
  return {
    // Core notification context functions
    ...notificationContext,
    
    // Enhanced notification capabilities
    getNotifications,
    getNotificationById,
  };
}

export default useNotifications;