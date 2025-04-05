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

  // Delete subscription mutation - enhanced with proper error handling
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
      // This is just visual - if the deletion fails, we'll restore previous data
      queryClient.setQueryData(['subscriptions'], (oldData: any) => {
        if (!oldData || !oldData.subscriptions) return oldData;
        
        console.log(`Optimistically removing subscription ${id} from UI`);
        return {
          ...oldData,
          subscriptions: oldData.subscriptions.filter((sub: any) => sub.id !== id)
        };
      });
      
      // Hold the removal of this subscription from other caches until we get confirmation
      
      return { previousData };
    },
    onSuccess: (result, id, context) => {
      console.log(`onSuccess: Subscription ${id} deleted with result:`, result);
      
      // Subscription was definitely deleted in the backend
      toast({
        title: 'Subscription deleted',
        description: 'Your subscription has been deleted successfully.',
        variant: 'default',
      });
      
      // Permanently remove this subscription from any individual query cache
      queryClient.removeQueries({ queryKey: ['subscription', id] });
            
      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      
      // Force immediate refetch of the subscription list
      setTimeout(() => {
        console.log(`Refetching subscriptions after confirmed deletion`);
        queryClient.removeQueries({ queryKey: ['subscriptions'] });
        queryClient.refetchQueries({ queryKey: ['subscriptions'] });
      }, 300);
    },
    onError: (error: any, id, context) => {
      console.error(`onError: Error deleting subscription ${id}:`, error);
      
      // Show error message to user
      toast({
        title: 'Error deleting subscription',
        description: error.message || 'There was a problem deleting your subscription. Please try again.',
        variant: 'destructive',
      });
      
      // Revert optimistic update by restoring the previous data
      if (context?.previousData) {
        console.log('Reverting optimistic deletion due to error');
        queryClient.setQueryData(['subscriptions'], context.previousData);
      }
      
      // Check if the error should be treated as a success (e.g., 404 Not Found is actually a good thing)
      if (error.status === 404) {
        console.log(`Subscription ${id} reported 404 - already deleted in backend`);
        // Remove any individual subscription data from cache
        queryClient.removeQueries({ queryKey: ['subscription', id] });
        
        // Show success toast for 404s since it means subscription is gone
        toast({
          title: 'Subscription removed',
          description: 'This subscription is no longer in the system.',
          variant: 'default',
        });
      } else {
        // For other errors, refetch to ensure we have correct data
        console.log('Refetching subscriptions after deletion error');
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      }
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

  // Extract subscriptions with better format handling
  const getSubscriptionsArray = () => {
    if (!data) return [];
    
    // Log the data format for debugging
    console.log('Subscriptions data format:', {
      hasSubscriptionsArray: Array.isArray(data.subscriptions),
      hasDataProperty: !!data.data,
      isDataArray: data.data && Array.isArray(data.data),
      hasSubscriptionsProperty: !!data.subscriptions,
      topLevelType: typeof data,
      isTopLevelArray: Array.isArray(data)
    });
    
    // Handle different data formats
    if (Array.isArray(data.subscriptions)) {
      // Format: { subscriptions: [] }
      return data.subscriptions;
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        // Format: { data: [] }
        return data.data;
      } else if (data.data.subscriptions && Array.isArray(data.data.subscriptions)) {
        // Format: { data: { subscriptions: [] } }
        return data.data.subscriptions;
      }
    } else if (Array.isArray(data)) {
      // Format: direct array
      return data;
    }
    
    // Default to empty array
    console.log('Could not detect subscription array format, returning empty array');
    return [];
  };

  return {
    // Queries
    subscriptions: getSubscriptionsArray(),
    metadata: data
      ? {
          total: data.total || (data.pagination ? data.pagination.total : 0) || 
                 (data.data && data.data.pagination ? data.data.pagination.total : 0) || 
                 getSubscriptionsArray().length,
          page: data.page || (data.pagination ? data.pagination.page : 1) || 
                (data.data && data.data.pagination ? data.data.pagination.page : 1) || 1,
          limit: data.limit || (data.pagination ? data.pagination.limit : 10) || 
                 (data.data && data.data.pagination ? data.data.pagination.limit : 10) || 10,
          totalPages: data.totalPages || (data.pagination ? data.pagination.totalPages : 1) || 
                      (data.data && data.data.pagination ? data.data.pagination.totalPages : 1) || 1,
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