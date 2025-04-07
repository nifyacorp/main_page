import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Bell, FileText, Building2, Newspaper, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import MainLayout from '../components/MainLayout';
import { templateService } from '../lib/api/services/templates';
import { subscriptions } from '../lib/api';
import type { Template } from '../lib/api/types';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import type { SubscriptionTemplate } from '../services/api/template-service';
import { useToast } from '../components/ui/use-toast';

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
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await templateService.getPublicTemplates({ limit: 50 });
        if (response.templates) {
          setTemplates(response.templates);
        } else {
          console.error('Failed to fetch templates');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSuccess = () => {
    toast({
      title: 'Subscription created successfully',
      description: 'The subscription has been created successfully.',
    });
  };

  return (
    <MainLayout hideNav={true}>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar - Your current subscriptions */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border shadow p-5">
              <h2 className="text-lg font-semibold mb-4">Your Subscriptions</h2>
              <Separator className="mb-4" />
              
              {/* Remove the existing subscriptions panel */}
              {/* 
              {subscriptionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : userSubscriptions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">You don't have any subscriptions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSubscriptions.map(subscription => (
                    <Link 
                      key={subscription.id}
                      to={`/subscriptions/${subscription.id}`}
                      className="block"
                    >
                      <div className="p-3 rounded-md bg-accent/40 hover:bg-accent transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-primary/10 flex-shrink-0 ${!subscription.active && 'opacity-50'}`}>
                            {iconMap[subscription.icon || 'Bell']}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{subscription.name}</h3>
                              {subscription.active ? (
                                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{subscription.frequency === 'immediate' ? 'Immediate' : 'Daily'}</span>
                              </div>
                            </div>
                            {subscription.prompts && subscription.prompts.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground truncate">
                                  Monitoring: {subscription.prompts.slice(0, 2).join(', ')}
                                  {subscription.prompts.length > 2 ? '...' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {!subscriptionsLoading && (
                <>
                  <Separator className="my-4" />
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/subscriptions')}
                      className="w-full text-sm"
                    >
                      View All Subscriptions
                    </Button>
                  </div>
                </>
              )}
              */}
            </div>
          </div>
          
          {/* Main content - Templates */}
          <div className="md:col-span-2">
            {loadingTemplates ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                          onClick={() => navigate(`/subscriptions/create/${template.id}`)}
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
                        onClick={() => navigate('/subscriptions/create/custom')}
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
    </MainLayout>
  );
};

export default NewSubscription; 