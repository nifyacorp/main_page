import React from 'react';
import { NotificationList } from './NotificationList';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <NotificationList />
    </div>
  );
}; 