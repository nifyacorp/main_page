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
import type { Template, Subscription } from '../lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from '../contexts/AuthContext';
import { getTemplate } from '../lib/api/services/templates';
import { toast } from '@/components/ui/use-toast';
import { subscriptionService } from '../services/api/subscription-service';
import MainLayout from '@/components/MainLayout';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

const SubscriptionPrompt: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [customFrequency, setCustomFrequency] = useState('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let fetchedTemplate: Template | null = null;
        if (templateId && templateId !== 'custom') {
          const templateResponse = await getTemplate(templateId);
          if (templateResponse.error) {
            throw new Error(templateResponse.error);
          }
          fetchedTemplate = templateResponse.data?.template || null;
          setTemplate(fetchedTemplate);
          setCustomPrompts(fetchedTemplate?.prompts || []);
          setCustomFrequency(fetchedTemplate?.frequency || 'daily');
          setDescription(fetchedTemplate?.description || '');
          setSubscriptionName(fetchedTemplate?.name || '');

        } else if (templateId === 'custom') {
          fetchedTemplate = { id: 'custom', name: 'Custom Subscription', type: 'custom', prompts: [], frequency: 'daily', description: 'Create a custom subscription.' };
          setTemplate(fetchedTemplate);
          setCustomPrompts([]);
          setCustomFrequency('daily');
          setDescription('');
          setSubscriptionName('');
        } else {
            throw new Error('Invalid template ID provided.');
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchTemplateDetails();
    } else {
      setError('No template ID provided in URL.');
      setIsLoading(false);
    }
  }, [templateId]);

  const addPromptField = () => {
    if (customPrompts.length < 5) {
      setCustomPrompts([...customPrompts, '']);
    }
  };

  const removePromptField = (index: number) => {
    const newPrompts = customPrompts.filter((_, i) => i !== index);
    setCustomPrompts(newPrompts);
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...customPrompts];
    newPrompts[index] = value;
    setCustomPrompts(newPrompts);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const finalPrompts = customPrompts.filter(p => p.trim() !== '');

    if (!subscriptionName.trim()) {
      setError('Subscription name cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    if (finalPrompts.length === 0) {
      setError('Please provide at least one keyword or prompt.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: subscriptionName,
        description: description || template?.description,
        type: template?.type || 'custom',
        prompts: finalPrompts,
        frequency: customFrequency,
        typeId: templateId !== 'custom' ? templateId : undefined,
        active: true,
      };
      
      const response = await subscriptionService.createSubscription(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Subscription Created",
        description: `Subscription "${payload.name}" created successfully.`,
      });
      navigate('/subscriptions');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create subscription';
      console.error('Subscription creation error:', err);
      setError(message);
      toast({
        title: "Error Creating Subscription",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout hideNav={true}>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout hideNav={true}>
        <div className="container mx-auto py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading template: {error}</p>
          <Button variant="outline" onClick={() => navigate('/subscriptions/create')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!template) {
    return (
      <MainLayout hideNav={true}>
         <div className="container mx-auto py-8 text-center">
          <p>Template not found.</p>
          <Button variant="outline" onClick={() => navigate('/subscriptions/create')}>
             Back to Templates
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideNav={true}>
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
              {templateId === 'custom' ? 'Nueva Suscripción' : 'Editar Suscripción'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {templateId === 'custom' 
                ? 'Configura tu nueva suscripción para recibir alertas' 
                : 'Modifica los parámetros de tu suscripción'}
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              {iconMap[template.type || '']}
            </div>
            <div>
              <CardTitle data-testid="subscription-title">
                {subscriptionName || template.name || 'Nueva Suscripción'}
              </CardTitle>
              <CardDescription>
                {description || template.description || ''}
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
                    {customPrompts.length > 1 ? 'Prompts' : 'Prompt'} 
                    <span className="text-gray-400 text-xs ml-1">(Máximo 5)</span>
                  </label>
                  
                  {customPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => handlePromptChange(index, e.target.value)}
                        className="flex-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={getPromptPlaceholder(template.type || 'default')}
                        data-testid={`prompt-input-${index}`}
                      />
                      
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePromptField(index)}
                          className="ml-2 p-1.5 text-gray-600 hover:text-gray-900"
                          aria-label="Remove prompt"
                          data-testid={`remove-prompt-${index}`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {customPrompts.length < 5 && (
                    <button
                      type="button"
                      onClick={addPromptField}
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
                        checked={customFrequency === 'immediate'}
                        onChange={() => setCustomFrequency('immediate')}
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
                        checked={customFrequency === 'daily'}
                        onChange={() => setCustomFrequency('daily')}
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
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  data-testid="subscription-submit-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {templateId === 'custom' ? 'Crear suscripción' : 'Actualizar suscripción'}
                    </>
                  ) : (
                    templateId === 'custom' ? 'Crear suscripción' : 'Actualizar suscripción'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPrompt;