import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Play,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Subscription, SubscriptionType } from '../services/subscription-service';
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

interface SubscriptionDetailProps {
  subscription: Subscription;
  subscriptionType?: SubscriptionType;
  isLoading?: boolean;
  onDeleted?: () => void;
}

const SubscriptionDetail: React.FC<SubscriptionDetailProps> = ({
  subscription,
  subscriptionType,
  isLoading = false,
  onDeleted,
}) => {
  const deleteSubscription = useDeleteSubscription();
  const processSubscription = useProcessSubscription();
  
  const handleDelete = async () => {
    try {
      await deleteSubscription.mutateAsync(subscription.id);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };
  
  const handleProcess = async () => {
    try {
      await processSubscription.mutateAsync(subscription.id);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Format dates
  const createdAt = format(new Date(subscription.created_at), 'PPP', { locale: es });
  const updatedAt = subscription.updated_at 
    ? format(new Date(subscription.updated_at), 'PPP', { locale: es }) 
    : null;
  const processedAt = subscription.processed_at 
    ? format(new Date(subscription.processed_at), 'PPP', { locale: es }) 
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/subscriptions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{subscription.name}</h1>
          {renderStatusBadge(subscription.status)}
        </div>
        
        <div className="flex gap-2">
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcess}
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
                  onClick={handleDelete}
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
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          {subscription.error && (
            <TabsTrigger value="errors">Errores</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
              <CardDescription>
                Detalles básicos de la suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                  <p className="font-mono text-sm">{subscription.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                  <p>{subscriptionType?.name || subscription.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                  <div>{renderStatusBadge(subscription.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Creada</h3>
                  <p>{createdAt}</p>
                </div>
                {updatedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Actualizada</h3>
                    <p>{updatedAt}</p>
                  </div>
                )}
                {processedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Último procesamiento</h3>
                    <p>{processedAt}</p>
                  </div>
                )}
              </div>
              
              {subscription.metadata && Object.keys(subscription.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Metadatos</h3>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                      {JSON.stringify(subscription.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Parámetros configurados para esta suscripción
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionType ? (
                <div className="space-y-4">
                  {subscriptionType.fields.map((field) => (
                    <div key={field.name}>
                      <h3 className="text-sm font-medium">{field.label}</h3>
                      <p className="text-sm text-muted-foreground">{field.help}</p>
                      <div className="mt-1">
                        {(() => {
                          const value = subscription.config[field.name];
                          
                          if (value === undefined || value === null) {
                            return <span className="text-muted-foreground italic">No especificado</span>;
                          }
                          
                          switch (field.type) {
                            case 'boolean':
                              return value ? 'Sí' : 'No';
                            case 'date':
                              try {
                                return format(new Date(value as string), 'PPP', { locale: es });
                              } catch (e) {
                                return String(value);
                              }
                            case 'select':
                              const option = field.options?.find(opt => opt.value === value);
                              return option ? option.label : String(value);
                            default:
                              return String(value);
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                  {JSON.stringify(subscription.config, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {subscription.error && (
          <TabsContent value="errors">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error de procesamiento</span>
                </CardTitle>
                <CardDescription>
                  La última vez que se procesó esta suscripción ocurrió un error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-destructive/10 p-3 rounded-md text-destructive">
                  <p>{subscription.error}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleProcess}
                  disabled={subscription.status === 'processing' || processSubscription.isPending}
                >
                  {subscription.status === 'processing' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  <span>Intentar procesar de nuevo</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SubscriptionDetail;