import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  Brain, 
  ArrowLeft, 
  Plus, 
  X, 
  Bell, 
  Clock, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { subscriptions, templates } from '../lib/api';
import type { IconType } from 'lucide-react';
import type { Template } from '../lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";

interface Subscription {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  frequency: 'immediate' | 'daily';
  logo?: string;
  type?: string;
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
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [frequency, setFrequency] = useState<'immediate' | 'daily'>('immediate');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
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
            setFrequency(data.subscription.frequency as 'immediate' | 'daily');
          }
        } else if (mode === 'create' && typeId) {
          // Fetch template details for new subscription
          const response = await templates.getDetails(typeId);
          if (response.error) throw new Error(response.error);

          if (response.data) {
            setTemplate(response.data);
            // If template has default prompts, use them
            if (response.data.prompts && response.data.prompts.length > 0) {
              setPrompts(response.data.prompts);
            }
            // Set default frequency from template
            if (response.data.frequency) {
              setFrequency(response.data.frequency);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // In development mode, create a mock template if needed
        if (import.meta.env.DEV && mode === 'create' && typeId) {
          console.log('Creating mock template for development');
          const mockTemplate: Template = {
            id: typeId,
            name: typeId === 'boe-template' ? 'BOE Subscription' : 'Custom Subscription',
            description: 'Development mode template',
            type: typeId === 'boe-template' ? 'boe' : 'custom',
            prompts: [],
            icon: typeId === 'boe-template' ? 'FileText' : 'Brain',
            logo: '',
            isPublic: true,
            metadata: {
              category: 'development',
              source: 'mock'
            },
            frequency: 'daily'
          };
          setTemplate(mockTemplate);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, typeId, subscriptionId]);

  if ((mode === 'create' && !typeId) || (!loading && !template && !subscription)) {
    navigate('/subscriptions/new');
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    navigate('/subscriptions/new');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPrompts = prompts.filter(p => p.trim());
    if (validPrompts.length === 0) {
      setError('Por favor, añade al menos un prompt');
      toast({
        title: "Error",
        description: "Por favor, añade al menos un prompt",
        variant: "destructive"
      });
      return;
    }
    
    if (mode === 'create' && !template && !typeId) {
      setError('No se ha seleccionado ninguna plantilla');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      if (mode === 'edit' && subscriptionId) {
        const response = await subscriptions.update(subscriptionId, {
          prompts: validPrompts,
          frequency,
        });
        if (response.error) throw new Error(response.error);
        
        toast({
          title: "Suscripción actualizada",
          description: "La suscripción se ha actualizado correctamente",
          variant: "default"
        });
      } else if (template) {
        // Create directly instead of subscribing to template to avoid undefined ID issues
        const createResponse = await subscriptions.create({
          typeId: template.id, // Use template.id directly instead of typeId from params
          name: template.name,
          description: template.description,
          prompts: validPrompts,
          logo: template.logo || '',
          frequency,
        });
        
        if (createResponse.error) throw new Error(createResponse.error);
        
        toast({
          title: "Suscripción creada",
          description: "Tu nueva suscripción se ha creado correctamente",
          variant: "default"
        });
      }

      navigate('/subscriptions');
    } catch (err) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} subscription:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} subscription`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(mode === 'edit' ? '/subscriptions' : '/subscriptions/new')} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {mode === 'edit' ? 'Volver a suscripciones' : 'Volver al catálogo'}
          </Button>
          
          <Badge variant="outline" className="px-3 py-1">
            {mode === 'edit' ? 'Editando Suscripción' : 'Nueva Suscripción'}
          </Badge>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                {mode === 'edit' && subscription ? (
                  React.createElement(iconMap[subscription.type === 'boe' ? 'FileText' : 
                    subscription.type === 'real-estate' ? 'Building2' : 'Brain'] || Brain, {
                    className: "h-6 w-6 text-primary"
                  })
                ) : template ? (
                  React.createElement(iconMap[template.icon] || Brain, {
                    className: "h-6 w-6 text-primary"
                  })
                ) : (
                  <Brain className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {mode === 'edit' ? subscription?.name : template?.name}
                </CardTitle>
                <CardDescription>
                  {mode === 'edit' 
                    ? 'Edita tu suscripción actual' 
                    : template?.description || 'Create a new subscription'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">¿Qué quieres monitorizar? ({prompts.length}/3)</CardTitle>
              <CardDescription>
                Describe con el mayor detalle posible lo que quieres que NIFYA busque para ti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prompts.map((prompt, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder={
                      mode === 'edit' && subscription?.type 
                        ? getPromptPlaceholder(subscription.type === 'boe' ? 'FileText' : 
                           subscription.type === 'real-estate' ? 'Building2' : 'Brain')
                        : template 
                        ? getPromptPlaceholder(template.icon)
                        : 'Enter what you want to monitor...'
                    }
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
              
              {prompts.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPrompt}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir otro prompt
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Frecuencia de notificaciones</CardTitle>
              <CardDescription>
                ¿Con qué frecuencia quieres recibir las notificaciones?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setFrequency('immediate')}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
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
                </div>

                <div
                  onClick={() => setFrequency('daily')}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/subscriptions/catalog')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting 
                    ? (mode === 'edit' ? 'Guardando...' : 'Creando...') 
                    : (mode === 'edit' ? 'Guardar cambios' : `Crear ${prompts.length > 1 ? 'Suscripciones' : 'Suscripción'}`)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;