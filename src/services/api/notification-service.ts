import apiClient, { ApiError } from './axios-config';

// Type definitions
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  source: string;
  subscriptionId?: string;
  subscriptionName?: string;
  data?: any;
  createdAt: string;
  userId: string;
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
   * Fetch all notifications with optional filtering
   */
  async getNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
    try {
      console.log('Notifications API - list');
      console.log('Listing notifications with options:', params);
      const response = await apiClient.get('/v1/notifications', { params });
      console.log('Processing notification response:', {
        hasData: !!response.data,
        status: response.status
      });
      
      console.log('Raw API response received:', {
        status: response.status,
        hasData: !!response.data
      });
      
      console.log('Processed notifications:', {
        count: response.data?.notifications?.length,
        total: response.data?.total
      });
      
      console.log('Returning processed notifications response');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Fetch a single notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/v1/notifications/${id}/read`);
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/v1/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/notifications/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
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
    try {
      const response = await apiClient.get('/v1/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
  
  /**
   * Get notification activity data
   */
  async getNotificationActivity(): Promise<{
    activityByDay: Array<{ day: string; count: number }>;
    sources: Array<{ name: string; count: number; color: string }>;
  }> {
    try {
      const response = await apiClient.get('/v1/notifications/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification activity:', error);
      throw error;
    }
  }

  /**
   * Get notifications by subscription
   */
  async getNotificationsBySubscription(subscriptionId: string, params?: NotificationListParams): Promise<NotificationListResponse> {
    try {
      const response = await apiClient.get(`/v1/subscriptions/${subscriptionId}/notifications`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export default new NotificationService();