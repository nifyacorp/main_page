import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const { unreadCount, loading } = useNotifications();

  return (
    <Link to="/notifications" className={`relative ${className}`}>
      <Bell className="h-5 w-5" />
      
      {unreadCount > 0 && !loading && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}; 