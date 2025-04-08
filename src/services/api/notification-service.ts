import apiClient, { ApiError } from './axios-config';

// Type definitions
export interface Notification {
  id: string;
  title: string;
  content?: string;  // Raw notification content
  message?: string;  // For backward compatibility
  type?: 'success' | 'info' | 'warning' | 'error';
  entity_type?: string;  // For BOE/DOGA notifications
  isRead?: boolean;  // Frontend property
  read?: boolean;    // Backend property 
  sourceUrl?: string; // Backend property
  source?: string;   // Legacy property
  subscriptionId?: string;
  subscription_id?: string; // Backend property
  subscriptionName?: string;
  subscription_name?: string; // Backend property
  metadata?: any;    // Additional data
  data?: any;        // Legacy additional data
  createdAt?: string;
  created_at?: string; // Backend property
  userId?: string;
  user_id?: string;  // Backend property
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  subscriptionId?: string;
  source?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * Service for handling notification-related API calls
 */
class NotificationService {
  /**
   * Check if user is authenticated 
   */
  private isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' && 
           !!localStorage.getItem('accessToken');
  }

  /**
   * Fetch all notifications with optional filtering
   */
  async getNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
    // Return empty results if not authenticated
    if (!this.isAuthenticated()) {
      console.log('Notifications API - Skipping request, user not authenticated');
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        unreadCount: 0
      };
    }
    
    try {
      console.log('Notifications API - list');
      console.log('Listing notifications with options:', params);
      const response = await apiClient.get('/v1/notifications', { params });
      console.log('Processing notification response:', {
        hasData: !!response.data,
        status: response.status
      });
      
      // If we have notifications data, normalize it
      if (response.data?.notifications && Array.isArray(response.data.notifications)) {
        // Process each notification to normalize field names
        response.data.notifications = response.data.notifications.map((notification: any) => {
          // Create a normalized notification object
          const normalizedNotification: Notification = {
            id: notification.id,
            title: notification.title || 'Notification',
            // Handle message vs content field
            message: notification.message || notification.content || '',
            content: notification.content || notification.message || '',
            // Handle isRead vs read field
            isRead: notification.isRead !== undefined ? notification.isRead : 
                   notification.read !== undefined ? notification.read : false,
            read: notification.read !== undefined ? notification.read : 
                 notification.isRead !== undefined ? notification.isRead : false,
            // Handle source vs sourceUrl field
            source: notification.source || notification.sourceUrl || '',
            sourceUrl: notification.sourceUrl || notification.source || '',
            // Handle subscription fields
            subscriptionId: notification.subscriptionId || notification.subscription_id || '',
            subscription_id: notification.subscription_id || notification.subscriptionId || '',
            subscriptionName: notification.subscriptionName || notification.subscription_name || '',
            subscription_name: notification.subscription_name || notification.subscriptionName || '',
            // Handle timestamp fields
            createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
            created_at: notification.created_at || notification.createdAt || new Date().toISOString(),
            // Handle user fields
            userId: notification.userId || notification.user_id || '',
            user_id: notification.user_id || notification.userId || '',
            // Handle additional data
            data: notification.data || notification.metadata || {},
            metadata: notification.metadata || notification.data || {},
            // Handle type and entity_type
            type: notification.type || 'info',
            entity_type: notification.entity_type || ''
          };
          
          return normalizedNotification;
        });
      }
      
      console.log('Processed notifications:', {
        count: response.data?.notifications?.length,
        total: response.data?.total,
        sample: response.data?.notifications?.length > 0 ? {
          id: response.data.notifications[0].id,
          title: response.data.notifications[0].title
        } : 'none'
      });
      
      // Make sure we return a valid response
      return {
        notifications: response.data?.notifications || [],
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        limit: response.data?.limit || 10,
        totalPages: response.data?.totalPages || 1,
        unreadCount: response.data?.unread || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty results instead of throwing error
      return {
        notifications: [],
        total: 0, 
        page: 1,
        limit: 10,
        totalPages: 0,
        unreadCount: 0
      };
    }
  }

  /**
   * Fetch a single notification by ID
   */
  async getNotification(id: string): Promise<Notification | null> {
    if (!this.isAuthenticated()) {
      console.log(`Notifications API - Skipping get notification ${id}, user not authenticated`);
      return null;
    }
    
    try {
      const response = await apiClient.get(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      return null;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.log(`Notifications API - Skipping mark as read ${id}, user not authenticated`);
      return false;
    }
    
    try {
      await apiClient.patch(`/v1/notifications/${id}/read`);
      return true;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.log('Notifications API - Skipping mark all as read, user not authenticated');
      return false;
    }
    
    try {
      await apiClient.patch('/v1/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.log(`Notifications API - Skipping delete notification ${id}, user not authenticated`);
      return false;
    }
    
    try {
      await apiClient.delete(`/v1/notifications/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      return false;
    }
  }

  /**
   * Get notification count summary and stats
   */
  async getNotificationCount(): Promise<{
    total: number;
    unread: number;
    change: number;
    isIncrease: boolean;
    byType: Record<string, number>;
  }> {
    if (!this.isAuthenticated()) {
      console.log('Notifications API - Skipping get count, user not authenticated');
      return {
        total: 0,
        unread: 0,
        change: 0,
        isIncrease: false,
        byType: {}
      };
    }
    
    try {
      const response = await apiClient.get('/v1/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        change: 0,
        isIncrease: false,
        byType: {}
      };
    }
  }
  
  /**
   * Get notification activity data
   */
  async getNotificationActivity(): Promise<{
    activityByDay: Array<{ day: string; count: number }>;
    sources: Array<{ name: string; count: number; color: string }>;
  }> {
    if (!this.isAuthenticated()) {
      console.log('Notifications API - Skipping get activity, user not authenticated');
      return {
        activityByDay: [],
        sources: []
      };
    }
    
    try {
      const response = await apiClient.get('/v1/notifications/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification activity:', error);
      return {
        activityByDay: [],
        sources: []
      };
    }
  }

  /**
   * Get notifications by subscription
   */
  async getNotificationsBySubscription(subscriptionId: string, params?: NotificationListParams): Promise<NotificationListResponse> {
    if (!this.isAuthenticated()) {
      console.log(`Notifications API - Skipping get notifications for subscription ${subscriptionId}, user not authenticated`);
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        unreadCount: 0
      };
    }
    
    try {
      const response = await apiClient.get(`/v1/subscriptions/${subscriptionId}/notifications`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for subscription ${subscriptionId}:`, error);
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        unreadCount: 0
      };
    }
  }
}

export default new NotificationService();