import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Play, 
  Clock, 
  Calendar, 
  Bell, 
  ToggleLeft, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Components
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
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
} from "../components/ui/alert-dialog";
import { ProcessingStatusTracker, ProcessSubscriptionButton } from '../components/subscriptions';

// Hooks
import { useSubscriptions } from '../hooks/use-subscriptions';
import { useSubscriptionStatus } from '../hooks/use-subscription-status';
import { useToast } from '../components/ui/use-toast';

export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Fetch subscription data
  const { 
    fetchSubscription,
    processSubscription,
    deleteSubscription,
    toggleSubscriptionStatus
  } = useSubscriptions();
  
  const { 
    data: subscription, 
    isLoading, 
    isError,
    error
  } = fetchSubscription(id || '');
  
  // Handle error states cleanly without using blacklist
  React.useEffect(() => {
    if (isError && error) {
      // If we get a 404 or not found error, simply inform the user and redirect
      if (error.status === 404 || error.message?.includes('not found')) {
        toast({
          title: "Subscription not found",
          description: "The subscription you're looking for doesn't exist or has been deleted.",
          variant: "destructive",
        });
        navigate('/subscriptions');
      } else {
        // For other errors, show the error but stay on the page
        toast({
          title: "Error loading subscription",
          description: error instanceof Error ? error.message : "There was a problem loading the subscription details.",
          variant: "destructive",
        });
      }
    }
  }, [id, isError, error, navigate, toast]);

  // Handle processing the subscription
  const handleProcess = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    setIsCompleted(false);
    
    try {
      await processSubscription.mutateAsync(id);
      setIsProcessing(false);
      setIsCompleted(true);
      
      toast({
        title: "Procesamiento iniciado",
        description: "Tu suscripción está siendo procesada en segundo plano.",
        variant: "default",
      });
      
      setTimeout(() => {
        setIsCompleted(false);
      }, 3000);
    } catch (error) {
      setIsProcessing(false);
      
      toast({
        title: "Error de procesamiento",
        description: error instanceof Error ? error.message : "Ocurrió un error al procesar la suscripción",
        variant: "destructive",
      });
    }
  };

  // Store reference to the current open dialog
  const [openAlertDialog, setOpenAlertDialog] = useState<{ close: () => void } | null>(null);
  
  // Handle deleting the subscription
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const result = await deleteSubscription.mutateAsync(id);
      
      // Close the dialog programmatically
      if (openAlertDialog) {
        openAlertDialog.close();
      }
      
      // Check if the subscription was actually deleted in the database
      if (result.actuallyDeleted) {
        toast({
          title: "Subscription deleted",
          description: "The subscription has been successfully deleted from the database.",
          variant: "default",
        });
      } else {
        // The deletion request was successful but the database delete might have failed
        toast({
          title: "Subscription removal processed",
          description: "The subscription was marked for deletion, but there might have been an issue with the database operation.",
          variant: "default",
        });
      }
      
      // Always navigate back to subscriptions list
      setTimeout(() => {
        navigate('/subscriptions');
      }, 100);
    } catch (error) {
      // Close the dialog anyway
      if (openAlertDialog) {
        openAlertDialog.close();
      }
      
      toast({
        title: "Error deleting subscription",
        description: error instanceof Error ? error.message : "There was a problem deleting the subscription.",
        variant: "destructive",
      });
      
      // Don't navigate away in case of error - let the user try again
    }
  };

  // Handle toggling subscription status
  const handleToggleStatus = async () => {
    if (!id || !subscription) return;
    
    const newStatus = subscription.status !== 'active';
    
    try {
      await toggleSubscriptionStatus.mutateAsync({ 
        id, 
        isActive: newStatus 
      });
      
      toast({
        title: newStatus ? "Suscripción activada" : "Suscripción desactivada",
        description: newStatus 
          ? "La suscripción ha sido activada correctamente." 
          : "La suscripción ha sido desactivada correctamente.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error al cambiar estado",
        description: error instanceof Error ? error.message : "Ocurrió un error al cambiar el estado de la suscripción",
        variant: "destructive",
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/subscriptions');
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="flex items-center space-x-2 mb-8">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !subscription) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="flex items-center space-x-2 mb-8">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>No se pudo cargar la suscripción</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Ocurrió un error al cargar la suscripción"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>Volver a la lista de suscripciones</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{subscription.name}</h1>
          <Badge variant={subscription.source === 'BOE' ? "default" : "secondary"}>
            {subscription.source}
          </Badge>
          <Badge variant={subscription.status === 'active' ? "outline" : "secondary"}>
            {subscription.status === 'active' ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleStatus}
            disabled={toggleSubscriptionStatus.isPending}
          >
            {toggleSubscriptionStatus.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-2" />
            )}
            {subscription.status === 'active' ? 'Desactivar' : 'Activar'}
          </Button>
          
          <ProcessSubscriptionButton
            subscriptionId={subscription.id}
            variant="outline"
            size="sm"
          />
          
          <Button variant="outline" size="sm" asChild>
            <Link to={`/subscriptions/${subscription.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          
          <AlertDialog onOpenChange={(open) => {
            // If dialog is closing, reset stored reference
            if (!open) setOpenAlertDialog(null);
          }}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onCloseButtonClick={() => setOpenAlertDialog(null)}
              onEscapeKeyDown={() => setOpenAlertDialog(null)}
              onPointerDownOutside={() => setOpenAlertDialog(null)}
              // Store reference to the dialog when it opens
              onOpenAutoFocus={(e) => {
                // Get the DialogClose button reference
                const dialogEl = e.currentTarget.parentElement;
                if (dialogEl) {
                  const closeBtn = dialogEl.querySelector('button[data-state="open"]');
                  setOpenAlertDialog({
                    close: () => {
                      if (closeBtn && 'click' in closeBtn) {
                        (closeBtn as HTMLButtonElement).click();
                      }
                    }
                  });
                }
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la suscripción 
                  <span className="font-semibold"> {subscription.name}</span> y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteSubscription.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                <p>{subscription.description || "Sin descripción"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Palabras clave</h3>
                <div className="flex flex-wrap gap-1">
                  {subscription.keywords && Array.isArray(subscription.keywords) ? (
                    subscription.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay palabras clave definidas</p>
                  )}
                </div>
              </div>
              
              {subscription.url && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">URL</h3>
                  <a 
                    href={subscription.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    {subscription.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Frecuencia</h3>
                  <p className="text-muted-foreground text-sm">
                    {subscription.frequency || "Inmediata"}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Método de notificación</h3>
                  <p className="text-muted-foreground text-sm">
                    {subscription.notificationMethod || "Email"}
                  </p>
                </div>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          {/* Filters (if any) */}
          {subscription.filters && Object.keys(subscription.filters).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(subscription.filters, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {/* Processing Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Procesamiento</CardTitle>
              <CardDescription>
                Monitoriza el estado actual del procesamiento de esta suscripción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessingStatusTracker
                subscriptionId={subscription.id}
                showDetails={true}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar with stats and metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Notificaciones</h3>
                  <p className="text-2xl font-bold">{subscription.notifications || 0}</p>
                </div>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Última notificación</h3>
                  <p className="text-muted-foreground">
                    {subscription.lastNotification || "Nunca"}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Último procesamiento</h3>
                  <p className="text-muted-foreground">
                    {subscription.lastProcessed || "Nunca"}
                  </p>
                </div>
                <Play className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono">{subscription.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creado:</span>
                <span>
                  {subscription.createdAt 
                    ? format(new Date(subscription.createdAt), 'PP', { locale: es })
                    : "Desconocido"}
                </span>
              </div>
              
              {subscription.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizado:</span>
                  <span>
                    {format(new Date(subscription.updatedAt), 'PP', { locale: es })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fuente:</span>
                <Badge variant="outline">{subscription.source}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}