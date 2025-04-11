import apiClient from '../clients/axios-config';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'read' | 'unread';
  createdAt: string;
  subscriptionId: string;
  category: string;
  userId: string;
  data?: {
    details?: string;
    url?: string;
    imageUrl?: string;
    subscriptionName?: string;
    source?: string;
    priority?: 'high' | 'medium' | 'low';
    [key: string]: any;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface NotificationFilterOptions {
  status?: 'read' | 'unread' | 'all';
  subscription?: string;
  category?: string;
  limit?: number;
  page?: number;
  sort?: 'newest' | 'oldest';
}

/**
 * Service for handling notification-related API calls
 */
class NotificationService {
  /**
   * Get notifications with pagination and filtering
   */
  async getNotifications(options: NotificationFilterOptions = {}): Promise<NotificationsResponse> {
    try {
      const {
        status = 'all',
        subscription,
        category,
        limit = 20,
        page = 1,
        sort = 'newest'
      } = options;
      
      // Build query parameters
      const params: Record<string, string> = {
        limit: limit.toString(),
        page: page.toString(),
        sort
      };
      
      // Add optional filters if present
      if (status !== 'all') {
        params.status = status;
      }
      
      if (subscription) {
        params.subscription = subscription;
      }
      
      if (category) {
        params.category = category;
      }
      
      const response = await apiClient.get<NotificationsResponse>('/v1/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get<Notification>(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get notification ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/v1/notifications/${id}/read`, {});
      return response.data;
    } catch (error) {
      console.error(`Mark notification ${id} as read error:`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as unread
   */
  async markAsUnread(id: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/v1/notifications/${id}/unread`, {});
      return response.data;
    } catch (error) {
      console.error(`Mark notification ${id} as unread error:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    try {
      const response = await apiClient.patch<{ message: string; count: number }>('/v1/notifications/read-all', {});
      return response.data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/v1/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete notification ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<{ message: string; count: number }> {
    try {
      const response = await apiClient.delete<{ message: string; count: number }>('/v1/notifications/read');
      return response.data;
    } catch (error) {
      console.error('Delete all read notifications error:', error);
      throw error;
    }
  }

  /**
   * Get notification counts by status
   */
  async getNotificationCounts(): Promise<{ total: number; unread: number; read: number }> {
    try {
      const response = await apiClient.get<{ total: number; unread: number; read: number }>('/v1/notifications/counts');
      return response.data;
    } catch (error) {
      console.error('Get notification counts error:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    emailNotifications: boolean;
    notificationEmail?: string | null;
    emailFrequency?: 'daily' | 'weekly';
    instantNotifications?: boolean;
  }): Promise<{ message: string; settings: any }> {
    try {
      const response = await apiClient.patch<{ message: string; settings: any }>('/v1/users/notification-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<{
    emailNotifications: boolean;
    notificationEmail: string | null;
    emailFrequency: 'daily' | 'weekly';
    instantNotifications: boolean;
  }> {
    try {
      const response = await apiClient.get<{
        emailNotifications: boolean;
        notificationEmail: string | null;
        emailFrequency: 'daily' | 'weekly';
        instantNotifications: boolean;
      }>('/v1/users/notification-settings');
      return response.data;
    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 