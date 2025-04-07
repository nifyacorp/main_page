import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Bell, FileText, Building2, Newspaper, Plus, CheckCircle, Clock, AlertCircle, AlertTriangle, PlusCircle } from 'lucide-react';
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
          {/* Main content - Template Selection */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select a Template</CardTitle>
                <CardDescription>
                  Choose a pre-defined template or start from scratch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTemplates ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12 bg-muted/50 rounded-lg border">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Templates Available</h2>
                    <p className="text-muted-foreground">
                      Could not load subscription templates. Try creating a custom one.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        onSelect={() => navigate(`/subscriptions/create/${template.id}`)}
                      />
                    ))}
                  </div>
                )}
                
                <Separator className="my-6" />

                <h3 className="text-md font-semibold mb-3">Or Create Your Own</h3>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/subscriptions/create/custom')}
                  data-testid="template-select-button-custom"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Custom Subscription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewSubscription; 