import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Home, 
  BookOpen, 
  Building, 
  Briefcase, 
  FileSearch,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { SubscriptionType } from '../services/subscription-service';

interface SubscriptionTypeGridProps {
  types: SubscriptionType[];
  isLoading?: boolean;
  error?: Error | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const SubscriptionTypeGrid: React.FC<SubscriptionTypeGridProps> = ({
  types,
  isLoading = false,
  error = null,
  searchQuery = '',
  setSearchQuery,
}) => {
  // Group types by category
  const typesByCategory = types.reduce((acc, type) => {
    const category = type.type;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, SubscriptionType[]>);
  
  // Filter types by search query
  const filteredTypes = searchQuery
    ? types.filter(type => 
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : types;
  
  // Get icon for type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'boe':
        return <FileText className="h-5 w-5" />;
      case 'real-estate':
        return <Home className="h-5 w-5" />;
      case 'legal':
        return <BookOpen className="h-5 w-5" />;
      case 'business':
        return <Building className="h-5 w-5" />;
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'public-records':
        return <FileSearch className="h-5 w-5" />;
      case 'grants':
        return <Award className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Get category name
  const getCategoryName = (category: string) => {
    switch (category.toLowerCase()) {
      case 'boe':
        return 'Boletín Oficial del Estado';
      case 'real-estate':
        return 'Inmobiliario';
      case 'legal':
        return 'Legal';
      case 'business':
        return 'Negocios';
      case 'job':
        return 'Empleo';
      case 'public-records':
        return 'Registros Públicos';
      case 'grants':
        return 'Subvenciones';
      default:
        return category;
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {setSearchQuery && (
          <div className="flex max-w-sm mx-auto">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="border-destructive max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Error al cargar tipos de suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message || 'Ha ocurrido un error desconocido'}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Render empty state
  if (types.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No hay tipos de suscripción disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se encontraron tipos de suscripción disponibles en este momento.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Render grid with search
  if (setSearchQuery) {
    return (
      <div className="space-y-8">
        <div className="max-w-sm mx-auto">
          <Input
            type="search"
            placeholder="Buscar tipos de suscripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {searchQuery ? (
          // Render filtered results
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTypes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
              </div>
            ) : (
              filteredTypes.map((type) => (
                <SubscriptionTypeCard key={type.id} type={type} />
              ))
            )}
          </div>
        ) : (
          // Render grouped by category
          <div className="space-y-12">
            {Object.entries(typesByCategory).map(([category, types]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(category)}
                  <h2 className="text-xl font-semibold">
                    {getCategoryName(category)}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {types.map((type) => (
                    <SubscriptionTypeCard key={type.id} type={type} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Render simple grid without search
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type) => (
        <SubscriptionTypeCard key={type.id} type={type} />
      ))}
    </div>
  );
};

// Subscription type card component
const SubscriptionTypeCard: React.FC<{ type: SubscriptionType }> = ({ type }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{type.name}</CardTitle>
        <CardDescription>
          {type.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground">
          {type.description || 'Sin descripción'}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/subscriptions/create/${type.id}`} className="flex items-center justify-center">
            <span>Crear suscripción</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionTypeGrid;