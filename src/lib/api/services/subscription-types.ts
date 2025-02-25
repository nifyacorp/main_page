import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';

interface SubscriptionType {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSystem: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionTypesResponse {
  types: SubscriptionType[];
}

export const subscriptionTypesService = {
  list: (): Promise<ApiResponse<SubscriptionTypesResponse>> => {
    console.group('📋 Subscription Types List');
    console.log('Fetching subscription types...');
    
    return backendClient({
      endpoint: '/api/v1/subscriptions/types'
    }).finally(() => console.groupEnd());
  },
  
  create: (data: {
    name: string;
    description: string;
    icon: string;
  }): Promise<ApiResponse<SubscriptionType>> => {
    console.group('📝 Create Subscription Type');
    console.log('Creating subscription type:', data);
    
    return backendClient({
      endpoint: '/api/v1/subscriptions/types',
      method: 'POST',
      body: data,
    }).finally(() => console.groupEnd());
  }
};