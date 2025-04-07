import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import apiClient, { ApiResponse } from '../clients/api-client';
import { toast } from '@/components/ui/use-toast';

export interface ApiQueryOptions<TData> extends Omit<UseQueryOptions<ApiResponse<TData>, Error, TData>, 'queryFn'> {
  showErrorToast?: boolean;
  errorMessage?: string;
}

export function useApiQuery<TData>(
  url: string,
  params?: Record<string, unknown>,
  options?: ApiQueryOptions<TData>
): UseQueryResult<TData, Error> {
  const {
    showErrorToast = true,
    errorMessage = 'Error al cargar datos',
    select,
    ...queryOptions
  } = options || {};

  return useQuery<ApiResponse<TData>, Error, TData>({
    queryKey: [url, params],
    queryFn: async () => {
      return apiClient.get<TData>(url, params);
    },
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Error desconocido');
      }
      return response.data as TData;
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 2; // Retry other errors up to 2 times
    },
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    ...queryOptions,
    onError: (error) => {
      console.error(`API query error for ${url}:`, error);
      
      if (showErrorToast) {
        toast({
          title: errorMessage,
          description: error.message,
          variant: 'destructive',
        });
      }
      
      // Call the original onError if provided
      if (queryOptions.onError) {
        queryOptions.onError(error);
      }
    },
  });
}

export default useApiQuery;