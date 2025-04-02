# Frontend Deployment Fix

## Issue

The frontend deployment in Cloud Run was failing with the following error:

```
Error response from daemon: dockerfile parse error line 32: unknown instruction: SET
```

## Root Cause

The Dockerfile was using a heredoc syntax (`COPY <<'EOF'`) to create the entrypoint script directly in the Dockerfile. This syntax is not supported by all Docker engine versions, particularly the one used by Cloud Build.

## Solution

1. Created a separate entrypoint script file (`docker-entrypoint.sh`) 
2. Modified the Dockerfile to copy this file instead of using the heredoc syntax

### Changes Made

1. Created a separate `docker-entrypoint.sh` file:

```bash
#!/bin/bash
set -e

echo "Starting nginx configuration with environment variables..."

# Default values for environment variables
export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
export BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:3000}"

echo "AUTH_SERVICE_URL=$AUTH_SERVICE_URL"
echo "BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL"

# Process API configuration template
envsubst < /etc/nginx/templates/api.conf.template > /etc/nginx/conf.d/api.conf

echo "Nginx configuration completed."
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"
```

2. Updated the Dockerfile to copy this file:

```dockerfile
# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
```

## Verification

The configuration can be tested locally with:

```bash
./test-nginx-config.sh
```

## Expected Deployment Behavior

When deployed to Cloud Run, the container will:

1. Start up and run the entrypoint script
2. Set default environment variables if not provided
3. Use `envsubst` to process the Nginx configuration template
4. Start Nginx with the processed configuration

This enables the single container to proxy requests to both the authentication service and the backend API.

## Environment Variables

The deployment relies on these environment variables being set:

- `AUTH_SERVICE_URL`: URL of the authentication service
- `BACKEND_SERVICE_URL`: URL of the backend API service

These are set in the Cloud Run deployment command in `cloudbuild.yaml`:

```yaml
'--set-env-vars=AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app'
```