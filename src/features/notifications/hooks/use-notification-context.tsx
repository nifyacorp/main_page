import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  ReactNode,
  useMemo
} from 'react';
import { z } from 'zod';
import { useAuth } from '@/features/auth/hooks/use-auth-context';
import useApiQuery from '@/api/hooks/use-api-query';
import useApiMutation from '@/api/hooks/use-api-mutation';
import { toast } from '@/components/ui/use-toast';

// Notification schema for type safety
const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  entity_id: z.string().nullable(),
  entity_type: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  type: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Notification list response schema
const NotificationListSchema = z.object({
  notifications: z.array(NotificationSchema),
  total: z.number(),
  unread: z.number(),
});

export type NotificationList = z.infer<typeof NotificationListSchema>;

// Filter options
export interface NotificationFilters {
  page?: number;
  limit?: number;
  unread_only?: boolean;
  entity_type?: string;
  entity_id?: string;
  start_date?: string;
  end_date?: string;
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  unreadCount: number;
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  refreshNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use the notification context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Props for the provider
interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number; // In milliseconds
}

export function NotificationProvider({ 
  children, 
  pollingInterval = 30000 // Default to 30 seconds
}: NotificationProviderProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
    unread_only: false,
  });
  
  // Create query params from filters
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.unread_only) params.unread_only = filters.unread_only;
    if (filters.entity_type) params.entity_type = filters.entity_type;
    if (filters.entity_id) params.entity_id = filters.entity_id;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    
    return params;
  }, [filters]);
  
  // Fetch notifications with React Query
  const { 
    data: notificationData,
    isLoading,
    error: queryError,
    refetch
  } = useApiQuery<NotificationList>(
    '/notifications',
    queryParams,
    {
      enabled: isAuthenticated,
      refetchInterval: isAuthenticated ? pollingInterval : false,
      staleTime: 10000, // Consider data fresh for 10 seconds
      keepPreviousData: true,
      showErrorToast: false,
    }
  );
  
  // Extract data
  const notifications = notificationData?.notifications || [];
  const totalCount = notificationData?.total || 0;
  const unreadCount = notificationData?.unread || 0;
  const error = queryError?.message || null;
  
  // Mark single notification as read
  const { mutateAsync: markAsReadMutation } = useApiMutation<{ success: boolean }, string>(
    '/notifications/{id}/read',
    {
      method: 'PUT',
      showSuccessToast: false,
      showErrorToast: true,
      errorMessage: 'Error al marcar notificación como leída',
    }
  );
  
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadMutation(id);
      // Update local state optimistically
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, [markAsReadMutation, refetch]);
  
  // Mark all notifications as read
  const { mutateAsync: markAllAsReadMutation } = useApiMutation<{ success: boolean }, void>(
    '/notifications/read-all',
    {
      method: 'PUT',
      showSuccessToast: true,
      successMessage: 'Todas las notificaciones marcadas como leídas',
      errorMessage: 'Error al marcar todas las notificaciones como leídas',
    }
  );
  
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation();
      // Update local state
      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, [markAllAsReadMutation, refetch]);
  
  // Delete notification
  const { mutateAsync: deleteNotificationMutation } = useApiMutation<{ success: boolean }, string>(
    '/notifications/{id}',
    {
      method: 'DELETE',
      showSuccessToast: false,
      errorMessage: 'Error al eliminar notificación',
    }
  );
  
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotificationMutation(id);
      // Update local state
      refetch();
      toast({
        title: 'Notificación eliminada',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [deleteNotificationMutation, refetch]);
  
  // Manual refresh function
  const refreshNotifications = useCallback(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);
  
  // Set up interval for polling unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check for unread notifications more frequently than full refresh
    const unreadCheckInterval = setInterval(() => {
      // Only refetch if user is authenticated
      if (isAuthenticated) {
        fetch('/api/notifications/unread-count', {
          headers: {
            'Content-Type': 'application/json',
            ...useAuth().getAuthHeaders(),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            // If unread count has changed, trigger a full refresh
            if (data.unread !== unreadCount) {
              refreshNotifications();
            }
          })
          .catch((err) => {
            console.error('Failed to check unread notifications count:', err);
          });
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(unreadCheckInterval);
    };
  }, [isAuthenticated, unreadCount, refreshNotifications]);
  
  // Provide the context
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        error,
        totalCount,
        unreadCount,
        filters,
        setFilters,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Export the context and hook
export default NotificationContext;