# NIFYA Backend Microservices Flow

This document outlines the microservices architecture and API flow in the NIFYA application, focusing on how the backend distributes requests to various specialized services.

## Microservices Architecture Overview

The NIFYA application employs a microservices architecture consisting of at least four separate services:

1. **Frontend** (React application)
   - Main user interface
   - Makes API calls to other services via the backend

2. **Authentication Service**
   - URL: `https://authentication-415554190254.us-central1.run.app` 
   - Handles user authentication, token management
   - Path pattern: `/api/auth/*`

3. **Backend API**
   - URL: `https://backend-415554190254.us-central1.run.app`
   - Central router/coordinator for other services
   - Handles direct database operations
   - Path pattern: `/v1/*` (frontend calls as `/api/v1/*`)

4. **Subscription Worker**
   - URL: Referenced as environment variable `VITE_SUBSCRIPTION_WORKER`
   - Processes subscription requests asynchronously
   - Handles the actual data processing jobs

5. **DOGA Processor** (Document Generator/Analyzer)
   - Referenced in debug scripts
   - Appears to be used for specialized document parsing

## Backend as Router Pattern

The backend serves as both a direct API handler and a router to other specialized services. Here's a breakdown of how different endpoints are handled:

### 1. Direct Backend Processing Endpoints

These endpoints are handled directly by the backend service without relying on other microservices:

| Endpoint | Method | Description | Service |
|----------|--------|-------------|---------|
| `/v1/users/me` | GET | Get user profile | Backend |
| `/v1/users/me` | PATCH | Update user profile | Backend |
| `/v1/users/me/email-preferences` | GET/PATCH | Manage email preferences | Backend |
| `/v1/subscriptions` | GET | List subscriptions | Backend |
| `/v1/subscriptions/:id` | GET | Get subscription details | Backend |
| `/v1/subscriptions/:id` | PATCH | Update subscription | Backend |
| `/v1/subscriptions/:id` | DELETE | Delete subscription | Backend |
| `/v1/subscriptions/:id/toggle` | PATCH | Toggle subscription status | Backend |
| `/v1/subscriptions/stats` | GET | Get subscription statistics | Backend |
| `/v1/notifications` | GET | List notifications | Backend |
| `/v1/notifications/:id` | GET | Get notification details | Backend |
| `/v1/notifications/:id/read` | POST | Mark notification as read | Backend |
| `/v1/notifications/read-all` | POST | Mark all notifications as read | Backend |
| `/v1/notifications/:id` | DELETE | Delete notification | Backend |
| `/v1/notifications/delete-all` | DELETE | Delete all notifications | Backend |

### 2. Backend-to-Worker Processing Flow

These endpoints involve the backend delegating work to specialized worker services:

| Endpoint | Method | Routing Path | Description | Service Flow |
|----------|--------|-------------|-------------|--------------|
| `/v1/subscriptions/:id/process` | POST | → Subscription Worker | Trigger subscription processing | Backend → Subscription Worker |
| `/v1/subscriptions/:id/status` | GET | → Subscription Worker | Check processing status | Backend → Subscription Worker |
| `/v1/subscription-processing/:id` | GET | → Subscription Worker | Alternative status check | Backend → Subscription Worker |

### 3. Authentication Service Flow

All authentication-related endpoints are handled by the dedicated Authentication Service:

| Endpoint | Method | Description | Service |
|----------|--------|-------------|---------|
| `/api/auth/login` | POST | User login | Authentication Service |
| `/api/auth/signup` | POST | User registration | Authentication Service |
| `/api/auth/google/login` | POST | Google OAuth initiation | Authentication Service |
| `/api/auth/google/callback` | POST | Google OAuth callback | Authentication Service |
| `/api/auth/session` | GET | Session validation | Authentication Service |
| `/api/auth/refresh` | POST | Token refresh | Authentication Service |

## Subscription Processing Flow

The subscription processing flow is particularly complex, involving multiple services:

1. **Frontend Request**
   - User triggers processing via UI (`/subscriptions` page)
   - Frontend calls `/api/v1/subscriptions/:id/process` (POST)

2. **Backend Router**
   - Receives request at `/v1/subscriptions/:id/process`
   - Validates and authenticates the request
   - Creates a processing job/task
   - Forwards the job to the Subscription Worker
   - Returns a job ID/processing ID to the frontend

3. **Subscription Worker**
   - Receives processing job
   - Performs the actual data fetching and processing
   - May use additional services like DOGA for document parsing
   - Updates job status (pending → processing → completed/failed)
   - Generates notifications based on results

4. **Status Checking**
   - Frontend polls `/api/v1/subscriptions/:id/status` to track progress
   - Backend routes status check to Subscription Worker
   - Frontend displays progress to user
   - Frontend stops polling when status is "completed" or "failed"

## Fallback and Error Handling

The system includes multiple fallback mechanisms for handling service failures:

1. **Alternative Endpoints**
   - If primary process endpoint fails, tries `/v1/subscriptions/process/:id` 
   - If primary status endpoint fails, tries `/v1/subscription-processing/:id`

2. **Mock Data Generation**
   - Creates mock subscription data when actual service data is unavailable
   - Uses subscription statistics to generate plausible mock entries

3. **Client-Side Recovery**
   - Graceful error handling with defaults when services fail
   - Automatic authentication header fixing

## Debugging Tools

The application includes several debug tools for monitoring service interactions:

1. **Web Debug Interface** (`/debug` route)
   - Subscription API testing
   - Data comparison between different hooks
   - System information

2. **CLI Scripts**
   - `initialize-doga.ps1`: Configure DOGA processor settings
   - `test-doga.ps1`: Test DOGA with sample data
   - `check-subscription-logs.ps1`: View subscription processing logs
   - `fix-notifications.ps1`: Fix notification delivery issues

## Environmental Configuration

Service URLs are configured through environment variables:

```
VITE_AUTH_URL=https://authentication-415554190254.us-central1.run.app
VITE_BACKEND_URL=https://backend-415554190254.us-central1.run.app
VITE_SUBSCRIPTION_WORKER=http://localhost:5000 (development) or production URL
```

The application uses different configuration based on the environment mode (development/production).