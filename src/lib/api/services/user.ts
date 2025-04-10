import { backendClient } from '../clients/backend';
import type { ApiResponse, UserProfile, EmailPreferences } from '../types';

interface ProfileResponse {
  profile: UserProfile;
}

interface PreferencesResponse {
  preferences: Partial<UserProfile>;
}

interface EmailPreferencesResponse extends EmailPreferences {}

interface EmailPreferencesUpdateResponse {
  message: string;
  preferences: EmailPreferences;
}

interface TestEmailResponse {
  message: string;
}

export const userService = {
  getProfile: (): Promise<ApiResponse<ProfileResponse>> => {
    console.group('👤 Get User Profile');
    console.log('🔍 user.ts: getProfile called');
    console.log('Fetching user profile...');
    
    // Fix the endpoint path to match backend route registration
    return backendClient<ProfileResponse>({
      endpoint: '/api/v1/users/me'
    }).finally(() => console.groupEnd());
  },
  
  updateProfile: (data: Partial<UserProfile>): Promise<ApiResponse<ProfileResponse>> => {
    console.group('✏️ Update User Profile');
    console.log('🔍 user.ts: updateProfile called');
    console.log('Updating profile:', data);
    
    // Fix the endpoint path to match backend route registration
    return backendClient<ProfileResponse>({
      endpoint: '/api/v1/users/me',
      method: 'PATCH',
      body: data,
    }).finally(() => console.groupEnd());
  },

  // Get user preferences
  getPreferences: (): Promise<ApiResponse<PreferencesResponse>> => {
    console.group('⚙️ Get User Preferences');
    console.log('🔍 user.ts: getPreferences called');
    console.log('Fetching user preferences...');
    
    return backendClient<PreferencesResponse>({
      endpoint: '/api/v1/users/preferences'
    }).finally(() => console.groupEnd());
  },

  // Update user preferences
  updatePreferences: (data: Partial<UserProfile>): Promise<ApiResponse<PreferencesResponse>> => {
    console.group('⚙️ Update User Preferences');
    console.log('🔍 user.ts: updatePreferences called');
    console.log('Updating preferences:', data);
    
    return backendClient<PreferencesResponse>({
      endpoint: '/api/v1/users/preferences',
      method: 'PUT',
      body: data,
    }).finally(() => console.groupEnd());
  },

  // Get email preferences
  getEmailPreferences: (): Promise<ApiResponse<EmailPreferencesResponse>> => {
    console.group('📧 Get Email Preferences');
    console.log('🔍 user.ts: getEmailPreferences called');
    console.log('Fetching email preferences...');
    
    return backendClient<EmailPreferencesResponse>({
      endpoint: '/api/v1/me/email-preferences'
    }).finally(() => console.groupEnd());
  },

  // Update email preferences
  updateEmailPreferences: (data: Partial<EmailPreferences>): Promise<ApiResponse<EmailPreferencesUpdateResponse>> => {
    console.group('📧 Update Email Preferences');
    console.log('🔍 user.ts: updateEmailPreferences called');
    console.log('Updating email preferences:', data);
    
    return backendClient<EmailPreferencesUpdateResponse>({
      endpoint: '/api/v1/me/email-preferences',
      method: 'PATCH',
      body: data,
    }).finally(() => console.groupEnd());
  },

  // Send test email
  sendTestEmail: (): Promise<ApiResponse<TestEmailResponse>> => {
    console.group('📧 Send Test Email');
    console.log('🔍 user.ts: sendTestEmail called');
    console.log('Sending test email...');
    
    return backendClient<TestEmailResponse>({
      endpoint: '/api/v1/me/test-email',
      method: 'POST'
    }).finally(() => console.groupEnd());
  }
};