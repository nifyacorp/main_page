import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';
import { 
  UuidSchema
} from '../schemas';
import { 
  CreateSubscriptionSchema, 
  UpdateSubscriptionSchema,
  SubscriptionCreateUpdateResponse,
  SubscriptionGetResponse,
  SubscriptionListResponse,
  SubscriptionDeleteResponse,
  CreateSubscription,
  UpdateSubscription
} from '../../schemas/subscription';
import { validateWithZod } from '../../utils/validation';
import { z } from 'zod';

// Define toggle subscription schema (not part of our standardized schemas)
const ToggleSubscriptionSchema = z.object({
  active: z.boolean({
    required_error: 'Active status is required',
    invalid_type_error: 'Active status must be a boolean'
  })
});

// Legacy interface for backward compatibility
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

// Interface for process response
export interface ProcessSubscriptionResponse {
  message: string;
  processingId?: string;
  subscription_id?: string;
}

// Use type aliases from our standardized schemas
export type CreateSubscriptionInput = CreateSubscription;
export type UpdateSubscriptionInput = UpdateSubscription;

export const subscriptionService = {
  list: (): Promise<ApiResponse<SubscriptionListResponse>> => {
    console.group('📋 Subscription List Request');
    console.log('Fetching subscriptions...');
    
    return backendClient<SubscriptionListResponse>({
      endpoint: '/api/v1/subscriptions'
    }).finally(() => console.groupEnd());
  },
  
  create: (data: CreateSubscriptionInput): Promise<ApiResponse<SubscriptionCreateUpdateResponse>> => {
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
    
    return backendClient<SubscriptionCreateUpdateResponse>({
      endpoint: '/api/v1/subscriptions',
      method: 'POST',
      body: validation.data,
    }).finally(() => console.groupEnd());
  },
  
  delete: (id: string): Promise<ApiResponse<SubscriptionDeleteResponse>> => {
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
        data: undefined as any
      });
    }
    
    return backendClient<SubscriptionDeleteResponse>({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'DELETE',
      body: {}, // Add empty body to satisfy content-type requirement
    }).finally(() => console.groupEnd());
  },
  
  getDetails: (id: string): Promise<ApiResponse<SubscriptionGetResponse>> => {
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
        data: { subscription: null as any } as any
      });
    }
    
    return backendClient<SubscriptionGetResponse>({
      endpoint: `/api/v1/subscriptions/${id}`,
    }).finally(() => console.groupEnd());
  },

  update: (id: string, data: UpdateSubscriptionInput): Promise<ApiResponse<SubscriptionCreateUpdateResponse>> => {
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
        data: { subscription: null as any } as any
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
    
    // Use PATCH instead of PUT
    return backendClient<SubscriptionCreateUpdateResponse>({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'PATCH',
      body: dataValidation.data,
    }).finally(() => console.groupEnd());
  },
  
  // Updated toggle method that uses PATCH
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
    
    // Use PATCH directly with active parameter
    return backendClient<Subscription>({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'PATCH',
      body: { active },
    }).finally(() => console.groupEnd());
  },
  
  // Keep these for backward compatibility but mark as deprecated
  activate: (id: string): Promise<ApiResponse<Subscription>> => {
    console.group('🔄 Activate Subscription');
    console.log('Activating subscription (deprecated):', { id });
    console.warn('Deprecated: Use toggle(id, true) instead');
    
    // Call toggle with active=true
    return subscriptionService.toggle(id, true);
  },
  
  deactivate: (id: string): Promise<ApiResponse<Subscription>> => {
    console.group('🔄 Deactivate Subscription');
    console.log('Deactivating subscription (deprecated):', { id });
    console.warn('Deprecated: Use toggle(id, false) instead');
    
    // Call toggle with active=false
    return subscriptionService.toggle(id, false);
  },
  
  processImmediately: (id: string): Promise<ApiResponse<ProcessSubscriptionResponse>> => {
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
    
    console.log(`Sending process request to /api/v1/subscriptions/${id}/process`);
    
    // Use standard process endpoint
    return backendClient<ProcessSubscriptionResponse>({
      endpoint: `/api/v1/subscriptions/${id}/process`,
      method: 'POST',
      body: {}, // Empty body to satisfy content-type requirement
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Process subscription response:', response);
        return response;
      })
      .catch(error => {
        console.error('Error processing subscription:', error);
        
        // Check if it's a timeout error
        if (error.code === 'ECONNABORTED') {
          return { 
            status: 202, // Accepted - this is expected for long-running operations
            ok: true,
            data: { 
              message: 'Subscription processing initiated, but took longer than expected. Check notifications for results.',
              processingId: 'timeout'
            }
          };
        }
        
        return { 
          status: error.status || 500,
          ok: false,
          error: error.message || 'Failed to process subscription',
          data: { 
            message: error.message || 'Failed to process subscription',
            error: error.code || 'UNKNOWN_ERROR'
          }
        };
      })
      .finally(() => console.groupEnd());
  }
}