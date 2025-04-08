# API Endpoint Usage Analysis

This report analyzes how the frontend application uses the backend API endpoints as documented in `backend/api-endpoints.md`.

## Overview

The frontend application uses two different approaches for API communication:

1. **Legacy Services** (`/src/services/api/`): Older implementation with direct API calls
2. **Modern Services** (`/src/lib/api/services/`): Newer implementation with better error handling and data validation

Both sets of services are used in the application, but there appears to be an ongoing transition toward the modern services.

## API Base URL Configuration

The application correctly configures the API base URL:

- When using Netlify redirects: Relative URLs (`/api`)
- When connecting directly: Environment variable `VITE_BACKEND_URL` or fallback to `https://backend-415554190254.us-central1.run.app`

## Endpoint Compliance Analysis

### Subscription Endpoints

| Documented Endpoint | Frontend Implementation | Status |
|--------------------|-------------------------|--------|
| `GET /api/v1/subscriptions` | ✅ Both legacy and modern services | Compliant |
| `POST /api/v1/subscriptions` | ✅ Both legacy and modern services | Compliant |
| `GET /api/v1/subscriptions/:id` | ✅ Both legacy and modern services | Compliant |
| `PUT /api/v1/subscriptions/:id` | ⚠️ Legacy uses `PATCH` instead of `PUT` | Partially Compliant |
| `DELETE /api/v1/subscriptions/:id` | ✅ Both legacy and modern services | Compliant |
| `PATCH /api/v1/subscriptions/:id/activate` | ⚠️ Uses `/toggle` instead | Non-compliant |
| `PATCH /api/v1/subscriptions/:id/deactivate` | ⚠️ Uses `/toggle` instead | Non-compliant |
| `GET /api/v1/subscriptions/stats` | ✅ Implemented in legacy service | Compliant |

### Notification Endpoints

| Documented Endpoint | Frontend Implementation | Status |
|--------------------|-------------------------|--------|
| `GET /api/v1/notifications` | ✅ Both legacy and modern services | Compliant |
| `GET /api/v1/notifications/:id` | ✅ Both legacy and modern services | Compliant |
| `PATCH /api/v1/notifications/:id/read` | ⚠️ Uses `POST` or `PUT` instead of `PATCH` | Non-compliant |
| `DELETE /api/v1/notifications/:id` | ✅ Both legacy and modern services | Compliant |
| `PATCH /api/v1/notifications/read-all` | ⚠️ Uses `PUT` or `POST` instead of `PATCH` | Non-compliant |
| `GET /api/v1/notifications/stats` | ✅ Implemented in legacy service | Compliant |

### User Endpoints

| Documented Endpoint | Frontend Implementation | Status |
|--------------------|-------------------------|--------|
| `GET /api/v1/users/me` | ✅ Referenced in subscription service | Compliant |
| Other user endpoints | ❓ Not fully analyzed | Unknown |

## Issues Identified

1. **Inconsistent HTTP Methods**: The frontend sometimes uses different HTTP methods than documented:
   - `PATCH` instead of `PUT` for subscription updates
   - `POST` instead of `PATCH` for marking notifications as read
   - `PUT` instead of `PATCH` for marking all notifications as read

2. **Activation/Deactivation Endpoints**: The frontend uses a single `/toggle` endpoint instead of the separate activate/deactivate endpoints documented in the API.

3. **Error Handling Complexity**: The legacy services have complex error handling to account for different response formats, suggesting the API responses may not be consistent.

4. **Multiple Service Implementations**: Having both legacy and modern services for the same endpoints could lead to inconsistent behavior and maintenance challenges.

## Recommendations

1. **Standardize HTTP Methods**: Update the frontend to use the correct HTTP methods according to the API documentation, or update the documentation to match actual implementation.

2. **Consolidate Service Implementations**: Complete the transition to the modern service architecture to eliminate duplicate code.

3. **API Response Normalization**: Simplify the complex response parsing in the legacy services by ensuring the backend returns consistent response formats.

4. **Complete Endpoint Alignment**: Update any custom endpoints (like `/toggle`) to align with the documented API structure.

## Conclusion

The frontend application generally follows the documented API structure with some exceptions. The transition to the more structured modern service layer should be completed to ensure consistent API usage across the application. 