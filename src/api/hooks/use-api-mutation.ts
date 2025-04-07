import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import apiClient, { ApiResponse } from '../clients/api-client';
import { toast } from '@/components/ui/use-toast';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiMutationOptions<TData, TVariables> extends 
  Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  method?: HttpMethod;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: ApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const {
    method = 'POST',
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operación completada con éxito',
    errorMessage = 'Error al procesar la solicitud',
    ...mutationOptions
  } = options || {};

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      let response: ApiResponse<TData>;

      switch (method) {
        case 'POST':
          response = await apiClient.post<TData>(url, variables);
          break;
        case 'PUT':
          response = await apiClient.put<TData>(url, variables);
          break;
        case 'PATCH':
          response = await apiClient.patch<TData>(url, variables);
          break;
        case 'DELETE':
          response = await apiClient.delete<TData>(`${url}${variables ? `/${variables}` : ''}`);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      return response.data as TData;
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast({
          title: successMessage,
          variant: 'default',
        });
      }

      // Call the original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error(`API mutation error for ${method} ${url}:`, error);

      if (showErrorToast) {
        toast({
          title: errorMessage,
          description: error.message,
          variant: 'destructive',
        });
      }

      // Call the original onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export default useApiMutation;