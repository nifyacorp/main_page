import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, RefreshCw, Calendar, Clock } from 'lucide-react';

// Simple notification interface for demonstration
interface SimpleNotification {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  read: boolean;
  important: boolean;
}

// Sample data
const sampleNotifications: SimpleNotification[] = [
  {
    id: '1',
    title: 'New Tax Law Amendment',
    summary: 'Amendments to the tax law regulations affecting corporate taxation rates.',
    source: 'BOE',
    date: '2 hours ago',
    read: false,
    important: true
  },
  {
    id: '2',
    title: 'Public Tender Announcement',
    summary: 'New public tender for infrastructure development in Galicia region.',
    source: 'DOGA',
    date: '6 hours ago',
    read: false,
    important: false
  },
  {
    id: '3',
    title: 'Corporate Compliance Update',
    summary: 'Updated requirements for corporate compliance reporting in financial sector.',
    source: 'BOE',
    date: 'Yesterday',
    read: true,
    important: true
  }
];

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<SimpleNotification[]>(sampleNotifications);

  // Simple function to mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Function to mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead}
            className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1 text-sm"
            disabled={unreadCount === 0}
          >
            <CheckCircle size={16} />
            Mark all as read
          </button>
          <button className="px-3 py-1 bg-gray-200 rounded-md flex items-center gap-1 text-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Bell className={`flex-shrink-0 ${notification.important ? 'text-amber-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {notification.summary}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center mr-4">
                          <Calendar size={14} className="mr-1" />
                          {notification.date}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs">
                          {notification.source}
                        </span>
                      </div>
                      <div>
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-1">No notifications</h3>
            <p className="text-gray-500">You don't have any notifications yet.</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 