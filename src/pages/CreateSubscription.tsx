import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";

export default function CreateSubscription() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold tracking-tight">Create Subscription</h1>
        </div>

        <p className="text-muted-foreground">
          Create a new subscription to monitor official publications based on your interests.
        </p>

        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Your subscription will monitor official publications based on the criteria you specify.
            You'll be notified when new content matching your subscription is published.
          </AlertDescription>
        </Alert>

        <SubscriptionForm />
      </div>
    </div>
  );
} 