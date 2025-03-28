export interface ApiResponse<T> {
  data?: T;
  status: number;
  error?: string;
  ok: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  notificationEmail: string | null;
  emailFrequency: 'daily';
  instantNotifications: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en' | 'ca';
  notification_settings: NotificationSettings;
  lastLogin: string;
  emailVerified: boolean;
  subscriptionCount: number;
  notificationCount: number;
  lastNotification: string | null;
  
  // Deprecated fields - kept for backward compatibility
  emailNotifications?: boolean;
  notificationEmail?: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'boe' | 'real-estate' | 'custom';
  prompts: string[];
  icon: string;
  logo: string;
  isPublic: boolean;
  metadata: {
    category: string;
    source: string;
    [key: string]: any;
  };
  frequency: 'immediate' | 'daily';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplatesResponse {
  templates: Template[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}