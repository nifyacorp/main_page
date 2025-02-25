import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Building2, Brain, Plus, X, Bell, Clock, Loader2 } from 'lucide-react';
import { templates } from '../lib/api';
import type { Template } from '../lib/api/types';
import type { IconType } from 'lucide-react';

const iconMap: Record<string, IconType> = {
  FileText,
  Building2,
  Brain,
};

const getPromptPlaceholder = (type: string) => {
  switch (type) {
    case 'boe':
      return 'Ej: Subvenciones para startups tecnológicas en Madrid';
    case 'real-estate':
      return 'Ej: Pisos de 2 habitaciones en el centro de Madrid por menos de 300.000€';
    default:
      return 'Describe lo que quieres monitorizar...';
  }
};

const TemplateConfig = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [frequency, setFrequency] = useState<'immediate' | 'daily'>('immediate');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        navigate('/subscriptions/catalog');
        return;
      }

      try {
        const { data, error } = await templates.getDetails(templateId);
        if (error) throw new Error(error);
        
        if (data) {
          setTemplate(data);
          // Only update prompts if the template has prompts defined
          if (data.prompts && Array.isArray(data.prompts) && data.prompts.length > 0) {
            setPrompts([...data.prompts]);
          }
          if (data.frequency) {
            setFrequency(data.frequency);
          }
        } else {
          throw new Error('Template not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
        navigate('/subscriptions/catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, navigate]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template || !templateId) return;
    
    try {
      setSubscribing(true);
      setError(null);

      // Filter out empty prompts
      const validPrompts = prompts.filter(p => p.trim());
      
      if (validPrompts.length === 0) {
        throw new Error('Al menos un prompt es requerido');
      }

      const { data, error } = await templates.subscribe(templateId, {
        prompts: validPrompts,
        frequency
      });
      
      if (error) throw new Error(error);
      
      if (data?.subscription) {
        navigate('/subscriptions');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setSubscribing(false);
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
    if (prompts.length <= 1) return; // Prevent removing the last prompt
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
  };

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

  if (!template) {
    return null;
  }

  const Icon = iconMap[template.icon] || Brain;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/subscriptions/catalog')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </button>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
          </div>
          
          {template.metadata && (
            <div className="mt-4 p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Detalles</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(template.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground capitalize">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <form onSubmit={handleSubscribe} className="space-y-6">
          <div>
            <label className="block font-medium">
              Prompts de búsqueda ({prompts.length}/3)
            </label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Personaliza los prompts para ajustar la búsqueda a tus necesidades específicas.
            </p>
            
            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder={getPromptPlaceholder(template.type)}
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
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={subscribing}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creando suscripción...</span>
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  <span>Suscribirse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateConfig;