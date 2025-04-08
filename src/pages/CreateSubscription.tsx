import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { Progress } from "@/components/ui/progress";

export default function CreateSubscription() {
  const navigate = useNavigate();

  // Handle navigation back to subscriptions list
  const handleBack = () => {
    navigate("/subscriptions");
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Subscription</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set up notifications for official publications
              </p>
            </div>
          </div>
          <Bell className="h-8 w-8 text-primary opacity-50" />
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Progress value={33} className="w-full" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Step 1/3</span>
          </div>

          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <AlertTitle className="text-primary font-medium">Important Information</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              Your subscription will monitor official publications based on the criteria you specify.
              You'll be notified when new content matching your subscription is published.
            </AlertDescription>
          </Alert>

          <SubscriptionForm />
        </div>
      </div>
    </div>
  );
} 