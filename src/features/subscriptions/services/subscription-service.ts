import { z } from 'zod';
import apiClient from '@/api/clients/api-client';

// Subscription type schema
export const SubscriptionTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'select', 'date', 'boolean', 'textarea']),
      required: z.boolean().default(false),
      options: z.array(z.object({ 
        label: z.string(), 
        value: z.string() 
      })).optional(),
      default: z.union([z.string(), z.number(), z.boolean()]).optional(),
      placeholder: z.string().optional(),
      help: z.string().optional(),
    })
  ),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SubscriptionType = z.infer<typeof SubscriptionTypeSchema>;

// Subscription schema
export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  subscription_type_id: z.string(),
  type: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive', 'pending', 'processing', 'error']),
  config: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
  processed_at: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// Create subscription DTO
export const CreateSubscriptionDto = z.object({
  subscription_type_id: z.string(),
  name: z.string().min(1, 'Subscription name is required'),
  config: z.record(z.unknown()),
});

export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionDto>;

// Update subscription DTO
export const UpdateSubscriptionDto = z.object({
  name: z.string().min(1, 'Subscription name is required').optional(),
  config: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateSubscriptionDto = z.infer<typeof UpdateSubscriptionDto>;

// Subscription filter parameters
export const SubscriptionFilterParams = z.object({
  status: z.enum(['active', 'inactive', 'pending', 'processing', 'error']).optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type SubscriptionFilterParams = z.infer<typeof SubscriptionFilterParams>;

// Subscription service
const subscriptionService = {
  // Get subscription types
  getSubscriptionTypes: async () => {
    return apiClient.get<{ types: SubscriptionType[] }>('/subscription-types');
  },

  // Get subscription type by ID
  getSubscriptionType: async (id: string) => {
    return apiClient.get<{ type: SubscriptionType }>(`/subscription-types/${id}`);
  },

  // Get all subscriptions with optional filters
  getSubscriptions: async (params?: SubscriptionFilterParams) => {
    return apiClient.get<{ 
      subscriptions: Subscription[],
      total: number,
      page: number,
      limit: number
    }>('/subscriptions', params);
  },

  // Get subscription by ID
  getSubscription: async (id: string) => {
    return apiClient.get<{ subscription: Subscription }>(`/subscriptions/${id}`);
  },

  // Create new subscription
  createSubscription: async (data: CreateSubscriptionDto) => {
    // Validate data against schema
    CreateSubscriptionDto.parse(data);
    
    return apiClient.post<{ subscription: Subscription }>('/subscriptions', data);
  },

  // Update subscription
  updateSubscription: async (id: string, data: UpdateSubscriptionDto) => {
    // Validate data against schema
    UpdateSubscriptionDto.parse(data);
    
    return apiClient.put<{ subscription: Subscription }>(`/subscriptions/${id}`, data);
  },

  // Delete subscription
  deleteSubscription: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/subscriptions/${id}`);
  },

  // Process subscription (trigger manual processing)
  processSubscription: async (id: string) => {
    return apiClient.post<{ success: boolean, status: string }>(`/subscriptions/${id}/process`);
  },
  
  // Get subscription statistics
  getSubscriptionStatistics: async () => {
    return apiClient.get<{
      total: number,
      active: number,
      inactive: number,
      pending: number,
      processing: number,
      error: number,
      by_type: Record<string, number>
    }>('/subscriptions/statistics');
  }
};

export default subscriptionService;