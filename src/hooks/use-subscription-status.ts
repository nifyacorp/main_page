import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import subscriptionService from '@/services/api/subscription-service';

/**
 * Custom hook for tracking subscription processing status
 * @param subscriptionId - The ID of the subscription to track
 * @param pollingInterval - Optional polling interval in milliseconds (default: 5000ms)
 * @param initialFetch - Whether to fetch immediately on mount (default: true)
 */
export function useSubscriptionStatus(
  subscriptionId: string | null,
  pollingInterval: number = 5000,
  initialFetch: boolean = true
) {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(initialFetch);
  const [pollCount, setPollCount] = useState(0);
  const [autoStopAfter, setAutoStopAfter] = useState(12); // Default to stop after 12 polls (1 minute at 5s intervals)

  // Define the status query
  const {
    data: processingStatus,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['subscriptionStatus', subscriptionId],
    queryFn: () => 
      subscriptionId ? subscriptionService.getProcessingStatus(subscriptionId) : Promise.resolve(null),
    enabled: !!subscriptionId && isPolling,
    refetchInterval: isPolling ? pollingInterval : false,
    refetchOnWindowFocus: isPolling,
    onSuccess: (data) => {
      console.log(`[Status Poll ${pollCount}] Status:`, data?.status);
      
      // If we're polling and get a "completed" or "failed" status, or reach the max count, stop polling
      if (isPolling && 
          (data?.status === 'completed' || data?.status === 'failed' || pollCount >= autoStopAfter)) {
        console.log(`Auto-stopping status polling after ${pollCount} polls. Status: ${data?.status}`);
        setIsPolling(false);
      } else if (isPolling) {
        // Increment poll count if we're still polling
        setPollCount((prev) => prev + 1);
      }
    },
    onError: (err) => {
      // If we get an error while polling, log it but don't stop polling for expected errors
      console.log(`Error during status poll ${pollCount}:`, err?.message || 'Unknown error');
      
      // Check if this is a 500 error which is expected while schema is being migrated
      const is500Error = err?.status === 500 || 
                         err?.response?.status === 500 ||
                         (err?.message && err.message.includes('500'));
      
      // Only stop polling for unexpected errors and after several attempts
      if (!is500Error && pollCount >= 5) {
        console.log(`Auto-stopping status polling after ${pollCount} polls due to unexpected errors`);
        setIsPolling(false);
      } else {
        // For expected errors like 500s from schema updates, keep polling but increase count
        setPollCount((prev) => prev + 1);
      }
    },
  });

  // Function to start polling
  const startPolling = useCallback(() => {
    console.log(`Starting status polling for subscription ${subscriptionId}`);
    setPollCount(0);
    setIsPolling(true);
    // Force immediate refetch when starting polling
    refetch();
  }, [subscriptionId, refetch]);

  // Function to stop polling
  const stopPolling = useCallback(() => {
    console.log(`Stopping status polling for subscription ${subscriptionId}`);
    setIsPolling(false);
  }, [subscriptionId]);

  // Function to reset polling (stop and then start again)
  const resetPolling = useCallback(() => {
    console.log(`Resetting status polling for subscription ${subscriptionId}`);
    setPollCount(0);
    setIsPolling(true);
    // Force immediate refetch when resetting polling
    refetch();
  }, [subscriptionId, refetch]);

  // Update polling configuration
  const updatePollingConfig = useCallback((maxPolls: number) => {
    setAutoStopAfter(maxPolls);
  }, []);

  // Clean up on unmount or when subscription ID changes
  useEffect(() => {
    return () => {
      // Clean up by invalidating the query when component unmounts
      if (subscriptionId) {
        queryClient.invalidateQueries(['subscriptionStatus', subscriptionId]);
      }
    };
  }, [subscriptionId, queryClient]);

  return {
    processingStatus: processingStatus || { status: 'unknown' },
    isLoading,
    isError,
    error,
    isPolling,
    pollCount,
    startPolling,
    stopPolling,
    resetPolling,
    updatePollingConfig,
    refetch,
    isRefetching,
  };
}