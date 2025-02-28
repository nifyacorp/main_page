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

// Remove the prototype implementation as it doesn't work with plain JSON objects

// New utility function to safely get entity_type as a string
export function getEntityType(notification: Notification | null | undefined): string {
  return notification?.entity_type || '';
}

// New helper to normalize notification data structure from backend
function normalizeNotification(rawNotification: any): any {
  if (!rawNotification) return null;
  
  // If notification has only entity_type property, likely a serialization issue
  if (Object.keys(rawNotification).length === 1 && 'entity_type' in rawNotification) {
    console.warn('Received malformed notification with only entity_type:', rawNotification);
    // This notification is incomplete - return null to be filtered out
    return null;
  }
  
  // Create a normalized notification object using snake_case and camelCase properties
  // to ensure we capture data regardless of naming convention
  const normalized = {
    // Essential properties - default to empty values if missing
    id: rawNotification.id || '',
    userId: rawNotification.userId || rawNotification.user_id || '',
    subscriptionId: rawNotification.subscriptionId || rawNotification.subscription_id || '',
    title: rawNotification.title || '',
    content: rawNotification.content || '',
    sourceUrl: rawNotification.sourceUrl || rawNotification.source_url || '',
    read: !!rawNotification.read,
    createdAt: rawNotification.createdAt || rawNotification.created_at || new Date().toISOString(),
    
    // Optional properties
    readAt: rawNotification.readAt || rawNotification.read_at || null,
    subscription_name: rawNotification.subscription_name || '',
    entity_type: rawNotification.entity_type || '',
    
    // Metadata - default to empty object
    metadata: rawNotification.metadata || {}
  };
  
  return normalized;
}

// Update enhanceNotification to use the normalized data
export function enhanceNotification(notification: any): Notification {
  if (!notification) return notification;
  
  // First normalize the notification structure
  const normalized = normalizeNotification(notification);
  if (!normalized) return notification;
  
  // Add the getEntityTypeParts method implementation directly to the object
  normalized.getEntityTypeParts = function() {
    if (!this.entity_type) return [];
    return this.entity_type.split ? this.entity_type.split(':') : [];
  };
  
  return normalized as Notification;
}

// New helper to process an array of notifications
export function enhanceNotifications(notifications: any[]): Notification[] {
  if (!notifications) return [];
  return notifications.filter(Boolean).map(enhanceNotification);
}

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
        console.group('🔍 Notification API Response Analysis');
        console.log(`Received ${response.data.notifications.length} notifications from API`);
        
        // Log raw response for debugging
        console.log('Raw API response:', JSON.stringify(response.data));
        
        // Log raw data structure of the first notification
        if (response.data.notifications.length > 0) {
          const firstNotification = response.data.notifications[0];
          console.log('First notification sample:', JSON.stringify(firstNotification));
          console.log('First notification keys:', Object.keys(firstNotification));
          console.log('ID details:', {
            id: firstNotification.id,
            idValue: JSON.stringify(firstNotification.id),
            idType: typeof firstNotification.id,
            idLength: firstNotification.id ? firstNotification.id.length : 0,
            hasId: !!firstNotification.id
          });
        }
        
        // Process and normalize notifications
        const processedNotifications = response.data.notifications
          .map(notification => {
            const normalized = normalizeNotification(notification);
            if (!normalized) {
              console.warn('Dropping invalid notification:', notification);
              return null;
            }
            return normalized;
          })
          .filter(Boolean) // Remove null entries
          .map(enhanceNotification);
        
        console.log('Processed notifications:', processedNotifications.length);
        if (processedNotifications.length > 0) {
          console.log('First processed notification:', JSON.stringify(processedNotifications[0]));
          console.log('First processed notification keys:', Object.keys(processedNotifications[0]));
        }
        
        // Log all notifications with missing IDs
        const invalidNotifications = processedNotifications.filter(
          notification => !notification || !notification.id
        );
        
        if (invalidNotifications.length > 0) {
          console.warn(`Found ${invalidNotifications.length} notifications with missing IDs`);
          console.log('First invalid notification example:', invalidNotifications[0]);
        } else {
          console.log('All notifications have valid IDs ✓');
        }
        
        console.groupEnd();
        
        // Update the response with only valid notifications
        response.data.notifications = processedNotifications;
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
      const response = await backendClient({
        endpoint: `/api/v1/notifications/${id}`,
        method: 'GET'
      });
      
      // Enhance the notification if it exists
      if (response.data) {
        response.data = enhanceNotification(response.data);
      }
      
      return response;
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