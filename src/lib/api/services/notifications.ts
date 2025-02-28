import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';

export interface Notification {
  id: string;
  userId: string;
  subscriptionId: string;
  subscription_name?: string;
  entity_type?: string;
  title: string;
  content: string;
  sourceUrl: string;
  metadata: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
  
  // Helper method signature (no implementation in interface)
  getEntityTypeParts(): string[];
}

// Utility function to safely access entity type parts for any notification
// This helps when working with notification objects directly
export function getEntityTypeParts(notification: Notification | undefined | null): string[] {
  if (!notification || !notification.entity_type) return [];
  return notification.entity_type.split(':');
}

// Implementation of the interface method
// This is attached to the Notification prototype
Notification.prototype.getEntityTypeParts = function(): string[] {
  if (!this.entity_type) return [];
  return this.entity_type.split(':');
};

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NotificationUpdateInput {
  read: boolean;
}

export interface NotificationOptions {
  page?: number;
  limit?: number;
  unread?: boolean;
  subscriptionId?: string | null;
}

export interface DeleteResult {
  success: boolean;
  message: string;
}

export interface DeleteAllResult {
  success: boolean;
  deleted: number;
  message: string;
}

// Create a custom type for our return types that includes error as a possible response
export type NotificationApiResponse<T> = ApiResponse<T> | { error: any; data?: never };

export const notificationService = {
  /**
   * Lista todas las notificaciones del usuario
   */
  async list(options: NotificationOptions = {}): Promise<NotificationApiResponse<NotificationsResponse>> {
    const {
      page = 1,
      limit = 10,
      unread = false,
      subscriptionId = null
    } = options;
    
    console.log('Listing notifications', { page, limit, unread, subscriptionId });
    
    let endpoint = `/api/v1/notifications?page=${page}&limit=${limit}`;
    
    if (unread) {
      endpoint += '&unread=true';
    }
    
    if (subscriptionId) {
      endpoint += `&subscriptionId=${subscriptionId}`;
    }
    
    try {
      const response = await backendClient({
        endpoint,
        method: 'GET'
      });
      
      // Add validation to ensure all notifications have valid IDs
      if (response.data?.notifications) {
        console.log(`Received ${response.data.notifications.length} notifications from API`);
        
        // Filter out any notifications without valid IDs to prevent UI errors
        const validNotifications = response.data.notifications.filter(notification => {
          const isValid = !!notification && !!notification.id;
          if (!isValid) {
            console.warn('Found invalid notification in API response:', notification);
          }
          return isValid;
        });
        
        if (validNotifications.length !== response.data.notifications.length) {
          console.warn(`Filtered out ${response.data.notifications.length - validNotifications.length} invalid notifications`);
        }
        
        // Update the response with only valid notifications
        response.data.notifications = validNotifications;
      }
      
      return response;
    } catch (error: any) {
      console.error('Error listing notifications:', error);
      return { 
        error: error.message || 'Error al obtener notificaciones' 
      };
    }
  },

  /**
   * Obtiene los detalles de una notificación
   */
  async get(id: string): Promise<NotificationApiResponse<Notification>> {
    console.log('Getting notification details', { id });
    
    try {
      return await backendClient({
        endpoint: `/api/v1/notifications/${id}`,
        method: 'GET'
      });
    } catch (error: any) {
      console.error('Error getting notification:', error);
      return { 
        error: error.message || 'Error al obtener la notificación' 
      };
    }
  },

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string): Promise<NotificationApiResponse<Notification>> {
    console.log('Marking notification as read', { id });
    
    try {
      return await backendClient({
        endpoint: `/api/v1/notifications/${id}/read`,
        method: 'POST'
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { 
        error: error.message || 'Error al marcar la notificación como leída' 
      };
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(subscriptionId = null): Promise<NotificationApiResponse<{ updated: number }>> {
    console.log('Marking all notifications as read', { subscriptionId });
    
    let endpoint = `/api/v1/notifications/read-all`;
    if (subscriptionId) {
      endpoint += `?subscriptionId=${subscriptionId}`;
    }
    
    try {
      return await backendClient({
        endpoint,
        method: 'POST'
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { 
        error: error.message || 'Error al marcar todas las notificaciones como leídas' 
      };
    }
  },

  /**
   * Elimina una notificación
   */
  async deleteNotification(id: string): Promise<NotificationApiResponse<DeleteResult>> {
    // Enhanced logging for debugging
    console.group('🗑️ Delete Notification');
    console.log('Deleting notification', { 
      id,
      hasId: !!id,
      idType: typeof id,
      isValid: id !== undefined && id !== null && id !== 'undefined' && id !== 'null'
    });
    
    // Validate notification ID
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid notification ID provided to deleteNotification');
      console.groupEnd();
      return { 
        error: 'Invalid notification ID' 
      };
    }
    
    try {
      // Make DELETE request with empty body
      const response = await backendClient<DeleteResult>({
        endpoint: `/api/v1/notifications/${id}`,
        method: 'DELETE',
        // Explicitly set empty body to avoid undefined body issues
        body: {}
      });
      
      if (response.error) {
        console.error('Error from backend when deleting notification:', response.error);
        console.groupEnd();
        return response;
      }
      
      console.log('Successfully deleted notification:', response.data);
      console.groupEnd();
      return response;
    } catch (error: any) {
      console.error('Exception when deleting notification:', error);
      console.groupEnd();
      return { 
        error: error.message || 'Error al eliminar la notificación' 
      };
    }
  },

  /**
   * Elimina todas las notificaciones
   */
  async deleteAllNotifications(subscriptionId = null): Promise<NotificationApiResponse<DeleteAllResult>> {
    console.group('🗑️ Delete All Notifications');
    console.log('Deleting all notifications', { subscriptionId });
    
    let endpoint = `/api/v1/notifications/delete-all`;
    if (subscriptionId) {
      endpoint += `?subscriptionId=${subscriptionId}`;
    }
    
    try {
      // Make DELETE request with empty body
      const response = await backendClient<DeleteAllResult>({
        endpoint,
        method: 'DELETE',
        // Explicitly set empty body to avoid undefined body issues
        body: {}
      });
      
      if (response.error) {
        console.error('Error from backend when deleting all notifications:', response.error);
        console.groupEnd();
        return response;
      }
      
      console.log('Successfully deleted all notifications:', response.data);
      console.groupEnd();
      return response;
    } catch (error: any) {
      console.error('Exception when deleting all notifications:', error);
      console.groupEnd();
      return { 
        error: error.message || 'Error al eliminar todas las notificaciones' 
      };
    }
  }
}; 