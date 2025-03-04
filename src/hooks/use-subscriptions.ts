import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

import subscriptionService, {
  Subscription,
  SubscriptionFormData,
  SubscriptionListParams,
} from '@/services/api/subscription-service';

/**
 * Custom hook for managing subscriptions
 */
export function useSubscriptions(params?: SubscriptionListParams) {
  const [filter, setFilter] = useState<SubscriptionListParams>(params || {});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch subscriptions
  const {
    data,
    isLoading: isLoadingSubscriptions,
    isError: isErrorSubscriptions,
    error: errorSubscriptions,
    refetch,
  } = useQuery(
    ['subscriptions', filter],
    () => subscriptionService.getSubscriptions(filter),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  // Fetch subscription stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery('subscriptionStats', () => subscriptionService.getSubscriptionStats(), {
    staleTime: 60000, // 1 minute
  });

  // Fetch single subscription
  const fetchSubscription = (id: string) => {
    return useQuery(['subscription', id], () => subscriptionService.getSubscription(id), {
      enabled: !!id,
      staleTime: 30000, // 30 seconds
    });
  };

  // Create subscription mutation
  const createSubscription = useMutation(
    (data: SubscriptionFormData) => subscriptionService.createSubscription(data),
    {
      onSuccess: () => {
        toast({
          title: 'Subscription created',
          description: 'Your subscription has been created successfully.',
          variant: 'default',
        });
        queryClient.invalidateQueries('subscriptions');
        queryClient.invalidateQueries('subscriptionStats');
        navigate('/subscriptions');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create subscription',
          variant: 'destructive',
        });
      },
    }
  );

  // Update subscription mutation
  const updateSubscription = useMutation(
    ({ id, data }: { id: string; data: SubscriptionFormData }) =>
      subscriptionService.updateSubscription(id, data),
    {
      onSuccess: () => {
        toast({
          title: 'Subscription updated',
          description: 'Your subscription has been updated successfully.',
          variant: 'default',
        });
        queryClient.invalidateQueries('subscriptions');
        queryClient.invalidateQueries('subscriptionStats');
        navigate('/subscriptions');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update subscription',
          variant: 'destructive',
        });
      },
    }
  );

  // Delete subscription mutation
  const deleteSubscription = useMutation(
    (id: string) => subscriptionService.deleteSubscription(id),
    {
      onSuccess: () => {
        toast({
          title: 'Subscription deleted',
          description: 'Your subscription has been deleted successfully.',
          variant: 'default',
        });
        queryClient.invalidateQueries('subscriptions');
        queryClient.invalidateQueries('subscriptionStats');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete subscription',
          variant: 'destructive',
        });
      },
    }
  );

  // Process subscription mutation
  const processSubscription = useMutation(
    (id: string) => subscriptionService.processSubscription(id),
    {
      onSuccess: (data) => {
        toast({
          title: 'Processing started',
          description: data.message || 'Your subscription is being processed.',
          variant: 'default',
        });
        // Don't invalidate queries here since processing is async
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to process subscription',
          variant: 'destructive',
        });
      },
    }
  );

  // Toggle subscription status mutation
  const toggleSubscriptionStatus = useMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) =>
      subscriptionService.toggleSubscriptionStatus(id, isActive),
    {
      onSuccess: (_, variables) => {
        toast({
          title: variables.isActive ? 'Subscription activated' : 'Subscription deactivated',
          description: variables.isActive
            ? 'Your subscription is now active.'
            : 'Your subscription has been deactivated.',
          variant: 'default',
        });
        queryClient.invalidateQueries('subscriptions');
        queryClient.invalidateQueries('subscriptionStats');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update subscription status',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    // Queries
    subscriptions: data?.subscriptions || [],
    metadata: data
      ? {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        }
      : undefined,
    stats,
    filter,
    isLoadingSubscriptions,
    isErrorSubscriptions,
    errorSubscriptions,
    isLoadingStats,
    isErrorStats,
    fetchSubscription,
    
    // Mutations
    createSubscription,
    updateSubscription,
    deleteSubscription,
    processSubscription,
    toggleSubscriptionStatus,
    
    // Actions
    setFilter,
    refetchSubscriptions: refetch,
  };
} 