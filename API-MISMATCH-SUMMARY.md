# API Mismatch Summary (Updated)

This document summarizes the API mismatches between the frontend and backend of the NIFYA application, with updated information.

## Key Findings

1. **Separate Authentication Service**: Authentication endpoints are handled by a separate Authentication microservice:
   - URL: `https://authentication-415554190254.us-central1.run.app`
   - All `/api/auth/*` requests are proxied to this service
   - The missing auth endpoints are likely implemented there, not in the main backend

2. **Recently Implemented Endpoints**: Several previously missing endpoints have now been implemented:
   - Subscription processing status: `/api/v1/subscriptions/:id/status`
   - Subscription statistics: `/api/v1/subscriptions/stats`
   - Subscription sharing: `/api/v1/subscriptions/:id/share`
   - Email preferences: `/v1/users/me/email-preferences`
   - Test email sending: `/v1/users/me/test-email`

3. **Remaining Gaps**: A few endpoints are still missing from the backend implementation:
   - Authentication service extras: `/auth/logout`, `/auth/profile`, etc. (different path pattern)
   - Notification statistics and activity data
   - Subscription-specific notification filtering

4. **Client-Side Workarounds**: The frontend implements various fallbacks for handling API failures or missing endpoints:
   - Mock subscription generation based on statistics
   - Multiple endpoint format attempts
   - Graceful error handling with sensible defaults

## Microservices Architecture

The NIFYA application uses a microservices architecture with at least three separate services:

1. **Authentication Service**:
   - URL: `https://authentication-415554190254.us-central1.run.app`
   - Handles: Login, signup, session management, tokens, OAuth
   - API Path Pattern: `/api/auth/*`

2. **Backend API**:
   - URL: `https://backend-415554190254.us-central1.run.app`
   - Handles: Subscriptions, notifications, user profiles, templates
   - API Path Pattern: `/v1/*` (note: frontend calls these as `/api/v1/*`)

3. **Subscription Worker**:
   - URL: Referenced in environment variables
   - Handles: Background processing of subscriptions
   - Not directly called from frontend

## Authentication Flow Analysis

The token refresh functionality appears to be partially implemented:

1. **Frontend Implementation**:
   - The frontend has code in `backendClient.ts` to handle token refresh
   - It calls `/api/auth/refresh` when tokens expire
   - There's also a refresh mechanism in `axios-config.ts`

2. **Authentication Service**:
   - We don't have direct access to check if `/api/auth/refresh` is implemented
   - Since it's a separate microservice, this endpoint might exist but we can't confirm

3. **Potential Issues**:
   - If the endpoint is missing in the Authentication Service, token refresh won't work
   - This could cause users to be logged out when tokens expire
   - The frontend handles this gracefully by redirecting to login

## Suggested Actions

1. **Authentication Service Verification**:
   - Verify that `/api/auth/refresh` is properly implemented in the Authentication Service
   - Check that it accepts a refresh token and returns a new access token
   - Ensure it follows the expected format that the frontend is looking for

2. **Backend Additions**:
   - Implement notification statistics endpoints for dashboard functionality
   - Add subscription-specific notification filtering

3. **Frontend Updates**:
   - Ensure consistent API path patterns for authentication endpoints
   - Update any hardcoded API paths to match the backend implementation

## Implementation Priority

1. **High Priority**:
   - Verify Authentication Service token refresh functionality
   - Test full authentication flow including token expiration

2. **Medium Priority**:
   - Implement notification statistics for dashboard analytics
   - Standardize auth endpoint path patterns

3. **Lower Priority**:
   - Add subscription-specific notification filtering

## Testing Plan

1. **Authentication Flow Testing**:
   - Test token expiration scenarios with Authentication Service
   - Verify proper refresh token behavior
   - Check logout and session management

2. **Analytics Testing**:
   - Verify dashboard statistics from existing endpoints
   - Test any newly implemented notification statistics

3. **API Consistency Testing**:
   - Verify all endpoint response formats are consistent
   - Check error handling across all services