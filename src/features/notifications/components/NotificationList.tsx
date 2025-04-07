import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  FileText, 
  Clock, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  MoreVertical, 
  Trash2, 
  Eye,
  Check
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '../hooks/use-notification-context';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  error?: Error | null;
  maxHeight?: string;
  emptyMessage?: string;
  onMarkAsRead?: (id: string) => Promise<void>;
  onDeleteNotification?: (id: string) => Promise<void>;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading = false,
  error = null,
  maxHeight = 'max-h-[500px]',
  emptyMessage = 'No tienes notificaciones',
  onMarkAsRead,
  onDeleteNotification,
}) => {
  // Function to render notification icon
  const renderNotificationIcon = (notification: Notification) => {
    // Check priority or type to determine icon
    if (notification.priority === 'high' || notification.type === 'error') {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    
    if (notification.type === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
    
    if (notification.type === 'info') {
      return <Info className="h-5 w-5 text-primary" />;
    }
    
    if (notification.type === 'warning') {
      return <Clock className="h-5 w-5 text-warning" />;
    }
    
    if (notification.entity_type === 'boe') {
      return <FileText className="h-5 w-5 text-primary" />;
    }
    
    // Default
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Ahora mismo';
    }
    
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    
    return format(date, 'PPP', { locale: es });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-2/3 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Error al cargar notificaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message || 'Ocurrió un error desconocido'}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render empty state
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }
  
  // Render notifications list
  return (
    <ScrollArea className={maxHeight}>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={cn(
              "overflow-hidden transition-colors", 
              !notification.read && "border-primary/50 bg-muted/30"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  {renderNotificationIcon(notification)}
                  <div>
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <CardDescription>
                      {notification.entity_type && (
                        <Badge variant="outline" className="mr-2">
                          {notification.entity_type}
                        </Badge>
                      )}
                      {formatRelativeTime(notification.created_at)}
                    </CardDescription>
                  </div>
                </div>
                
                {!notification.read && (
                  <Badge variant="secondary" className="h-2 w-2 rounded-full p-0" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm">
                {notification.message}
              </p>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {notification.entity_id && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/subscriptions/${notification.entity_id}`}>
                    Ver detalles
                  </Link>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Más opciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && onMarkAsRead && (
                    <DropdownMenuItem 
                      onClick={() => onMarkAsRead(notification.id)}
                      className="cursor-pointer"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      <span>Marcar como leída</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onDeleteNotification && (
                    <>
                      {!notification.read && onMarkAsRead && <DropdownMenuSeparator />}
                      <DropdownMenuItem 
                        onClick={() => onDeleteNotification(notification.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

// Helper for conditional class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default NotificationList;