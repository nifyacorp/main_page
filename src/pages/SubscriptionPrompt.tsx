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
  AlertCircle,
  LucideIcon
} from 'lucide-react';
import { subscriptions, templates } from '../lib/api';
import type { Template } from '../lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";

interface Subscription {
  id: string;
  name: string;
  description?: string;
  source: string;
  prompts: string[];
  frequency: 'immediate' | 'daily';
  logo?: string;
  isActive?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  typeId?: string;
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Building2,
  Brain,
};

const getPromptPlaceholder = (type: string) => {
  switch (type.toLowerCase()) {
    case 'boe':
      return 'Ej: "subvenciones para empresas tecnológicas en Madrid"';
    case 'real-estate':
      return 'Ej: "apartamento de 2 habitaciones en Barcelona"';
    default:
      return 'Describe lo que quieres buscar...';
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
            // Use type assertion to avoid linter errors
            const apiData = data.subscription as any;
            const fullSubscription: Subscription = {
              id: apiData.id,
              name: apiData.name || '',
              description: apiData.description || '',
              source: apiData.source || apiData.type || 'custom',
              prompts: apiData.prompts || [],
              frequency: apiData.frequency as 'immediate' | 'daily',
              logo: apiData.logo || '',
              isActive: apiData.isActive,
              userId: apiData.userId,
              createdAt: apiData.createdAt,
              updatedAt: apiData.updatedAt
            };
            setSubscription(fullSubscription);
            setPrompts(fullSubscription.prompts);
            setFrequency(fullSubscription.frequency);
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
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setTemplate(null);
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
      <div className="p-8" data-testid="subscription-loading">
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
    
    // Reset error state
    setError(null);
    
    // Validate prompts
    const validPrompts = prompts.filter(p => p.trim().length > 0);
    
    if (validPrompts.length === 0) {
      setError('Por favor, añade al menos un término de búsqueda.');
      toast({
        title: "Error de validación",
        description: "Por favor, añade al menos un término de búsqueda.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    console.log('Submitting form with prompts:', validPrompts);
    console.log('Frequency:', frequency);
    
    try {
      if (mode === 'edit' && subscription) {
        // Update existing subscription
        const response = await subscriptions.update(subscription.id, {
          prompts: validPrompts,
          frequency
        });
        
        console.log('Update response:', response);
        
        if (response.error) {
          console.error('Error details:', response);
          throw new Error(response.error);
        }
        
        toast({
          title: "Suscripción actualizada",
          description: "La suscripción se ha actualizado correctamente",
          variant: "default"
        });
      } else if (template) {
        // Create subscription with template
        console.log('Creating subscription with prompts:', validPrompts);
        
        // Ensure prompts are in the correct format - always an array
        const formattedPrompts = Array.isArray(validPrompts) ? validPrompts : [validPrompts];
        console.log('Formatted prompts (array):', formattedPrompts);
        
        // Create the subscription payload
        const subscriptionData = {
          // Type is required by the backend API
          type: template.type || 'boe', 
          typeId: template.id, // Keep typeId for reference
          name: template.name || `Subscription from ${typeId || 'template'}`,
          description: template.description || '',
          prompts: formattedPrompts,
          logo: template.logo || 'https://nifya.com/assets/logo.png', // Always provide a default logo
          frequency,
        };
        
        // Ensure required fields are present and valid
        if (!subscriptionData.name || subscriptionData.name.trim() === '') {
          subscriptionData.name = typeId ? `Subscription from ${typeId}` : 'Custom Subscription';
        }
        
        // Ensure logo is a valid URL if present, or use a default
        if (!subscriptionData.logo || !subscriptionData.logo.startsWith('http')) {
          // Provide a default logo URL based on the subscription type
          if (template.type === 'boe') {
            subscriptionData.logo = 'https://www.boe.es/favicon.ico';
          } else if (template.type === 'real-estate') {
            subscriptionData.logo = 'https://cdn-icons-png.flaticon.com/512/1040/1040993.png';
          } else {
            subscriptionData.logo = 'https://nifya.com/assets/logo.png';
          }
        }
        
        console.log('Subscription data being sent:', subscriptionData);
        
        try {
          const createResponse = await subscriptions.create(subscriptionData);
          
          // Log the complete response for debugging
          console.log('Subscription creation complete response:', createResponse);
          
          // If we got here, the subscription was created successfully
          console.log('Subscription created successfully:', createResponse);
          
          toast({
            title: "Suscripción creada",
            description: "Tu nueva suscripción se ha creado correctamente",
            variant: "default"
          });
          
          // Enhanced redirect approach - multiple strategies to ensure navigation happens
          console.log('Redirecting to subscriptions list...');
          
          // Strategy 1: Immediate navigation with replace
          navigate('/subscriptions', { replace: true });
          
          // Strategy 2: Forced navigation after a slight delay as backup
          setTimeout(() => {
            console.log('Executing delayed redirect as backup');
            window.location.href = '/subscriptions';
          }, 500);
          
          // Return early to prevent the edit mode setTimeout from executing
          return;
        } catch (error: any) {
          console.error('Error creating subscription:', error);
          
          // Try to extract validation errors from the response
          let errorMessage = 'Failed to create subscription';
          
          if (error.response && error.response.data) {
            const { message, details } = error.response.data;
            
            if (details && typeof details === 'object') {
              // Format validation errors for display
              const validationErrors = Object.entries(details)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join('\n');
              
              errorMessage = `Validation failed:\n${validationErrors}`;
            } else if (message) {
              errorMessage = message;
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          // Display the error
          setError(errorMessage);
          toast({
            title: "Error de validación",
            description: errorMessage,
            variant: "destructive"
          });
          
          throw error; // Re-throw to be caught by the outer catch block
        }
      }

      // This setTimeout only executes in edit mode now
      setTimeout(() => {
        navigate('/subscriptions', { replace: true });
      }, 300);
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

  // Set the icon based on the source or template type
  const getIcon = () => {
    let iconType = '';
    
    if (subscription && subscription.source) {
      // If we have a subscription, use its source
      iconType = subscription.source;
    } else if (template && template.type) {
      // Otherwise use the template type
      iconType = template.type;
    }
    
    switch (iconType.toLowerCase()) {
      case 'boe':
        return <FileText className="h-6 w-6" />;
      case 'real-estate':
      case 'inmobiliaria':
        return <Building2 className="h-6 w-6" />;
      default:
        return <Brain className="h-6 w-6" />;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8" data-testid="subscription-form-container">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/subscriptions/new')}
          data-testid="back-button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'edit' ? 'Editar Suscripción' : 'Nueva Suscripción'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit' 
              ? 'Modifica los parámetros de tu suscripción' 
              : 'Configura tu nueva suscripción para recibir alertas'}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            {getIcon()}
          </div>
          <div>
            <CardTitle data-testid="subscription-title">
              {subscription?.name || template?.name || 'Nueva Suscripción'}
            </CardTitle>
            <CardDescription>
              {subscription?.description || template?.description || ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="subscription-form">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm" data-testid="form-error">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {prompts.length > 1 ? 'Prompts' : 'Prompt'} 
                  <span className="text-gray-400 text-xs ml-1">(Máximo 3)</span>
                </label>
                
                {prompts.map((prompt, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => handlePromptChange(index, e.target.value)}
                      className="flex-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={getPromptPlaceholder(template?.type || (subscription?.source || 'default'))}
                      data-testid={`prompt-input-${index}`}
                    />
                    
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePrompt(index)}
                        className="ml-2 p-1.5 text-gray-600 hover:text-gray-900"
                        aria-label="Remove prompt"
                        data-testid={`remove-prompt-${index}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                
                {prompts.length < 3 && (
                  <button
                    type="button"
                    onClick={addPrompt}
                    className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                    data-testid="add-prompt-button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir prompt
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Frecuencia de notificaciones
                </label>
                
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="immediate"
                      checked={frequency === 'immediate'}
                      onChange={() => setFrequency('immediate')}
                      className="form-radio text-indigo-600"
                      data-testid="frequency-immediate"
                    />
                    <span>Inmediata</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={frequency === 'daily'}
                      onChange={() => setFrequency('daily')}
                      className="form-radio text-indigo-600"
                      data-testid="frequency-daily"
                    />
                    <span>Diaria</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/subscriptions')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                disabled={submitting}
                data-testid="subscription-submit-button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Actualizar suscripción' : 'Crear suscripción'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPrompt;