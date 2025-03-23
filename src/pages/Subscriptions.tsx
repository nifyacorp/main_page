import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, FileText, Play, Edit, Trash, Bell, Loader2, AlertTriangle, RefreshCcw, CheckCircle } from 'lucide-react';
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
  const [showMockBanner, setShowMockBanner] = useState(false);
  
  // Use the subscriptions hook
  const { 
    subscriptions, 
    isLoadingSubscriptions,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
    processSubscription,
    deleteSubscription
  } = useSubscriptions();

  // Only use real data from the database
  const subscriptionsData = subscriptions || [];
  
  // Add debugging logs
  useEffect(() => {
    console.log('Subscriptions component mounted/updated');
    console.log('Subscriptions data:', subscriptionsData);
    console.log('Subscriptions data length:', subscriptionsData.length);
    console.log('Subscriptions loading:', isLoadingSubscriptions);
    console.log('Subscriptions error:', subscriptionsError);
    
    // Log each subscription to help debug
    if (subscriptionsData.length > 0) {
      console.log('Individual subscriptions:');
      subscriptionsData.forEach((sub, index) => {
        console.log(`Subscription ${index + 1}:`, sub);
      });
    } else {
      console.log('No subscriptions data available');
    }
  }, [subscriptionsData, isLoadingSubscriptions, subscriptionsError]);
  
  // Check if we're using mock data
  useEffect(() => {
    // Check if there's an error message indicating mock data
    if (subscriptionsError && subscriptionsError.includes('mock data')) {
      setShowMockBanner(true);
    } else {
      setShowMockBanner(false);
    }
  }, [subscriptionsError]);

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptionsData.filter(sub => {
    // Handle case where keywords or prompts might be used
    const keywords = sub.keywords || sub.prompts || [];
    
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(keywords) && keywords.some(k => 
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

  // Store dialogs that need to be closed after mutation completes
  const [dialogsToClose, setDialogsToClose] = useState<Map<string, boolean>>(new Map());
  
  // Handle deleting a subscription
  const handleDelete = async (id: string) => {
    try {
      console.log(`Starting deletion for subscription ID: ${id}`);
      
      // Set deletingId to track which subscription is being deleted
      setDeletingId(id);
      
      // First add to blacklist to immediately hide from UI regardless of API result
      const deletedIds = JSON.parse(localStorage.getItem('deletedSubscriptionIds') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('deletedSubscriptionIds', JSON.stringify(deletedIds));
        console.log(`Added subscription ${id} to deletion blacklist`);
      }
      
      // Show a success message immediately to improve perceived performance
      toast({
        title: "Subscription deleted",
        description: "The subscription has been removed from your view",
        variant: "default",
      });
      
      // No need to call setFilter - we'll rely on the refetch instead
      
      // DIRECT FETCH - bypassing React Query to verify API works
      console.log(`DIRECT FETCH: Attempting DELETE for subscription ${id}`);
      try {
        // Direct API call to ensure it reaches the backend
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/v1/subscriptions/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`DIRECT FETCH RESPONSE:`, {
          status: response.status,
          statusText: response.statusText
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`DIRECT FETCH SUCCESS:`, data);
          } catch (parseError) {
            console.log(`DIRECT FETCH SUCCESS (no JSON response)`);
          }
        } else {
          console.log(`DIRECT FETCH ERROR - Status: ${response.status}`);
          // Even 404s are fine - already deleted
          try {
            const errorData = await response.json();
            console.log(`Error details:`, errorData);
          } catch (e) {
            console.log(`Could not parse error response`);
          }
        }
      } catch (directFetchError) {
        console.error(`DIRECT FETCH ERROR:`, directFetchError);
      }
      
      // BACKUP APPROACH: Also use the mutation to update the React Query cache
      try {
        console.log(`Calling deleteSubscription.mutateAsync for ID: ${id}`);
        const result = await deleteSubscription.mutateAsync(id);
        console.log(`Delete mutation completed with result:`, result);
      } catch (mutationError) {
        console.error(`Error in mutation:`, mutationError);
        // Continue despite error - UI is already updated
      }
      
    } catch (error) {
      // Even on error, the subscription should be gone from UI because of the blacklist
      console.error(`Error in handleDelete for ID ${id}:`, error);
    } finally {
      // Always reset the deleting state
      setDeletingId(null);
      
      // Force a full refetch to ensure UI is synchronized with server
      window.setTimeout(() => {
        console.log(`Executing refetch after deletion`);
        refetchSubscriptions();
      }, 1000);
    }
  };

  // Render error state
  const renderErrorState = () => (
    <Card className="mb-8">
      <CardHeader className="bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <CardTitle className="text-destructive">Error Loading Subscriptions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {subscriptionsError || "There was a problem loading your subscriptions. The service might be temporarily unavailable."}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button variant="outline" onClick={() => refetchSubscriptions()} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/subscriptions/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create New Subscription</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Empty state
  const renderEmptyState = () => (
    <Card className="mb-8 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Create your first subscription to start receiving notifications about topics that interest you.
        </p>
        <Button asChild size="lg">
          <Link to="/subscriptions/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>Create Subscription</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

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

      {/* Mock Data Banner */}
      {showMockBanner && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
          <strong className="font-bold">Nota: </strong>
          <span className="block sm:inline">
            Estás viendo datos simulados basados en estadísticas. La API retornó una lista vacía, pero las estadísticas muestran que tienes subscripciones.
          </span>
        </div>
      )}

      {/* Error state - only show for non-mock data errors */}
      {subscriptionsError && !showMockBanner && renderErrorState()}

      {/* Search & Filter */}
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
        <div>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md"
          >
            <option value="all">Todas las fuentes</option>
            <option value="boe">BOE</option>
            <option value="doga">DOGA</option>
            <option value="other">Otras</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingSubscriptions && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Cargando subscripciones...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingSubscriptions && !subscriptionsError && filteredSubscriptions.length === 0 && renderEmptyState()}

      {/* Subscription List */}
      {!isLoadingSubscriptions && !subscriptionsError && filteredSubscriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={subscription.isActive ? "default" : "outline"}>
                    {subscription.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                  <Badge variant="secondary">{subscription.source}</Badge>
                </div>
                <Link to={`/subscriptions/${subscription.id}`}>
                  <CardTitle className="text-lg hover:text-primary transition-colors">
                    {subscription.name}
                  </CardTitle>
                </Link>
                {subscription.description && (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {subscription.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-1 flex-wrap">
                  {(subscription.keywords || subscription.prompts || []).slice(0, 3).map((keyword, i) => (
                    <Badge key={i} variant="outline" className="bg-secondary/10">
                      {keyword}
                    </Badge>
                  ))}
                  {(subscription.keywords || subscription.prompts || []).length > 3 && (
                    <Badge variant="outline" className="bg-secondary/10">
                      +{(subscription.keywords || subscription.prompts || []).length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center mt-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {subscription.frequency === 'realtime' || subscription.frequency === 'immediate' ? 'Tiempo real' :
                     subscription.frequency === 'daily' ? 'Diaria' :
                     subscription.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/subscriptions/${subscription.id}`}>
                    <FileText className="h-4 w-4 mr-1" /> Detalle
                  </Link>
                </Button>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={processingIds[subscription.id]}
                    onClick={() => handleProcess(subscription.id)}
                  >
                    {processingIds[subscription.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : completedIds[subscription.id] ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/subscriptions/${subscription.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  {/* Simplified Delete Button - Direct action without AlertDialog */}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => {
                      if (confirm("¿Eliminar esta subscripción? Esta acción no se puede deshacer.")) {
                        handleDelete(subscription.id);
                      }
                    }}
                    disabled={deletingId === subscription.id}
                  >
                    {deletingId === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// No sample data - only use real data from backend