import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bell, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';
// Removed unused icons: Clock, FileText, Play, Edit, Trash, CheckCircle, Mail

import { useSubscriptions } from '../hooks/use-subscriptions';
import { useEmailPreferences } from '../hooks/use-email-preferences';
import { useToast } from '../components/ui/use-toast';

// UI components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// Removed unused UI: Input, Badge, Separator, AlertDialog components (now handled in card)

// Extracted components
import SubscriptionCard from '../components/subscriptions/SubscriptionCard';
import SubscriptionFilterBar from '../components/subscriptions/SubscriptionFilterBar';

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
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showMockBanner, setShowMockBanner] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({ email_notifications: false });
  
  // Use the subscriptions hook
  const { 
    subscriptions: rawSubscriptions, // Renamed to avoid confusion
    isLoadingSubscriptions,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
    processSubscription,
    deleteSubscription
  } = useSubscriptions();

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
  const handleDelete = useCallback(async (id: string) => {
    console.log(`[SubscriptionsPage] handleDelete called for ID: ${id}`);
    setDeletingId(id); // Set loading state immediately
    
    try {
      console.log(`[SubscriptionsPage] Calling deleteSubscription mutation for ID: ${id}`);
      // The mutation hook now handles success/error toasts and query invalidation
      await deleteSubscription.mutateAsync(id);
      console.log(`[SubscriptionsPage] deleteSubscription mutation finished for ID: ${id}`);
      
      // Note: Success toast is handled by the hook's onSuccess
      
    } catch (error) {
      console.error(`[SubscriptionsPage] Error caught from deleteSubscription mutation for ID ${id}:`, error);
      // Note: Error toast is handled by the hook's onError
    } finally {
      console.log(`[SubscriptionsPage] Resetting deletingId after attempt for ID: ${id}`);
      setDeletingId(null); // Reset loading state regardless of outcome
    }
  }, [deleteSubscription, toast]); // Ensure toast dependency is still needed if used elsewhere, remove if not

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
          <Link to="/subscriptions/new" className="flex items-center gap-2">
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
        />
      ))}
    </div>
  );

  // --- Main Return --- //

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Page Header */}
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
        ? renderSubscriptionList()
        : null /* Handle case where there's an error but we don't show the error state (e.g., mock banner) */
      }
    </div>
  );
}

// No sample data - only use real data from backend