import apiClient from '../clients/axios-config';
import { Template } from '../types';

/**
 * Service for handling template-related API calls
 */
class TemplateService {
  /**
   * Get all available templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await apiClient.get<Template[]>('/v1/templates');
      return response.data;
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<Template> {
    try {
      const response = await apiClient.get<Template>(`/v1/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get template ${id} error:`, error);
      throw error;
    }
  }
}

export default new TemplateService(); 