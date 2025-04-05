import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Play, Edit, Trash, Bell, Loader2, CheckCircle, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Define the structure of a subscription object based on usage in Subscriptions.tsx
interface Subscription {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  source: string;
  keywords?: string[];
  prompts?: string[]; // Handle both keywords and prompts
  frequency: 'realtime' | 'immediate' | 'daily' | 'weekly' | 'monthly' | string; // Allow string for flexibility
}

interface SubscriptionCardProps {
  subscription: Subscription;
  emailNotificationsEnabled: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isDeleting: boolean;
  onProcess: (id: string) => void;
  onDelete: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  emailNotificationsEnabled,
  isProcessing,
  isCompleted,
  isDeleting,
  onProcess,
  onDelete,
}) => {
  const keywords = subscription.keywords || subscription.prompts || [];
  const frequencyText = 
    subscription.frequency === 'realtime' || subscription.frequency === 'immediate' ? 'Tiempo real' :
    subscription.frequency === 'daily' ? 'Diaria' :
    subscription.frequency === 'weekly' ? 'Semanal' :
    subscription.frequency === 'monthly' ? 'Mensual' : subscription.frequency; // Fallback to raw value

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start mb-2 gap-1">
          <div className="flex gap-1 items-center flex-wrap">
            <Badge variant={subscription.isActive ? "default" : "outline"}>
              {subscription.isActive ? "Activa" : "Inactiva"}
            </Badge>
            {emailNotificationsEnabled && (
              <Badge variant="outline" className="bg-primary/10 text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="flex-shrink-0">{subscription.source}</Badge>
        </div>
        <Link to={`/subscriptions/${subscription.id}`}>
          <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
            {subscription.name}
          </CardTitle>
        </Link>
        {subscription.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {subscription.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {keywords.length > 0 && (
           <div className="flex gap-1 flex-wrap mb-3">
             {keywords.slice(0, 3).map((keyword, i) => (
               <Badge key={i} variant="outline" className="bg-secondary/10">
                 {keyword}
               </Badge>
             ))}
             {keywords.length > 3 && (
               <Badge variant="outline" className="bg-secondary/10">
                 +{keywords.length - 3} más
               </Badge>
             )}
           </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>Frecuencia: {frequencyText}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 mt-auto">
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
          <Link to={`/subscriptions/${subscription.id}`} className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> Detalle
          </Link>
        </Button>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            title="Procesar ahora"
            disabled={isProcessing || isCompleted} // Disable if processing or just completed
            onClick={() => onProcess(subscription.id)}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title="Editar" asChild>
            <Link to={`/subscriptions/edit/${subscription.id}`}> {/* Fixed edit link */}
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                title="Eliminar"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive" // Ensure hover state is destructive too
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará la subscripción "{subscription.name}" permanentemente. 
                  No podrás deshacer esta acción.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(subscription.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Style delete action button
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard; 