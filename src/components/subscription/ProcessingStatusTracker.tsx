import { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

interface ProcessingStatusTrackerProps {
  subscriptionId: string;
  onComplete?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ProcessingStatusTracker({
  subscriptionId,
  onComplete,
  showDetails = true,
  className = '',
}: ProcessingStatusTrackerProps) {
  // Use the subscription status hook with 3 second polling interval
  const {
    processingStatus,
    isLoading,
    isError,
    isPolling,
    pollCount,
    startPolling,
    stopPolling,
    resetPolling,
  } = useSubscriptionStatus(subscriptionId, 3000, true);

  const [expanded, setExpanded] = useState(false);

  // Callback for completion
  useEffect(() => {
    if (processingStatus.status === 'completed' && onComplete) {
      onComplete();
    }
  }, [processingStatus.status, onComplete]);

  // Status indicator icon
  const StatusIcon = () => {
    switch (processingStatus.status) {
      case 'processing':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="mr-2 h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="mr-2 h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />;
    }
  };

  // Status messages
  function getStatusMessage() {
    switch (processingStatus.status) {
      case 'processing':
        return 'Your subscription is being processed...';
      case 'completed':
        return 'Processing completed successfully!';
      case 'failed':
        return `Processing failed: ${processingStatus.error || 'Unknown error'}`;
      case 'pending':
        return 'Waiting to start processing...';
      default:
        return 'Unknown processing status';
    }
  }

  // Format dates
  function formatDate(dateString?: string) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return `${format(date, 'PPpp')} (${formatDistance(date, new Date(), { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  }

  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <StatusIcon />
          <span className="font-medium">{getStatusMessage()}</span>
        </div>
        <div className="flex gap-2">
          {showDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
          {!isPolling ? (
            <Button variant="outline" size="sm" onClick={startPolling}>
              Check Status
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={stopPolling}>
              Stop Checking
            </Button>
          )}
        </div>
      </div>

      {expanded && showDetails && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Status:</span>
            <span className="capitalize">{processingStatus.status}</span>
            
            <span className="font-medium">Last run:</span>
            <span>{formatDate(processingStatus.last_run_at)}</span>
            
            <span className="font-medium">Next scheduled run:</span>
            <span>{formatDate(processingStatus.next_run_at)}</span>
            
            {processingStatus.error && (
              <>
                <span className="font-medium">Error:</span>
                <span className="text-red-500">{processingStatus.error}</span>
              </>
            )}
            
            <span className="font-medium">Processing ID:</span>
            <span className="font-mono text-xs">
              {processingStatus.processing_id || 'N/A'}
            </span>
            
            <span className="font-medium">Poll count:</span>
            <span>{pollCount}</span>
          </div>
          
          {processingStatus.metadata && (
            <div className="mt-2">
              <details className="cursor-pointer">
                <summary className="font-medium">Metadata</summary>
                <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(processingStatus.metadata, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={resetPolling}>
              Refresh Status
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}