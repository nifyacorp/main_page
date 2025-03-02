import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, FileText, Building2, Brain, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptions } from '../lib/api';

interface Subscription {
  id: string;
  type: 'boe' | 'real-estate' | 'custom';
  name: string;
  description: string;
  prompts: string[];
  frequency: 'immediate' | 'daily';
  active: boolean;
  created_at: string;
  updated_at: string;
  processingError?: string;
  processingSuccess?: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'boe':
      return FileText;
    case 'real-estate':
      return Building2;
    default:
      return Brain;
  }
};

const Subscriptions = () => {
  const navigate = useNavigate();
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [processed, setProcessed] = useState<Record<string, boolean>>({});

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await subscriptions.list();
      if (error) throw new Error(error);

      if (data?.subscriptions) {
        setUserSubscriptions(data.subscriptions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleToggleSubscription = async (e: React.MouseEvent, id: string, currentActive: boolean) => {
    e.stopPropagation(); // Prevent navigation when clicking the toggle button
    try {
      const { error } = await subscriptions.toggle(id, !currentActive);
      if (error) throw new Error(error);
      
      setUserSubscriptions(subs =>
        subs.map(sub =>
          sub.id === id ? { ...sub, active: !currentActive } : sub
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle subscription');
    }
  };

  const handleDeleteSubscription = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation when clicking the delete button
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) {
      return;
    }
    
    try {
      const { error } = await subscriptions.delete(id);
      if (error) throw new Error(error);
      
      setUserSubscriptions(subs => subs.filter(sub => sub.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription');
    }
  };

  const handleProcessImmediately = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent the click from bubbling up to the parent div
    
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      setProcessed(prev => ({ ...prev, [id]: false }));
      
      console.log('Requesting immediate processing for subscription:', id);
      const result = await subscriptions.processImmediately(id);
      
      if (result.error) {
        console.error('Processing error:', result.error);
        setError(result.error);
        setUserSubscriptions(prev => 
          prev.map(sub => 
            sub.id === id ? { ...sub, processingError: result.error, processingSuccess: false } : sub
          )
        );
      } else {
        console.log('Processing requested successfully:', result.data);
        
        setProcessed(prev => ({ ...prev, [id]: true }));
        
        setUserSubscriptions(prev => 
          prev.map(sub => 
            sub.id === id ? { ...sub, processingSuccess: true, processingError: undefined } : sub
          )
        );
        
        setTimeout(() => {
          fetchSubscriptions();
        }, 5000);
      }
    } catch (err) {
      console.error('Exception during processing:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la suscripción';
      setError(errorMsg);
      setUserSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, processingError: errorMsg, processingSuccess: false } : sub
        )
      );
    } finally {
      setTimeout(() => {
        setProcessing(prev => ({ ...prev, [id]: false }));
        
        setTimeout(() => {
          setProcessed(prev => ({ ...prev, [id]: false }));
          setUserSubscriptions(prev => 
            prev.map(sub => 
              sub.id === id ? { ...sub, processingError: undefined, processingSuccess: false } : sub
            )
          );
        }, 5000);
      }, 1000);
    }
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mis Suscripciones</h1>
          <button
            onClick={() => navigate('/subscriptions/catalog')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Nueva Suscripción
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-lg border bg-card animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <div className="h-6 w-6 bg-primary/20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-16 bg-muted rounded-full" />
                    <div className="h-8 w-8 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 border rounded-lg bg-card">
            <p className="text-destructive">{error}</p>
          </div>
        ) : userSubscriptions.length > 0 ? (
          <div className="space-y-4">
            {userSubscriptions.map((subscription) => {
              const Icon = getIcon(subscription.type);
              return (
                <div
                  key={subscription.id}
                  onClick={() => navigate(`/subscriptions/${subscription.id}/edit`)}
                  className="p-6 rounded-lg border bg-card hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subscription.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subscription.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {subscription.prompts.map((prompt, i) => (
                            <span
                              key={i}
                              className="inline-block max-w-[300px] truncate px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                              title={prompt}
                            >
                              {prompt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleToggleSubscription(e, subscription.id, subscription.active)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.active
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {subscription.active ? 'Activa' : 'Inactiva'}
                      </button>
                      {subscription.active && (
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={(e) => handleProcessImmediately(e, subscription.id)}
                            disabled={processing[subscription.id]}
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 transition-all ${
                              processed[subscription.id]
                                ? 'bg-green-100 text-green-800'
                                : processing[subscription.id]
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title="Procesar inmediatamente"
                          >
                            {processed[subscription.id] ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Procesado
                              </>
                            ) : processing[subscription.id] ? (
                              <>
                                <svg className="animate-spin h-3 w-3 text-amber-800" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                Procesar
                              </>
                            )}
                          </button>
                          {subscription.processingError && (
                            <div className="text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-md border border-destructive/20 shadow-sm">
                              <span className="font-medium">Error:</span> {subscription.processingError}
                            </div>
                          )}
                          {subscription.processingSuccess && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200 shadow-sm flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 flex-shrink-0" />
                              <span>Procesando en segundo plano...</span>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteSubscription(e, subscription.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-card">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay suscripciones activas.{' '}
              <button
                onClick={() => navigate('/subscriptions/catalog')}
                className="text-primary hover:underline"
              >
                Crear una nueva
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;