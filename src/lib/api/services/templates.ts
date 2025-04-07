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