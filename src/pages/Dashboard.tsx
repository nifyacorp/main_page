import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, FileText, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-8">
        <p className="text-lg">
          Welcome back, {user?.name || 'User'}!
        </p>
        <p className="text-gray-600 mt-2">
          This is a simplified dashboard for testing the build.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 mr-2 text-blue-500" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <p className="mb-4">View your latest notifications and updates.</p>
          <Link 
            to="/notifications" 
            className="block text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Notifications
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 mr-2 text-green-500" />
            <h2 className="text-xl font-semibold">Subscriptions</h2>
          </div>
          <p className="mb-4">Manage your active subscriptions and alerts.</p>
          <Link 
            to="/subscriptions" 
            className="block text-center py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Manage Subscriptions
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 mr-2 text-purple-500" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <p className="mb-4">Customize your account preferences.</p>
          <Link 
            to="/settings" 
            className="block text-center py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;