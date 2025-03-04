import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import MainLayout from '../components/MainLayout';

const NewSubscription: React.FC = () => {
  const navigate = useNavigate();

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle>BOE Subscription</CardTitle>
              <CardDescription>
                Subscribe to official government publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get notifications for new publications in the Spanish Official State Gazette (BOE) 
                based on your keywords and filters.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Select</Button>
            </CardFooter>
          </Card>

          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle>Real Estate Subscription</CardTitle>
              <CardDescription>
                Track property listings and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get notifications for new properties, price changes, and other updates from 
                real estate platforms based on your criteria.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Select</Button>
            </CardFooter>
          </Card>

          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle>News Subscription</CardTitle>
              <CardDescription>
                Stay updated with news on specific topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get notifications for news articles and updates on topics that matter to you,
                filtered by keywords and sources.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Select</Button>
            </CardFooter>
          </Card>

          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle>Custom Subscription</CardTitle>
              <CardDescription>
                Create a custom notification source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up a custom notification source with your own parameters, 
                webhooks, or API integrations.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Select</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewSubscription; 