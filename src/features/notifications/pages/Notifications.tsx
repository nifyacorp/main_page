import React, { useState } from 'react';
import { CheckCheck, Filter, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import NotificationList from '../components/NotificationList';
import { useNotifications, NotificationFilters } from '../hooks/use-notification-context';

const NotificationsPage: React.FC = () => {
  const { 
    notifications,
    isLoading,
    error,
    totalCount,
    unreadCount,
    filters,
    setFilters,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Calculate pagination
  const pageSize = filters.limit || 20;
  const currentPage = filters.page || 1;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Filter by read status
  const unreadNotifications = notifications.filter(n => !n.read);
  
  // Filter by entity type
  const entityTypes = [...new Set(notifications.map(n => n.entity_type).filter(Boolean))];
  
  // Create pagination links
  const paginationLinks = () => {
    if (totalPages <= 1) return null;
    
    const links = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
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
    
    // First page and ellipsis
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
    
    // Last page and ellipsis
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {totalCount} notificaciones, {unreadCount} sin leer
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              <span>Marcar todas como leídas</span>
            </Button>
          )}
          
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtros</span>
                {(filters.entity_type || filters.unread_only || filters.start_date || filters.end_date) && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 h-5">
                    {Object.values(filters).filter(v => v !== undefined && typeof v !== 'number').length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar notificaciones</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mostrar</label>
                  <Select
                    value={filters.unread_only ? 'unread' : 'all'}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        unread_only: value === 'unread',
                        page: 1,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las notificaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las notificaciones</SelectItem>
                      <SelectItem value="unread">Solo no leídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {entityTypes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={filters.entity_type || ''}
                      onValueChange={(value) => {
                        setFilters({
                          ...filters,
                          entity_type: value || undefined,
                          page: 1,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        {entityTypes.map((type) => (
                          <SelectItem key={type} value={type || ''}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mostrar por página</label>
                  <Select
                    value={String(filters.limit || 20)}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        limit: Number(value),
                        page: 1,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="20 notificaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 notificaciones</SelectItem>
                      <SelectItem value="20">20 notificaciones</SelectItem>
                      <SelectItem value="50">50 notificaciones</SelectItem>
                      <SelectItem value="100">100 notificaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 20,
                      });
                      setIsFiltersOpen(false);
                    }}
                  >
                    Restablecer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsFiltersOpen(false);
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">
                <Inbox className="h-4 w-4 mr-2" />
                <span>Todas</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 sm:flex-none">
                <Badge variant="secondary" className="mr-2">
                  {unreadCount}
                </Badge>
                <span>No leídas</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={markAsRead}
                onDeleteNotification={deleteNotification}
                emptyMessage="No tienes notificaciones"
                maxHeight="max-h-[600px]"
              />
            </TabsContent>
            
            <TabsContent value="unread">
              <NotificationList
                notifications={unreadNotifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={markAsRead}
                onDeleteNotification={deleteNotification}
                emptyMessage="No tienes notificaciones sin leer"
                maxHeight="max-h-[600px]"
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {paginationLinks()}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default NotificationsPage;