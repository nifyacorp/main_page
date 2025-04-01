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
    
    // Determine which page to load
    let pageToLoad = reset ? (reset === true ? 1 : page) : page;
    
    try {
      console.log('Loading notifications page', pageToLoad);
      const response = await notificationService.list({
        page: pageToLoad,
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
        
        // Process debugging data only in development mode
        if (import.meta.env.DEV) {
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
              hasMessage: 'message' in firstRaw,
              hasMetadata: 'metadata' in firstRaw,
              metadataKeys: firstRaw.metadata ? Object.keys(firstRaw.metadata) : []
            });
          } catch (error) {
            console.error('Error analyzing notification structure:', error);
          }
          console.groupEnd();
        }
        
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
        
        // If reset is true, replace notifications; otherwise append
        const newNotifications = reset ? processedNotifications : [...notifications, ...processedNotifications];
        setNotifications(newNotifications);
        groupNotificationsByDay(newNotifications);
        setHasMore(response.data.hasMore);
        setTotalCount(response.data.total);
        setUnreadCount(response.data.unread);
        
        // Update the page state based on what we just loaded
        setPage(pageToLoad); 
      } else {
        // No notifications found, keep existing or set empty
        if (reset) {
          setNotifications([]);
          setGroupedNotifications({});
          setHasMore(false);
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
      
      // Optimistically update UI first
      const updatedNotifications = notifications.filter(n => n.id !== notification.id);
      setNotifications(updatedNotifications);
      groupNotificationsByDay(updatedNotifications);
      
      // Update total count
      setTotalCount(prev => Math.max(0, prev - 1));
      
      // If the notification was unread, update unread count
      if (!notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Attempt to delete the notification
      const success = await deleteNotification(notification.id);
      
      if (!success) {
        console.log('Failed to delete notification, reverting UI changes');
        // If deletion failed, revert UI changes
        loadNotifications(true);
      } else {
        console.log('Successfully deleted notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Refresh notifications from server to ensure UI is in sync
      loadNotifications(true);
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
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('Processing notification title:', {
        id: notification.id,
        hasTitle: !!notification.title,
        isUntitled: notification.title === 'Untitled Notification',
        hasContent: !!notification.content,
        keys: Object.keys(notification)
      });
    }

    // Step 1: Check if we have a real title that's not the default "Untitled Notification"
    if (notification.title && notification.title !== 'Untitled Notification') {
      // Check for truncated titles and attempt to restore them
      if (notification.title.endsWith('...') && notification.metadata?.original_title) {
        return notification.metadata.original_title || notification.title;
      }
      return notification.title;
    }
    
    // Step 2: If no title or default title, but we have subscription name, use that for context
    if (notification.subscription_name || notification.subscriptionName) {
      const name = notification.subscription_name || notification.subscriptionName;
      return `Notification from ${name}`;
    }
    
    // Step 3: If no title or default title, but we have content, use content as title
    if (notification.content) {
      const truncatedContent = typeof notification.content === 'string' && notification.content.length > 50 
        ? `${notification.content.substring(0, 47)}...` 
        : typeof notification.content === 'string' ? notification.content : 'Notification';
      return truncatedContent;
    }
    
    // Step 4: Check if title might be in metadata
    if (notification.metadata) {
      const metadataTitle = notification.metadata.title || 
                            notification.metadata.subject || 
                            notification.metadata.heading ||
                            notification.metadata.name;
      
      if (metadataTitle) {
        return typeof metadataTitle === 'string' ? metadataTitle : String(metadataTitle);
      }
      
      // For BOE notifications, look deeper in metadata
      if (notification.metadata.document_type === 'boe_document' || 
          notification.entity_type?.includes('boe')) {
        return notification.metadata.original_title || 
               'BOE Document Notification';
      }
    }
    
    // Step 5: If we have entity_type, use that for context
    if (notification.entity_type) {
      const type = notification.entity_type.split(':').pop() || notification.entity_type;
      return `New ${type.replace(/_/g, ' ')} notification`;
    }
    
    // Step 6: Last resort fallback
    return 'Notification';
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
                    {/* Debug notification title only in development */}
                    {import.meta.env.DEV && console.log('Rendering notification ID:', notification.id)}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <div>
          <p className="text-sm text-gray-500">
            Showing {notifications.length} of {totalCount} notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadNotifications(true)}
            disabled={page === 1 || loading}
          >
            First Page
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                loadNotifications(true); // Reset but with updated page
              }
            }}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="px-2 py-1 text-sm">
            Page {page}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadMoreNotifications}
            disabled={!hasMore || loading}
          >
            Next
          </Button>
        </div>
      </div>

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