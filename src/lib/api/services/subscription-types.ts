import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';
import { UuidSchema } from '../schemas';
import { validateWithZod } from '../../utils/validation';

// Define types for subscription types/templates
export interface SubscriptionType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  parser_url?: string;
  logo_url?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionTypesResponse {
  status: string;
  data: {
    types: SubscriptionType[];
  };
}

export interface SubscriptionTypeResponse {
  status: string;
  data: {
    type: SubscriptionType;
  };
}

export const subscriptionTypesService = {
  // Get all subscription types/templates
  list: (): Promise<ApiResponse<SubscriptionTypesResponse>> => {
    console.group('📋 Subscription Types Request');
    console.log('Fetching subscription types/templates...');
    
    return backendClient<SubscriptionTypesResponse>({
      endpoint: '/api/v1/subscriptions/types'
    }).finally(() => console.groupEnd());
  },
  
  // Get a specific subscription type/template by ID
  getDetails: (id: string): Promise<ApiResponse<SubscriptionTypeResponse>> => {
    console.group('📋 Subscription Type Details');
    console.log('Fetching subscription type details:', id);
    
    // Validate UUID format
    const validation = validateWithZod(UuidSchema, id);
    
    if (!validation.success) {
      console.error('Invalid subscription type ID:', validation.error);
      console.groupEnd();
      
      return Promise.resolve({
        status: 400,
        ok: false,
        error: 'Invalid subscription type ID format',
        data: { type: null as any } as any
      });
    }
    
    return backendClient<SubscriptionTypeResponse>({
      endpoint: `/api/v1/subscriptions/types/${id}`,
    }).finally(() => console.groupEnd());
  }
};