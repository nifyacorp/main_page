import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import subscriptionService, { 
  Subscription, 
  SubscriptionFilterParams,
  CreateSubscriptionDto,
  UpdateSubscriptionDto
} from '../services/subscription-service';
import { toast } from '@/components/ui/use-toast';

// Query keys
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (filters: SubscriptionFilterParams) => [...subscriptionKeys.lists(), filters] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
  statistics: () => [...subscriptionKeys.all, 'statistics'] as const,
};

// Hook for fetching subscriptions with filters
export const useSubscriptions = (filters?: SubscriptionFilterParams) => {
  return useQuery({
    queryKey: subscriptionKeys.list(filters || {}),
    queryFn: () => subscriptionService.getSubscriptions(filters),
    select: (data) => data.data,
    staleTime: 60000, // 1 minute
  });
};

// Hook for fetching a single subscription
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => subscriptionService.getSubscription(id),
    select: (data) => data.data?.subscription,
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

// Hook for subscription statistics
export const useSubscriptionStatistics = () => {
  return useQuery({
    queryKey: subscriptionKeys.statistics(),
    queryFn: () => subscriptionService.getSubscriptionStatistics(),
    select: (data) => data.data,
    staleTime: 300000, // 5 minutes
  });
};

// Hook for creating a subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionDto) => subscriptionService.createSubscription(data),
    onSuccess: () => {
      // Invalidate subscriptions list
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      toast({
        title: 'Suscripción creada',
        description: 'La suscripción ha sido creada exitosamente.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear suscripción',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating a subscription
export const useUpdateSubscription = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateSubscriptionDto) => subscriptionService.updateSubscription(id, data),
    onSuccess: () => {
      // Invalidate specific subscription and list
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      toast({
        title: 'Suscripción actualizada',
        description: 'La suscripción ha sido actualizada exitosamente.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar suscripción',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting a subscription
export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscriptionService.deleteSubscription(id),
    onSuccess: () => {
      // Invalidate subscriptions list
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      toast({
        title: 'Suscripción eliminada',
        description: 'La suscripción ha sido eliminada exitosamente.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar suscripción',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
        variant: 'destructive',
      });
    },
  });
};

// Hook for processing a subscription
export const useProcessSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscriptionService.processSubscription(id),
    onSuccess: (data, variables) => {
      // Invalidate specific subscription
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(variables) });
      toast({
        title: 'Procesamiento iniciado',
        description: 'La suscripción está siendo procesada.',
        variant: 'default',
      });
      
      // Optimistically update the subscription status
      queryClient.setQueryData(
        subscriptionKeys.detail(variables),
        (old: any) => {
          if (!old?.data?.subscription) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              subscription: {
                ...old.data.subscription,
                status: 'processing',
              },
            },
          };
        }
      );
    },
    onError: (error) => {
      toast({
        title: 'Error al procesar suscripción',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
        variant: 'destructive',
      });
    },
  });
};

// Enhanced subscription hook that provides computed values
export const useSubscriptionsEnhanced = (filters?: SubscriptionFilterParams) => {
  const { data, isLoading, error } = useSubscriptions(filters);
  
  // Extract subscriptions or default to empty array
  const subscriptions = data?.subscriptions || [];
  
  // Group subscriptions by type
  const subscriptionsByType = subscriptions.reduce((acc, subscription) => {
    const type = subscription.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(subscription);
    return acc;
  }, {} as Record<string, Subscription[]>);
  
  // Filter subscriptions by status
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const pendingSubscriptions = subscriptions.filter(sub => sub.status === 'pending');
  const processingSubscriptions = subscriptions.filter(sub => sub.status === 'processing');
  const errorSubscriptions = subscriptions.filter(sub => sub.status === 'error');
  
  // Function to get subscription status with more context
  const getSubscriptionStatus = (id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return null;
    
    return {
      status: subscription.status,
      lastProcessed: subscription.processed_at,
      error: subscription.error,
    };
  };
  
  return {
    subscriptions,
    isLoading,
    error,
    subscriptionsByType,
    activeSubscriptions,
    pendingSubscriptions,
    processingSubscriptions,
    errorSubscriptions,
    getSubscriptionStatus,
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      pageCount: Math.ceil(data.total / data.limit),
    } : null,
  };
};

export default useSubscriptionsEnhanced;