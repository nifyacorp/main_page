import { backendClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface Notification {
  id: string;
  userId: string;
  subscriptionId: string;
  title: string;
  content: string;
  sourceUrl: string;
  metadata: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse extends PaginatedResponse {
  notifications: Notification[];
}

export interface NotificationUpdateInput {
  read: boolean;
}

export const notificationService = {
  /**
   * Lista todas las notificaciones del usuario
   */
  async list(page = 1, limit = 10) {
    console.log('Listing notifications', { page, limit });
    
    try {
      const response = await backendClient.get<NotificationsResponse>(
        `/notifications?page=${page}&limit=${limit}`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Error listing notifications:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Error al obtener notificaciones' 
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
      const response = await backendClient.patch<{ notification: Notification }>(
        `/notifications/${id}`,
        { read: true }
      );
      return { data: response.data.notification, error: null };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Error al marcar la notificación como leída' 
      };
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead() {
    console.log('Marking all notifications as read');
    
    try {
      const response = await backendClient.post<{ success: boolean }>(
        `/notifications/mark-all-read`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message || 'Error al marcar todas las notificaciones como leídas' 
      };
    }
  }
}; 