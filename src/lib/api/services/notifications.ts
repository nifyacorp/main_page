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

// Helper function to extract entity type parts from a notification
export function getEntityTypeParts(notification: Notification | undefined | null): string[] {
  if (!notification || !notification.entity_type) {
    console.warn('Missing notification or entity_type for getEntityTypeParts', notification);
    return [];
  }
  
  try {
    return notification.entity_type.split(':');
  } catch (error) {
    console.error('Error splitting entity_type', error, notification);
    return [];
  }
}

// New utility function to safely get entity_type as a string
export function getEntityType(notification: Notification | null | undefined): string {
  return notification?.entity_type || '';
}

// Helper function to normalize notification data
function normalizeNotification(data: any): Notification {
  if (!data) {
    console.error('Received null or undefined notification data');
    // Create a minimal valid notification to prevent UI errors
    return {
      id: `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: '',
      subscriptionId: '',
      title: 'Error: Invalid notification',
      content: 'This notification could not be properly loaded.',
      sourceUrl: '',
      metadata: {},
      read: false,
      createdAt: new Date().toISOString(),
      entity_type: 'error:invalid',
      getEntityTypeParts: function() { return ['error', 'invalid']; }
    };
  }
  
  // Ensure all required fields are present with fallbacks
  const normalized: Notification = {
    id: data.id || `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: data.userId || data.user_id || '',
    subscriptionId: data.subscriptionId || data.subscription_id || '',
    title: data.title || 'Untitled Notification',
    content: data.content || '',
    sourceUrl: data.sourceUrl || data.source_url || '',
    metadata: data.metadata || {},
    read: !!data.read,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    readAt: data.readAt || data.read_at,
    entity_type: data.entity_type || '',
    
    // Add the getEntityTypeParts method implementation directly to the object
    getEntityTypeParts: function() {
      return getEntityTypeParts(this);
    }
  };
  
  // Optional fields
  if (data.subscription_name) {
    normalized.subscription_name = data.subscription_name;
  }
  
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
   * List notifications for the current user
   * @param options Query parameters for filtering notifications
   * @returns Promise with notifications response
   */
  async list(options: NotificationOptions = {}): Promise<ApiResponse<NotificationsResponse>> {
    console.group('Notifications API - list');
    console.log('Listing notifications with options:', options);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unread !== undefined) params.append('unread', options.unread.toString());
      if (options.subscriptionId) params.append('subscriptionId', options.subscriptionId);
      
      // Make API request
      const response = await backendClient.get<NotificationsResponse>(`/notifications?${params.toString()}`);
      
      // Process and validate the response
      console.log('Raw API response received:', {
        status: response.status,
        hasData: !!response.data,
        notificationCount: response.data?.notifications?.length || 0
      });
      
      // Ensure we have a valid response with notifications array
      if (!response.data || !Array.isArray(response.data.notifications)) {
        console.error('Invalid response format - missing notifications array', response.data);
        return {
          ...response,
          data: {
            notifications: [],
            total: 0,
            unread: 0,
            page: options.page || 1,
            limit: options.limit || 10,
            hasMore: false
          }
        };
      }
      
      // Process and normalize each notification
      const processedNotifications = response.data.notifications
        .map(notification => {
          try {
            return normalizeNotification(notification);
          } catch (error) {
            console.error('Error normalizing notification:', error, notification);
            return null;
          }
        })
        .filter(Boolean) as Notification[];
      
      // Log notification processing results
      console.log('Processed notifications:', {
        originalCount: response.data.notifications.length,
        processedCount: processedNotifications.length,
        firstNotification: processedNotifications.length > 0 ? {
          id: processedNotifications[0].id,
          hasId: !!processedNotifications[0].id,
          entityType: processedNotifications[0].entity_type
        } : 'none'
      });
      
      // Return processed response
      const result = {
        ...response,
        data: {
          ...response.data,
          notifications: processedNotifications
        }
      };
      
      console.log('Returning processed notifications response');
      console.groupEnd();
      return result;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.groupEnd();
      throw error;
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