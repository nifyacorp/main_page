/**
 * Fallback utility for handling API failures
 * Provides sample data when APIs are unavailable to prevent app crashes
 */

// Subscription fallbacks
export const FALLBACK_SUBSCRIPTIONS = [
  {
    id: "fallback-1",
    name: "BOE Subscription (Fallback)",
    description: "This is fallback data shown when the API returns an error",
    prompts: ["Información general del BOE"],
    logo: "",
    frequency: "daily",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type_name: "boe",
    user_id: "system",
    metadata: { fallback: true }
  }
];

// Notification fallbacks
export const FALLBACK_NOTIFICATIONS = [
  {
    id: "fallback-1",
    title: "System Notification (Fallback)",
    content: "This is fallback data shown when the notification API returns an error.",
    user_id: "system",
    subscription_id: "fallback-1",
    created_at: new Date().toISOString(),
    read: false,
    source_url: "",
    entity_type: "system:fallback",
    metadata: { fallback: true }
  }
];

// Stats fallbacks
export const FALLBACK_SUBSCRIPTION_STATS = {
  total: 1,
  active: 1,
  inactive: 0,
  types: { boe: 1 }
};

export const FALLBACK_NOTIFICATION_STATS = {
  total: 1,
  unread: 1,
  today: 1,
  byType: { system: 1 }
};

/**
 * Wraps an API function with fallback behavior
 * If the original function throws an error, returns the fallback data
 * 
 * @param fn - Original API function
 * @param fallbackData - Data to return if the API call fails
 * @param fallbackStatus - HTTP status to use in fallback response
 * @returns A function that won't throw and will use fallback data on failure
 */
export function withFallback<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  fallbackData: T,
  fallbackStatus = 500
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    try {
      // Try the original function
      return await fn(...args);
    } catch (error: any) {
      // Log the error but don't crash
      console.error('API error (using fallback):', error.message || error);
      
      // If fallback is an API response object, add error info
      if (typeof fallbackData === 'object' && fallbackData !== null) {
        const responseData = fallbackData as any;
        
        // Only modify if it looks like our API response format
        if ('ok' in responseData && 'status' in responseData && 'data' in responseData) {
          responseData.ok = false;
          responseData.status = fallbackStatus;
          responseData.error = error.message || 'Unknown error';
          responseData.fallback = true;
        }
      }
      
      return fallbackData;
    }
  };
}

/**
 * Determines if the current environment should use fallbacks
 * @returns Boolean indicating if fallbacks should be used
 */
export function shouldUseFallbacks(): boolean {
  // In development or when debugging is enabled, use fallbacks
  return import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
}