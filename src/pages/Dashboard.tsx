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
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";

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
    total: 247,
    unread: 13,
    change: 12,
    isIncrease: true
  },
  subscriptions: {
    total: 7,
    active: 5,
    pending: 2
  },
  sources: [
    { name: 'BOE', count: 36, color: '#ff5722' },
    { name: 'Idealista', count: 27, color: '#4caf50' },
    { name: 'Diarios', count: 18, color: '#2196f3' },
    { name: 'Social Media', count: 9, color: '#9c27b0' }
  ],
  activityByDay: [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 8 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 9 },
    { day: 'Fri', count: 18 },
    { day: 'Sat', count: 6 },
    { day: 'Sun', count: 4 }
  ],
  recentNotifications: [
    {
      id: 1,
      title: 'Nuevo inmueble disponible',
      description: 'Se ha encontrado un inmueble que coincide con tus criterios',
      time: '10:23',
      date: 'Hoy',
      isNew: true,
      source: 'Idealista'
    },
    {
      id: 2,
      title: 'Publicación en BOE',
      description: 'Nueva publicación relacionada con tus suscripciones',
      time: '09:15',
      date: 'Hoy',
      isNew: true,
      source: 'BOE'
    },
    {
      id: 3,
      title: 'Actualización de precio',
      description: 'Un inmueble en seguimiento ha bajado su precio un 5%',
      time: '18:42',
      date: 'Ayer',
      isNew: false,
      source: 'Fotocasa'
    },
    {
      id: 4,
      title: 'Recordatorio de evento',
      description: 'Tienes una visita programada mañana a las 17:00',
      time: '12:00',
      date: 'Ayer',
      isNew: false,
      source: 'Calendario'
    }
  ],
  upcomingEvents: [
    {
      id: 1,
      title: 'Visita inmueble Calle Gran Vía',
      description: 'Visita con el agente inmobiliario',
      date: 'Mañana, 17:00'
    },
    {
      id: 2,
      title: 'Publicación BOE trimestral',
      description: 'Publicación programada de interés',
      date: '23 Marzo, 08:00'
    },
    {
      id: 3,
      title: 'Renovación suscripción',
      description: 'Vencimiento de periodo de prueba',
      date: '30 Marzo, 00:00'
    }
  ]
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MockStatsType>(mockStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = React.useState('Hace 5 minutos');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshData = (): void => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, we would fetch from API and update state
    }, 1500);
  };

  useEffect(() => {
    // Initial data fetch would happen here
  }, []);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <Button size="sm" variant="outline" className="w-full">
              Ver todas <ChevronRight className="h-4 w-4 ml-1" />
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
            <Button size="sm" variant="outline" className="w-full">
              Administrar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 shadow-md md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Acciones rápidas
            </CardTitle>
            <CardDescription>Operaciones comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center justify-start h-auto py-3">
                <PlusCircle className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Nueva suscripción</div>
                  <div className="text-xs text-muted-foreground">Añadir nueva fuente</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center justify-start h-auto py-3">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Programar</div>
                  <div className="text-xs text-muted-foreground">Nueva notificación</div>
                </div>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Más acciones <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Content Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Notifications */}
        <Card className="border-2 shadow-md md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Notificaciones recientes</CardTitle>
            <CardDescription>Últimas alertas recibidas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] px-6">
              <div className="space-y-4 pt-2">
                {stats.recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex flex-col space-y-1 border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <h4 className="text-sm font-semibold">{notification.title}</h4>
                        {notification.isNew && (
                          <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{notification.time}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant="outline" className="text-xs font-normal">
                        {notification.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{notification.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Ver todas <ChevronRight className="h-4 w-4 ml-1" />
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
            <BarChart data={stats.activityByDay} />
          </CardContent>
          <Separator />
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Fuentes</CardTitle>
            <CardDescription>Distribución por origen</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <PieChart data={stats.sources} />
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card className="border-2 shadow-md md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Próximos eventos</CardTitle>
            <CardDescription>Calendario y recordatorios</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-4 pt-2">
                {stats.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-primary" />
                        <span className="text-xs font-medium">{event.date}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Ver calendario <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;