export interface SubscriptionTemplate {
  id: string;
  name: string;
  description?: string;
  type?: string;
  icon?: string;
  isPublic?: boolean;
  frequency?: string;
  prompts?: string[];
  metadata?: {
    category?: string;
    source?: string;
    [key: string]: any;
  };
} 