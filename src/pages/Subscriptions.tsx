import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Clock, FileText, MoreHorizontal, Bell, Edit, Trash } from 'lucide-react';

// Sample data
const subscriptionData = [
  { 
    id: 1, 
    name: "BOE Legal Updates", 
    description: "Updates on legal regulations published in BOE",
    source: "BOE", 
    frequency: "Instant", 
    keywords: ["law", "regulation", "legal"], 
    lastNotification: "2 hours ago", 
    status: "active", 
    notifications: 24,
    created: "10/02/2024"
  },
  { 
    id: 2, 
    name: "DOGA Regulatory Changes", 
    description: "Changes to regional regulations in Galicia",
    source: "DOGA", 
    frequency: "Daily", 
    keywords: ["regulation", "Galicia", "policy"], 
    lastNotification: "1 day ago", 
    status: "active", 
    notifications: 16,
    created: "15/01/2024"
  },
  { 
    id: 3, 
    name: "Tax Law Updates", 
    description: "Updates on tax legislation and regulations",
    source: "BOE", 
    frequency: "Weekly", 
    keywords: ["tax", "fiscal", "budget"], 
    lastNotification: "3 days ago", 
    status: "active", 
    notifications: 8,
    created: "05/12/2023"
  },
  { 
    id: 4, 
    name: "Environmental Regulations", 
    description: "Environmental policy updates and regulations",
    source: "DOGA", 
    frequency: "Instant", 
    keywords: ["environment", "ecological", "sustainability"], 
    lastNotification: "1 week ago", 
    status: "active", 
    notifications: 5,
    created: "22/11/2023"
  },
];

export default function Subscriptions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSource, setFilterSource] = React.useState('all');

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptionData.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = filterSource === 'all' || sub.source === filterSource;
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Link 
          to="/subscriptions/new" 
          className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1 text-sm"
        >
          <Plus size={16} />
          New Subscription
        </Link>
      </div>

      {/* Simple search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search subscriptions..."
          className="w-full p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Source filter */}
      <div className="mb-6 flex gap-2">
        <button 
          className={`px-3 py-1 rounded-md text-sm ${filterSource === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterSource('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm ${filterSource === 'BOE' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterSource('BOE')}
        >
          BOE
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm ${filterSource === 'DOGA' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilterSource('DOGA')}
        >
          DOGA
        </button>
      </div>

      {/* Grid of subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.map((subscription) => (
          <div key={subscription.id} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{subscription.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                subscription.source === 'BOE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {subscription.source}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 mb-4">
              {subscription.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {subscription.keywords.map((keyword, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {keyword}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {subscription.frequency}
              </div>
              <div className="flex items-center">
                <Bell size={14} className="mr-1" />
                {subscription.notifications}
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <Link 
                to={`/subscriptions/${subscription.id}`}
                className="text-blue-500 hover:underline text-sm flex items-center"
              >
                <FileText size={14} className="mr-1" />
                View Details
              </Link>
              
              <div className="flex gap-2">
                <button className="text-gray-500 hover:text-blue-500">
                  <Edit size={16} />
                </button>
                <button className="text-gray-500 hover:text-red-500">
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <Bell size={40} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No subscriptions found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button 
            onClick={() => {setSearchTerm(''); setFilterSource('all');}}
            className="px-4 py-2 bg-gray-200 rounded-md text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}