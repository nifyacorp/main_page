import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    error: errorData,
    refetch,
  } = useQuery({
    queryKey: ['subscriptions', filter],
    queryFn: () => subscriptionService.getSubscriptions(filter),
    staleTime: 30000, // 30 seconds
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
  });

  // Extract error message or undefined
  const error = data?.error || (errorData instanceof Error ? errorData.message : undefined);

  // Fetch subscription stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: () => subscriptionService.getSubscriptionStats(),
    staleTime: 60000, // 1 minute
    retry: 2
  });

  // Fetch single subscription
  const fetchSubscription = (id: string) => {
    return useQuery({
      queryKey: ['subscription', id],
      queryFn: () => subscriptionService.getSubscription(id),
      enabled: !!id,
      staleTime: 30000, // 30 seconds
    });
  };

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: (data: SubscriptionFormData) => subscriptionService.createSubscription(data),
    onSuccess: () => {
      toast({
        title: 'Subscription created',
        description: 'Your subscription has been created successfully.',
        variant: 'default',
      });
      // Invalidate and refetch both subscriptions and stats
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      
      // Force immediate refetch to ensure we get latest data
      setTimeout(() => {
        refetch();
        refetchStats();
      }, 500);
      
      navigate('/subscriptions');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  // Update subscription mutation
  const updateSubscription = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionFormData }) =>
      subscriptionService.updateSubscription(id, data),
    onSuccess: () => {
      toast({
        title: 'Subscription updated',
        description: 'Your subscription has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      navigate('/subscriptions');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      });
    },
  });

  // Delete subscription mutation
  const deleteSubscription = useMutation({
    mutationFn: (id: string) => subscriptionService.deleteSubscription(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });
      
      // Get the current data from the cache
      const previousData = queryClient.getQueryData(['subscriptions']);
      
      // Optimistically update the cache to remove the deleted subscription
      queryClient.setQueryData(['subscriptions'], (oldData: any) => {
        if (!oldData || !oldData.subscriptions) return oldData;
        
        return {
          ...oldData,
          subscriptions: oldData.subscriptions.filter((sub: any) => sub.id !== id)
        };
      });
      
      // Also immediately remove this subscription from any individual query cache
      queryClient.removeQueries({ queryKey: ['subscription', id] });
      
      return { previousData };
    },
    onSuccess: (result, id, context) => {
      toast({
        title: 'Subscription deleted',
        description: result.message || 'Your subscription has been deleted successfully.',
        variant: 'default',
      });
      
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      
      // Force immediate refetch of the subscription list
      queryClient.refetchQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: any, id, context) => {
      // Even for errors, don't rollback the UI state - we always want to remove from UI
      toast({
        title: 'Subscription removed from view',
        description: 'The subscription has been removed from your view.',
        variant: 'default',
      });
      
      console.log(`Handling delete error for subscription ${id} (but keeping it removed from UI)`, error);
      
      // Force refetch to make sure we're in sync with backend
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  // Process subscription mutation
  const processSubscription = useMutation({
    mutationFn: (id: string) => subscriptionService.processSubscription(id),
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
  });

  // Toggle subscription status mutation
  const toggleSubscriptionStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      subscriptionService.toggleSubscriptionStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast({
        title: variables.isActive ? 'Subscription activated' : 'Subscription deactivated',
        description: variables.isActive
          ? 'Your subscription is now active.'
          : 'Your subscription has been deactivated.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription status',
        variant: 'destructive',
      });
    },
  });

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
    error,
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