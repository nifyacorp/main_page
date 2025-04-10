import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import MainLayout from '../components/MainLayout';
import { SubscriptionType, subscriptionTypesService } from '../lib/api/services/subscription-types';
import SubscriptionTypeSelector from '../components/subscriptions/SubscriptionTypeSelector';

const SubscriptionTypes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSelectType = (type: SubscriptionType) => {
    // Navigate to the create subscription form with the selected type ID
    navigate(`/subscriptions/create/${type.id}`);
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
          <h1 className="text-2xl font-bold">Select Subscription Type</h1>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Available Subscription Types</h2>
          <p className="text-muted-foreground mb-6">
            Select a subscription type to configure your notifications:
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-destructive mb-2">{error}</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <SubscriptionTypeSelector 
              onSelect={handleSelectType}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionTypes; 