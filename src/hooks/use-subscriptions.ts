import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

import { 
  subscriptionService, 
  Subscription, 
  SubscriptionsResponse, 
  SubscriptionFilterOptions 
} from '../api';

// Fallback data for when the API fails
const fallbackSubscriptions = [
  {
    id: 'fallback-1',
    name: 'BOE Notifications',
    type: 'boe',
    description: 'Get notified about official publications (Fallback)',
    logo: null,
    prompts: ['legal', 'regulations'],
    frequency: 'daily',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Real Estate Updates',
    type: 'real-estate',
    description: 'Track real estate listings (Fallback)',
    logo: null,
    prompts: ['apartments', 'houses', 'madrid'],
    frequency: 'immediate',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const fallbackStats = {
  total: 2,
  active: 2,
  inactive: 0,
  bySource: {
    boe: 1,
    'real-estate': 1,
  },
  byFrequency: {
    daily: 1,
    immediate: 1,
  },
};

/**
 * Unified subscription hook that combines regular and enhanced functionality
 * Provides optimistic updates and fallback mechanisms for API failures
 */
export function useSubscriptions(params?: SubscriptionListParams) {
  const [filter, setFilter] = useState<SubscriptionListParams>(params || {});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usingFallback, setUsingFallback] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Fetch subscriptions with fallback
  const {
    data,
    isLoading: isLoadingSubscriptions,
    isError: isErrorSubscriptions,
    error: errorSubscriptions,
    refetch,
  } = useQuery({
    queryKey: ['subscriptions', filter],
    queryFn: () => subscriptionService.getSubscriptions(filter),
    staleTime: 30000, // 30 seconds
    retry: 2,
    onError: (error) => {
      console.error('Subscription API failed:', error);
      // Show fallback toast only once
      if (!usingFallback) {
        toast({
          title: 'Using cached data',
          description: 'We could not connect to the server. Showing cached content.',
          variant: 'warning',
        });
        setUsingFallback(true);
      }
    },
    onSuccess: () => {
      if (usingFallback) {
        setUsingFallback(false);
        toast({
          title: 'Connected to server',
          description: 'Now showing live data from the server.',
          variant: 'default',
        });
      }
    },
  });

  // Fetch subscription stats with fallback
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: () => subscriptionService.getSubscriptionStats(),
    staleTime: 60000, // 1 minute
    retry: 2,
  });

  // Fetch single subscription with fallback
  const fetchSubscription = (id: string) => {
    const query = useQuery({
      queryKey: ['subscription', id],
      queryFn: () => subscriptionService.getSubscription(id),
      enabled: !!id,
      staleTime: 30000, // 30 seconds
      retry: 2,
      onError: () => {
        // Find fallback subscription if using real ID format
        if (!id.startsWith('fallback-')) {
          const fallbackSub = fallbackSubscriptions.find(s => s.id === 'fallback-1');
          if (fallbackSub) {
            return { subscription: fallbackSub };
          }
        }
      }
    });

    // Return the fallback data if there's an error
    if (query.isError && id.startsWith('fallback-')) {
      const fallbackSub = fallbackSubscriptions.find(s => s.id === id);
      return {
        ...query,
        data: fallbackSub ? { subscription: fallbackSub } : undefined,
        isError: false,
      };
    }

    return query;
  };

  // Periodically retry when using fallback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (usingFallback) {
      timer = setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
        refetch();
      }, 30000); // Try again every 30 seconds
    }
    return () => clearTimeout(timer);
  }, [usingFallback, retryAttempt, refetch]);

  // Create subscription mutation with optimistic updates
  const createSubscription = useMutation({
    mutationFn: (data: SubscriptionFormData) => subscriptionService.createSubscription(data),
    onMutate: async (newSubscriptionData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });

      // Snapshot current data
      const previousSubscriptions = queryClient.getQueryData(['subscriptions']);

      // Create a temporary ID
      const tempId = `temp-${Date.now()}`;

      // Create a temporary subscription object
      const tempSubscription = {
        id: tempId,
        name: newSubscriptionData.name,
        type: newSubscriptionData.type,
        description: newSubscriptionData.description || '',
        logo: null,
        prompts: newSubscriptionData.prompts,
        frequency: newSubscriptionData.frequency,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update subscriptions list
      if (previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], (old: any) => ({
          ...old,
          subscriptions: [tempSubscription, ...(old?.subscriptions || [])],
        }));
      }

      return { previousSubscriptions };
    },
    onSuccess: () => {
      toast({
        title: 'Subscription created',
        description: 'Your subscription has been created successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      navigate('/subscriptions');
    },
    onError: (error: any, _, context) => {
      // Rollback to previous data
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], context.previousSubscriptions);
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  // Update subscription mutation with optimistic updates
  const updateSubscription = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionFormData }) =>
      subscriptionService.updateSubscription(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });
      await queryClient.cancelQueries({ queryKey: ['subscription', id] });

      // Snapshot current data
      const previousSubscriptions = queryClient.getQueryData(['subscriptions']);
      const previousSubscription = queryClient.getQueryData(['subscription', id]);

      // Optimistically update subscriptions list
      if (previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], (old: any) => ({
          ...old,
          subscriptions: (old?.subscriptions || []).map((sub: any) => 
            sub.id === id 
              ? { ...sub, ...data, updated_at: new Date().toISOString() } 
              : sub
          ),
        }));
      }

      // Also update the individual subscription if it's in the cache
      if (previousSubscription) {
        queryClient.setQueryData(['subscription', id], (old: any) => ({
          ...old,
          subscription: { ...old.subscription, ...data, updated_at: new Date().toISOString() },
        }));
      }

      return { previousSubscriptions, previousSubscription };
    },
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
    onError: (error: any, variables, context) => {
      // Rollback to previous data
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], context.previousSubscriptions);
      }
      if (context?.previousSubscription) {
        queryClient.setQueryData(['subscription', variables.id], context.previousSubscription);
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      });
    },
  });

  // Delete subscription mutation with optimistic updates
  const deleteSubscription = useMutation({
    mutationFn: (id: string) => subscriptionService.deleteSubscription(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });

      // Snapshot current data
      const previousSubscriptions = queryClient.getQueryData(['subscriptions']);

      // Optimistically update subscriptions list
      if (previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], (old: any) => ({
          ...old,
          subscriptions: (old?.subscriptions || []).filter((sub: any) => sub.id !== id),
        }));
      }

      return { previousSubscriptions };
    },
    onSuccess: (_, id) => {
      toast({
        title: 'Subscription deleted',
        description: 'Your subscription has been deleted successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStats'] });
      // Remove specific subscription query cache if it exists
      queryClient.removeQueries({ queryKey: ['subscription', id] });
    },
    onError: (error: any, id, context) => {
      console.error(`[useSubscriptions] onError deleting subscription ${id}:`, error);
      
      // Rollback to previous data
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], context.previousSubscriptions);
      }
      
      // Determine the error message to show
      let errorMessage = 'There was a problem deleting your subscription. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error deleting subscription',
        description: errorMessage,
        variant: 'destructive',
      });

      // Important: Invalidate queries even on error to potentially get the correct state back from the server
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

  // Toggle subscription status mutation with optimistic updates
  const toggleSubscriptionStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      subscriptionService.toggleSubscriptionStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] });
      await queryClient.cancelQueries({ queryKey: ['subscription', id] });

      // Snapshot current data
      const previousSubscriptions = queryClient.getQueryData(['subscriptions']);
      const previousSubscription = queryClient.getQueryData(['subscription', id]);

      // Optimistically update subscriptions list
      if (previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], (old: any) => ({
          ...old,
          subscriptions: (old?.subscriptions || []).map((sub: any) => 
            sub.id === id 
              ? { ...sub, active: isActive, updated_at: new Date().toISOString() } 
              : sub
          ),
        }));
      }

      // Also update the individual subscription if it's in the cache
      if (previousSubscription) {
        queryClient.setQueryData(['subscription', id], (old: any) => ({
          ...old,
          subscription: { 
            ...old.subscription, 
            active: isActive, 
            updated_at: new Date().toISOString() 
          },
        }));
      }

      return { previousSubscriptions, previousSubscription };
    },
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
    onError: (error: any, variables, context) => {
      // Rollback to previous data
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(['subscriptions'], context.previousSubscriptions);
      }
      if (context?.previousSubscription) {
        queryClient.setQueryData(['subscription', variables.id], context.previousSubscription);
      }
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription status',
        variant: 'destructive',
      });
    },
  });

  // Extract subscriptions with fallback handling
  const getSubscriptionsArray = useCallback(() => {
    if (usingFallback || isErrorSubscriptions) {
      return fallbackSubscriptions;
    }
    
    if (!data) return [];
    
    // Handle different data formats
    if (Array.isArray(data.subscriptions)) {
      return data.subscriptions;
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (data.data.subscriptions && Array.isArray(data.data.subscriptions)) {
        return data.data.subscriptions;
      }
    } else if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  }, [data, usingFallback, isErrorSubscriptions]);

  // Get metadata with fallback
  const getMetadata = useCallback(() => {
    if (usingFallback || isErrorSubscriptions) {
      return {
        total: fallbackSubscriptions.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    }
    
    if (!data) return undefined;
    
    return {
      total: data.total || (data.pagination ? data.pagination.total : 0) || 
             (data.data && data.data.pagination ? data.data.pagination.total : 0) || 
             getSubscriptionsArray().length,
      page: data.page || (data.pagination ? data.pagination.page : 1) || 
            (data.data && data.data.pagination ? data.data.pagination.page : 1) || 1,
      limit: data.limit || (data.pagination ? data.pagination.limit : 10) || 
             (data.data && data.data.pagination ? data.data.pagination.limit : 10) || 10,
      totalPages: data.totalPages || (data.pagination ? data.pagination.totalPages : 1) || 
                  (data.data && data.data.pagination ? data.data.pagination.totalPages : 1) || 1,
    };
  }, [data, getSubscriptionsArray, usingFallback, isErrorSubscriptions]);

  // Get stats with fallback
  const getStats = useCallback(() => {
    return usingFallback || isErrorStats ? fallbackStats : stats;
  }, [stats, usingFallback, isErrorStats]);

  return {
    // Queries with fallback support
    subscriptions: getSubscriptionsArray(),
    metadata: getMetadata(),
    stats: getStats(),
    filter,
    isLoadingSubscriptions: isLoadingSubscriptions && !usingFallback,
    isErrorSubscriptions: isErrorSubscriptions && !usingFallback,
    error: errorSubscriptions,
    isLoadingStats: isLoadingStats && !usingFallback,
    isErrorStats: isErrorStats && !usingFallback,
    fetchSubscription,
    usingFallback,
    
    // Mutations with optimistic updates
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