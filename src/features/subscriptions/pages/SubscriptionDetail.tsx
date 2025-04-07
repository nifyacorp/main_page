import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSubscription } from '../hooks/use-subscriptions';
import { useSubscriptionType } from '../hooks/use-subscription-types';
import SubscriptionDetailComponent from '../components/SubscriptionDetail';

const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch subscription data
  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading, 
    error: subscriptionError 
  } = useSubscription(id || '');
  
  // Fetch subscription type data
  const {
    data: subscriptionType,
    isLoading: isTypeLoading,
    error: typeError
  } = useSubscriptionType(subscription?.subscription_type_id || '');
  
  // Handle subscription deletion
  const handleDeleted = () => {
    navigate('/subscriptions');
  };
  
  // Handle errors
  const error = subscriptionError || typeError;
  
  // Loading state
  const isLoading = isSubscriptionLoading || isTypeLoading;
  
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>
          {subscription ? `${subscription.name} | NIFYA` : 'Detalle de suscripción | NIFYA'}
        </title>
      </Helmet>
      
      <SubscriptionDetailComponent
        subscription={subscription!}
        subscriptionType={subscriptionType}
        isLoading={isLoading}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

export default SubscriptionDetailPage;