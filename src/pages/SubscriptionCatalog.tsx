import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, Brain, ChevronRight, Search, Plus, Clock, Zap, Lock, Globe, AlertTriangle, X, LucideIcon } from 'lucide-react';
import { templateService, Template } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Building2,
  Brain,
};

const SubscriptionCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'custom' as const,
    prompts: [''],
    frequency: 'immediate' as 'immediate' | 'daily',
    icon: 'Brain',
    isPublic: false,
    metadata: {
      category: 'custom',
      source: 'user'
    }
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await templateService.list(currentPage, itemsPerPage);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data && data.templates) {
          setTemplateList(data.templates);
          setPagination(data.pagination);
        } else {
          setTemplateList([]);
          setError('No templates available');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load templates');
        setTemplateList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentPage]);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templateList;

    const query = searchQuery.toLowerCase();
    return templateList.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    );
  }, [searchQuery, templateList]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setCurrentPage(newPage);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const { error } = await templateService.create(newTemplate);
      if (error) throw new Error(error);
      
      setShowCreateModal(false);
      // Refresh template list
      setCurrentPage(1);
      const { data, error: fetchError } = await templateService.list(1, itemsPerPage);
      if (fetchError) throw new Error(fetchError);
      if (data) {
        setTemplateList(data.templates);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/subscriptions/new/${templateId}`);
  };

  const renderTemplate = (template: Template) => {
    const Icon = iconMap[template.icon] || Brain;
    
    return (
      <Card key={template.id} className="h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <Badge variant={template.isPublic ? "secondary" : "outline"}>
              {template.isPublic ? "Público" : "Privado"}
            </Badge>
          </div>
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {template.frequency === 'immediate' ? 'Tiempo real' : 
               template.frequency === 'daily' ? 'Diaria' : 
               template.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
            </span>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {template.metadata?.category && (
              <Badge variant="outline" className="bg-secondary/10">
                {template.metadata.category}
              </Badge>
            )}
            {template.metadata?.source && (
              <Badge variant="outline" className="bg-secondary/10">
                {template.metadata.source}
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 mt-auto">
          <Button 
            className="w-full" 
            onClick={() => handleSelectTemplate(template.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Suscripción
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Catálogo de Suscripciones</h1>
            <p className="text-muted-foreground">
              Encuentra la suscripción perfecta para tus necesidades
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Template</span>
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error cargando templates</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar suscripción..."
            className="w-full pl-10 pr-4 py-3"
          />
        </div>

        {/* Template Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card animate-pulse h-64">
                <div className="h-6 bg-muted rounded mb-4 w-1/3"></div>
                <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                <div className="h-4 bg-muted rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-muted rounded mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-card">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No se encontraron resultados</h3>
            <p className="text-muted-foreground">
              No hay plantillas que coincidan con tu búsqueda
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => renderTemplate(template))}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &larr; Anterior
                  </Button>
                  
                  <div className="flex items-center px-4 text-sm">
                    Página {currentPage} de {pagination.totalPages}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Siguiente &rarr;
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative bg-card w-full max-w-lg rounded-lg border p-6 shadow-lg">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-semibold mb-4">Crear Nuevo Template</h2>

              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prompts por defecto
                  </label>
                  <div className="space-y-2">
                    {newTemplate.prompts.map((prompt, index) => (
                      <input
                        key={index}
                        type="text"
                        value={prompt}
                        onChange={(e) => {
                          const newPrompts = [...newTemplate.prompts];
                          newPrompts[index] = e.target.value;
                          setNewTemplate(prev => ({
                            ...prev,
                            prompts: newPrompts
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Prompt por defecto..."
                      />
                    ))}
                    {newTemplate.prompts.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setNewTemplate(prev => ({
                          ...prev,
                          prompts: [...prev.prompts, '']
                        }))}
                        className="text-sm text-primary hover:underline"
                      >
                        + Añadir prompt
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frecuencia por defecto
                  </label>
                  <select
                    value={newTemplate.frequency}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      frequency: e.target.value as 'immediate' | 'daily'
                    }))}
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="immediate">Inmediata</option>
                    <option value="daily">Diaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Icono
                  </label>
                  <select
                    value={newTemplate.icon}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      icon: e.target.value
                    }))}
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Brain">Cerebro</option>
                    <option value="FileText">Documento</option>
                    <option value="Building2">Edificio</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTemplate.isPublic}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      isPublic: e.target.checked
                    }))}
                    className="rounded border-primary text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Hacer público este template
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {creating ? 'Creando...' : 'Crear Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCatalog;