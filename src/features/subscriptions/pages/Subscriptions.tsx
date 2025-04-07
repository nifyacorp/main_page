import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionsList from '../components/SubscriptionsList';
import SubscriptionFilter from '../components/SubscriptionFilter';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSubscriptionsEnhanced } from '../hooks/use-subscriptions';
import { useOrganizedSubscriptionTypes } from '../hooks/use-subscription-types';
import { SubscriptionFilterParams } from '../services/subscription-service';

const SubscriptionsPage: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<SubscriptionFilterParams>({
    page: 1,
    limit: 10,
    sort: 'created_at',
    order: 'desc',
  });
  
  // Fetch subscriptions with filters
  const {
    subscriptions,
    isLoading,
    error,
    activeSubscriptions,
    pendingSubscriptions,
    processingSubscriptions,
    errorSubscriptions,
    pagination,
  } = useSubscriptionsEnhanced(filters);
  
  // Fetch subscription types for filter options
  const { categories, typesByCategory } = useOrganizedSubscriptionTypes();
  
  // Create type options for filter
  const typeOptions = categories.map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    value: category,
  }));
  
  // Function to generate pagination links
  const generatePaginationLinks = () => {
    if (!pagination || pagination.pageCount <= 1) return null;
    
    const currentPage = pagination.page;
    const totalPages = pagination.pageCount;
    
    const links = [];
    
    // Previous button
    links.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) {
              setFilters({ ...filters, page: currentPage - 1 });
            }
          }}
          isDisabled={currentPage === 1}
        />
      </PaginationItem>
    );
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      links.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setFilters({ ...filters, page: 1 });
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        links.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setFilters({ ...filters, page: i });
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        links.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      links.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setFilters({ ...filters, page: totalPages });
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    links.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
              setFilters({ ...filters, page: currentPage + 1 });
            }
          }}
          isDisabled={currentPage === totalPages}
        />
      </PaginationItem>
    );
    
    return links;
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis suscripciones</h1>
        <Button asChild>
          <Link to="/subscriptions/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva suscripción
          </Link>
        </Button>
      </div>
      
      <SubscriptionFilter
        filters={filters}
        setFilters={setFilters}
        typeOptions={typeOptions}
        onApplyFilters={() => {}}
      />
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Activas ({activeSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({pendingSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Procesando ({processingSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="error">
            Error ({errorSubscriptions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <SubscriptionsList
            subscriptions={subscriptions}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <SubscriptionsList
            subscriptions={activeSubscriptions}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <SubscriptionsList
            subscriptions={pendingSubscriptions}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="processing" className="mt-6">
          <SubscriptionsList
            subscriptions={processingSubscriptions}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="error" className="mt-6">
          <SubscriptionsList
            subscriptions={errorSubscriptions}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
      </Tabs>
      
      {pagination && pagination.pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            {generatePaginationLinks()}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SubscriptionsPage;