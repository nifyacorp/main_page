import React, { useEffect, useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCheck, Bell, ExternalLink, Trash, Trash2 } from 'lucide-react';
import { Notification, notificationService, NotificationApiResponse } from '../../lib/api/services/notifications';
import { useNotifications } from '../../contexts/NotificationContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from '../ui/button';

interface NotificationListProps {
  onRefresh?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onRefresh }) => {
  const { refreshUnreadCount, deleteNotification, deleteAllNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, Notification[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const loadNotifications = async (reset = false) => {
    setLoading(true);
    setError(null);
    
    const currentPage = reset ? 1 : page;
    
    try {
      const response = await notificationService.list({
        page: currentPage,
        limit: 20,
        unread: false
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (!response.error && response.data) {
        const newNotifications = reset ? response.data.notifications : [...notifications, ...response.data.notifications];
        setNotifications(newNotifications);
        groupNotificationsByDay(newNotifications);
        setHasMore(response.data.hasMore);
        setTotalCount(response.data.total);
        setUnreadCount(response.data.unread);
        
        if (reset) {
          setPage(1);
        } else {
          setPage(currentPage + 1);
        }
      }
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupNotificationsByDay = (notificationsList: Notification[]) => {
    const grouped: Record<string, Notification[]> = {};
    
    notificationsList.forEach((notification) => {
      const date = parseISO(notification.createdAt);
      let groupKey: string;
      
      if (isToday(date)) {
        groupKey = 'Hoy';
      } else if (isYesterday(date)) {
        groupKey = 'Ayer';
      } else if (isThisWeek(date)) {
        groupKey = format(date, 'EEEE', { locale: es });
        // Capitalize first letter
        groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      } else {
        groupKey = format(date, 'd MMMM yyyy', { locale: es });
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      
      grouped[groupKey].push(notification);
    });
    
    setGroupedNotifications(grouped);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read) return;
    
    try {
      const response = await notificationService.markAsRead(notification.id);
      
      if (response.error) {
        console.error('Error marking notification as read:', response.error);
        return;
      }
      
      if (!response.error && response.data) {
        // Update the notification in state
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        );
        
        setNotifications(updatedNotifications);
        setUnreadCount(prev => Math.max(0, prev - 1));
        groupNotificationsByDay(updatedNotifications);
        
        // Update global notification count
        refreshUnreadCount();
        
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      const success = await deleteNotification(notification.id);
      
      if (success) {
        // Remove the notification from the list
        const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);
        groupNotificationsByDay(updatedNotifications);
        
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAllNotifications = async () => {
    setIsDeleteDialogOpen(false);
    setLoading(true);
    
    try {
      const success = await deleteAllNotifications();
      
      if (success) {
        // Clear the notifications list
        setNotifications([]);
        setGroupedNotifications({});
        
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, []);

  const loadMoreNotifications = () => {
    if (hasMore && !loading) {
      loadNotifications();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Notificaciones {unreadCount > 0 && `(${unreadCount} sin leer)`}
          </h2>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                title="Eliminar todas las notificaciones"
                disabled={notifications.length === 0 || loading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar todas las notificaciones</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres eliminar todas tus notificaciones? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteAllNotifications}>Eliminar todo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-500">Cargando notificaciones...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell className="h-10 w-10 mb-2 opacity-30" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-1">
                  {date}
                </h3>
                
                <div className="space-y-2">
                  {dateNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.read ? 'bg-white' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{notification.content}</div>
                          
                          {notification.entity_type && (
                            <div className="text-xs text-gray-500 mt-1">
                              {notification.entity_type} • {notification.subscription_name || 'Suscripción'}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {format(parseISO(notification.createdAt), 'HH:mm', { locale: es })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Marcar como leído"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          
                          {notification.sourceUrl && (
                            <a
                              href={notification.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Ver origen"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleDeleteNotification(notification)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Eliminar notificación"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  variant="outline"
                  onClick={loadMoreNotifications}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 