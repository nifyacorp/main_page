import { backendClient } from '../clients/backend';
import type { ApiResponse } from '../types';

interface CreateSubscriptionInput {
  typeId: string;
  name: string;
  description: string;
  prompts: string[];
  logo: string;
  frequency: 'immediate' | 'daily';
}

interface Subscription {
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

interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

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
    
    return backendClient({
      endpoint: '/api/v1/subscriptions',
      method: 'POST',
      body: data,
    }).finally(() => console.groupEnd());
  },
  
  delete: (id: string): Promise<ApiResponse<void>> => {
    console.group('🗑️ Delete Subscription');
    console.log('Deleting subscription:', id);
    
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'DELETE',
      body: {}, // Add empty body to satisfy content-type requirement
    }).finally(() => console.groupEnd());
  },
  
  getDetails: (id: string): Promise<ApiResponse<{ subscription: Subscription }>> => {
    console.group('📋 Subscription Details');
    console.log('Fetching subscription details:', id);
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
    }).finally(() => console.groupEnd());
  },

  update: (id: string, data: Partial<CreateSubscriptionInput>): Promise<ApiResponse<{ subscription: Subscription }>> => {
    console.group('✏️ Update Subscription');
    console.log('Updating subscription:', { id, data });
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}`,
      method: 'PATCH',
      body: data,
    }).finally(() => console.groupEnd());
  },
  
  toggle: (id: string, active: boolean): Promise<ApiResponse<Subscription>> => {
    console.group('🔄 Toggle Subscription');
    console.log('Toggling subscription:', { id, active });
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}/toggle`,
      method: 'PATCH',
      body: { active },
    }).finally(() => console.groupEnd());
  },
  
  processImmediately: (id: string): Promise<ApiResponse<{ message: string }>> => {
    console.group('🔄 Process Subscription Immediately');
    console.log('Processing subscription:', id);
    
    return backendClient({
      endpoint: `/api/v1/subscriptions/${id}/process`,
      method: 'POST',
      body: {}, // Empty body to satisfy content-type requirement
    }).finally(() => console.groupEnd());
  }
}