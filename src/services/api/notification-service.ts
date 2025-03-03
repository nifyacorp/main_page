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
      const response = await apiClient.get('/notifications', { params });
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
      const response = await apiClient.get(`/notifications/${id}`);
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
      await apiClient.put(`/notifications/${id}/read`);
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
      await apiClient.put('/notifications/read-all');
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
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get notification count summary
   */
  async getNotificationCount(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get('/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      throw error;
    }
  }

  /**
   * Get notifications by subscription
   */
  async getNotificationsBySubscription(subscriptionId: string, params?: NotificationListParams): Promise<NotificationListResponse> {
    try {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}/notifications`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }
}

export default new NotificationService(); 