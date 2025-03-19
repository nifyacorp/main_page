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
  async getSubscriptions(params?: SubscriptionListParams): Promise<SubscriptionListResponse> {
    try {
      const response = await apiClient.get('/v1/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
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
      const response = await apiClient.post('/v1/subscriptions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
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
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySource: Record<string, number>;
    byFrequency: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get('/v1/subscriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();