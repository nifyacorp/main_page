import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService, Notification } from '../lib/api/services/notifications';

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
    hasMore: false,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await notificationService.list(pagination.page, pagination.limit);
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setNotifications(data.notifications);
        setPagination(prev => ({
          ...prev,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
          hasMore: data.hasMore
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('No se pudieron cargar las notificaciones. Inténtalo de nuevo más tarde.');
      // Mantener los datos anteriores si hay un error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data, error } = await notificationService.markAsRead(id);
      
      if (error) {
        throw new Error(error);
      }
      
      // Actualizar el estado local si la operación fue exitosa
      if (data) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Mostrar un mensaje de error si es necesario
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await notificationService.markAllAsRead();
      
      if (error) {
        throw new Error(error);
      }
      
      // Actualizar el estado local si la operación fue exitosa
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Mostrar un mensaje de error si es necesario
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notificaciones
        </h1>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="btn-neobrutalism bg-muted text-foreground"
          >
            Marcar todas como leídas
          </button>
          <button
            onClick={fetchNotifications}
            className="btn-neobrutalism-primary"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-md text-destructive flex items-center gap-2 shadow-[3px_3px_0_0_rgba(220,38,38,0.3)]">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-2 border-black rounded-md animate-pulse bg-card shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <div className="flex gap-2 items-start">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 card-neobrutalism">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tienes notificaciones</h3>
          <p className="text-muted-foreground">
            Las notificaciones de tus suscripciones aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-2 border-black rounded-md transition-colors shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${
                  notification.read ? 'bg-card/50' : 'bg-card'
                }`}
              >
                <div className="flex justify-between">
                  <h3 className={`text-lg font-medium mb-1 ${notification.read ? 'text-muted-foreground' : ''}`}>
                    {notification.title}
                  </h3>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-muted-foreground hover:text-foreground hover:rotate-3 transition-transform"
                        title="Marcar como leída"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {notification.sourceUrl && (
                      <a 
                        href={notification.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-muted-foreground hover:text-foreground hover:rotate-3 transition-transform"
                        title="Ver fuente original"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className={`mb-2 ${notification.read ? 'text-muted-foreground' : ''}`}>
                  {notification.content}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                  <span className="badge-neobrutalism bg-muted">{formatDate(notification.createdAt)}</span>
                  {notification.subscriptionId && (
                    <Link 
                      to={`/subscriptions?id=${notification.subscriptionId}`}
                      className="nav-link-neobrutalism"
                    >
                      Ver suscripción
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground badge-neobrutalism bg-muted">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{' '}
              {pagination.totalCount} notificaciones
            </div>
            <div className="tabs-neobrutalism">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className={`tab-neobrutalism ${pagination.page <= 1 ? 'opacity-50' : ''}`}
              >
                Anterior
              </button>
              <button
                disabled={!pagination.hasMore}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className={`tab-neobrutalism ${!pagination.hasMore ? 'opacity-50' : ''}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications; 