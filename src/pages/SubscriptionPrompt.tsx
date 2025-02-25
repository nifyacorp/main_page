import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Building2, Brain, ArrowLeft, Plus, X, Bell, Clock } from 'lucide-react';
import { subscriptionTypes, subscriptions } from '../lib/api';
import type { IconType } from 'lucide-react';

interface SubscriptionType {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSystem: boolean;
  createdBy: string | null;
}

const iconMap: Record<string, IconType> = {
  FileText,
  Building2,
  Brain,
};

const getPromptPlaceholder = (type: string) => {
  switch (type) {
    case 'FileText':
      return 'Ej: Subvenciones para startups tecnológicas en Madrid';
    case 'Building2':
      return 'Ej: Pisos de 2 habitaciones en el centro de Madrid por menos de 300.000€';
    default:
      return 'Describe lo que quieres monitorizar...';
  }
};

interface SubscriptionPromptProps {
  mode: 'create' | 'edit';
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ mode }) => {
  const { typeId, subscriptionId } = useParams();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [frequency, setFrequency] = useState<'immediate' | 'daily'>('immediate');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<SubscriptionType | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === 'edit' && subscriptionId) {
          // Fetch existing subscription details
          const { data, error } = await subscriptions.getDetails(subscriptionId);
          if (error) throw new Error(error);
          
          if (data?.subscription) {
            setSubscription(data.subscription);
            setPrompts(data.subscription.prompts);
            setFrequency(data.subscription.frequency);
            setType({
              id: data.subscription.id,
              name: data.subscription.name,
              description: data.subscription.description,
              icon: data.subscription.type === 'boe' ? 'FileText' : 
                    data.subscription.type === 'real-estate' ? 'Building2' : 'Brain',
              isSystem: true,
              createdBy: null
            });
          }
        } else if (mode === 'create' && typeId) {
          // Fetch subscription type for new subscription
          const { data, error } = await subscriptionTypes.list();
          if (error) throw new Error(error);

          const foundType = data?.types.find(t => t.id === typeId);
          if (!foundType) throw new Error('Subscription type not found');
          
          setType(foundType);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, typeId, subscriptionId]);

  if ((mode === 'create' && !typeId) || (!loading && !type)) {
    navigate('/subscriptions/catalog');
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-4" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    navigate('/subscriptions/catalog');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPrompts = prompts.filter(p => p.trim());
    if (!type || validPrompts.length === 0) return;

    try {
      setLoading(true);
      
      if (mode === 'edit' && subscriptionId) {
        const { error } = await subscriptions.update(subscriptionId, {
          prompts: validPrompts,
          frequency,
        });
        if (error) throw new Error(error);
      } else {
        const { error } = await subscriptions.create({
          typeId: typeId as string,
          name: type.name,
          description: type.description,
          prompts: validPrompts,
          logo: type.logo || '',
          frequency,
        });
        if (error) throw new Error(error);
      }

      navigate('/subscriptions');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} subscription`);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const addPrompt = () => {
    if (prompts.length < 3) {
      setPrompts([...prompts, '']);
    }
  };

  const removePrompt = (index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/subscriptions/catalog')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {mode === 'edit' ? 'Volver a suscripciones' : 'Volver al catálogo'}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              {type && React.createElement(iconMap[type.icon] || Brain, {
                className: "h-6 w-6 text-primary"
              })}
            </div>
            <h1 className="text-2xl font-bold">{type?.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {mode === 'edit' ? 'Edita tu suscripción actual' : type?.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium">
              ¿Qué quieres monitorizar? ({prompts.length}/3)
            </label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Describe con el mayor detalle posible lo que quieres que NIFYA busque para ti.
            </p>
            
            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder={type ? getPromptPlaceholder(type.icon) : ''}
                    className="w-full h-32 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none pr-10"
                    required
                  />
                  {prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrompt(index)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {prompts.length < 3 && (
              <button
                type="button"
                onClick={addPrompt}
                className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir otro prompt</span>
              </button>
            )}
          </div>

          {/* Notification Frequency */}
          <div className="space-y-4 pt-6 border-t">
            <label className="block font-medium">
              Frecuencia de notificaciones
            </label>
            <p className="text-sm text-muted-foreground">
              ¿Con qué frecuencia quieres recibir las notificaciones?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFrequency('immediate')}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                  frequency === 'immediate'
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  frequency === 'immediate' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Bell className={`h-5 w-5 ${
                    frequency === 'immediate' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="font-medium">Inmediata</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones tan pronto como haya coincidencias
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                  frequency === 'daily'
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  frequency === 'daily' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Clock className={`h-5 w-5 ${
                    frequency === 'daily' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="font-medium">Diaria</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen diario con todas las coincidencias
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : 
                mode === 'edit' ? 'Guardar cambios' : 
                `Crear ${prompts.length > 1 ? 'Suscripciones' : 'Suscripción'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;