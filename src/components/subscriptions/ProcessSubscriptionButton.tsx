import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { ProcessingStatusTracker } from './ProcessingStatusTracker';

interface ProcessSubscriptionButtonProps {
  subscriptionId: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onProcessed?: () => void;
  className?: string;
}

export function ProcessSubscriptionButton({
  subscriptionId,
  variant = 'default',
  size = 'default',
  onProcessed,
  className = '',
}: ProcessSubscriptionButtonProps) {
  const { processSubscription } = useSubscriptions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatusTracker, setShowStatusTracker] = useState(false);

  // Handler for processing the subscription
  const handleProcess = async () => {
    if (!subscriptionId) return;
    
    setIsProcessing(true);
    
    try {
      await processSubscription.mutateAsync(subscriptionId);
      setShowStatusTracker(true);
    } catch (error) {
      console.error('Error processing subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for when processing completes
  const handleProcessingComplete = () => {
    if (onProcessed) {
      onProcessed();
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleProcess}
        disabled={isProcessing || processSubscription.isLoading}
      >
        {(isProcessing || processSubscription.isLoading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Process Now
          </>
        )}
      </Button>
      
      {showStatusTracker && (
        <ProcessingStatusTracker
          subscriptionId={subscriptionId}
          onComplete={handleProcessingComplete}
        />
      )}
    </div>
  );
} 