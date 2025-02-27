import React from 'react';
import { NotificationList } from '../components/notifications/NotificationList';

const Notifications: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <NotificationList />
    </div>
  );
};

export default Notifications; 