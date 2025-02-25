import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, Brain, ChevronRight, Search, Plus, Clock, Zap, Lock, Globe } from 'lucide-react';
import { templates } from '../lib/api';
import type { Template } from '../lib/api/types';
import type { IconType } from 'lucide-react';

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const iconMap: Record<string, IconType> = {
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
    frequency: 'immediate' as const,
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
        const { data, error } = await templates.list(currentPage, itemsPerPage);
        
        if (error) throw new Error(error);
        
        if (data) {
          setTemplateList(data.templates);
          setPagination(data.pagination);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
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
      const { error } = await templates.create(newTemplate);
      if (error) throw new Error(error);
      
      setShowCreateModal(false);
      // Refresh template list
      setCurrentPage(1);
      const { data, error: fetchError } = await templates.list(1, itemsPerPage);
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Catálogo de Suscripciones</h1>
            <p className="text-muted-foreground">
              Encuentra la suscripción perfecta para tus necesidades
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Template</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar suscripción..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Template Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <div className="h-6 w-6 bg-primary/20 rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = iconMap[template.icon] || Brain;
              
              return (
                <div
                  key={template.id}
                  className="p-6 rounded-lg border bg-card hover:bg-muted/50 transition-all group cursor-pointer"
                  onClick={() => navigate(`/templates/${template.id}/configure`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {template.frequency === 'immediate' ? (
                            <>
                              <Zap className="h-3 w-3" />
                              Inmediata
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Diaria
                            </>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {template.prompts.length} {template.prompts.length === 1 ? 'prompt' : 'prompts'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {template.isPublic ? (
                            <>
                              <Globe className="h-3 w-3" />
                              Público
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Privado
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No se encontraron suscripciones que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 rounded border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
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