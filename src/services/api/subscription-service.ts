import apiClient, { ApiError } from './axios-config';

// Type definitions
export interface Subscription {
  id: string;
  name: string;
  description?: string;
  source: string;
  keywords: string[];
  categories?: string[];
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  notificationType: 'email' | 'push' | 'both';
  filters?: {
    includePatterns?: string[];
    excludePatterns?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFormData {
  name: string;
  description?: string;
  source: string;
  keywords: string[];
  categories?: string[];
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  notificationType: 'email' | 'push' | 'both';
  filters?: {
    includePatterns?: string[];
    excludePatterns?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
}

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  frequency?: string;
  isActive?: boolean;
  sort?: string;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service for handling subscription-related API calls
 */
class SubscriptionService {
  /**
   * Fetch all subscriptions with optional filtering
   */
  async getSubscriptions(params?: SubscriptionListParams): Promise<{ subscriptions: Subscription[]; total: number; page: number; limit: number; totalPages: number; error?: string }> {
    try {
      const response = await apiClient.get('/v1/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'Unable to load subscriptions. Please try again later.';
      
      if (error.response && error.response.data) {
        const { message, code } = error.response.data;
        if (message) {
          errorMessage = message;
        } else if (code === 'SUBSCRIPTION_FETCH_ERROR') {
          errorMessage = 'There was a problem fetching your subscriptions. The service might be temporarily unavailable.';
        }
      }
      
      // Return a user-friendly error but with empty subscriptions array to prevent UI crashes
      return {
        subscriptions: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Fetch a single subscription by ID
   */
  async getSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.get(`/v1/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: SubscriptionFormData): Promise<Subscription> {
    try {
      // Format data to match backend API schema
      const formattedData = {
        name: data.name,
        description: data.description || '',
        type: data.source.toLowerCase() === 'boe' ? 'boe' : 
               data.source.toLowerCase() === 'doga' ? 'doga' : 'custom',
        prompts: Array.isArray(data.keywords) ? data.keywords : [data.keywords],
        logo: data.logo || 'https://nifya.com/assets/logo.png',
        frequency: data.frequency === 'realtime' ? 'immediate' : 
                   data.frequency.toLowerCase() === 'weekly' ? 'daily' : 
                   data.frequency.toLowerCase() === 'monthly' ? 'daily' : 
                   data.frequency.toLowerCase(),
        // Add any other required fields
        typeId: data.typeId
      };

      console.log('Formatted subscription data for API:', formattedData);
      
      const response = await apiClient.post('/v1/subscriptions', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      // Extract and throw more helpful error messages
      if (error.response && error.response.data) {
        const { message, code, details } = error.response.data;
        
        if (details) {
          // Format validation errors
          const validationErrors = Object.entries(details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          
          throw new Error(`Validation failed: ${validationErrors}`);
        } else if (message) {
          throw new Error(message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(id: string, data: SubscriptionFormData): Promise<Subscription> {
    try {
      const response = await apiClient.put(`/v1/subscriptions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/subscriptions/${id}`);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Process a subscription (manually trigger processing)
   */
  async processSubscription(id: string): Promise<{ message: string; jobId?: string }> {
    try {
      const response = await apiClient.post(`/v1/subscriptions/${id}/process`);
      return response.data;
    } catch (error) {
      console.error(`Error processing subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle subscription active status
   */
  async toggleSubscriptionStatus(id: string, isActive: boolean): Promise<Subscription> {
    try {
      const response = await apiClient.patch(`/v1/subscriptions/${id}/toggle`, { active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling subscription status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Share a subscription with another user
   */
  async shareSubscription(id: string, email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/v1/subscriptions/${id}/share`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error sharing subscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get subscription statistics with fallback for failed requests
   */
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySource: Record<string, number>;
    byFrequency: Record<string, number>;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/v1/subscriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      // Return fallback data to prevent UI crashes
      return {
        total: 0,
        active: 0,
        inactive: 0,
        bySource: {},
        byFrequency: {},
        error: 'Unable to load subscription statistics. Please try again later.'
      };
    }
  }
}

export default new SubscriptionService();