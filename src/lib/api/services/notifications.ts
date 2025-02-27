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
      return await backendClient({
        endpoint,
        method: 'GET'
      });
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
    console.log('Deleting notification', { id });
    
    try {
      return await backendClient({
        endpoint: `/api/v1/notifications/${id}`,
        method: 'DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return { 
        error: error.message || 'Error al eliminar la notificación' 
      };
    }
  },

  /**
   * Elimina todas las notificaciones
   */
  async deleteAllNotifications(subscriptionId = null): Promise<NotificationApiResponse<DeleteAllResult>> {
    console.log('Deleting all notifications', { subscriptionId });
    
    let endpoint = `/api/v1/notifications/delete-all`;
    if (subscriptionId) {
      endpoint += `?subscriptionId=${subscriptionId}`;
    }
    
    try {
      return await backendClient({
        endpoint,
        method: 'DELETE'
      });
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      return { 
        error: error.message || 'Error al eliminar todas las notificaciones' 
      };
    }
  }
}; 