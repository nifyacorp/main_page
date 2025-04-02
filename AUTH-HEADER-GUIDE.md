# Authentication Header Guide

## Authentication Header Format

All authenticated requests to the NIFYA API must include an Authorization header with a properly formatted Bearer token.

### Correct Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Common Issues

1. **Missing Bearer Prefix**
   - Incorrect: `Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Error: `MISSING_HEADERS: Invalid Authorization header format. Must be: Bearer <token>`
   - Fix: Ensure the token has the 'Bearer ' prefix

2. **Extra Spaces**
   - Incorrect: `Authorization: Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (note the double space)
   - Fix: Ensure there's only a single space between 'Bearer' and the token

3. **Lowercase 'bearer'**
   - Incorrect: `Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Fix: The backend accepts both 'Bearer' and 'bearer', but prefer 'Bearer' for consistency

## Authentication Flow

1. The frontend authenticates with the authentication service
2. The authentication service returns a token
3. The frontend adds 'Bearer ' prefix to the token if not already present
4. The token is stored in localStorage as `accessToken` with the Bearer prefix
5. All subsequent API requests include the Authorization header with this token

## Debugging Authentication Issues

If you encounter 401 Unauthorized errors:

1. Check the browser console for error details
2. Verify that localStorage has a valid token with 'Bearer ' prefix
3. Confirm the token hasn't expired
4. Try manually adding the 'Bearer ' prefix in localStorage:
   ```javascript
   let token = localStorage.getItem('accessToken');
   if (token && !token.startsWith('Bearer ')) {
     localStorage.setItem('accessToken', `Bearer ${token}`);
   }
   ```

## Routes

- The application now uses `/auth` instead of `/login` for authentication
- The App component includes a direct redirect from `/login` to `/auth` to prevent infinite loops
- All redirects on authentication failures point to `/auth`

## Preventing Authentication Loops

1. The application checks if a redirect is already in progress before initiating a new one
2. Authentication state is verified before making API calls
3. Proper Bearer token format is maintained throughout the application
4. Public routes are identified to prevent unnecessary authentication checks
5. Loop detection mechanism prevents infinite redirects between /auth and protected routes
6. The Auth component checks if a user is already authenticated before mounting
7. AuthContext computes authentication state from both user object and localStorage
8. Redirect flags are cleared when authentication is successful