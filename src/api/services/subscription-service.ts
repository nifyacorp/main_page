import apiClient from '../clients/axios-config';

export interface Subscription {
  id: string;
  name: string;
  description: string;
  userId: string;
  type: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  frequency: 'daily' | 'hourly' | 'immediate';
  parameters: Record<string, any>;
  templateId?: string;
  resultsCount: number;
  notificationCount: number;
  lastNotification?: string;
  metadata?: {
    keywords?: string[];
    regions?: string[];
    categories?: string[];
    [key: string]: any;
  };
}

export interface SubscriptionCreateInput {
  name: string;
  description?: string;
  type: string;
  parameters: Record<string, any>;
  templateId?: string;
  frequency?: 'daily' | 'hourly' | 'immediate';
  metadata?: {
    keywords?: string[];
    regions?: string[];
    categories?: string[];
    [key: string]: any;
  };
}

export interface SubscriptionUpdateInput {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  parameters?: Record<string, any>;
  frequency?: 'daily' | 'hourly' | 'immediate';
  metadata?: {
    keywords?: string[];
    regions?: string[];
    categories?: string[];
    [key: string]: any;
  };
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface SubscriptionFilterOptions {
  status?: 'active' | 'inactive' | 'pending' | 'error' | 'all';
  type?: string;
  search?: string;
  limit?: number;
  page?: number;
  sort?: 'newest' | 'oldest' | 'alphabetical';
}

/**
 * Service for handling subscription-related API calls
 */
class SubscriptionService {
  /**
   * Get subscriptions with pagination and filtering
   */
  async getSubscriptions(options: SubscriptionFilterOptions = {}): Promise<SubscriptionsResponse> {
    try {
      const {
        status,
        type,
        search,
        limit = 10,
        page = 1,
        sort = 'newest'
      } = options;
      
      // Build query parameters
      const params: Record<string, string> = {
        limit: limit.toString(),
        page: page.toString(),
        sort
      };
      
      // Add optional filters if present
      if (status && status !== 'all') {
        params.status = status;
      }
      
      if (type) {
        params.type = type;
      }
      
      if (search) {
        params.search = search;
      }
      
      const response = await apiClient.get<SubscriptionsResponse>('/v1/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Get subscriptions error:', error);
      throw error;
    }
  }

  /**
   * Get a single subscription by ID
   */
  async getSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.get<Subscription>(`/v1/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscription: SubscriptionCreateInput): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>('/v1/subscriptions', subscription);
      return response.data;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(id: string, subscription: SubscriptionUpdateInput): Promise<Subscription> {
    try {
      const response = await apiClient.patch<Subscription>(`/v1/subscriptions/${id}`, subscription);
      return response.data;
    } catch (error) {
      console.error(`Update subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/v1/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Activate a subscription
   */
  async activateSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.patch<Subscription>(`/v1/subscriptions/${id}/activate`, {});
      return response.data;
    } catch (error) {
      console.error(`Activate subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a subscription
   */
  async deactivateSubscription(id: string): Promise<Subscription> {
    try {
      const response = await apiClient.patch<Subscription>(`/v1/subscriptions/${id}/deactivate`, {});
      return response.data;
    } catch (error) {
      console.error(`Deactivate subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Run a subscription manually
   */
  async runSubscription(id: string): Promise<{ message: string; jobId: string }> {
    try {
      const response = await apiClient.post<{ message: string; jobId: string }>(`/v1/subscriptions/${id}/run`, {});
      return response.data;
    } catch (error) {
      console.error(`Run subscription ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Get subscription run history
   */
  async getSubscriptionRuns(
    id: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<{
    runs: {
      id: string;
      status: 'success' | 'failure' | 'pending';
      startedAt: string;
      completedAt?: string;
      resultsCount: number;
      error?: string;
    }[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    };
  }> {
    try {
      const { limit = 10, page = 1 } = options;
      
      const params = {
        limit: limit.toString(),
        page: page.toString()
      };
      
      const response = await apiClient.get(`/v1/subscriptions/${id}/runs`, { params });
      return response.data;
    } catch (error) {
      console.error(`Get subscription ${id} runs error:`, error);
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
    byType: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        active: number;
        inactive: number;
        byType: Record<string, number>;
      }>('/v1/subscriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Get subscription stats error:', error);
      throw error;
    }
  }
}

export default new SubscriptionService(); 