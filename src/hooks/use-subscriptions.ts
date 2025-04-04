import { useState, useEffect } from 'react';
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

  // Delete subscription mutation - enhanced with forced refetching
  const deleteSubscription = useMutation({
    mutationFn: (id: string) => {
      console.log(`Mutation starting for delete subscription: ${id}`);
      return subscriptionService.deleteSubscription(id);
    },
    onMutate: async (id) => {
      console.log(`onMutate handling for delete subscription: ${id}`);
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });
      
      // Get the current data from the cache
      const previousData = queryClient.getQueryData(['subscriptions']);
      
      // Optimistically update the cache to remove the deleted subscription
      // But don't add to deletion blacklist yet - wait for backend confirmation
      queryClient.setQueryData(['subscriptions'], (oldData: any) => {
        if (!oldData || !oldData.subscriptions) return oldData;
        
        console.log(`Optimistically removing subscription ${id} from UI`);
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
      console.log(`onSuccess: Subscription ${id} deleted with result:`, result);
      
      // Check if the subscription was actually deleted in the backend
      const actuallyDeleted = result.actuallyDeleted !== false;
      
      if (actuallyDeleted) {
        console.log(`Subscription ${id} was confirmed deleted in the backend`);
        // The service has already updated the deletion blacklist if needed
      } else {
        console.log(`Subscription ${id} might not have been completely deleted in the backend`);
        // Ensure we refetch to get the latest status
      }
      
      // IMPORTANT: Force reset query cache
      queryClient.resetQueries({ queryKey: ['subscriptions'] });
      queryClient.resetQueries({ queryKey: ['subscriptionStats'] });
      
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      
      // Force immediate refetch of the subscription list
      setTimeout(() => {
        console.log(`Refetching subscriptions after deletion (success: ${actuallyDeleted})`);
        queryClient.removeQueries({ queryKey: ['subscriptions'] });
        queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      }, 300);
      
      // Run the cleanup function to ensure deletion blacklist is accurate
      setTimeout(() => {
        console.log('Running cleanup on deletion blacklist after delete operation');
        subscriptionService.cleanupDeletionBlacklist();
      }, 1000);
    },
    onError: (error: any, id, context) => {
      console.error(`onError: Error deleting subscription ${id}:`, error);
      
      // IMPORTANT: Force reset query cache
      queryClient.resetQueries({ queryKey: ['subscriptions'] });
      queryClient.resetQueries({ queryKey: ['subscriptionStats'] });
      
      // Force refetch to make sure we're in sync with backend
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      
      // Force immediate refetch of the subscription list
      setTimeout(() => {
        console.log(`Force refetching subscriptions after deletion error`);
        queryClient.removeQueries({ queryKey: ['subscriptions'] });
        queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      }, 300);
      
      // Run the cleanup function to ensure deletion blacklist is accurate
      setTimeout(() => {
        console.log('Running cleanup on deletion blacklist after delete error');
        subscriptionService.cleanupDeletionBlacklist();
      }, 1000);
    },
    onSettled: (data, error, variables) => {
      console.log(`onSettled: Mutation settled for subscription ${variables}`);
      
      // Always refetch after error or success to ensure consistency
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      }, 500);
      
      // One final refetch after a longer delay to ensure data consistency
      setTimeout(() => {
        console.log(`Final refetch after deletion operation`);
        queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      }, 1500);
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

  // Add some debug logging when the subscription data changes
  useEffect(() => {
    if (data) {
      console.log('Subscription data updated:', {
        count: data.subscriptions?.length || 0,
        hasData: !!data.subscriptions,
        filter,
        metadata: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        }
      });
    }
  }, [data, filter]);

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