# API Endpoint Comparison

This document compares the endpoints used by the frontend against their actual backend counterparts.

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Subscription Endpoints](#subscription-endpoints)
- [Notification Endpoints](#notification-endpoints)
- [User Endpoints](#user-endpoints)
- [Template Endpoints](#template-endpoints)

## Authentication Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/auth` | `/api/auth/login` | `/api/auth/login` | POST | ✅ | Used for user login with email/password |
| `/auth` | `/api/auth/signup` | `/api/auth/signup` | POST | ✅ | Used for new user registration |
| `/auth` | `/api/auth/google/login` | `/api/auth/google/login` | POST | ✅ | Initiates Google OAuth flow |
| `/auth` | `/api/auth/google/callback` | `/api/auth/google/callback` | POST | ✅ | Processes Google OAuth callback |
| `/auth` | `/api/auth/session` | `/api/auth/session` | GET | ✅ | Checks current authentication session |
| `/auth` | `/api/auth/refresh` | Not found | POST | ❌ | Refreshes expired access token |
| `/settings` | `/auth/logout` | Not found | POST | ❌ | Logs out the current user |
| `/settings` | `/auth/profile` | Not found | PUT | ❌ | Updates user profile information |
| `/settings` | `/auth/change-password` | Not found | POST | ❌ | Changes user password |
| `/auth` | `/auth/forgot-password` | Not found | POST | ❌ | Requests password reset email |
| `/auth` | `/auth/reset-password` | Not found | POST | ❌ | Sets new password with reset token |

## Subscription Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/subscriptions` | `/api/v1/subscriptions` | `/api/v1/subscriptions` | GET | ✅ | Lists all subscriptions |
| `/subscriptions/new` | `/api/v1/subscriptions` | `/api/v1/subscriptions` | POST | ✅ | Creates a new subscription |
| `/subscriptions/:id` | `/api/v1/subscriptions/:id` | `/api/v1/subscriptions/:id` | GET | ✅ | Gets specific subscription details |
| `/subscriptions/edit/:id` | `/api/v1/subscriptions/:id` | `/api/v1/subscriptions/:id` | PATCH | ✅ | Updates a subscription |
| `/subscriptions` | `/api/v1/subscriptions/:id` | `/api/v1/subscriptions/:id` | DELETE | ✅ | Deletes a subscription |
| `/subscriptions` | `/api/v1/subscriptions/:id/toggle` | `/api/v1/subscriptions/:id/toggle` | PATCH | ✅ | Toggles subscription active status |
| `/subscriptions` | `/api/v1/subscriptions/:id/process` | `/api/v1/subscriptions/:id/process` | POST | ✅ | Triggers immediate processing |
| `/subscriptions` | `/api/v1/subscriptions/:id/status` | Not found | GET | ❌ | Gets subscription processing status |
| `/dashboard` | `/api/v1/subscriptions/stats` | Not found | GET | ❌ | Gets subscription statistics |
| `/subscriptions/:id` | `/api/v1/subscriptions/:id/share` | Not found | POST | ❌ | Shares a subscription with another user |
| `/subscriptions/:id` | `/api/v1/subscriptions/:id/notifications` | Not found | GET | ❌ | Gets notifications for a subscription |

## Notification Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/notifications`, `/dashboard` | `/api/v1/notifications` | `/api/v1/notifications` | GET | ✅ | Lists notifications with pagination/filtering |
| `/notifications` | `/api/v1/notifications/:id` | `/api/v1/notifications/:id` | GET | ✅ | Gets a specific notification |
| `/notifications` | `/api/v1/notifications/:id/read` | `/api/v1/notifications/:id/read` | POST | ✅ | Marks notification as read |
| `/notifications` | `/api/v1/notifications/read-all` | `/api/v1/notifications/read-all` | POST | ✅ | Marks all notifications as read |
| `/notifications` | `/api/v1/notifications/:id` | `/api/v1/notifications/:id` | DELETE | ✅ | Deletes a notification |
| `/notifications` | `/api/v1/notifications/delete-all` | `/api/v1/notifications/delete-all` | DELETE | ✅ | Deletes all notifications |
| `/dashboard` | `/v1/notifications/stats` | Not found | GET | ❌ | Gets notification statistics |
| `/dashboard` | `/v1/notifications/activity` | Not found | GET | ❌ | Gets notification activity data |

## User Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/settings` | `/api/v1/users/me` | `/api/v1/users/me` | GET | ✅ | Gets current user profile |
| `/settings` | `/api/v1/users/me` | `/api/v1/users/me` | PATCH | ✅ | Updates current user profile |
| `/settings` | `/api/v1/users/me/email-preferences` | Not found | PATCH | ❌ | Updates email notification preferences |

## Template Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/templates` | `/api/v1/templates` | `/api/v1/templates` | GET | ✅ | Lists available templates |
| `/templates/:id` | `/api/v1/templates/:id` | `/api/v1/templates/:id` | GET | ✅ | Gets template details |
| `/templates/new` | `/api/v1/templates` | `/api/v1/templates` | POST | ✅ | Creates custom template |
| `/templates/:id/subscribe` | `/api/v1/templates/:id/subscribe` | `/api/v1/templates/:id/subscribe` | POST | ✅ | Subscribe to a template |

## API Mismatches and Issues

### Missing Backend Endpoints
The following frontend-requested endpoints don't appear to have backend implementations:

1. **Authentication Service**
   - `/api/auth/refresh` - Token refresh endpoint
   - `/auth/logout` - User logout 
   - `/auth/profile` - Profile updates
   - `/auth/change-password` - Password changes
   - `/auth/forgot-password` - Password reset request
   - `/auth/reset-password` - Password reset with token

2. **Subscription Service**
   - `/api/v1/subscriptions/:id/status` - Subscription processing status
   - `/api/v1/subscriptions/stats` - Subscription statistics
   - `/api/v1/subscriptions/:id/share` - Subscription sharing
   - `/api/v1/subscriptions/:id/notifications` - Subscription-specific notifications

3. **Notification Service**
   - `/v1/notifications/stats` - Notification statistics
   - `/v1/notifications/activity` - Notification activity data

4. **User Service**
   - `/api/v1/users/me/email-preferences` - Email notification preferences

### Authentication Notes
- The frontend expects `/api/auth/refresh` for token refresh, but this endpoint wasn't found in the backend
- The auth-related endpoints under `/auth/` (without `/api/` prefix) appear to be missing in the backend

## Request/Response Format Summary

### Authentication Requests
- Login/Signup: Email/password credentials in JSON format
- Session check: No request body, uses stored token in Authorization header
- Token refresh: Requires valid refresh token

### Authentication Responses
- Login/Signup: Returns user object and authentication tokens
- Session check: Returns authentication status, user info, and session details
- Token refresh: Returns new access token and optionally new refresh token

### Subscription Requests
- Create: Requires name, prompts, frequency
- Update: Accepts partial subscription fields
- Process: No request body required

### Subscription Responses
- List: Returns array of subscription objects with pagination
- Detail: Returns a single subscription object
- Process: Returns processing ID and status message

### Notification Requests
- List: Supports query parameters for filtering
- Mark as read: No request body required
- Delete: No request body required

### Notification Responses
- List: Returns array of notification objects with pagination and unread count
- Mark as read: Returns updated notification
- Delete: Returns success status and message

### Notes on Authentication Headers
- All authenticated requests require `Authorization: Bearer {token}` header
- Must include space after "Bearer"
- Also require `x-user-id` header with user ID
- Incorrectly formatted headers result in 401 MISSING_HEADERS error