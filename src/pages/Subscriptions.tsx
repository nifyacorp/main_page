import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bell, Loader2, AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';
// Removed unused icons: Clock, FileText, Play, Edit, Trash, CheckCircle, Mail

import { useSubscriptions } from '../hooks/use-subscriptions';
import { useEmailPreferences } from '../hooks/use-email-preferences';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// UI components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

// Extracted components
import { SubscriptionCard, SubscriptionFilterBar, SubscriptionForm } from '../components/subscriptions';

// Define Subscription type (can be shared or defined closer to hook if preferred)
interface Subscription {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  source: string;
  keywords?: string[];
  prompts?: string[];
  frequency: 'realtime' | 'immediate' | 'daily' | 'weekly' | 'monthly' | string;
}

export default function Subscriptions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showMockBanner, setShowMockBanner] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({ email_notifications: false });
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const ITEMS_PER_PAGE = 9;

  // Use the subscriptions hook
  const { 
    subscriptions: rawSubscriptions, // Renamed to avoid confusion
    isLoadingSubscriptions,
    error: subscriptionsError,
    refetchSubscriptions,
    processSubscription,
    deleteSubscription,
    metadata // Need metadata for pagination
  } = useSubscriptions({ page: currentPage, limit: ITEMS_PER_PAGE }); // <-- Pass page and limit

  // Get email preferences
  const { getEmailPreferences } = useEmailPreferences();
  
  // Removed auth consistency check useEffect
  
  // Data normalization - consider moving this logic into the useSubscriptions hook if possible
  const subscriptionsData: Subscription[] = useMemo(() => {
    let data: Subscription[] = [];
    if (Array.isArray(rawSubscriptions)) {
      data = rawSubscriptions;
    } else if (rawSubscriptions && typeof rawSubscriptions === 'object') {
      if (Array.isArray((rawSubscriptions as any).subscriptions)) {
        data = (rawSubscriptions as any).subscriptions;
      } else if ((rawSubscriptions as any).data && Array.isArray((rawSubscriptions as any).data)) {
        data = (rawSubscriptions as any).data;
      }
    }
    // Ensure all items match the Subscription interface, potentially filtering or transforming
    // For now, just return the normalized array, assuming the shapes are compatible.
    return data;
  }, [rawSubscriptions]);
  
  // Fetch email preferences on mount
  useEffect(() => {
    let isMounted = true;
    const loadPrefs = async () => {
      try {
        const prefs = await getEmailPreferences();
        if (isMounted) {
          setEmailPreferences(prefs);
        }
      } catch (err) {
        console.error('Failed to load email preferences:', err);
        // Optionally show a toast message
      }
    };
    loadPrefs();
    return () => { isMounted = false; };
  }, [getEmailPreferences]);

  // Removed debug log & local storage blacklist useEffect
  
  // Handle mock data banner state
  useEffect(() => {
    setShowMockBanner(subscriptionsError?.includes('mock data') ?? false);
  }, [subscriptionsError]);

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsData.filter(sub => {
        if (!sub) return false; // Add type guard
        const keywords = sub.keywords || sub.prompts || [];
        const searchLower = searchTerm.toLowerCase();
        
        const matchesSearch = 
          sub.name?.toLowerCase().includes(searchLower) || 
          sub.description?.toLowerCase().includes(searchLower) ||
          (Array.isArray(keywords) && keywords.some(k => 
            typeof k === 'string' && k.toLowerCase().includes(searchLower)
          ));
        
        const matchesSource = filterSource === 'all' || 
          (sub.source?.toLowerCase() === filterSource.toLowerCase());
        
        return matchesSearch && matchesSource;
      });
  }, [subscriptionsData, searchTerm, filterSource]);

  // Handle processing a subscription
  const handleProcess = useCallback(async (id: string) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    setCompletedIds(prev => ({ ...prev, [id]: false }));
    
    try {
      await processSubscription.mutateAsync(id);
      setProcessingIds(prev => ({ ...prev, [id]: false }));
      setCompletedIds(prev => ({ ...prev, [id]: true }));
      
      toast({
        title: "Proceso iniciado",
        description: "Tu subscripción se está procesando en segundo plano.",
        variant: "default",
      });
      
      setTimeout(() => {
        setCompletedIds(prev => ({ ...prev, [id]: false }));
      }, 3000); // Reset completed indicator after 3 seconds
    } catch (error) {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
      toast({
        title: "Error al procesar",
        description: error instanceof Error ? error.message : "Ocurrió un error al procesar la subscripción.",
        variant: "destructive",
      });
    }
  }, [processSubscription, toast]);
  
  // Handle deleting a subscription
  const handleDelete = (id: string) => {
    // console.log('[SubscriptionsPage] handleDelete called for ID:', id);
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    // console.log('[SubscriptionsPage] Calling deleteSubscription mutation for ID:', deletingId);
    
    deleteSubscription.mutate(deletingId, {
      onSuccess: () => {
        // console.log('[SubscriptionsPage] deleteSubscription mutation finished for ID:', deletingId);
        toast({
          title: "Subscripción eliminada",
          description: "La subscripción ha sido eliminada exitosamente.",
          variant: "default",
        });
        setDeletingId(null); // Close the dialog on success
        // queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); // Invalidation is handled by the hook
      },
      onError: (error) => {
        // console.error('[SubscriptionsPage] Error deleting subscription:', error);
        toast({
          title: "Error al eliminar",
          description: error.message || "No se pudo eliminar la subscripción.",
          variant: "destructive",
        });
        setDeletingId(null); // Also close the dialog on error
      },
      // onSettled: () => {
      //   console.log('[SubscriptionsPage] Resetting deletingId after attempt for ID:', deletingId);
      //   setDeletingId(null);
      // } Removed onSettled as we handle closing in onSuccess/onError
    });
  };

  // Handle deleting ALL subscriptions
  const handleDeleteAll = async () => {
    // console.log('[SubscriptionsPage] handleDeleteAll called');
    setShowDeleteAllConfirm(false); // Close the confirmation dialog first
    setIsDeletingAll(true); // Show loading state/indicator
    
    try {
      // Use the dedicated mutation or call the service method directly
      // Assuming subscriptionService has a deleteAll method now
      const subscriptionService = (await import('../api/services/subscription-service')).default;
      const response = await subscriptionService.deleteAllSubscriptions(); // Call the new bulk delete method - UNCOMMENTED
      
      // Placeholder response until backend/service call is implemented - REMOVED
      // const response = { success: false, deletedCount: 0, message: "Bulk delete not implemented yet." };

      // console.log('[SubscriptionsPage] Delete All response:', response);
      
      if (response.success) {
        toast({
          title: "Todas las subscripciones eliminadas",
          description: `Se eliminaron ${response.deletedCount} subscripciones.`, // Use count from response
          variant: "default",
        });
        // Invalidate relevant queries to refresh the list and stats
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      } else {
        throw new Error(response.message || 'Failed to delete all subscriptions');
      }
    } catch (error) {
      // console.error('[SubscriptionsPage] Error deleting all subscriptions:', error);
      // Type check the error
      const errorMessage = error instanceof Error ? error.message : "No se pudieron eliminar todas las subscripciones.";
      toast({
        title: "Error al eliminar todo",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false); // Hide loading state regardless of outcome
    }
  };

  // --- Render Functions --- //

  const renderErrorState = () => (
    <Card className="mb-8">
      <CardHeader className="bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <CardTitle className="text-destructive">Error al cargar subscripciones</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {subscriptionsError || "Hubo un problema al cargar tus subscripciones."}
            </p>
            {/* Simplified Auth error message */}
            {(subscriptionsError || '').includes('401') && (
              <p className="text-sm font-semibold mt-2">
                Error de autenticación. Intenta <a href="/auth" className="text-primary underline">iniciar sesión</a> de nuevo.
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button variant="outline" onClick={() => refetchSubscriptions()} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/subscriptions/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Crear nueva subscripción</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <Card className="mb-8 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aún no tienes subscripciones</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Crea tu primera subscripción para empezar a recibir notificaciones.
        </p>
        <Button asChild size="lg">
          <Link to="/subscriptions/types" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>Crear Subscripción</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-lg">Cargando subscripciones...</span>
    </div>
  );

  const renderSubscriptionList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSubscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          emailNotificationsEnabled={emailPreferences.email_notifications}
          isProcessing={processingIds[subscription.id] ?? false}
          isCompleted={completedIds[subscription.id] ?? false}
          isDeleting={deletingId === subscription.id}
          onProcess={handleProcess}
          onDelete={handleDelete}
          onConfirmDelete={confirmDelete}
        />
      ))}
    </div>
  );

  // --- Pagination Handler ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (metadata?.totalPages ?? 1)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- SIMPLE Pagination Component ---
  const renderSimplePagination = () => {
    if (!metadata || metadata.totalPages <= 1) return null;

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < metadata.totalPages;

    return (
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrev}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {metadata.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
    );
  };

  // --- Main Return --- //

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscripciones</h1>
          <p className="text-muted-foreground">Gestiona tus fuentes de datos y alertas</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/subscriptions/types" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Nueva Subscripción</span>
            </Link>
          </Button>
          <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isLoadingSubscriptions || subscriptionsData.length === 0 || isDeletingAll}
              >
                {isDeletingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar Todas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar Todas las Subscripciones?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente TODAS ({subscriptionsData.length}) tus subscripciones. 
                  No podrás deshacer esta acción.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAll}>Cancelar</AlertDialogCancel>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  ) : null}
                  {isDeletingAll ? 'Eliminando...' : 'Eliminar Todo'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Mock Data Banner */}
      {showMockBanner && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
          <strong className="font-bold">Nota: </strong>
          <span className="block sm:inline">
            Estás viendo datos simulados. La API retornó una lista vacía.
          </span>
        </div>
      )}

      {/* Error state (only if not mock banner) */}
      {subscriptionsError && !showMockBanner && renderErrorState()}

      {/* Filter Bar (only show if not loading and no error, or if there's data) */}
      {!isLoadingSubscriptions && (!subscriptionsError || subscriptionsData.length > 0) && (
        <SubscriptionFilterBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filterSource={filterSource}
          onFilterSourceChange={setFilterSource}
        />
      )}

      {/* Content Area */}      
      {isLoadingSubscriptions 
        ? renderLoadingState() 
        : !subscriptionsError && filteredSubscriptions.length === 0 
        ? renderEmptyState()
        : !subscriptionsError && filteredSubscriptions.length > 0
        ? (<>
             {renderSubscriptionList()}
             {renderSimplePagination()}
           </>)
        : null /* Handle case where there's an error but we don't show the error state (e.g., mock banner) */
      }
    </div>
  );
}

// No sample data - only use real data from backend