import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionType } from '../hooks/use-subscription-types';
import { 
  useSubscription, 
  useCreateSubscription, 
  useUpdateSubscription 
} from '../hooks/use-subscriptions';
import SubscriptionForm from '../components/SubscriptionForm';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../services/subscription-service';

interface SubscriptionPromptPageProps {
  mode: 'create' | 'edit';
}

const SubscriptionPromptPage: React.FC<SubscriptionPromptPageProps> = ({
  mode,
}) => {
  const navigate = useNavigate();
  const { typeId, id } = useParams<{ typeId?: string; id?: string }>();
  
  // For create mode, get subscription type
  const { 
    data: subscriptionType, 
    isLoading: isTypeLoading, 
    error: typeError 
  } = useSubscriptionType(mode === 'create' ? typeId || '' : '');
  
  // For edit mode, get subscription
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    error: subscriptionError
  } = useSubscription(mode === 'edit' ? id || '' : '');
  
  // For edit mode, get subscription type based on subscription
  const {
    data: editSubscriptionType,
    isLoading: isEditTypeLoading,
  } = useSubscriptionType(
    mode === 'edit' && subscription
      ? subscription.subscription_type_id
      : ''
  );
  
  // Create and update mutations
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription(id || '');
  
  // Loading state
  const isLoading = 
    (mode === 'create' && isTypeLoading) || 
    (mode === 'edit' && (isSubscriptionLoading || isEditTypeLoading)) ||
    createSubscription.isPending ||
    updateSubscription.isPending;
  
  // Error state
  const error = mode === 'create' ? typeError : subscriptionError;
  
  // Handle form submission
  const handleSubmit = async (formData: CreateSubscriptionDto | UpdateSubscriptionDto) => {
    try {
      if (mode === 'create') {
        const result = await createSubscription.mutateAsync(formData as CreateSubscriptionDto);
        navigate(`/subscriptions/${result.data?.subscription.id}`);
      } else if (mode === 'edit' && id) {
        await updateSubscription.mutateAsync(formData as UpdateSubscriptionDto);
        navigate(`/subscriptions/${id}`);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} subscription:`, error);
    }
  };
  
  // Determine active subscription type
  const activeSubscriptionType = mode === 'create' 
    ? subscriptionType 
    : editSubscriptionType;
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/subscriptions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Nueva suscripción' : 'Editar suscripción'}
          </h1>
        </div>
        
        <Card className="border-destructive max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">
              {mode === 'create' 
                ? 'Error al cargar el tipo de suscripción' 
                : 'Error al cargar la suscripción'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message || 'Ha ocurrido un error desconocido'}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/subscriptions">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Volver</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Nueva suscripción' : 'Editar suscripción'}
        </h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isLoading 
              ? <Skeleton className="h-6 w-2/3" /> 
              : (mode === 'create' 
                ? `Crear suscripción de ${activeSubscriptionType?.name || ''}` 
                : `Editar ${subscription?.name || ''}`)}
          </CardTitle>
          <CardDescription>
            {isLoading 
              ? <Skeleton className="h-4 w-full" /> 
              : (mode === 'create'
                ? 'Configura los parámetros para tu nueva suscripción'
                : 'Modifica los parámetros de tu suscripción')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !activeSubscriptionType ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : activeSubscriptionType ? (
            <SubscriptionForm
              subscriptionType={activeSubscriptionType}
              initialValues={mode === 'edit' ? subscription : undefined}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isEdit={mode === 'edit'}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No se pudo cargar el formulario de suscripción.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPromptPage;