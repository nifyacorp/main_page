import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { useQuery } from "@tanstack/react-query";
import subscriptionService from "@/services/api/subscription-service";

export default function EditSubscription() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Directly use useQuery to fetch the subscription
  const { 
    data: subscription,
    isLoading,
    isError,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => subscriptionService.getSubscription(id || ""),
    enabled: !!id,
    staleTime: 30000,
    retry: 2,
  });

  // Check for error state
  useEffect(() => {
    if (!id) {
      setError("Subscription ID is missing");
    } else if (isError) {
      setError(subscriptionError?.message || "Failed to load subscription");
    } else {
      setError(null);
    }
  }, [id, isError, subscriptionError]);

  // Handle navigation back to subscriptions list
  const handleBack = () => {
    navigate("/subscriptions");
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Subscription</h1>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-full max-w-md" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <p className="text-muted-foreground">
              Update your subscription details below. Changes will be saved immediately.
            </p>
            {subscription && <SubscriptionForm initialData={subscription} isEditing={true} />}
          </>
        )}
      </div>
    </div>
  );
} 