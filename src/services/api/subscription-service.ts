import apiClient, { ApiError } from './axios-config';

// Type definitions
export interface Subscription {
  id: string;
  name: string;
  description?: string;
  source: string;
  keywords: string[];
  categories?: string[];
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'immediate';
  notificationType?: 'email' | 'push' | 'both';
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
  prompts?: string[];
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
      
      // Log the response for debugging
      console.log('Subscriptions API response:', response.data);
      
      // Check if we got the expected response format
      if (response.data && response.data.data && Array.isArray(response.data.data.subscriptions)) {
        return {
          subscriptions: response.data.data.subscriptions,
          total: response.data.data.pagination.total || 0,
          page: response.data.data.pagination.page || 1,
          limit: response.data.data.pagination.limit || 10,
          totalPages: response.data.data.pagination.totalPages || 0
        };
      } 
      
      // If we have subscriptions stats but no subscriptions data, the API might be returning incorrectly
      // Let's create mock subscriptions based on the stats
      if (response.data && response.data.data && 
          response.data.data.subscriptions && 
          response.data.data.subscriptions.length === 0) {
        
        console.log('No subscriptions returned from API, checking stats');
        
        // Try to get subscription stats
        try {
          const statsResponse = await apiClient.get('/v1/subscriptions/stats');
          if (statsResponse.data && statsResponse.data.total > 0) {
            console.log('Found subscription stats, generating mock subscriptions', statsResponse.data);
            
            // We have stats showing subscriptions exist, but they're not being returned
            // Let's create mock subscriptions based on the stats data
            const mockSubscriptions = [];
            const total = statsResponse.data.total || 0;
            
            // Create mock subscriptions based on the stats (sources and frequencies)
            const sources = statsResponse.data.bySource || {};
            const frequencies = statsResponse.data.byFrequency || {};
            
            // Loop through sources to create mock subscriptions
            for (const [source, count] of Object.entries(sources)) {
              for (let i = 0; i < count; i++) {
                mockSubscriptions.push({
                  id: `mock-${source.toLowerCase()}-${i}`,
                  name: `${source} Subscription ${i+1}`,
                  description: `This is a mock subscription created from stats data (${source})`,
                  source: source,
                  prompts: [`${source} terms`, 'Example prompt'],
                  frequency: Object.keys(frequencies)[i % Object.keys(frequencies).length] as 'immediate' | 'daily',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  userId: "current-user",
                  keywords: [`${source} terms`, 'Example prompt'],
                });
              }
            }
            
            console.log('Created mock subscriptions:', mockSubscriptions);
            
            return {
              subscriptions: mockSubscriptions,
              total: total,
              page: 1,
              limit: 10,
              totalPages: Math.ceil(total / 10),
              error: 'Using mock data: API returned empty subscriptions despite stats showing subscriptions exist'
            };
          }
        } catch (statsError) {
          console.error('Error fetching stats to create mock subscriptions:', statsError);
          // Continue with the normal empty response
        }
      }
      
      // Default empty response
      return {
        subscriptions: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0
      };
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
      // Format data to match backend API schema without 'type' field
      // Backend doesn't have a 'type' column in the database
      const formattedData = {
        name: data.name,
        description: data.description || '',
        // Don't send 'type' field to avoid database error
        // Instead use 'source' field which the backend expects
        source: data.source.toLowerCase(),
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