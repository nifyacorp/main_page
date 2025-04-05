import React from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'; // Using Shadcn Select

interface SubscriptionFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filterSource: string;
  onFilterSourceChange: (source: string) => void;
}

const SubscriptionFilterBar: React.FC<SubscriptionFilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  filterSource,
  onFilterSourceChange,
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-3">
        <Input
          type="search"
          placeholder="Buscar subscripciones..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full"
          aria-label="Buscar subscripciones"
        />
      </div>
      <div>
        <Select value={filterSource} onValueChange={onFilterSourceChange}>
          <SelectTrigger className="w-full" aria-label="Filtrar por fuente">
            <SelectValue placeholder="Todas las fuentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fuentes</SelectItem>
            <SelectItem value="boe">BOE</SelectItem>
            <SelectItem value="doga">DOGA</SelectItem>
            {/* Add other sources dynamically if possible in the future */}
            <SelectItem value="other">Otras</SelectItem> 
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SubscriptionFilterBar; 