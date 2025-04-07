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

  // Fetch single subscription - modified to work correctly
  const fetchSubscription = (id: string) => {
    if (!id) return { 
      data: undefined, 
      isLoading: false, 
      isError: true, 
      error: new Error('Subscription ID is required') 
    };
    
    // Use the returned result of useQuery instead of returning useQuery itself
    return useQuery({
      queryKey: ['subscription', id],
      queryFn: () => subscriptionService.getSubscription(id),
      enabled: true,
      staleTime: 30000, // 30 seconds
      retry: 2,
      refetchOnWindowFocus: false,
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

  // Delete subscription mutation - simplified for debugging
  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      console.log('[useSubscriptions] mutationFn: Deleting subscription', id);
      try {
        const response = await subscriptionService.deleteSubscription(id);
        console.log('[useSubscriptions] deleteSubscription response:', response);
        return { id, ...response }; // Pass ID along with response
      } catch (error) {
        console.error('[useSubscriptions] Error in deleteSubscription mutationFn:', error);
        throw error; // Re-throw to be handled by onError
      }
    },
    onSuccess: (data) => {
      console.log('[useSubscriptions] Delete successful for ID:', data.id, 'Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      // Remove specific subscription query cache if it exists
      queryClient.removeQueries({ queryKey: ['subscription', data.id] });
    },
    onError: (error: any, id) => {
      console.error(`[useSubscriptions] onError deleting subscription ${id}:`, error);

      // Determine the error message to show
      let errorMessage = 'There was a problem deleting your subscription. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        // Handle ApiError-like objects passed from the service
        errorMessage = error.message;
      }
      
      // Show error toast
      toast({
        title: 'Error deleting subscription',
        description: errorMessage,
        variant: 'destructive',
      });

      // Important: Invalidate queries even on error to potentially get the correct state back from the server
      // For example, if the delete failed because it was already gone, refetching will update the UI.
      console.log(`[useSubscriptions] Invalidating queries after delete error for ID: ${id}`);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
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

  // Log data format only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && data) {
      // console.log('Subscriptions data format:', {
      //   hasSubscriptionsArray: Array.isArray(data.subscriptions),
      //   hasDataProperty: 'data' in data,
      //   isDataArray: Array.isArray(data.data),
      //   hasSubscriptionsProperty: 'subscriptions' in data,
      //   topLevelType: typeof data,
      //   subscriptionCount: data?.subscriptions?.length || (Array.isArray(data.data) ? data.data.length : undefined),
      // });
    }
  }, [data]);

  // Log processed data for debugging
  // useEffect(() => {
  //   if (processedData) {
  //     console.log('Subscription data updated:', {
  //       count: processedData.subscriptions.length,
  //       hasData: processedData.subscriptions.length > 0,
  //       filter: currentFilter, // Ensure currentFilter is defined if uncommenting
  //       metadata: processedData.metadata
  //     });
  //   }
  // }, [processedData, currentFilter]); // Ensure dependencies are correct if uncommenting

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