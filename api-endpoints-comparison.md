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
| `PUT /api/v1/users/me` | ✅ Documented | ❌ Not used | Unused | |
| `GET /api/v1/users/preferences` | ✅ Documented | ❌ Not used | Unused | |
| `PUT /api/v1/users/preferences` | ✅ Documented | ❌ Not used | Unused | |
| **Subscriptions - Core** |
| `GET /api/v1/subscriptions` | ✅ Documented | ✅ Used | Compliant | |
| `POST /api/v1/subscriptions` | ✅ Documented | ✅ Used | Compliant | |
| `GET /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | |
| `PUT /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | |
| `DELETE /api/v1/subscriptions/:id` | ✅ Documented | ✅ Used | Compliant | |
| `DELETE /api/v1/subscriptions/` | ❌ Not documented | ✅ Used | Missing in Docs | Bulk delete all user subscriptions |
| **Subscriptions - Status** |
| `PATCH /api/v1/subscriptions/:id/activate` | ✅ Documented | ✅ Used | Compliant | |
| `PATCH /api/v1/subscriptions/:id/deactivate` | ✅ Documented | ✅ Used | Compliant | |
| `PATCH /api/v1/subscriptions/:id/toggle` | ❌ Not documented | ✅ Used (legacy) | Missing in Docs | Legacy endpoint, should be replaced with activate/deactivate |
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
- **Missing in Documentation**: 9 endpoints are used by the frontend but not documented in the backend
- **Unused**: 14 endpoints are documented in the backend but not used by the frontend

### Recommendations

1. **Document Missing Endpoints**: The backend documentation should be updated to include the 9 endpoints currently used by the frontend but missing from documentation:
   - Bulk deletion endpoints
   - Subscription processing endpoints
   - Subscription sharing
   - Notification activity endpoint
   - Related notification endpoints

2. **Review Unused Endpoints**: Consider deprecating or removing endpoints that are documented but not used by the frontend, unless they serve other purposes:
   - User preferences endpoints
   - Subscription types endpoints
   - Template endpoints
   - Debug endpoints

3. **Standardize Endpoint Patterns**: Several endpoints have alternate formats (like processing endpoints). Standardize on one pattern.

4. **Legacy Support Plan**: Some legacy endpoints are still in use. Create a plan to migrate to the standardized versions.