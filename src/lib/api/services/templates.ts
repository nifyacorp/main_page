import type { ApiResponse, Template, TemplatesResponse } from '../types';
import { backendClient } from '../clients/backend';

interface CreateTemplateInput {
  name: string;
  description: string;
  type: 'custom';
  prompts: string[];
  frequency: 'immediate' | 'daily';
  icon: string;
  isPublic: boolean;
  metadata: {
    category: string;
    source: string;
    [key: string]: any;
  };
}

interface SubscriptionResponse {
  subscription: {
    id: string;
    name: string;
    description: string;
    prompts: string[];
    logo: string;
    frequency: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const templateService = {
  list: async (page = 1, limit = 10): Promise<ApiResponse<TemplatesResponse>> => {
    return backendClient({
      endpoint: `/api/v1/templates?page=${page}&limit=${limit}`,
    });
  },

  getPublicTemplates: async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}): Promise<{ templates: any[] }> => {
    try {
      const response = await backendClient({
        endpoint: `/api/v1/templates/public?page=${page}&limit=${limit}`,
      });
      
      if (response.error) {
        console.error('Error fetching public templates:', response.error);
        // Return an empty array if there's an error
        return { templates: [] };
      }
      
      // If the API doesn't have templates yet, we'll return default templates
      if (!response.data?.templates || response.data.templates.length === 0) {
        // Default BOE Parser template
        return {
          templates: [
            {
              id: 'boe-parser-template',
              name: 'BOE Parser',
              description: 'Suscríbete a alertas del Boletín Oficial del Estado y recibe notificaciones cuando se publiquen documentos relevantes para ti.',
              type: 'boe',
              icon: 'FileText',
              isPublic: true,
              frequency: 'daily',
              prompts: [],
              metadata: {
                category: 'government',
                source: 'BOE',
              }
            }
          ]
        };
      }
      
      // Return the real templates from the API
      return { 
        templates: response.data.templates || [] 
      };
    } catch (error) {
      console.error('Failed to fetch public templates:', error);
      // Return default templates on error
      return {
        templates: [
          {
            id: 'boe-parser-template',
            name: 'BOE Parser',
            description: 'Suscríbete a alertas del Boletín Oficial del Estado y recibe notificaciones cuando se publiquen documentos relevantes para ti.',
            type: 'boe',
            icon: 'FileText',
            isPublic: true,
            frequency: 'daily',
            prompts: [],
            metadata: {
              category: 'government',
              source: 'BOE',
            }
          }
        ]
      };
    }
  },

  getDetails: async (templateId: string): Promise<ApiResponse<Template>> => {
    return backendClient({
      endpoint: `/api/v1/templates/${templateId}`,
    });
  },

  create: async (data: CreateTemplateInput): Promise<ApiResponse<Template>> => {
    return backendClient({
      endpoint: '/api/v1/templates',
      method: 'POST',
      body: data,
    });
  },

  subscribe: async (
    templateId: string,
    customization: {
      prompts?: string[];
      frequency?: 'immediate' | 'daily';
    }
  ): Promise<ApiResponse<SubscriptionResponse>> => {
    return backendClient({
      endpoint: `/api/v1/templates/${templateId}/subscribe`,
      method: 'POST',
      body: customization,
    });
  }
};

// Export a standalone getTemplate function that calls the getDetails method
export const getTemplate = async (templateId: string): Promise<ApiResponse<{ template: Template }>> => {
  const response = await templateService.getDetails(templateId);
  
  // Adjust the response format to match what SubscriptionPrompt.tsx expects
  if (response.data) {
    return {
      ...response,
      data: { template: response.data }
    };
  }
  
  return response as ApiResponse<{ template: Template }>;
};