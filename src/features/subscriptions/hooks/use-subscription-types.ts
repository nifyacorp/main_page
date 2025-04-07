import { useQuery } from '@tanstack/react-query';
import subscriptionService, { SubscriptionType } from '../services/subscription-service';

// Query keys
export const subscriptionTypeKeys = {
  all: ['subscription-types'] as const,
  lists: () => [...subscriptionTypeKeys.all, 'list'] as const,
  details: () => [...subscriptionTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionTypeKeys.details(), id] as const,
};

// Hook for fetching all subscription types
export const useSubscriptionTypes = () => {
  return useQuery({
    queryKey: subscriptionTypeKeys.lists(),
    queryFn: () => subscriptionService.getSubscriptionTypes(),
    select: (data) => data.data?.types || [],
    staleTime: 300000, // 5 minutes since types change rarely
  });
};

// Hook for fetching a single subscription type
export const useSubscriptionType = (id: string) => {
  return useQuery({
    queryKey: subscriptionTypeKeys.detail(id),
    queryFn: () => subscriptionService.getSubscriptionType(id),
    select: (data) => data.data?.type,
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

// Hook that provides organized subscription types
export const useOrganizedSubscriptionTypes = () => {
  const { data: types = [], isLoading, error } = useSubscriptionTypes();
  
  // Group by category
  const typesByCategory = types.reduce((acc, type) => {
    const category = type.type;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, SubscriptionType[]>);
  
  // Get unique categories
  const categories = Object.keys(typesByCategory);
  
  // Find type by ID
  const getTypeById = (id: string) => types.find(type => type.id === id);
  
  return {
    types,
    isLoading,
    error,
    typesByCategory,
    categories,
    getTypeById,
  };
};

export default useOrganizedSubscriptionTypes;