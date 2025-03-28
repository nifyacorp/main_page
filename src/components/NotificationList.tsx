import React, { useEffect, useState } from 'react';
import { Bell, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { notificationService, type Notification } from '../lib/api/services/notifications';
import { useNotifications } from '../contexts/NotificationContext';
import ErrorBoundary from './ErrorBoundary';

interface NotificationListProps {
  limit?: number;
  className?: string;
  showControls?: boolean;
  onError?: (error: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  limit = 10,
  className = '',
  showControls = true,
  onError
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { markAllAsRead, deleteAllNotifications } = useNotifications();

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.list({
        page: pageNum,
        limit,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.data || !Array.isArray(response.data.notifications)) {
        // Create an empty fallback response to prevent UI errors
        setNotifications(pageNum === 1 ? [] : notifications);
        setHasMore(false);
        console.error('Invalid notification response format:', response.data);
        if (onError) onError('Invalid notification data format received');
        return;
      }
      
      setNotifications(pageNum === 1 
        ? response.data.notifications 
        : [...notifications, ...response.data.notifications]
      );
      setHasMore(response.data.hasMore);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
      if (onError) onError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setPage(1);
    fetchNotifications(1);
  };
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllAsRead();
      if (success) {
        // Update the local state to show all as read
        setNotifications(notifications.map(notification => ({ 
          ...notification, 
          read: true 
        })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };
  
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }
    
    try {
      const success = await deleteAllNotifications();
      if (success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };
  
  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Show a helpful message if there's an error loading notifications
  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
        <p className="font-medium">Error loading notifications</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Try Again
        </button>
      </div>
    );
  }
  
  // Show loading state
  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }
  
  // Show empty state
  if (!loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Bell className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No notifications</p>
        <p className="text-sm">You don't have any notifications yet.</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary section="NotificationList" fallbackComponent={
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
        <p className="font-medium">Failed to display notifications</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Reload Page
        </button>
      </div>
    }>
      <div className={`notification-list ${className}`}>
        {showControls && (
          <div className="flex justify-between mb-4">
            <button 
              onClick={handleRefresh}
              className="text-sm flex items-center text-gray-600 hover:text-primary"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </button>
            <div className="space-x-2">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                Mark all as read
              </button>
              <button 
                onClick={handleDeleteAll}
                className="text-sm px-2 py-1 flex items-center bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Clear all
              </button>
            </div>
          </div>
        )}
        
        <ul className="space-y-2">
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`p-3 rounded border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
              {notification.sourceUrl && (
                <a 
                  href={notification.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View source
                </a>
              )}
            </li>
          ))}
        </ul>
        
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="w-full mt-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </span>
            ) : (
              'Load more'
            )}
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NotificationList;