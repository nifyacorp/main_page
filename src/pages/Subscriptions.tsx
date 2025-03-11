import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, FileText, Play, Edit, Trash, Bell, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscriptions } from '../hooks/use-subscriptions';
import { useToast } from '../components/ui/use-toast';

// UI components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
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

export default function Subscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Use the subscriptions hook
  const { 
    subscriptions, 
    isLoadingSubscriptions,
    processSubscription,
    deleteSubscription
  } = useSubscriptions();

  // Use the real data or sample data if not loaded yet
  const subscriptionsData = isLoadingSubscriptions 
    ? [] 
    : subscriptions.length > 0 
      ? subscriptions 
      : sampleSubscriptionData;

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptionsData.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.keywords && Array.isArray(sub.keywords) && sub.keywords.some(k => 
        typeof k === 'string' && k.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesSource = filterSource === 'all' || 
      (sub.source && sub.source.toLowerCase() === filterSource.toLowerCase());
    
    return matchesSearch && matchesSource;
  });

  // Handle processing a subscription
  const handleProcess = async (id: string) => {
    // Set processing state
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    setCompletedIds(prev => ({ ...prev, [id]: false }));
    
    try {
      // Call the process mutation
      await processSubscription.mutateAsync(id);
      
      // Set completed state
      setProcessingIds(prev => ({ ...prev, [id]: false }));
      setCompletedIds(prev => ({ ...prev, [id]: true }));
      
      // Show success toast
      toast({
        title: "Processing started",
        description: "Your subscription is being processed in the background.",
        variant: "default",
      });
      
      // Reset completed state after 3 seconds
      setTimeout(() => {
        setCompletedIds(prev => ({ ...prev, [id]: false }));
      }, 3000);
    } catch (error) {
      // Reset processing state and show error
      setProcessingIds(prev => ({ ...prev, [id]: false }));
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred while processing the subscription",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a subscription
  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription.mutateAsync(id);
      setDeletingId(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred while deleting the subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscripciones</h1>
          <p className="text-muted-foreground">Gestiona tus fuentes de datos y alertas</p>
        </div>
        <Button asChild>
          <Link to="/subscriptions/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Subscripción</span>
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Input
            type="search"
            placeholder="Buscar subscripciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filterSource === 'all' ? "default" : "outline"}
            onClick={() => setFilterSource('all')}
            className="flex-1"
            size="sm"
          >
            Todas
          </Button>
          <Button 
            variant={filterSource === 'BOE' ? "default" : "outline"}
            onClick={() => setFilterSource('BOE')}
            className="flex-1"
            size="sm"
          >
            BOE
          </Button>
          <Button 
            variant={filterSource === 'DOGA' ? "default" : "outline"}
            onClick={() => setFilterSource('DOGA')}
            className="flex-1"
            size="sm"
          >
            DOGA
          </Button>
        </div>
      </div>

      {isLoadingSubscriptions ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando subscripciones...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{subscription.name}</CardTitle>
                  <Badge variant={subscription.source === 'BOE' ? "default" : "secondary"}>
                    {subscription.source}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {subscription.description || "No description provided"}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {subscription.keywords && Array.isArray(subscription.keywords) && subscription.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {subscription.frequency || "Immediate"}
                  </div>
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-1" />
                    {subscription.notifications || "0"}
                  </div>
                </div>
              </CardContent>
              
              <Separator />
              
              <CardFooter className="pt-3 flex justify-between items-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/subscriptions/${subscription.id}`} className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Link>
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleProcess(subscription.id.toString())}
                    disabled={processingIds[subscription.id] || completedIds[subscription.id] || deleteSubscription.isPending}
                    className={completedIds[subscription.id] ? "text-green-500" : ""}
                    title={
                      processingIds[subscription.id] ? "Procesando..." : 
                      completedIds[subscription.id] ? "Procesado!" : 
                      "Procesar suscripción"
                    }
                  >
                    {processingIds[subscription.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : completedIds[subscription.id] ? (
                      <div className="text-xs font-medium">✓</div>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="icon" asChild disabled={deleteSubscription.isPending}>
                    <Link to={`/subscriptions/${subscription.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive/70 hover:text-destructive"
                        onClick={() => setDeletingId(subscription.id.toString())}
                        disabled={deleteSubscription.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente la suscripción 
                          <span className="font-semibold"> {subscription.name}</span> y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(subscription.id.toString())}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {deleteSubscription.isPending && deletingId === subscription.id.toString() ? (
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoadingSubscriptions && filteredSubscriptions.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">No se encontraron subscripciones</h3>
          <p className="text-muted-foreground mb-4">Prueba a ajustar tu búsqueda o filtros</p>
          <Button 
            variant="outline" 
            onClick={() => {setSearchTerm(''); setFilterSource('all');}}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

// Sample data (used when backend data is not available)
const sampleSubscriptionData = [
  { 
    id: "1", 
    name: "BOE Legal Updates", 
    description: "Updates on legal regulations published in BOE",
    source: "BOE", 
    frequency: "Instant", 
    keywords: ["law", "regulation", "legal"], 
    lastNotification: "2 hours ago", 
    status: "active", 
    notifications: 24,
    createdAt: "2023-12-10"
  },
  { 
    id: "2", 
    name: "DOGA Regulatory Changes", 
    description: "Changes to regional regulations in Galicia",
    source: "DOGA", 
    frequency: "Daily", 
    keywords: ["regulation", "Galicia", "policy"], 
    lastNotification: "1 day ago", 
    status: "active", 
    notifications: 16,
    createdAt: "2023-12-15"
  },
  { 
    id: "3", 
    name: "Tax Law Updates", 
    description: "Updates on tax legislation and regulations",
    source: "BOE", 
    frequency: "Weekly", 
    keywords: ["tax", "fiscal", "budget"], 
    lastNotification: "3 days ago", 
    status: "active", 
    notifications: 8,
    createdAt: "2023-12-05"
  },
  { 
    id: "4", 
    name: "Environmental Regulations", 
    description: "Environmental policy updates and regulations",
    source: "DOGA", 
    frequency: "Instant", 
    keywords: ["environment", "ecological", "sustainability"], 
    lastNotification: "1 week ago", 
    status: "active", 
    notifications: 5,
    createdAt: "2023-11-22"
  },
];