import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, FileText, User, Settings, BarChart3, LineChart, Briefcase, Calendar, AlertCircle, ArrowUp, ArrowDown, Clock, FileSearch, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Define types for our data structures
interface DayActivity {
  day: string;
  count: number;
}

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  date: string;
  isNew: boolean;
  source: string;
}

interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface SourceData {
  name: string;
  count: number;
  color: string;
}

interface MockStatsType {
  notifications: {
    total: number;
    unread: number;
    change: number;
    isIncrease: boolean;
  };
  subscriptions: {
    total: number;
    active: number;
    pending: number;
  };
  sources: SourceData[];
  activityByDay: DayActivity[];
  recentNotifications: NotificationItem[];
  upcomingEvents: EventItem[];
}

// Mock data for charts and stats
const mockStats: MockStatsType = {
  notifications: {
    total: 24,
    unread: 8,
    change: 12,
    isIncrease: true
  },
  subscriptions: {
    total: 7,
    active: 5,
    pending: 2
  },
  sources: [
    { name: 'BOE', count: 43, color: '#4f46e5' },
    { name: 'DOGA', count: 21, color: '#0891b2' },
    { name: 'Inmobiliarias', count: 18, color: '#16a34a' },
    { name: 'Otros', count: 12, color: '#f59e0b' }
  ],
  activityByDay: [
    { day: 'Lun', count: 12 },
    { day: 'Mar', count: 8 },
    { day: 'Mié', count: 15 },
    { day: 'Jue', count: 10 },
    { day: 'Vie', count: 22 },
    { day: 'Sáb', count: 6 },
    { day: 'Dom', count: 4 }
  ],
  recentNotifications: [
    {
      id: 1,
      title: 'Nuevo anuncio BOE',
      description: 'Subvenciones para empresas de tecnología',
      time: '12:32',
      date: 'Hoy',
      isNew: true,
      source: 'BOE'
    },
    {
      id: 2,
      title: 'Actualización inmobiliaria',
      description: 'Nuevo local disponible en Madrid',
      time: '10:15',
      date: 'Hoy',
      isNew: true,
      source: 'Inmobiliarias'
    },
    {
      id: 3,
      title: 'Resolución DOGA',
      description: 'Resolución de ayudas para autónomos',
      time: '16:45',
      date: 'Ayer',
      isNew: false,
      source: 'DOGA'
    }
  ],
  upcomingEvents: [
    {
      id: 1,
      title: 'Publicación BOE',
      description: 'Nuevas ayudas previstas',
      date: 'Mañana'
    },
    {
      id: 2,
      title: 'Renovación suscripción',
      description: 'Plan Premium',
      date: '23/03/2024'
    }
  ]
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = React.useState('Hace 5 minutos');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshData = (): void => {
    setIsRefreshing(true);
    // Simulate API call with timeout
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate('Justo ahora');
    }, 1500);
  };

  // Simplified bar chart component
  const BarChart: React.FC<{ data: DayActivity[] }> = ({ data }) => (
    <div className="flex items-end h-40 gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <div 
            className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/30 transition-colors cursor-pointer relative group"
            style={{ height: `${(item.count / Math.max(...data.map(d => d.count))) * 100}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {item.count}
            </div>
          </div>
          <span className="text-xs font-medium">{item.day}</span>
        </div>
      ))}
    </div>
  );

  // Simplified pie chart
  const PieChart: React.FC<{ data: SourceData[] }> = ({ data }) => (
    <div className="relative h-40 w-40 mx-auto">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {data.map((segment, i) => {
          // Simple calculation for pie segments
          const total = data.reduce((sum, item) => sum + item.count, 0);
          let startAngle = 0;
          
          for (let j = 0; j < i; j++) {
            startAngle += (data[j].count / total) * 360;
          }
          
          const endAngle = startAngle + (segment.count / total) * 360;
          
          // Convert angles to radians and calculate coordinates
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          // Create SVG arc path
          const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          return <path key={i} d={pathData} fill={segment.color} />
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.count, 0)}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name || 'Usuario'}. Aquí tienes un resumen de tus notificaciones y suscripciones.
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <div className="text-sm text-muted-foreground mr-2">
            <span className="inline-flex items-center">
              <Clock className="w-3 h-3 mr-1" /> {lastUpdate}
            </span>
          </div>
          <button 
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Notification Stats */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notificaciones</p>
              <h3 className="text-2xl font-bold mt-1">{mockStats.notifications.total}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-md">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">No leídas:</span>
            <span className="text-sm font-bold">{mockStats.notifications.unread}</span>
            <div className="ml-auto flex items-center text-xs">
              <span className={mockStats.notifications.isIncrease ? 'text-green-600' : 'text-red-600'}>
                {mockStats.notifications.isIncrease ? '+' : '-'}{mockStats.notifications.change}%
              </span>
              {mockStats.notifications.isIncrease ? 
                <ArrowUp className="h-3 w-3 ml-1 text-green-600" /> : 
                <ArrowDown className="h-3 w-3 ml-1 text-red-600" />
              }
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suscripciones</p>
              <h3 className="text-2xl font-bold mt-1">{mockStats.subscriptions.total}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-md">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
              <span className="text-xs text-muted-foreground">Activas: {mockStats.subscriptions.active}</span>
            </div>
            <div className="flex items-center ml-4">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-xs text-muted-foreground">Pendientes: {mockStats.subscriptions.pending}</span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Actividad semanal</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-md">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <BarChart data={mockStats.activityByDay} />
          </div>
        </div>

        {/* Sources Breakdown */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fuentes</p>
            </div>
            <div className="p-2 bg-teal-100 rounded-md">
              <LineChart className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-1">
            <PieChart data={mockStats.sources} />
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Notificaciones Recientes</h3>
            <Link 
              to="/notifications" 
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-4">
            {mockStats.recentNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border ${notification.isNew ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{notification.title}</h4>
                        {notification.isNew && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{notification.time}</div>
                    <div>{notification.date}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {notification.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Próximamente</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {mockStats.upcomingEvents.map(event => (
                <div key={event.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
            <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/subscriptions/new" 
                className="p-3 bg-primary/10 hover:bg-primary/20 rounded-md text-center transition-colors"
              >
                <Briefcase className="h-5 w-5 mx-auto mb-1 text-primary" />
                <span className="text-sm font-medium">Nueva Suscripción</span>
              </Link>
              <Link 
                to="/notifications" 
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-md text-center transition-colors"
              >
                <Bell className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <span className="text-sm font-medium">Notificaciones</span>
              </Link>
              <Link 
                to="/settings" 
                className="p-3 bg-amber-50 hover:bg-amber-100 rounded-md text-center transition-colors"
              >
                <Settings className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                <span className="text-sm font-medium">Ajustes</span>
              </Link>
              <Link 
                to="/search" 
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-md text-center transition-colors"
              >
                <FileSearch className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <span className="text-sm font-medium">Buscar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;