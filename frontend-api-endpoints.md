# Frontend API Endpoints

This document lists all API endpoints currently used by the frontend application, organized by resource type. This reflects the actual API usage in the codebase, not the documentation.

## Authentication Endpoints

- `POST /api/v1/auth/refresh` - Refresh authentication token
- `POST /api/auth/refresh` - Alternative path for token refresh (legacy)

## User Endpoints

- `GET /api/v1/users/me` - Get current user profile
- `GET /v1/users/me` - Get current user profile (used by subscription service)

## Subscription Endpoints

### Core CRUD Operations

- `GET /api/v1/subscriptions` - List all subscriptions
- `POST /api/v1/subscriptions` - Create a new subscription
- `GET /api/v1/subscriptions/:id` - Get a specific subscription
- `PUT /api/v1/subscriptions/:id` - Update a subscription
- `DELETE /api/v1/subscriptions/:id` - Delete a subscription
- `DELETE /api/v1/subscriptions/` - Delete all user subscriptions

### Subscription Status Management

- `PATCH /api/v1/subscriptions/:id/activate` - Activate a subscription
- `PATCH /api/v1/subscriptions/:id/deactivate` - Deactivate a subscription
- `PATCH /api/v1/subscriptions/:id/toggle` - Toggle subscription status (legacy endpoint)

### Subscription Processing

- `POST /api/v1/subscriptions/:id/process` - Process a subscription immediately
- `POST /api/v1/subscriptions/process/:id` - Alternative endpoint for processing (fallback)
- `GET /api/v1/subscriptions/:id/status` - Get subscription processing status
- `GET /api/v1/subscription-processing/:id` - Alternative endpoint for status (fallback)

### Subscription Statistics & Sharing

- `GET /api/v1/subscriptions/stats` - Get subscription statistics 
- `POST /api/v1/subscriptions/:id/share` - Share a subscription with another user

## Notification Endpoints

### Core CRUD Operations

- `GET /api/v1/notifications` - List all notifications
- `GET /api/v1/notifications/:id` - Get a specific notification
- `DELETE /api/v1/notifications/:id` - Delete a notification
- `DELETE /api/v1/notifications/delete-all` - Delete all notifications

### Notification Status Management

- `PATCH /api/v1/notifications/:id/read` - Mark a notification as read
- `PATCH /api/v1/notifications/read-all` - Mark all notifications as read

### Notification Statistics & Analytics

- `GET /api/v1/notifications/stats` - Get notification statistics
- `GET /api/v1/notifications/activity` - Get notification activity data

### Related Notifications

- `GET /api/v1/subscriptions/:subscriptionId/notifications` - Get notifications for a specific subscription

## Path Format Notes

- The frontend uses two formats for API paths:
  - `/api/v1/...` - Modern format with `/api` prefix
  - `/v1/...` - Legacy format without `/api` prefix
- Both formats are normalized by the `ensureV1Prefix` function in the backend client 