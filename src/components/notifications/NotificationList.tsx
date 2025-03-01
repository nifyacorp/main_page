import React, { useEffect, useState } from 'react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Bell, ExternalLink, Trash2, Eye } from 'lucide-react';
import { 
  Notification, 
  notificationService, 
  enhanceNotification, 
  enhanceNotifications 
} from '../../lib/api/services/notifications';
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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isNotificationDetailOpen, setIsNotificationDetailOpen] = useState(false);
  const { 
    markAsRead, 
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
      console.log('Loading notifications page', currentPage);
      const response = await notificationService.list({
        page: currentPage,
        limit: 20,
        unread: false
      });
      
      if (response.error) {
        setError(response.error);
        console.error('Error from notification service:', response.error);
        return;
      }
      
      if (response.data && response.data.notifications && response.data.notifications.length > 0) {
        console.log(`Received ${response.data.notifications.length} notifications from API`);
        
        // Add detailed debugging for raw notifications
        console.group('Raw Notification Structure Analysis');
        try {
          const firstRaw = response.data.notifications[0];
          console.log('Raw notification structure example:', {
            first: firstRaw,
            keys: Object.keys(firstRaw),
            hasDirectTitle: 'title' in firstRaw,
            directTitleValue: firstRaw.title,
            directTitleType: typeof firstRaw.title,
            possibleAlternateTitles: {
              notification_title: firstRaw.notification_title,
              message_title: firstRaw.message_title,
              subject: firstRaw.subject
            },
            hasMessage: 'message' in firstRaw,
            messageType: typeof firstRaw.message,
            messageStructure: firstRaw.message ? (typeof firstRaw.message === 'object' ? Object.keys(firstRaw.message) : 'not an object') : null,
            hasMetadata: 'metadata' in firstRaw,
            metadataKeys: firstRaw.metadata ? Object.keys(firstRaw.metadata) : []
          });
          
          // Dump stringified version for complete analysis
          console.log('Full raw notification JSON:', JSON.stringify(firstRaw, null, 2));
        } catch (error) {
          console.error('Error analyzing notification structure:', error);
        }
        console.groupEnd();
        
        // Process the notifications and enhance them
        const processedNotifications = enhanceNotifications(response.data.notifications);
        console.log(`Processed ${processedNotifications.length} notifications`);
        
        if (processedNotifications.length > 0) {
          console.log('First notification sample:', {
            id: processedNotifications[0].id,
            title: processedNotifications[0].title,
            entity_type: processedNotifications[0].entity_type,
            has_method: typeof processedNotifications[0].getEntityTypeParts === 'function'
          });
        }
        
        const newNotifications = reset ? processedNotifications : [...notifications, ...processedNotifications];
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

  const handleShowNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsNotificationDetailOpen(true);
  };

  const handleDeleteNotification = async (notification: Notification) => {
    console.group('🗑️ NotificationList - Delete Notification');
    try {
      // Enhanced debug logging
      console.log('Attempting to delete notification:', {
        notification,
        id: notification?.id,
        hasId: !!notification?.id,
        idType: typeof notification?.id,
        isValid: notification?.id !== undefined && notification?.id !== null
      });
      
      // Validate notification ID
      if (!notification?.id) {
        console.error('Cannot delete notification with undefined ID');
        console.groupEnd();
        return;
      }
      
      // Attempt to delete the notification
      const success = await deleteNotification(notification.id);
      
      if (success) {
        console.log('Successfully deleted notification, updating UI');
        // Remove the notification from the list
        const updatedNotifications = notifications.filter(n => n.id !== notification.id);
        setNotifications(updatedNotifications);
        groupNotificationsByDay(updatedNotifications);
        
        // Update total count
        setTotalCount(prev => Math.max(0, prev - 1));
        
        // If the notification was unread, update unread count
        if (!notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        console.warn('Failed to delete notification, no changes made to UI');
      }
    } catch (err) {
      console.error('Exception when deleting notification:', err);
    } finally {
      console.groupEnd();
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

  const getNotificationTitle = (notification: Notification): string => {
    console.log('Processing notification title:', {
      id: notification.id,
      originalTitle: notification.title,
      isUntitled: notification.title === 'Untitled Notification',
      hasContent: !!notification.content,
      contentLength: notification.content?.length || 0,
      contentPreview: notification.content ? notification.content.substring(0, 30) + '...' : 'none'
    });

    // Step 1: Check if we have a real title that's not the default "Untitled Notification"
    if (notification.title && notification.title !== 'Untitled Notification') {
      console.log(`Using original title for notification ${notification.id}: "${notification.title}"`);
      return notification.title;
    }
    
    // Step 2: If no title or default title, but we have content, use content as title
    if (notification.content) {
      const truncatedContent = notification.content.length > 50 
        ? `${notification.content.substring(0, 47)}...` 
        : notification.content;
      console.log(`Using content as title for notification ${notification.id}: "${truncatedContent}"`);
      return truncatedContent;
    }
    
    // Step 3: Check if title might be in metadata
    if (notification.metadata) {
      const metadataTitle = notification.metadata.title || 
                            notification.metadata.subject || 
                            notification.metadata.heading ||
                            notification.metadata.name;
      
      if (metadataTitle) {
        console.log(`Found title in metadata for notification ${notification.id}: "${metadataTitle}"`);
        return typeof metadataTitle === 'string' ? metadataTitle : String(metadataTitle);
      }
    }
    
    // Step 4: Last resort fallback
    console.log(`Falling back to "Untitled Notification" for ${notification.id}`);
    return 'Untitled Notification';
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
        {notifications
          // Filter out notifications without valid IDs to prevent errors
          .filter(notification => {
            const isValid = !!notification && !!notification.id;
            if (!isValid) {
              console.warn('Filtering out invalid notification:', notification);
            }
            return isValid;
          })
          .map((notification) => {
            // Safety check - ensure notification has been enhanced with methods
            if (typeof notification.getEntityTypeParts !== 'function') {
              console.log('Enhancing notification in render:', notification.id);
              notification = enhanceNotification(notification);
            }
            
            return (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between">
                  <div className="flex-grow">
                    {/* Debug notification title */}
                    {console.log('Rendering notification:', {
                      id: notification.id,
                      titleBeforeHelper: notification.title,
                      titleAfterHelper: getNotificationTitle(notification)
                    })}
                    <h4 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                      {getNotificationTitle(notification)}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.content}</p>
                    <span className="text-xs text-gray-500">
                      {notification.createdAt && format(parseISO(notification.createdAt), 'MMM d, yyyy h:mm a', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-start ml-4 space-x-2">
                    {/* View details button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="View details" 
                      onClick={() => handleShowNotificationDetails(notification)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Mark as read" 
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Delete notification"
                      onClick={() => handleDeleteNotification(notification)}
                      disabled={!notification.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>

      {/* Notification Detail Dialog */}
      <Dialog open={isNotificationDetailOpen} onOpenChange={setIsNotificationDetailOpen}>
        <DialogContent>
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle>{getNotificationTitle(selectedNotification)}</DialogTitle>
                <DialogDescription>
                  {selectedNotification.createdAt && format(parseISO(selectedNotification.createdAt), 'MMMM d, yyyy h:mm a', { locale: es })}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">{selectedNotification.content}</p>
                {selectedNotification.sourceUrl && (
                  <a 
                    href={selectedNotification.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 mt-4 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View source
                  </a>
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  {!selectedNotification.read && (
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        handleMarkAsRead(selectedNotification);
                        setIsNotificationDetailOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleDeleteNotification(selectedNotification);
                      setIsNotificationDetailOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNotificationDetailOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 