import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import notificationService, {
  Notification,
  NotificationListParams,
} from '@/services/api/notification-service';

/**
 * Custom hook for managing notifications
 */
export function useNotifications(params?: NotificationListParams) {
  const [filter, setFilter] = useState<NotificationListParams>(params || {});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check authentication status
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Fetch notifications - only if authenticated
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationService.getNotifications(filter),
    staleTime: 30000, // 30 seconds
    enabled: isAuthenticated, // Only run query if authenticated
  });

  // Get notification count - only if authenticated
  const {
    data: notificationCount,
    isLoading: isLoadingCount,
    refetch: refetchCount,
    error: countError
  } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: async () => {
      try {
        return await notificationService.getNotificationCount();
      } catch (error) {
        console.error('Error fetching notification count:', error);
        // Return default values to prevent UI errors
        return {
          total: 0,
          unread: 0,
          change: 0,
          isIncrease: false,
          byType: {}
        };
      }
    },
    staleTime: 30000, // 30 seconds
    enabled: isAuthenticated, // Only run query if authenticated
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });

  // Delete notification mutation
  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    notifications: data?.notifications || [],
    metadata: data
      ? {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          unreadCount: data.unreadCount,
        }
      : undefined,
    notificationCount,
    filter,
    isLoading,
    isError,
    error,
    isLoadingCount,
    
    // Mutations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    
    // Actions
    setFilter,
    refetchNotifications: refetch,
    refetchCount,
  };
}