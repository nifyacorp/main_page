export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errorCode?: string;
  status?: number;
  ok?: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  notificationEmail: string | null;
  emailFrequency: 'daily';
  instantNotifications: boolean;
}

export interface EmailPreferences {
  email_notifications: boolean;
  notification_email: string | null;
  digest_time: string;
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

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
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

// Standard Error Interfaces
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
    details?: any;
    help?: {
      endpoint_info?: {
        method: string;
        auth_required: boolean;
        description: string;
      };
      documentation_url?: string;
      related_endpoints?: {
        path: string;
        methods: string[];
        description: string;
      }[];
    };
  };
}

// Error codes matching backend error codes
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  
  // Permission errors
  FORBIDDEN = 'FORBIDDEN',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  
  // Request errors
  VALIDATION_ERROR = 'VALIDATION_ERROR', 
  BAD_REQUEST = 'BAD_REQUEST',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  
  // OAuth errors
  INVALID_LOGIN_METHOD = 'INVALID_LOGIN_METHOD',
} 