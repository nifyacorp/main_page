/**
 * Standardized header constants
 * This file contains all the HTTP header names used across the application
 * to ensure consistency between frontend and backend
 */

// Authentication headers
export const AUTH_HEADER = 'Authorization';
export const USER_ID_HEADER = 'x-user-id';

// Standard request headers
export const CONTENT_TYPE = 'Content-Type';
export const ACCEPT = 'Accept';
export const X_REQUESTED_WITH = 'X-Requested-With';

// Content type values
export const JSON_CONTENT_TYPE = 'application/json';

// Auth token utilities
export const TOKEN_PREFIX = 'Bearer ';

/**
 * Ensures a token is properly formatted with the Bearer prefix
 * @param token - The authentication token
 * @returns A properly formatted Bearer token
 */
export const formatBearerToken = (token: string): string => 
  token.startsWith(TOKEN_PREFIX) ? token : `${TOKEN_PREFIX}${token}`;

/**
 * Returns headers with authentication information if available
 * @param accessToken - Optional access token
 * @param userId - Optional user ID
 * @returns Record of headers with authentication information
 */
export const getAuthHeaders = (
  accessToken?: string | null, 
  userId?: string | null
): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  if (accessToken) {
    headers[AUTH_HEADER] = formatBearerToken(accessToken);
  }
  
  if (userId) {
    headers[USER_ID_HEADER] = userId;
  }
  
  return headers;
}; 