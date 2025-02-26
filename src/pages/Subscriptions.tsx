import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, FileText, Building2, Brain, ChevronRight, Play } from 'lucide-react';
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
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
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
    e.stopPropagation(); // Prevent navigation when clicking the process button
    
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      
      console.log('Requesting immediate processing for subscription:', id);
      const result = await subscriptions.processImmediately(id);
      
      if (result.error) {
        console.error('Processing error:', result.error);
        setError(result.error);
        // Show error alert
        alert(`Error al procesar la suscripción: ${result.error}`);
      } else {
        // Show success notification
        console.log('Processing requested successfully:', result.data);
        alert('Suscripción enviada para procesamiento inmediato');
      }
    } catch (err) {
      console.error('Exception during processing:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la suscripción';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
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
                        <button
                          onClick={(e) => handleProcessImmediately(e, subscription.id)}
                          disabled={processing[subscription.id]}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                          title="Procesar inmediatamente"
                        >
                          <Play className="h-3 w-3" />
                          {processing[subscription.id] ? 'Procesando...' : 'Procesar'}
                        </button>
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