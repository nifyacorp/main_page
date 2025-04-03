# API Mismatch Summary

This document summarizes the API mismatches between the frontend and backend of the NIFYA application.

## Key Findings

1. **Authentication Service Gaps**: Several authentication-related endpoints used by the frontend aren't implemented in the backend:
   - Token refresh endpoint (`/api/auth/refresh`)
   - User logout, profile updates, and password management endpoints

2. **Missing Advanced Subscription Features**: The frontend expects several subscription-related endpoints that don't exist in the backend:
   - Subscription processing status tracking
   - Subscription statistics
   - Subscription sharing
   - Subscription-specific notification filtering

3. **Missing Notification Analytics**: The frontend attempts to call notification statistics and activity endpoints that aren't implemented:
   - `/v1/notifications/stats`
   - `/v1/notifications/activity`

4. **Email Preference Management**: The frontend tries to update email notification preferences, but the endpoint doesn't exist.

5. **Authentication Path Inconsistency**: Some auth-related endpoints use `/auth/` (without `/api/` prefix) while others use `/api/auth/`.

## Impact Analysis

1. **Auth Token Refresh**: Without `/api/auth/refresh`, the application likely experiences authentication failures when tokens expire, requiring users to log in again manually.

2. **User Management**: Users can't update their profiles, change passwords, or manage logout through the standard UI flows.

3. **Subscription Monitoring**: Without status tracking, users can't see real-time progress of subscription processing.

4. **Analytics**: Dashboard statistics for subscriptions and notifications likely display placeholder data or fail to load.

5. **Email Preferences**: Users can't customize their email notification settings.

## Suggested Actions

1. **High Priority**:
   - Implement token refresh endpoint to prevent authentication failures
   - Add basic user profile management endpoints

2. **Medium Priority**:
   - Add subscription status tracking endpoint
   - Implement email notification preferences
   - Standardize auth endpoint path patterns (either all `/api/auth/` or all `/auth/`)

3. **Lower Priority**:
   - Add statistics and analytics endpoints
   - Implement subscription sharing features

## Implementation Notes

1. **Auth Refresh Endpoint**:
   ```
   POST /api/auth/refresh
   Request: { refreshToken: string }
   Response: { accessToken: string, refreshToken?: string }
   ```

2. **Profile Management**:
   ```
   PUT /auth/profile
   Request: { name?: string, email?: string, profile_image?: string }
   Response: { user: UserObject }
   ```

3. **Email Preferences**:
   ```
   PATCH /api/v1/users/me/email-preferences
   Request: { emailNotifications: boolean, emailDigest: 'daily' | 'weekly' | 'none' }
   Response: { preferences: PreferencesObject }
   ```

4. **Subscription Status**:
   ```
   GET /api/v1/subscriptions/:id/status
   Response: { status: 'pending' | 'processing' | 'completed' | 'failed', progress: number, message?: string }
   ```

## Testing Plan

1. **Authentication Flow Testing**:
   - Test token expiration and refresh scenarios
   - Verify proper error handling when tokens expire

2. **User Management Testing**:
   - Test profile updates
   - Test password changes

3. **Notification Settings**:
   - Test email preference changes
   - Verify preferences are respected by notification system

4. **Analytics Testing**:
   - Verify dashboard statistics
   - Test activity data visualization