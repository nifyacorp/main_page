import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { NotificationList } from '../components/notifications/NotificationList';

export default function Notifications() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <NotificationList />
      </div>

      <div className="mt-6 text-center">
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 