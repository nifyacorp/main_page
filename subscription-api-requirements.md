# Subscription API Requirements

This document lists all the endpoints required by the frontend subscription dashboard to function properly.

## Subscription Management

### Subscription Listing
- **GET `/api/v1/subscriptions`**
  - Description: Get a list of all subscriptions for the current user
  - Query Parameters:
    - `page`: Page number (optional)
    - `limit`: Items per page (optional)
    - `sort`: Field to sort by (optional)
    - `order`: Sort order (asc/desc) (optional)
    - `type`: Filter by subscription type (optional)
  - Response: Array of subscription objects

### Subscription Statistics
- **GET `/api/v1/subscriptions/stats`**
  - Description: Get statistics about the user's subscriptions
  - Response: Statistics object with counts by status, type, etc.

### Subscription Details
- **GET `/api/v1/subscriptions/:id`**
  - Description: Get detailed information about a specific subscription
  - URL Parameters:
    - `id`: Subscription ID
  - Response: Detailed subscription object

### Create Subscription
- **POST `/api/v1/subscriptions`**
  - Description: Create a new subscription
  - Request Body:
    - `name`: Subscription name
    - `type`: Subscription type (e.g., 'boe', 'real-estate', 'custom')
    - `typeId`: Template ID (optional)
    - `description`: Description (optional)
    - `prompts`: Array of search terms (1-3 items)
    - `frequency`: Notification frequency ('immediate' or 'daily')
    - `logo`: Icon/logo URL (optional)
  - Response: Created subscription object

### Update Subscription
- **PATCH `/api/v1/subscriptions/:id`**
  - Description: Update an existing subscription
  - URL Parameters:
    - `id`: Subscription ID
  - Request Body: Object with fields to update
  - Response: Updated subscription object

### Delete Subscription
- **DELETE `/api/v1/subscriptions/:id`**
  - Description: Delete a subscription
  - URL Parameters:
    - `id`: Subscription ID
  - Response: Success message

### Toggle Subscription Active Status
- **PATCH `/api/v1/subscriptions/:id/toggle`**
  - Description: Toggle the active status of a subscription
  - URL Parameters:
    - `id`: Subscription ID
  - Request Body:
    - `active`: Boolean indicating desired state (optional)
  - Response: Updated subscription object

### Process Subscription Immediately
- **POST `/api/v1/subscriptions/:id/process`**
  - Description: Manually trigger subscription processing
  - URL Parameters:
    - `id`: Subscription ID
  - Response: Process information or success message

## Template Management

### List Templates
- **GET `/api/v1/templates`**
  - Description: Get a list of all available subscription templates
  - Query Parameters:
    - `page`: Page number (optional)
    - `limit`: Items per page (optional)
  - Response: Array of template objects

### Template Details
- **GET `/api/v1/templates/:id`**
  - Description: Get detailed information about a specific template
  - URL Parameters:
    - `id`: Template ID
  - Response: Detailed template object

## Subscription Types

### List Subscription Types
- **GET `/api/v1/subscription-types`**
  - Description: Get a list of all available subscription types
  - Response: Array of subscription type objects

## Sharing (Optional/Future)

### Share Subscription
- **POST `/api/v1/subscriptions/:id/share`**
  - Description: Share a subscription with another user
  - URL Parameters:
    - `id`: Subscription ID
  - Request Body:
    - `recipient`: User ID or email to share with
  - Response: Success message or shared subscription object