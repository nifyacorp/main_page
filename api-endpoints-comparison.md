# API Endpoints Comparison

This document compares the documented backend API endpoints (from `backend/api-endpoints.md`) with the endpoints actually used by the frontend application.

## Comparison Table

| Endpoint Type | Documented in Backend | Used in Frontend | Status | Notes |
|---------------|----------------------|------------------|--------|-------|
| **Authentication** |
| `POST /api/v1/auth/refresh` | ✅ Documented | ✅ Used | Compliant | Auth refresh token endpoint |
| `POST /api/auth/refresh` | ✅ Documented | ✅ Used (legacy) | Compliant | Legacy endpoint, redirects to v1 version |
| **Users** |
| `GET /api/v1/users/me` | ✅ Documented | ✅ Used | Compliant | |
| `PUT /api/v1/users/me` | ✅ Documented | ✅ Used | Compliant | User profile editing |
| `GET /api/v1/users/preferences` | ✅ Documented | ✅ Used | Compliant | Get user language, theme preferences |
| `PUT /api/v1/users/preferences` | ✅ Documented | ✅ Used | Compliant | Update user language, theme preferences |
| **Subscriptions - Core** |
| `GET /api/v1/subscriptions` | ✅ Documented | ✅ Used | Compliant | |
| `POST /api/v1/subscriptions` | ✅ Documented | ✅ Used | Compliant | |
| `GET /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | |
| `PATCH /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | Standard endpoint for all subscription updates |
| `PUT /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Deprecated | Redirects to PATCH version with 308 status code |
| `DELETE /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | |
| `DELETE /api/v1/subscriptions/` | ❌ Not documented | ❌ Removed | Removed | Bulk deletion removed in favor of individual deletes |
| **Subscriptions - Status** |
| `PATCH /api/v1/subscriptions/:id/activate` | ✅ Documented | ❌ Deprecated | Deprecated | Use PATCH /:id with { active: true } instead |
| `PATCH /api/v1/subscriptions/:id/deactivate` | ✅ Documented | ❌ Deprecated | Deprecated | Use PATCH /:id with { active: false } instead |
| `PATCH /api/v1/subscriptions/:id/toggle` | ❌ Not documented | ✅ Used | Implemented | Standard endpoint for toggling subscription status |
| **Subscriptions - Processing** |
| `POST /api/v1/subscriptions/:id/process` | ❌ Not documented | ✅ Used | Missing in Docs | Important endpoint for triggering subscription processing |
| `POST /api/v1/subscriptions/process/:id` | ❌ Not documented | ✅ Used (fallback) | Missing in Docs | Alternative endpoint format used as fallback |
| `GET /api/v1/subscriptions/:id/status` | ❌ Not documented | ✅ Used | Missing in Docs | Check subscription processing status |
| `GET /api/v1/subscription-processing/:id` | ❌ Not documented | ✅ Used (fallback) | Missing in Docs | Alternative endpoint for status checking |
| **Subscriptions - Stats & Misc** |
| `GET /api/v1/subscriptions/stats` | ✅ Documented | ✅ Used | Compliant | |
| `GET /api/v1/subscriptions/debug-filter` | ✅ Documented | ❌ Not used | Unused | Debug endpoint |
| `POST /api/v1/subscriptions/:id/share` | ❌ Not documented | ✅ Used | Missing in Docs | Share subscription feature used by frontend |
| **Subscription Types** |
| `GET /api/v1/subscriptions/types` | ✅ Documented | ❌ Not used | Unused | |
| `POST /api/v1/subscriptions/types` | ✅ Documented | ❌ Not used | Unused | |
| `GET /api/v1/subscriptions/types/:id` | ✅ Documented | ❌ Not used | Unused | |
| **Notifications - Core** |
| `GET /api/v1/notifications` | ✅ Documented | ✅ Used | Compliant | |
| `GET /api/v1/notifications/:id` | ✅ Documented | ✅ Used | Compliant | |
| `DELETE /api/v1/notifications/:id` | ✅ Documented | ✅ Used | Compliant | |
| `DELETE /api/v1/notifications/delete-all` | ❌ Not documented | ✅ Used | Missing in Docs | Bulk delete all notifications |
| **Notifications - Status** |
| `PATCH /api/v1/notifications/:id/read` | ✅ Documented | ✅ Used | Compliant | |
| `PATCH /api/v1/notifications/read-all` | ✅ Documented | ✅ Used | Compliant | |
| **Notifications - Stats & Analytics** |
| `GET /api/v1/notifications/stats` | ✅ Documented | ✅ Used | Compliant | |
| `GET /api/v1/notifications/activity` | ❌ Not documented | ✅ Used | Missing in Docs | Used for activity analytics in frontend |
| **Notifications - Relations** |
| `GET /api/v1/subscriptions/:id/notifications` | ❌ Not documented | ✅ Used | Missing in Docs | Get notifications for a specific subscription |
| **Templates** |
| `GET /api/v1/templates` | ✅ Documented | ❌ Not used | Unused | |
| `GET /api/v1/templates/public` | ✅ Documented | ❌ Not used | Unused | |
| `GET /api/v1/templates/:id` | ✅ Documented | ❌ Not used | Unused | |
| `POST /api/v1/templates` | ✅ Documented | ❌ Not used | Unused | |
| **Diagnostics** |
| Various `/diagnostics/` endpoints | ✅ Documented | ❌ Not used | Unused | Development/testing endpoints |

## Summary

### Status Breakdown

- **Compliant**: 15 endpoints are documented and used correctly
- **Deprecated**: 3 endpoints are marked as deprecated in favor of standardized alternatives
- **Removed**: 1 endpoint has been removed (bulk deletion)
- **Missing in Documentation**: 6 endpoints are used by the frontend but not documented in the backend
- **Unused**: 11 endpoints are documented in the backend but not used by the frontend

### Recent API Standardization

We've implemented several changes to standardize the subscription API:

1. **Standardized on PATCH for Updates**:
   - Modified the `PUT /api/v1/subscriptions/:id` endpoint to redirect to PATCH
   - Now using PATCH for all subscription updates which is more RESTful

2. **Simplified Activation/Deactivation**:
   - Consolidated dedicated activation/deactivation endpoints into the standard PATCH update
   - Added a simpler toggle implementation in the frontend

3. **Removed Bulk Deletion**:
   - Removed the undocumented `DELETE /api/v1/subscriptions/` endpoint
   - Individual deletes are now the only supported deletion method

### Recommendations

1. **Document Missing Endpoints**: The backend documentation should be updated to include the 6 endpoints currently used by the frontend but missing from documentation:
   - Subscription processing endpoints
   - Subscription sharing
   - Notification activity endpoint
   - Related notification endpoints

2. **Review Unused Endpoints**: Consider deprecating or removing endpoints that are documented but not used by the frontend, unless they serve other purposes:
   - Subscription types endpoints
   - Template endpoints
   - Debug endpoints

3. **Continue API Standardization**: Apply similar standardization to other endpoint groups like notifications.