import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../hooks/use-notification-context';

interface NotificationBadgeProps {
  variant?: 'default' | 'button';
  showCount?: boolean;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  variant = 'default',
  showCount = true,
  maxCount = 99,
}) => {
  const { unreadCount } = useNotifications();
  
  // Display count with limit
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;
  
  // If there are no unread notifications, just show the icon
  if (!showCount || unreadCount === 0) {
    if (variant === 'button') {
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link to="/notifications" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      );
    }
    return <Bell className="h-5 w-5" />;
  }
  
  // With unread count
  if (variant === 'button') {
    return (
      <Button variant="ghost" size="icon" asChild className="relative">
        <Link to="/notifications" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {displayCount}
          </span>
        </Link>
      </Button>
    );
  }
  
  // Default variant with badge
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {displayCount}
      </span>
    </div>
  );
};

export default NotificationBadge;