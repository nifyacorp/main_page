# NIFYA Frontend Route and API Documentation

This document provides a comprehensive overview of all routes in the NIFYA frontend application and the API endpoints used by each route.

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [Dashboard Routes](#dashboard-routes)
- [Subscription Routes](#subscription-routes)
- [Notification Routes](#notification-routes)
- [Settings Routes](#settings-routes)
- [Other Routes](#other-routes)

## Authentication Routes

### /auth

**Page Component**: `Auth.tsx`

**Description**: Handles user login, registration, and OAuth flows.

**API Endpoints**:

1. **Login**
   - **Endpoint**: `/api/auth/login`
   - **Method**: POST
   - **Request Format**:
     ```typescript
     {
       email: string;
       password: string;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       user: {
         id: string;
         email: string;
         name: string;
       };
       accessToken: string;
       refreshToken?: string;
     }
     ```
   - **Usage**: Authenticates user with email and password, stores token in localStorage with "Bearer" prefix

2. **Sign-up**
   - **Endpoint**: `/api/auth/signup`
   - **Method**: POST
   - **Request Format**:
     ```typescript
     {
       email: string;
       password: string;
       name: string;
     }
     ```
   - **Response Format**: Same as login
   - **Usage**: Creates new user account and authenticates user

3. **Google OAuth**
   - **Endpoint**: `/api/auth/google/login`
   - **Method**: POST
   - **Response Format**: Redirect URL to Google OAuth flow
   - **Usage**: Redirects user to Google authentication

4. **Google OAuth Callback**
   - **Endpoint**: `/api/auth/google/callback`
   - **Method**: POST
   - **Request Format**:
     ```typescript
     {
       code: string;
     }
     ```
   - **Response Format**: Same as login
   - **Usage**: Processes Google OAuth callback code

5. **Session Check**
   - **Endpoint**: `/api/auth/session`
   - **Method**: GET
   - **Response Format**:
     ```typescript
     {
       authenticated: boolean;
       user: {
         id: string;
         email: string;
         name: string;
         email_verified: boolean;
       } | null;
       session: {
         issuedAt: string;
         expiresAt: string;
         remainingTime: number;
       } | null;
     }
     ```
   - **Usage**: Verifies user session status

## Dashboard Routes

### /dashboard

**Page Component**: `Dashboard.tsx`

**Description**: Main dashboard view showing summary of subscriptions and recent notifications.

**API Endpoints**:

1. **Get Recent Notifications**
   - **Endpoint**: `/api/v1/notifications`
   - **Method**: GET
   - **Query Parameters**:
     ```typescript
     {
       limit: number; // Default: 5
       unread?: boolean;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       notifications: Array<{
         id: string;
         userId: string;
         subscriptionId: string;
         subscription_name?: string;
         title: string;
         content: string;
         sourceUrl: string;
         metadata: any;
         read: boolean;
         createdAt: string;
         readAt?: string;
       }>;
       total: number;
       unread: number;
       page: number;
       limit: number;
     }
     ```
   - **Usage**: Displays recent notifications in dashboard

2. **Get Subscription Statistics**
   - **Endpoint**: `/api/v1/subscriptions/stats` (implied)
   - **Method**: GET
   - **Response Format**:
     ```typescript
     {
       total: number;
       active: number;
       inactive: number;
     }
     ```
   - **Usage**: Shows subscription stats cards

## Subscription Routes

### /subscriptions

**Page Component**: `Subscriptions.tsx`

**Description**: Lists all user subscriptions with management options.

**API Endpoints**:

1. **List All Subscriptions**
   - **Endpoint**: `/api/v1/subscriptions`
   - **Method**: GET
   - **Query Parameters**:
     ```typescript
     {
       page?: number;
       limit?: number;
       active?: boolean;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       subscriptions: Array<{
         id: string;
         name: string;
         description: string;
         prompts: string[];
         logo: string;
         frequency: 'immediate' | 'daily';
         active: boolean;
         createdAt: string;
         updatedAt: string;
       }>;
       total: number;
       page: number;
       limit: number;
       totalPages: number;
     }
     ```
   - **Usage**: Displays list of subscriptions in card format

2. **Delete Subscription**
   - **Endpoint**: `/api/v1/subscriptions/:id`
   - **Method**: DELETE
   - **Response Format**:
     ```typescript
     {
       actuallyDeleted: boolean;
     }
     ```
   - **Usage**: Removes subscription from list

3. **Toggle Subscription**
   - **Endpoint**: `/api/v1/subscriptions/:id/toggle`
   - **Method**: PATCH
   - **Request Format**:
     ```typescript
     {
       active: boolean;
     }
     ```
   - **Response Format**: Updated subscription object
   - **Usage**: Enables/disables subscription monitoring

4. **Process Subscription**
   - **Endpoint**: `/api/v1/subscriptions/:id/process`
   - **Method**: POST
   - **Response Format**:
     ```typescript
     {
       message: string;
       processingId?: string;
       subscription_id?: string;
     }
     ```
   - **Usage**: Triggers immediate subscription processing

### /subscriptions/new

**Page Component**: `NewSubscription.tsx`

**Description**: Form to create a new subscription.

**API Endpoints**:

1. **Create Subscription**
   - **Endpoint**: `/api/v1/subscriptions`
   - **Method**: POST
   - **Request Format**:
     ```typescript
     {
       name: string;
       description?: string;
       type: 'boe' | 'real-estate' | 'custom';
       typeId?: string;
       prompts: string[] | string;
       logo?: string;
       frequency: 'immediate' | 'daily';
     }
     ```
   - **Response Format**:
     ```typescript
     {
       subscription: {
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
     }
     ```
   - **Usage**: Creates new subscription and redirects to subscription list

### /subscriptions/:id

**Page Component**: `SubscriptionDetail.tsx`

**Description**: Detailed view of a single subscription with notifications.

**API Endpoints**:

1. **Get Subscription Details**
   - **Endpoint**: `/api/v1/subscriptions/:id`
   - **Method**: GET
   - **Response Format**:
     ```typescript
     {
       subscription: {
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
     }
     ```
   - **Usage**: Displays subscription details

2. **Get Subscription Notifications**
   - **Endpoint**: `/api/v1/notifications`
   - **Method**: GET
   - **Query Parameters**:
     ```typescript
     {
       subscriptionId: string;
       page?: number;
       limit?: number;
     }
     ```
   - **Response Format**: Same as notifications endpoint
   - **Usage**: Shows notifications specific to this subscription

### /subscriptions/edit/:id

**Page Component**: `EditSubscription.tsx`

**Description**: Form to edit an existing subscription.

**API Endpoints**:

1. **Get Subscription Details**
   - **Endpoint**: `/api/v1/subscriptions/:id`
   - **Method**: GET
   - **Response Format**: Same as subscription detail
   - **Usage**: Pre-fills edit form with current values

2. **Update Subscription**
   - **Endpoint**: `/api/v1/subscriptions/:id`
   - **Method**: PATCH
   - **Request Format**: Same as create, but fields are optional
   - **Response Format**: Same as create
   - **Usage**: Updates subscription details

## Notification Routes

### /notifications

**Page Component**: `Notifications.tsx`

**Description**: Lists all notifications with filtering and management options.

**API Endpoints**:

1. **List Notifications**
   - **Endpoint**: `/api/v1/notifications`
   - **Method**: GET
   - **Query Parameters**:
     ```typescript
     {
       page?: number;
       limit?: number;
       unread?: boolean;
       subscriptionId?: string;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       notifications: Array<{
         id: string;
         userId: string;
         subscriptionId: string;
         subscription_name?: string;
         title: string;
         content: string;
         sourceUrl: string;
         metadata: any;
         read: boolean;
         createdAt: string;
         readAt?: string;
       }>;
       total: number;
       unread: number;
       page: number;
       limit: number;
       hasMore: boolean;
     }
     ```
   - **Usage**: Displays paginated list of notifications

2. **Mark Notification as Read**
   - **Endpoint**: `/api/v1/notifications/:id/read`
   - **Method**: POST
   - **Response Format**: Updated notification
   - **Usage**: Updates read status when notification is viewed

3. **Mark All as Read**
   - **Endpoint**: `/api/v1/notifications/read-all`
   - **Method**: POST
   - **Query Parameters**:
     ```typescript
     {
       subscriptionId?: string;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       updated: number;
     }
     ```
   - **Usage**: Marks all notifications as read

4. **Delete Notification**
   - **Endpoint**: `/api/v1/notifications/:id`
   - **Method**: DELETE
   - **Response Format**:
     ```typescript
     {
       success: boolean;
       message: string;
     }
     ```
   - **Usage**: Removes individual notification

5. **Delete All Notifications**
   - **Endpoint**: `/api/v1/notifications/delete-all`
   - **Method**: DELETE
   - **Query Parameters**:
     ```typescript
     {
       subscriptionId?: string;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       success: boolean;
       deleted: number;
       message: string;
     }
     ```
   - **Usage**: Clears all notifications

## Settings Routes

### /settings

**Page Component**: `Settings.tsx`

**Description**: User profile and application settings.

**API Endpoints**:

1. **Get User Profile**
   - **Endpoint**: `/api/v1/users/me`
   - **Method**: GET
   - **Response Format**:
     ```typescript
     {
       id: string;
       name: string;
       email: string;
       created_at: string;
       email_verified: boolean;
       profile_image?: string;
     }
     ```
   - **Usage**: Displays user information and preferences

2. **Update User Profile**
   - **Endpoint**: `/api/v1/users/me`
   - **Method**: PATCH
   - **Request Format**:
     ```typescript
     {
       name?: string;
       email?: string;
       profile_image?: string;
     }
     ```
   - **Response Format**: Updated user object
   - **Usage**: Updates profile information

3. **Update Email Notification Preferences**
   - **Endpoint**: `/api/v1/users/me/email-preferences`
   - **Method**: PATCH
   - **Request Format**:
     ```typescript
     {
       emailNotifications: boolean;
       emailDigest: 'daily' | 'weekly' | 'none';
     }
     ```
   - **Response Format**: Updated preferences object
   - **Usage**: Changes email notification settings

4. **Change Password**
   - **Endpoint**: `/auth/change-password`
   - **Method**: POST
   - **Request Format**:
     ```typescript
     {
       currentPassword: string;
       newPassword: string;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       success: boolean;
       message: string;
     }
     ```
   - **Usage**: Updates user password

## Other Routes

### /

**Page Component**: `Landing.tsx`

**Description**: Public landing page for unauthenticated users.

**API Endpoints**: None (static content)

### /404

**Page Component**: `NotFound.tsx`

**Description**: 404 error page.

**API Endpoints**: None (static content)

## Global Authentication Headers

All authenticated API requests include:

- **Authorization**: `Bearer {token}` (with space after "Bearer")
- **x-user-id**: User's ID

> Note: Incorrect header format will result in `MISSING_HEADERS` (401) error.

## Error Handling

Standard API response format:
```typescript
{
  data?: T;
  status: number;
  error?: string;
  ok: boolean;
}
```

Client-side error handling patterns:
- React Query's error handling with `onError` callbacks
- Toast notifications for user feedback
- Error state tracking with `isError` flags
- Token refresh mechanism for expired tokens
- Optimistic updates with rollback on error

## Authentication Flow

1. User submits login/signup form or completes OAuth flow
2. Backend returns user object and token
3. Frontend stores token in localStorage with "Bearer" prefix
4. AuthContext provides authentication state to all components
5. Protected routes check authentication before rendering
6. API requests include authentication headers
7. Token refresh happens automatically when needed