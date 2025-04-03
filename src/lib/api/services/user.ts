import { backendClient } from '../clients/backend';
import type { ApiResponse, UserProfile } from '../types';

interface ProfileResponse {
  profile: UserProfile;
}

export const userService = {
  getProfile: (): Promise<ApiResponse<ProfileResponse>> => {
    console.group('👤 Get User Profile');
    console.log('Fetching user profile...');
    
    // Fix the endpoint path to match backend route registration
    return backendClient({
      endpoint: '/api/v1/users/me'
    }).finally(() => console.groupEnd());
  },
  
  updateProfile: (data: Partial<UserProfile>): Promise<ApiResponse<ProfileResponse>> => {
    console.group('✏️ Update User Profile');
    console.log('Updating profile:', data);
    
    // Fix the endpoint path to match backend route registration
    return backendClient({
      endpoint: '/api/v1/users/me',
      method: 'PATCH',
      body: data,
    }).finally(() => console.groupEnd());
  }
};