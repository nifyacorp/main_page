# Updated API Endpoint Comparison

This document provides an updated comparison of the endpoints used by the frontend against their backend counterparts, reflecting recent changes to the codebase.

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
| `/subscriptions` | `/api/v1/subscriptions/:id/status` | `/api/v1/subscriptions/:id/status` | GET | ✅ | Gets subscription processing status |
| `/dashboard` | `/api/v1/subscriptions/stats` | `/api/v1/subscriptions/stats` | GET | ✅ | Gets subscription statistics |
| `/subscriptions/:id` | `/api/v1/subscriptions/:id/share` | `/api/v1/subscriptions/:id/share` | POST | ✅ | Shares a subscription with another user |
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
| `/settings` | `/api/v1/users/me/email-preferences` | `/v1/users/me/email-preferences` | PATCH | ✅ | Updates email notification preferences |
| `/settings` | `/api/v1/users/me/test-email` | `/v1/users/me/test-email` | POST | ✅ | Sends a test email |

## Template Endpoints

| Frontend Route | Frontend Endpoint | Backend Endpoint | HTTP Method | Working? | Comments |
|----------------|-------------------|------------------|-------------|----------|----------|
| `/templates` | `/api/v1/templates` | `/api/v1/templates` | GET | ✅ | Lists available templates |
| `/templates/:id` | `/api/v1/templates/:id` | `/api/v1/templates/:id` | GET | ✅ | Gets template details |
| `/templates/new` | `/api/v1/templates` | `/api/v1/templates` | POST | ✅ | Creates custom template |
| `/templates/:id/subscribe` | `/api/v1/templates/:id/subscribe` | `/api/v1/templates/:id/subscribe` | POST | ✅ | Subscribe to a template |

## API Improvements Summary

### Added Backend Endpoints
The following endpoints have been implemented in the backend:

1. **Subscription Service**
   - ✅ `/api/v1/subscriptions/:id/status` - Subscription processing status
   - ✅ `/api/v1/subscriptions/stats` - Subscription statistics
   - ✅ `/api/v1/subscriptions/:id/share` - Subscription sharing

2. **User Service**
   - ✅ `/v1/users/me/email-preferences` - Email notification preferences
   - ✅ `/v1/users/me/test-email` - Send test email

### Remaining Missing Endpoints
Some endpoints are still not implemented in the backend:

1. **Authentication Service**
   - ❌ `/api/auth/refresh` - Token refresh endpoint
   - ❌ `/auth/logout` - User logout 
   - ❌ `/auth/profile` - Profile updates
   - ❌ `/auth/change-password` - Password changes
   - ❌ `/auth/forgot-password` - Password reset request
   - ❌ `/auth/reset-password` - Password reset with token

2. **Notification Service**
   - ❌ `/v1/notifications/stats` - Notification statistics
   - ❌ `/v1/notifications/activity` - Notification activity data

3. **Subscription Service**
   - ❌ `/api/v1/subscriptions/:id/notifications` - Subscription-specific notifications

## Client-Side Workarounds

1. **Subscription Status Fallbacks**
   - When the primary status endpoint fails, the client tries a fallback API path (`/v1/subscription-processing/:id`)
   - For API errors, client-side mock data is provided to prevent UI crashes

2. **Subscription Statistics Fallbacks**
   - When the stats endpoint fails, the client returns default values
   - A `createMockSubscriptionsFromStats` function creates mock subscriptions when listing fails

3. **Email Preferences Path Fix**
   - Frontend now correctly uses `/v1/users/me/email-preferences` instead of `/api/v1/users/me/email-preferences`
   - Uses more specific API response handling

## Impact Analysis

1. **Authentication Improvements**
   - ❌ Token refresh issues still exist - user sessions may expire without auto-refresh
   - ❌ Password management features still missing

2. **Subscription Enhancements**
   - ✅ Status tracking now working for subscription processing
   - ✅ Statistics endpoints added for dashboards
   - ✅ Subscription sharing functionality implemented

3. **User Settings**
   - ✅ Email notification preferences now functioning
   - ✅ Added ability to send test emails

## Remaining Critical Gaps

1. **Authentication Flow**
   - Token refresh functionality still missing, causing potential session expiration issues
   - User logout and password management endpoints still missing

2. **Notification Analytics**
   - Dashboard statistics for notifications still not implemented

## Request/Response Format Summary

All API endpoints follow consistent request/response formats as documented in the original comparison document.