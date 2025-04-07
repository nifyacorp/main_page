import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizedSubscriptionTypes } from '../hooks/use-subscription-types';
import SubscriptionTypeGrid from '../components/SubscriptionTypeGrid';

const NewSubscriptionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { types, isLoading, error, typesByCategory, categories } = useOrganizedSubscriptionTypes();
  
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
          <h1 className="text-3xl font-bold">Nueva suscripción</h1>
        </div>
        
        <Card className="border-destructive max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar tipos de suscripción</CardTitle>
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
        <h1 className="text-3xl font-bold">Nueva suscripción</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Selecciona el tipo de suscripción</CardTitle>
          <CardDescription>
            Elige el tipo de información que deseas monitorizar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="max-w-sm mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tipos de suscripción..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
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
          ) : searchQuery ? (
            <SubscriptionTypeGrid 
              types={types.filter(type => 
                type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                type.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                type.type.toLowerCase().includes(searchQuery.toLowerCase())
              )}
            />
          ) : (
            <Tabs defaultValue={categories[0] || 'all'}>
              <TabsList className="mb-6">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <SubscriptionTypeGrid types={typesByCategory[category] || []} />
                </TabsContent>
              ))}
              
              <TabsContent value="all">
                <SubscriptionTypeGrid types={types} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSubscriptionPage;