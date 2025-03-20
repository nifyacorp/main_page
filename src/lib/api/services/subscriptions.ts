import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';
import { 
  CreateSubscriptionSchema, 
  UpdateSubscriptionSchema, 
  ToggleSubscriptionSchema,
  UuidSchema
} from '../schemas';
import { validateWithZod } from '../../utils/validation';
import { z } from 'zod';

// Define response interfaces
export interface Subscription {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  logo: string;
  frequency: 'immediate' | 'daily';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

// Type for create/update requests using Zod schema
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;

export const subscriptionService = {
  list: (): Promise<ApiResponse<SubscriptionsResponse>> => {
    console.group('📋 Subscription List Request');
    console.log('Fetching subscriptions...');
    
    return backendClient({
      endpoint: '/api/v1/subscriptions'
    }).finally(() => console.groupEnd());
  },
  
  create: (data: CreateSubscriptionInput): Promise<ApiResponse<{ subscription: Subscription }>> => {
    console.group('📝 Create Subscription');
    console.log('Creating subscription:', data);
    
    // Validate input data against schema
    const validation = validateWithZod(CreateSubscriptionSchema, data);
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      console.groupEnd();
      
      // Return a rejected promise with validation errors
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Validation failed',
        data: { 
          validationErrors: validation.error?.details || {},
          message: 'Please correct the errors and try again'
        } as any
      });
    }
    
    // Proceed with valid data
    console.log('Validation passed, sending to backend');
    
    return backendClient({
      endpoint: '/api/v1/subscriptions',
      method: 'POST',
      body: validation.data,
    }).finally(() => console.groupEnd());
  },
  
  delete: (id: string): Promise<ApiResponse<void>> => {
    console.group('🗑️ Delete Subscription');
    console.log('Deleting subscription:', id);
    
    // Validate UUID format
    const validation = validateWithZod(UuidSchema, id);
    
    if (!validation.success) {
      console.error('Invalid subscription ID:', validation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription ID format',
        data: undefined
      });
    }
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'DELETE',
      body: {}, // Add empty body to satisfy content-type requirement
    }).finally(() => console.groupEnd());
  },
  
  getDetails: (id: string): Promise<ApiResponse<{ subscription: Subscription }>> => {
    console.group('📋 Subscription Details');
    console.log('Fetching subscription details:', id);
    
    // Validate UUID format
    const validation = validateWithZod(UuidSchema, id);
    
    if (!validation.success) {
      console.error('Invalid subscription ID:', validation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription ID format',
        data: { subscription: null as any }
      });
    }
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
    }).finally(() => console.groupEnd());
  },

  update: (id: string, data: UpdateSubscriptionInput): Promise<ApiResponse<{ subscription: Subscription }>> => {
    console.group('✏️ Update Subscription');
    console.log('Updating subscription:', { id, data });
    
    // Validate UUID format
    const idValidation = validateWithZod(UuidSchema, id);
    
    if (!idValidation.success) {
      console.error('Invalid subscription ID:', idValidation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription ID format',
        data: { subscription: null as any }
      });
    }
    
    // Validate update data
    const dataValidation = validateWithZod(UpdateSubscriptionSchema, data);
    
    if (!dataValidation.success) {
      console.error('Validation failed:', dataValidation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Validation failed',
        data: { 
          validationErrors: dataValidation.error?.details || {},
          message: 'Please correct the errors and try again',
          subscription: null as any
        } as any
      });
    }
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'PATCH',
      body: dataValidation.data,
    }).finally(() => console.groupEnd());
  },
  
  toggle: (id: string, active: boolean): Promise<ApiResponse<Subscription>> => {
    console.group('🔄 Toggle Subscription');
    console.log('Toggling subscription:', { id, active });
    
    // Validate UUID format
    const idValidation = validateWithZod(UuidSchema, id);
    
    if (!idValidation.success) {
      console.error('Invalid subscription ID:', idValidation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription ID format',
        data: null as any
      });
    }
    
    // Validate toggle data
    const toggleValidation = validateWithZod(ToggleSubscriptionSchema, { active });
    
    if (!toggleValidation.success) {
      console.error('Validation failed:', toggleValidation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Validation failed: active must be a boolean',
        data: null as any
      });
    }
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}/toggle`,
      method: 'PATCH',
      body: toggleValidation.data,
    }).finally(() => console.groupEnd());
  },
  
  processImmediately: (id: string): Promise<ApiResponse<{ message: string }>> => {
    console.group('🔄 Process Subscription Immediately');
    console.log('Processing subscription:', id);
    
    // Validate UUID format
    const validation = validateWithZod(UuidSchema, id);
    
    if (!validation.success) {
      console.error('Invalid subscription ID:', validation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription ID format',
        data: { message: 'Invalid subscription ID format' }
      });
    }
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}/process`,
      method: 'POST',
      body: {}, // Empty body to satisfy content-type requirement
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    })
      .catch(error => {
        console.error('Error processing subscription:', error);
        return { 
          status: 500,
          ok: false,
          error: error.message || 'Failed to process subscription',
          data: { message: 'Failed to process subscription' }
        };
      })
      .finally(() => console.groupEnd());
  }
}