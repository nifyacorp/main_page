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

export const notificationService = {
  /**
   * Lista todas las notificaciones del usuario
   */
  async list(options: NotificationOptions = {}) {
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
      return await backendClient<NotificationsResponse>({
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
  async get(id: string) {
    console.log('Getting notification details', { id });
    
    try {
      const response = await backendClient.get<{ notification: Notification }>(
        `/notifications/${id}`
      );
      return { data: response.data.notification, error: null };
    } catch (error: any) {
      console.error('Error getting notification:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Error al obtener la notificación' 
      };
    }
  },

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string) {
    console.log('Marking notification as read', { id });
    
    try {
      return await backendClient<Notification>({
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
  async markAllAsRead(subscriptionId = null) {
    console.log('Marking all notifications as read', { subscriptionId });
    
    let endpoint = `/api/v1/notifications/read-all`;
    if (subscriptionId) {
      endpoint += `?subscriptionId=${subscriptionId}`;
    }
    
    try {
      return await backendClient<{ updated: number }>({
        endpoint,
        method: 'POST'
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { 
        error: error.message || 'Error al marcar todas las notificaciones como leídas' 
      };
    }
  }
}; 