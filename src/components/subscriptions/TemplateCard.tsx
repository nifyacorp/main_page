import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Newspaper, Bell, Plus, CheckCircle, Clock } from 'lucide-react';

// Map of icon names to Lucide React components
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Newspaper: <Newspaper className="h-6 w-6" />,
  Bell: <Bell className="h-6 w-6" />,
  Plus: <Plus className="h-6 w-6" />,
};

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    icon?: string;
    isPublic?: boolean;
    frequency?: string;
  };
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const { name, description, icon = 'FileText', type = 'custom', frequency = 'daily' } = template;
  
  const frequencyText = frequency === 'immediate' ? 'Inmediata' : 
                       frequency === 'daily' ? 'Diaria' : 
                       frequency === 'weekly' ? 'Semanal' : 'Personalizada';
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            {iconMap[icon] || <FileText className="h-6 w-6" />}
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="text-xs">Tipo: {type}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {description || `Plantilla para subscripciones de tipo ${type}`}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>Frecuencia: {frequencyText}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onSelect}
          data-testid={`template-select-button-${template.id}`}
        >
          Seleccionar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard; 