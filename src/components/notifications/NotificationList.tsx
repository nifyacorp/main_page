import React, { useEffect, useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCheck, Bell, ExternalLink } from 'lucide-react';
import { Notification, notificationService, NotificationApiResponse } from '../../lib/api/services/notifications';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationListProps {
  onRefresh?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onRefresh }) => {
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, Notification[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

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

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.error) {
        console.error('Error marking all notifications as read:', response.error);
        return;
      }
      
      // Update all notifications in state
      const updatedNotifications = notifications.map(n => 
        !n.read ? { ...n, read: true, readAt: new Date().toISOString() } : n
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      groupNotificationsByDay(updatedNotifications);
      
      // Update global notification count
      refreshUnreadCount();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications();
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => loadNotifications(true)}
            className="mt-2 text-sm underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading && notifications.length === 0 ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/20 rounded-lg">
          <Bell className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No tienes notificaciones</p>
          <p className="text-sm text-muted-foreground">
            Cuando recibas notificaciones, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
            <div key={dateGroup} className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground sticky top-0 bg-background/95 backdrop-blur py-1">
                {dateGroup}
              </h3>
              
              <div className="space-y-2">
                {groupNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(notification.createdAt), 'HH:mm')}
                        {notification.subscription_name && ` • ${notification.subscription_name}`}
                      </span>
                      
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification)}
                            title="Marcar como leída"
                            className="text-muted-foreground hover:text-primary p-1 rounded-full hover:bg-primary/10"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {notification.content}
                    </p>
                    
                    {notification.sourceUrl && (
                      <a
                        href={notification.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Ver documento</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 text-sm border rounded-md hover:bg-secondary/30 transition disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 