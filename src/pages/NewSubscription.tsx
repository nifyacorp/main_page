import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Bell, FileText, Building2, Newspaper, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import DashboardLayout from '../components/DashboardLayout';
import { templateService, subscriptionService, Template } from '../api';

// Map of icon names to Lucide React components
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Newspaper: <Newspaper className="h-6 w-6" />,
  Bell: <Bell className="h-6 w-6" />,
  Plus: <Plus className="h-6 w-6" />,
};

interface Subscription {
  id: string;
  name: string;
  description?: string;
  type?: string;
  icon?: string;
  active: boolean;
  frequency: string;
  prompts: string[];
  createdAt: string;
}

const NewSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch templates
        setLoading(true);
        const templatesResponse = await templateService.list(1, 20);
        
        if (templatesResponse.error) {
          throw new Error(templatesResponse.error);
        }
        
        if (templatesResponse.data?.templates) {
          setTemplates(templatesResponse.data.templates);
        } else {
          setTemplates([]);
        }
        
        // Fetch user's existing subscriptions
        setSubscriptionsLoading(true);
        const subscriptionsResponse = await subscriptionService.getSubscriptions();
        
        if (subscriptionsResponse.error) {
          console.error('Error fetching subscriptions:', subscriptionsResponse.error);
        } else if (subscriptionsResponse.subscriptions) {
          // Add icon information based on subscription type
          const enhancedSubscriptions = subscriptionsResponse.subscriptions.map(sub => ({
            ...sub,
            icon: sub.type === 'boe' ? 'FileText' : 
                 sub.type === 'real-estate' ? 'Building2' : 'Bell'
          }));
          setUserSubscriptions(enhancedSubscriptions);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // In development mode, create mock data for testing
        if (import.meta.env.DEV) {
          console.log('Creating mock data for development');
          
          // Set mock templates if in dev mode
          if (templates.length === 0) {
            setTemplates([
              {
                id: 'boe-general',
                name: 'BOE General',
                description: 'Seguimiento general del Bolet??n Oficial del Estado',
                type: 'boe',
                prompts: ['disposici??n', 'ley', 'real decreto'],
                icon: 'FileText',
                logo: 'https://www.boe.es/favicon.ico',
                isBuiltIn: true,
                metadata: {
                  category: 'government',
                  source: 'boe'
                },
                frequency: 'daily'
              },
              {
                id: 'boe-subvenciones',
                name: 'Subvenciones BOE',
                description: 'Alertas de subvenciones y ayudas p??blicas',
                type: 'boe',
                prompts: ['subvenci??n', 'ayuda', 'convocatoria'],
                icon: 'Coins',
                logo: 'https://www.boe.es/favicon.ico',
                isBuiltIn: true,
                metadata: {
                  category: 'government',
                  source: 'boe'
                },
                frequency: 'immediate'
              },
              {
                id: 'real-estate-rental',
                name: 'Alquiler de Viviendas',
                description: 'B??squeda de alquileres en zonas espec??ficas',
                type: 'real-estate',
                prompts: ['alquiler', 'piso', 'apartamento'],
                icon: 'Building2',
                logo: 'https://example.com/icon.png',
                isBuiltIn: true,
                metadata: {
                  category: 'real-estate',
                  source: 'property-listings'
                },
                frequency: 'immediate'
              }
            ]);
          }
          
          // Add mock subscriptions in development mode
          setUserSubscriptions([
            {
              id: 'mock-sub-1',
              name: 'My BOE Subscription',
              description: 'Tracking tax law changes',
              type: 'boe',
              icon: 'FileText',
              active: true,
              frequency: 'daily',
              prompts: ['impuestos', 'IRPF', 'IVA'],
              createdAt: new Date().toISOString()
            },
            {
              id: 'mock-sub-2',
              name: 'Madrid Real Estate',
              description: 'Looking for apartments in Madrid',
              type: 'real-estate',
              icon: 'Building2',
              active: true,
              frequency: 'immediate',
              prompts: ['Madrid', 'apartamento', '2 habitaciones'],
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } finally {
        setLoading(false);
        setSubscriptionsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/subscriptions/create/${templateId}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => navigate('/subscriptions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Button>
          <h1 className="text-2xl font-bold">Create New Subscription</h1>
        </div>
        
        <div>
          {/* Main content - Templates */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error && templates.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 mb-2">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border shadow">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No templates available</h2>
                <p className="text-muted-foreground">
                  There are currently no subscription templates available. 
                  Please check back later.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4">Available Templates</h2>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-2 shadow-md hover:shadow-lg transition-shadow" data-testid={`template-card-${template.id}`}>
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          {iconMap[template.icon] || <Bell className="h-6 w-6" />}
                        </div>
                        <div>
                          <CardTitle data-testid={`template-title-${template.id}`}>{template.name}</CardTitle>
                          <CardDescription>
                            {template.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          {template.type === 'boe' 
                            ? 'Get notifications for new publications in the Spanish Official State Gazette (BOE) based on your keywords and filters.'
                            : template.type === 'real-estate'
                            ? 'Get notifications for new properties, price changes, and other updates from real estate platforms based on your criteria.'
                            : 'Create a custom subscription with your own parameters and filters.'}
                        </p>
                        {template.prompts && template.prompts.length > 0 && (
                          <div className="mt-3 bg-accent/40 p-2 rounded-md">
                            <p className="text-xs font-medium">Default prompts:</p>
                            <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                              {template.prompts.map((prompt, idx) => (
                                <li key={idx}>{prompt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handleSelectTemplate(template.id)}
                          data-testid={`template-select-button-${template.id}`}
                        >
                          Select
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Add Custom Subscription Card */}
                  <Card className="border-2 border-dashed shadow-md" data-testid="template-card-custom">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle data-testid="template-title-custom">Custom Subscription</CardTitle>
                        <CardDescription>
                          Create a custom notification source
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        Set up a custom notification source with your own parameters, 
                        webhooks, or API integrations.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleSelectTemplate('custom')}
                        data-testid="template-select-button-custom"
                      >
                        Create Custom
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewSubscription; 
