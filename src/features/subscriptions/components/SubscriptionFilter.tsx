import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { SubscriptionFilterParams } from '../services/subscription-service';
import { format } from 'date-fns';

interface SubscriptionFilterProps {
  filters: SubscriptionFilterParams;
  setFilters: (filters: SubscriptionFilterParams) => void;
  typeOptions?: { label: string; value: string }[];
  onApplyFilters: () => void;
}

const SubscriptionFilter: React.FC<SubscriptionFilterProps> = ({
  filters,
  setFilters,
  typeOptions = [],
  onApplyFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<SubscriptionFilterParams>(filters);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  // Count active filters (excluding page, limit, sort, order)
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    return value !== undefined && !['page', 'limit', 'sort', 'order'].includes(key);
  }).length;
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput, page: 1 });
    onApplyFilters();
  };
  
  const handleFilterChange = (key: keyof SubscriptionFilterParams, value: any) => {
    setTempFilters({ ...tempFilters, [key]: value, page: 1 });
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
    onApplyFilters();
  };
  
  const resetFilters = () => {
    const resetState: SubscriptionFilterParams = {
      page: 1,
      limit: filters.limit,
    };
    setTempFilters(resetState);
    setFilters(resetState);
    setSearchInput('');
    setIsFilterOpen(false);
    onApplyFilters();
  };
  
  // Function to format date for display
  const formatDateFilter = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch (error) {
      return '';
    }
  };
  
  // Generate badges for active filters
  const getFilterBadges = () => {
    const badges = [];
    
    if (filters.status) {
      badges.push(
        <Badge key="status" variant="outline" className="flex items-center gap-1">
          <span>Estado: {filters.status}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const newFilters = { ...filters };
              delete newFilters.status;
              setFilters(newFilters);
              setTempFilters(newFilters);
              onApplyFilters();
            }}
          />
        </Badge>
      );
    }
    
    if (filters.type) {
      const typeLabel = typeOptions.find(opt => opt.value === filters.type)?.label || filters.type;
      badges.push(
        <Badge key="type" variant="outline" className="flex items-center gap-1">
          <span>Tipo: {typeLabel}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const newFilters = { ...filters };
              delete newFilters.type;
              setFilters(newFilters);
              setTempFilters(newFilters);
              onApplyFilters();
            }}
          />
        </Badge>
      );
    }
    
    if (filters.search) {
      badges.push(
        <Badge key="search" variant="outline" className="flex items-center gap-1">
          <span>Búsqueda: {filters.search}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const newFilters = { ...filters };
              delete newFilters.search;
              setFilters(newFilters);
              setSearchInput('');
              onApplyFilters();
            }}
          />
        </Badge>
      );
    }
    
    if (filters.from_date) {
      badges.push(
        <Badge key="from_date" variant="outline" className="flex items-center gap-1">
          <span>Desde: {formatDateFilter(filters.from_date)}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const newFilters = { ...filters };
              delete newFilters.from_date;
              setFilters(newFilters);
              setTempFilters(newFilters);
              onApplyFilters();
            }}
          />
        </Badge>
      );
    }
    
    if (filters.to_date) {
      badges.push(
        <Badge key="to_date" variant="outline" className="flex items-center gap-1">
          <span>Hasta: {formatDateFilter(filters.to_date)}</span>
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const newFilters = { ...filters };
              delete newFilters.to_date;
              setFilters(newFilters);
              setTempFilters(newFilters);
              onApplyFilters();
            }}
          />
        </Badge>
      );
    }
    
    return badges;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar suscripciones..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar suscripciones</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select
                    value={tempFilters.status || ''}
                    onValueChange={(value) => 
                      handleFilterChange('status', value === '' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {typeOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={tempFilters.type || ''}
                      onValueChange={(value) => 
                        handleFilterChange('type', value === '' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Desde</label>
                    <DatePicker
                      value={tempFilters.from_date ? new Date(tempFilters.from_date) : undefined}
                      onChange={(date) => {
                        if (date) {
                          handleFilterChange('from_date', date.toISOString());
                        } else {
                          const newFilters = { ...tempFilters };
                          delete newFilters.from_date;
                          setTempFilters(newFilters);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hasta</label>
                    <DatePicker
                      value={tempFilters.to_date ? new Date(tempFilters.to_date) : undefined}
                      onChange={(date) => {
                        if (date) {
                          handleFilterChange('to_date', date.toISOString());
                        } else {
                          const newFilters = { ...tempFilters };
                          delete newFilters.to_date;
                          setTempFilters(newFilters);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Resetear
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select
            value={filters.sort ? `${filters.sort}:${filters.order || 'desc'}` : 'created_at:desc'}
            onValueChange={(value) => {
              const [sort, order] = value.split(':');
              const newFilters = { ...filters, sort, order: order as 'asc' | 'desc' };
              setFilters(newFilters);
              setTempFilters(newFilters);
              onApplyFilters();
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                <SelectItem value="created_at:desc">Más recientes</SelectItem>
                <SelectItem value="created_at:asc">Más antiguos</SelectItem>
                <SelectItem value="name:asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="name:desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="type:asc">Tipo (A-Z)</SelectItem>
                <SelectItem value="type:desc">Tipo (Z-A)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {getFilterBadges()}
          
          {activeFilterCount > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={resetFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionFilter;