import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  FileText, 
  User, 
  Settings, 
  BarChart3, 
  LineChart, 
  Briefcase, 
  Calendar, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  FileSearch, 
  RefreshCw,
  PieChart as PieChartIcon,
  CircleArrowUp,
  CircleArrowDown,
  ChevronRight,
  Sparkles,
  PlusCircle 
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useNotifications } from '../hooks/use-notifications';
import { useSubscriptions } from '../hooks/use-subscriptions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { notificationService, subscriptionService } from '../api';

// Define types for our data structures
interface DayActivity {
  day: string;
  count: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  source: string;
  createdAt: string;
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

interface StatsType {
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

// Default empty state
const defaultStats: StatsType = {
  notifications: {
    total: 0,
    unread: 0,
    change: 0,
    isIncrease: false
  },
  subscriptions: {
    total: 0,
    active: 0,
    pending: 0
  },
  sources: [],
  activityByDay: [],
  recentNotifications: [],
  upcomingEvents: []
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsType>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = React.useState('Actualizando...');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Get notifications data using the hook
  const { 
    unreadCount,
    refreshUnreadCount
  } = useNotifications();
  
  // Get paginated notifications list
  const notificationsQuery = useNotifications().getNotifications({ limit: 4 });
  const notificationsData = notificationsQuery.data?.data?.notifications || [];
  const notificationCount = {
    total: notificationsQuery.data?.data?.total || 0,
    unread: unreadCount || 0,
    change: 0, // Will be calculated from activity data
    isIncrease: false
  };
  
  // Get subscription data using the hook
  const { 
    stats: subscriptionStats, 
    isLoadingStats 
  } = useSubscriptions();

  useEffect(() => {
    // Load dashboard data on mount
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Update stats whenever subscription or notification data changes
    updateStats();
  }, [notificationsData, notificationCount, subscriptionStats]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Get recent notifications
      await notificationsQuery.refetch();
      await refreshUnreadCount();
      
      let activityData = {
        activityByDay: [],
        sources: []
      };
      
      try {
        // Get activity data - wrap in try/catch to handle errors independently
        activityData = await notificationService.getNotificationActivity();
      } catch (activityError) {
        console.warn("Error fetching activity data, using default empty values:", activityError);
      }
      
      // Update last update time
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Process and update data
      updateStats(activityData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Still update with whatever data we have
      updateStats();
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (activityData?: any) => {
    if (!notificationCount || !subscriptionStats) return;
    
    // Format notifications for display
    const recentNotifications = notificationsData.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      source: n.source,
      createdAt: n.createdAt
    }));
    
    // Format activity data
    const activityByDay = activityData?.activityByDay || [];
    const sources = activityData?.sources || [];
    
    // Update stats state
    setStats({
      notifications: {
        total: notificationCount?.total || 0,
        unread: notificationCount?.unread || 0,
        change: notificationCount?.change || 0,
        isIncrease: notificationCount?.isIncrease || false
      },
      subscriptions: {
        total: subscriptionStats?.total || 0,
        active: subscriptionStats?.active || 0,
        pending: subscriptionStats?.pending || 0
      },
      sources,
      activityByDay,
      recentNotifications,
      upcomingEvents: []
    });
  };

  const refreshData = (): void => {
    setIsRefreshing(true);
    fetchDashboardData().finally(() => {
      setIsRefreshing(false);
    });
  };

  const BarChart: React.FC<{ data: DayActivity[] }> = ({ data }) => (
    <div className="flex h-[120px] items-end justify-between gap-1">
      {data.map((item) => (
        <div key={item.day} className="flex flex-col items-center gap-1">
          <div 
            className="bg-primary w-8 rounded-sm transition-all hover:opacity-90"
            style={{ height: `${(item.count / 20) * 100}px` }}
          ></div>
          <span className="text-xs text-muted-foreground">{item.day}</span>
        </div>
      ))}
    </div>
  );

  const PieChart: React.FC<{ data: SourceData[] }> = ({ data }) => (
    <div className="flex justify-center py-4 relative h-[120px]">
      <div className="flex items-center gap-4">
        {data.map((source, index) => (
          <div key={source.name} className="flex flex-col items-center">
            <div 
              className="rounded-full hover:opacity-90"
              style={{ 
                backgroundColor: source.color,
                width: `${(source.count / 40) * 60}px`,
                height: `${(source.count / 40) * 60}px`
              }}
            ></div>
            <span className="text-xs mt-1 text-muted-foreground">{source.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista general de tus notificaciones, suscripciones y actividad.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Notificaciones
            </CardTitle>
            <CardDescription>Resumen de tus alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{stats.notifications.total}</div>
                <div className="text-sm text-muted-foreground">Total recibidas</div>
              </div>
              <div>
                <div className="flex items-center">
                  <Badge variant="outline" className="rounded-sm font-bold">
                    {stats.notifications.unread} sin leer
                  </Badge>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {stats.notifications.isIncrease ? 
                    <ArrowUp className="h-4 w-4 mr-1 text-green-500" /> : 
                    <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                  }
                  <span className={stats.notifications.isIncrease ? "text-green-500" : "text-red-500"}>
                    {stats.notifications.change}% esta semana
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to="/notifications">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
              Suscripciones
            </CardTitle>
            <CardDescription>Tus fuentes configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{stats.subscriptions.total}</div>
                <div className="text-sm text-muted-foreground">Total configuradas</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">{stats.subscriptions.active} activas</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">{stats.subscriptions.pending} pendientes</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to="/subscriptions">
                Administrar <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Content Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Recent Notifications */}
        <Card className="border-2 shadow-md md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Notificaciones recientes</CardTitle>
            <CardDescription>Últimas alertas recibidas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] px-6">
              <div className="space-y-4 pt-2">
                {stats.recentNotifications.length > 0 ? (
                  stats.recentNotifications.map((notification) => (
                    <div key={notification.id} className="flex flex-col space-y-1 border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <h4 className="text-sm font-semibold">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="outline" className="text-xs font-normal">
                          {notification.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No tienes notificaciones recientes</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to="/notifications">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Weekly Activity */}
        <Card className="border-2 shadow-md md:col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Actividad semanal</CardTitle>
            <CardDescription>Notificaciones por día</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.activityByDay.length > 0 ? (
              <BarChart data={stats.activityByDay} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay datos de actividad disponibles</p>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Fuentes</CardTitle>
            <CardDescription>Distribución por origen</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {stats.sources.length > 0 ? (
              <PieChart data={stats.sources} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <PieChartIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No hay datos de fuentes disponibles</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 text-center text-xs text-muted-foreground">
            <div className="w-full">
              <span>Última actualización: {lastUpdate}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;