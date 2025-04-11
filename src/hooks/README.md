# Hooks and Contexts Organization

This directory contains custom hooks that provide access to the application's state and functionality. The hooks are organized to follow the "single source of truth" principle.

## Core Hooks

### Authentication

- **`use-auth.ts`**: The central hook for all authentication-related functionality. Always use this hook instead of directly accessing the AuthContext.

```tsx
// Example usage
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, authHeaders } = useAuth();
  
  // Access user information
  console.log(user?.email);
  
  // Check authentication status
  if (isAuthenticated) {
    // Do something for authenticated users
  }
  
  // Get auth headers for API requests
  const headers = authHeaders();
}
```

### Notifications

- **`use-notifications.ts`**: The central hook for working with notifications. Provides access to notification counts, actions like marking as read, and queries for fetching notifications.

```tsx
// Example usage
import { useNotifications } from '@/hooks/use-notifications';

function MyComponent() {
  const { 
    unreadCount,
    refreshUnreadCount,
    markAsRead,
    getNotifications
  } = useNotifications();
  
  // Get a paginated list of notifications
  const { data, isLoading } = getNotifications({ page: 1, limit: 10 });
  
  // Mark a notification as read
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    refreshUnreadCount();
  };
}
```

### Subscriptions

- **`use-subscriptions.ts`**: The unified hook for subscription management. Includes optimistic updates, fallback data for offline situations, and all subscription CRUD operations.

- **`use-subscription-status.ts`**: A specialized hook for tracking the processing status of a subscription.

```tsx
// Example usage
import { useSubscriptions } from '@/hooks/use-subscriptions';

function MyComponent() {
  const {
    subscriptions,
    stats,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    processSubscription
  } = useSubscriptions();
  
  // ...
}
```

## Deprecated Hooks

- **`use-subscriptions-enhanced.ts`**: This hook is deprecated and will be removed in a future version. Please use the standard `useSubscriptions` hook instead, which now includes all enhanced functionality.

## Design Patterns

1. **Context/Hook Separation**: The state management is split between contexts and hooks. Contexts hold the state and provide basic functionality, while hooks add additional utility functions and provide a simplified API.

2. **Single Source of Truth**: Each piece of state has a single source of truth. For example, all authentication state is managed by the AuthContext and exposed through the useAuth hook.

3. **Centralized API Access**: Hooks encapsulate all API calls, providing a clean interface for components to interact with backend services.

4. **Optimistic Updates**: The subscription hooks perform optimistic updates, immediately updating the UI before the API call completes, then rolling back if the call fails.

5. **Fallback Mechanisms**: The subscription hook includes fallback data when API calls fail, ensuring the UI remains functional even during network issues.

## Best Practices

1. Always use the hook instead of directly accessing the context
2. Keep specialized hooks focused on a single responsibility
3. Use the standard hook pattern (prefix with "use")
4. Include type definitions for hook return values
5. Handle loading, error, and success states properly 