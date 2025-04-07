import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Play,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Subscription } from '../services/subscription-service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDeleteSubscription, useProcessSubscription } from '../hooks/use-subscriptions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  error?: Error | null;
}

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  subscriptions,
  isLoading = false,
  error = null,
}) => {
  const deleteSubscription = useDeleteSubscription();
  const processSubscription = useProcessSubscription();
  
  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };
  
  const handleProcess = async (id: string) => {
    try {
      await processSubscription.mutateAsync(id);
    } catch (error) {
      console.error('Error processing subscription:', error);
    }
  };
  
  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Activa</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Procesando</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Error</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <span>Desconocido</span>
          </Badge>
        );
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
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
            <span>Error al cargar suscripciones</span>
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
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay suscripciones</CardTitle>
          <CardDescription>
            No tienes suscripciones activas. Crea una nueva para comenzar a recibir notificaciones.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link to="/subscriptions/create">Crear suscripción</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render subscriptions list
  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg">{subscription.name}</CardTitle>
                <CardDescription>
                  Tipo: {subscription.type}
                </CardDescription>
              </div>
              {renderStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              <p>
                Creada: {format(new Date(subscription.created_at), 'PPP', { locale: es })}
              </p>
              {subscription.processed_at && (
                <p>
                  Última actualización:{' '}
                  {format(new Date(subscription.processed_at), 'PPP', { locale: es })}
                </p>
              )}
              {subscription.error && (
                <p className="text-destructive mt-2">
                  Error: {subscription.error}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/subscriptions/${subscription.id}`}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  <span>Ver</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/subscriptions/edit/${subscription.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  <span>Editar</span>
                </Link>
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProcess(subscription.id)}
                disabled={subscription.status === 'processing' || processSubscription.isPending}
              >
                {subscription.status === 'processing' ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                <span>Procesar</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span>Eliminar</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esta acción eliminará permanentemente la suscripción
                      y no podrás recibir más notificaciones relacionadas con ella.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(subscription.id)}
                    >
                      {deleteSubscription.isPending && (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionsList;