# Infinite Loop Fix - Email Preferences in Subscriptions Page

## Problem Description

The frontend was experiencing an infinite loop in the Subscriptions page when attempting to load email preferences. The browser console showed continuous errors and requests to the email preferences endpoint.

Error pattern:
```
Failed to fetch email preferences 
getEmailPreferences @ use-email-preferences.ts:38
(anonymous) @ Subscriptions.tsx:73
(anonymous) @ Subscriptions.tsx:81
```

## Root Causes

1. **Function Reference Stability**: The `getEmailPreferences` function was being created as a new instance on every render, causing React's dependency tracking in `useEffect` to trigger the effect on every render.

2. **Circular Dependency**: The `useEffect` in Subscriptions.tsx depended on `getEmailPreferences`, which triggered state updates, causing re-renders, which created a new `getEmailPreferences` function.

3. **API Endpoint Mismatch**: The email preferences endpoint was using an incorrect path (`/v1/users/me/email-preferences`) that didn't match the backend's forwarding mechanism (`/v1/me/email-preferences`).

## Implemented Fixes

### 1. Stabilized Function References with `useCallback`

Wrapped all service functions in `useCallback` to prevent them from being recreated on every render:

```typescript
// Before:
const getEmailPreferences = async (): Promise<EmailPreference> => {
  // ...
};

// After:
const getEmailPreferences = useCallback(async (): Promise<EmailPreference> => {
  // ...
}, [authHeaders]);
```

### 2. Fixed Dependency in useEffect

Removed the unstable function from the dependency array and added cleanup to prevent state updates after unmount:

```typescript
// Before:
useEffect(() => {
  const loadEmailPreferences = async () => {
    // ...
  };
  
  loadEmailPreferences();
}, [getEmailPreferences]); // This caused the infinite loop

// After:
useEffect(() => {
  let isMounted = true;
  
  const loadEmailPreferences = async () => {
    try {
      const prefs = await getEmailPreferences();
      if (isMounted) {
        setEmailPreferences(prefs);
      }
    } catch (err) {
      console.error('Failed to load email preferences:', err);
    }
  };
  
  loadEmailPreferences();
  
  return () => {
    isMounted = false;
  };
}, []); // Empty dependency array - only run once on mount
```

### 3. Fixed API Endpoint Paths

Updated the API paths to match the backend's compatibility layer:

```typescript
// Before:
const response = await API.get('/v1/users/me/email-preferences', { headers: authHeaders() });

// After:
const response = await API.get('/v1/me/email-preferences', { headers: authHeaders() });
```

## Testing

The fixes should prevent the infinite loop while still loading email preferences correctly. To verify:

1. Navigate to the Subscriptions page
2. Check the browser console for any error messages
3. Verify that email preferences are loaded correctly (only one request)
4. Confirm there are no repeating errors or API calls

## Future Improvements

1. Consider moving the email preferences hooks to React Query for better caching and error handling
2. Add better error recovery when the preferences endpoint fails
3. Implement a retry mechanism with exponential backoff for temporary failures
4. Add client-side caching for email preferences to reduce API calls