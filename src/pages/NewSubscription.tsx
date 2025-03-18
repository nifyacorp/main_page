import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Bell, FileText, Building2, Newspaper, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import MainLayout from '../components/MainLayout';
import { templateService } from '../lib/api/services/templates';
import type { Template } from '../lib/api/types';

// Map of icon names to Lucide React components
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Newspaper: <Newspaper className="h-6 w-6" />,
  Bell: <Bell className="h-6 w-6" />,
  Plus: <Plus className="h-6 w-6" />,
};

const NewSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await templateService.list(1, 20);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.templates) {
          setTemplates(response.data.templates);
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load subscription templates. Please try again later.');
        
        // Provide fallback templates in development mode
        if (import.meta.env.DEV) {
          setTemplates([
            {
              id: 'boe-template',
              name: 'BOE Subscription',
              description: 'Subscribe to official government publications',
              type: 'boe',
              prompts: [],
              icon: 'FileText',
              logo: 'https://www.boe.es/favicon.ico',
              isPublic: true,
              metadata: {
                category: 'government',
                source: 'boe',
              },
              frequency: 'daily'
            },
            {
              id: 'real-estate-template',
              name: 'Real Estate Subscription',
              description: 'Track property listings and updates',
              type: 'real-estate',
              prompts: [],
              icon: 'Building2',
              logo: 'https://cdn-icons-png.flaticon.com/512/1040/1040993.png',
              isPublic: true,
              metadata: {
                category: 'real-estate',
                source: 'property-listings',
              },
              frequency: 'daily'
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/subscriptions/new/${templateId}`);
  };

  return (
    <MainLayout>
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error && templates.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No templates available</h2>
            <p className="text-muted-foreground">
              There are currently no subscription templates available. 
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {iconMap[template.icon] || <Bell className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.type === 'boe' 
                      ? 'Get notifications for new publications in the Spanish Official State Gazette (BOE) based on your keywords and filters.'
                      : template.type === 'real-estate'
                      ? 'Get notifications for new properties, price changes, and other updates from real estate platforms based on your criteria.'
                      : 'Create a custom subscription with your own parameters and filters.'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Add Custom Subscription Card */}
            <Card className="border-2 border-dashed shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Custom Subscription</CardTitle>
                  <CardDescription>
                    Create a custom notification source
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set up a custom notification source with your own parameters, 
                  webhooks, or API integrations.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/subscriptions/new/custom')}
                >
                  Create Custom
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewSubscription; 