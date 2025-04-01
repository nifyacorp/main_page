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
  
  // Debug logging only in development mode
  if (import.meta.env.DEV) {
    console.log('Normalizing notification:', { 
      id: data.id,
      originalTitle: data.title,
      hasTitle: !!data.title,
      contentPreview: data.content ? data.content.substring(0, 30) + '...' : 'no content'
    });
  }
  
  // Look for a title in multiple possible fields
  let title = data.title || data.notification_title || data.message_title || data.subject || '';
  
  // Check if title might be in message field for some backend implementations
  if (!title && data.message) {
    if (typeof data.message === 'object' && data.message.title) {
      title = data.message.title;
      console.log('Found title in message object:', title);
    } else if (typeof data.message === 'string' && data.message.length > 0) {
      // Try to use message as title if it's a string
      title = data.message.length > 50 
        ? `${data.message.substring(0, 47)}...` 
        : data.message;
      console.log('Using message as title:', { id: data.id, messageTitle: title });
    }
  }
  
  // Check if title might be in metadata
  if (!title && data.metadata && typeof data.metadata === 'object') {
    if (data.metadata.title) {
      title = data.metadata.title;
      console.log('Found title in metadata.title:', title);
    } else if (data.metadata.subject) {
      title = data.metadata.subject;
      console.log('Found title in metadata.subject:', title);
    } else if (data.metadata.document_type) {
      title = `${data.metadata.document_type} Notification`;
      console.log('Created title from document_type:', title);
    }
  }
  
  // Check specifically for BOE notifications that might have title buried in metadata
  if (!title && data.entity_type && data.entity_type.includes('boe') && data.metadata) {
    if (data.metadata.result && data.metadata.result.title) {
      title = data.metadata.result.title;
      console.log('Found title in BOE metadata:', title);
    } else if (data.metadata.title) {
      title = data.metadata.title;
      console.log('Found title in BOE metadata.title:', title);
    }
  }
  
  // Create a title from content if title is still missing
  if (!title && data.content) {
    // Use the first 50 characters of content as title
    title = data.content.length > 50 
      ? `${data.content.substring(0, 47)}...` 
      : data.content;
    console.log('Generated title from content:', { id: data.id, generatedTitle: title });
  } else if (!title) {
    // Last resort: Check if we can derive a title from other properties
    if (data.subscription_name) {
      title = `New ${data.subscription_name} Notification`;
      console.log('Generated title from subscription_name:', title);
    } else if (data.entity_type) {
      title = `New ${data.entity_type.replace(/[_:]/g, ' ')} Notification`;
      console.log('Generated title from entity_type:', title);
    } else {
      title = 'New Notification';
      console.log('Using generic fallback title:', { id: data.id });
    }
  }
  
  // Ensure all required fields are present with fallbacks
  const normalized: Notification = {
    id: data.id || `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: data.userId || data.user_id || '',
    subscriptionId: data.subscriptionId || data.subscription_id || '',
    title,
    content: data.content || data.message?.content || data.message?.body || data.message || '',
    sourceUrl: data.sourceUrl || data.source_url || data.url || '',
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
  
  console.log('Normalized notification result:', { 
    id: normalized.id, 
    finalTitle: normalized.title,
    titleLength: normalized.title?.length || 0
  });
  
  return normalized;
}

// Update enhanceNotification to use the normalized data
export function enhanceNotification(notification: any): Notification {
  if (!notification) return notification;
  
  // Log the raw notification data before normalization (only in development mode)
  if (import.meta.env.DEV) {
    console.log('Enhancing notification:', { 
      id: notification.id,
      hasTitle: !!notification.title
    });
  }
  
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
    
    // First check if we are authenticated
    const accessToken = localStorage.getItem('accessToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated || !accessToken) {
      console.warn('User not authenticated, returning empty notifications list');
      console.groupEnd();
      return {
        status: 200,
        ok: true,
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
    
    // Ensure token has Bearer prefix
    if (accessToken && !accessToken.startsWith('Bearer ')) {
      const formattedToken = `Bearer ${accessToken}`;
      localStorage.setItem('accessToken', formattedToken);
      console.log('Fixed token format to include Bearer prefix');
    }
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unread !== undefined) params.append('unread', options.unread.toString());
      if (options.subscriptionId) params.append('subscriptionId', options.subscriptionId);
      
      // Make API request - using the function directly with correct endpoint path
      const response = await backendClient({
        endpoint: `/api/v1/notifications?${params.toString()}`,
        method: 'GET'
      });
      
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
      
      // Debug the raw notification data from the backend (only in development mode)
      if (import.meta.env.DEV && response.data.notifications.length > 0) {
        const firstNotification = response.data.notifications[0];
        console.log('First raw notification from backend:', {
          hasTitle: !!firstNotification.title,
          titleType: typeof firstNotification.title,
          hasMetadata: !!firstNotification.metadata
        });
        
        // Add minimal debugging for missing title
        if (firstNotification.title === undefined) {
          console.warn('Title is undefined in notification', {
            id: firstNotification.id,
            hasMetadata: !!firstNotification.metadata
          });
        }
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
          entityType: processedNotifications[0].entity_type,
          title: processedNotifications[0].title
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
      
      // Try to recover from auth errors
      if (error && (error.status === 401 || (typeof error === 'object' && error.error === 'MISSING_HEADERS'))) {
        console.log('Authentication error detected, attempting recovery...');
        
        // Import auth recovery utilities dynamically
        const { recoverFromAuthError } = await import('../../utils/auth-recovery');
        
        // Attempt to recover
        const recovered = await recoverFromAuthError(error);
        
        if (recovered) {
          console.log('Auth recovered, retrying notifications request');
          return this.list(options);
        }
      }
      
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
    
    // For generated IDs, no need to hit the server - just return success
    if (id && id.startsWith('generated-')) {
      console.log('Notification has a generated ID, returning success without API call:', id);
      console.groupEnd();
      return {
        status: 200,
        data: {
          success: true,
          message: 'Client-side generated notification removed'
        }
      };
    }
    
    // Validate notification ID
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid notification ID provided to deleteNotification');
      console.groupEnd();
      return { 
        error: 'Invalid notification ID' 
      };
    }
    
    try {
      // Try DELETE method with both empty body and no body - some servers are stricter
      try {
        // First try with empty body object
        const response = await backendClient<DeleteResult>({
          endpoint: `/api/v1/notifications/${id}`,
          method: 'DELETE',
          // Explicitly set empty body to avoid undefined body issues
          body: {}
        });
        
        if (response.error) {
          console.error('Error from backend when deleting notification:', response.error);
          throw new Error(response.error);
        }
        
        console.log('Successfully deleted notification:', response.data);
        console.groupEnd();
        return response;
      } catch (firstAttemptError) {
        console.warn('First delete attempt failed, trying alternative approach:', firstAttemptError);
        
        // Second attempt: use regular fetch with no body
        const response = await fetch(`/api/v1/notifications/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'x-user-id': localStorage.getItem('userId') || '',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('Successfully deleted notification with fetch API');
          console.groupEnd();
          return {
            status: response.status,
            data: {
              success: true,
              message: 'Notification deleted successfully'
            }
          };
        }
        
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Exception when deleting notification:', error);
      
      // Even on error, return success to allow UI cleanup
      console.groupEnd();
      return { 
        status: 200,
        data: {
          success: true,
          message: 'Notification removed from view (sync error)',
          clientSideOnly: true
        }
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