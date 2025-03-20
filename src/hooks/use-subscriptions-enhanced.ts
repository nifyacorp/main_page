import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, CreateSubscriptionInput, UpdateSubscriptionInput } from '../lib/api/services/subscriptions';
import { FALLBACK_SUBSCRIPTIONS, shouldUseFallbacks } from '../lib/utils/fallback';
import { useToast } from '../components/ui/use-toast';

/**
 * Enhanced hook for managing subscriptions with fallback support
 * This version will handle API errors gracefully and provide fallback data
 */
export function useSubscriptionsEnhanced() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const useFallbacks = shouldUseFallbacks();

  // Get all subscriptions with fallback
  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      try {
        const response = await subscriptionService.list();
        
        // In case of error, provide fallback data in development
        if (!response.ok && useFallbacks) {
          console.warn('Using fallback subscription data due to API error:', response.error);
          return { subscriptions: FALLBACK_SUBSCRIPTIONS, fallback: true };
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Failed to fetch subscriptions:', error.message || error);
        
        // In development/debug, return fallback data
        if (useFallbacks) {
          console.warn('Using fallback subscription data due to exception');
          return { subscriptions: FALLBACK_SUBSCRIPTIONS, fallback: true };
        }
        
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create new subscription
  const createSubscription = useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscription created',
        description: 'Your subscription has been created successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to create subscription:', error);
      toast({
        title: 'Error creating subscription',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Update subscription
  const updateSubscription = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionInput }) =>
      subscriptionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscription updated',
        description: 'Your subscription has been updated successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to update subscription:', error);
      toast({
        title: 'Error updating subscription',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Delete subscription
  const deleteSubscription = useMutation({
    mutationFn: (id: string) => subscriptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscription deleted',
        description: 'Your subscription has been deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete subscription:', error);
      toast({
        title: 'Error deleting subscription',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Toggle subscription active state
  const toggleSubscriptionActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      subscriptionService.toggle(id, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: variables.active ? 'Subscription activated' : 'Subscription paused',
        description: variables.active
          ? 'Your subscription is now active'
          : 'Your subscription has been paused',
      });
    },
    onError: (error) => {
      console.error('Failed to toggle subscription:', error);
      toast({
        title: 'Error updating subscription',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Process subscription immediately
  const processSubscription = useMutation({
    mutationFn: (id: string) => subscriptionService.processImmediately(id),
    onSuccess: (data) => {
      toast({
        title: 'Processing started',
        description: data.data?.message || 'Your subscription is being processed',
      });
    },
    onError: (error) => {
      console.error('Failed to process subscription:', error);
      toast({
        title: 'Error processing subscription',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  return {
    subscriptions: subscriptionsData?.subscriptions || [],
    isUsingFallback: !!subscriptionsData?.fallback,
    isLoadingSubscriptions,
    subscriptionsError,
    refetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    processSubscription,
  };
}