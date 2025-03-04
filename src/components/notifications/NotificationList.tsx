import React, { useEffect, useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification, notificationService } from '../../lib/api/services/notifications';
import { useNotifications } from '../../contexts/NotificationContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from '../ui/button';

interface NotificationListProps {
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { 
    markAsRead: markNotificationAsRead, 
    markAllAsRead, 
    refreshUnreadCount,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, Notification[]>>({});
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
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllAsRead();
      
      if (success) {
        // Update all notifications as read
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString()
        }));
        
        setNotifications(updatedNotifications);
        setUnreadCount(0);
        groupNotificationsByDay(updatedNotifications);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
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

  if (loading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="p-4 text-center">No notifications</div>;
  }

  return (
    <div className={`notifications-list ${className || ''}`}>
      <div className="flex justify-between items-center mb-4 p-2 border-b">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={async () => {
              await handleMarkAllAsRead();
            }}
          >
            Mark all as read
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger>
              <Button 
                variant="destructive" 
                size="sm"
              >
                Delete all
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete All Notifications</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete all notifications? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAllNotifications}
                >
                  Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ul className="divide-y">
        {notifications.map((notification) => (
          <li 
            key={notification.id} 
            className={`p-4 hover:bg-gray-50 flex justify-between ${!notification.read ? 'bg-blue-50' : ''}`}
          >
            <div className="flex-grow">
              <div 
                className="cursor-pointer" 
                onClick={() => !notification.read && handleMarkAsRead(notification)}
              >
                <h4 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600">{notification.content}</p>
                <span className="text-xs text-gray-500">
                  {notification.createdAt && format(parseISO(notification.createdAt), 'MMM d, yyyy h:mm a', { locale: es })}
                </span>
              </div>
            </div>
            <div className="flex items-start ml-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteNotification(notification)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 