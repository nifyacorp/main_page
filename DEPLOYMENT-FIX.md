# Frontend Deployment Fix

## Issue

The frontend deployment in Cloud Run was failing with two errors:

1. Initially: `Error response from daemon: dockerfile parse error line 32: unknown instruction: SET`
2. After fixing that: `[emerg] 3#3: "location" directive is not allowed here in /etc/nginx/conf.d/api.conf:2`

## Root Causes

1. **Docker Build Error**: The Dockerfile was using a heredoc syntax (`COPY <<'EOF'`) which isn't supported by all Docker engine versions.

2. **Nginx Configuration Error**: The Nginx configuration files were structured incorrectly, with location directives used outside of a server context block.

## Solution

We've completely revised the approach to make it simpler and more reliable:

1. Created a single `nginx.template` file with the complete Nginx configuration including all server blocks and proxy settings
2. Modified the entrypoint script to process this template directly into `/etc/nginx/nginx.conf`
3. Simplified the Dockerfile to use this approach

### Changes Made

1. Created a comprehensive `nginx.template` file with a complete, valid Nginx configuration:

```nginx
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    # Enable gzip compression globally
    gzip on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    server {
        listen 8080 default_server;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Auth service - must be before the more general /api/ location
        location /api/auth/ {
            proxy_pass ${AUTH_SERVICE_URL}/api/auth/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend service
        location /api/ {
            proxy_pass ${BACKEND_SERVICE_URL}/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static file serving and SPA routing
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache";
        }

        # Other configurations...
    }
}
```

2. Simplified the entrypoint script:

```bash
#!/bin/bash
set -e

echo "Starting nginx configuration with environment variables..."

# Default values for environment variables
export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
export BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:3000}"

echo "AUTH_SERVICE_URL=$AUTH_SERVICE_URL"
echo "BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL"

# Process the main nginx template
envsubst '${AUTH_SERVICE_URL} ${BACKEND_SERVICE_URL}' < /etc/nginx/nginx.template > /etc/nginx/nginx.conf

echo "Nginx configuration completed."
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"
```

3. Simplified the Dockerfile:

```dockerfile
# Runtime stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext bash

# Copy the built app to nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the template nginx configuration
COPY nginx.template /etc/nginx/nginx.template

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Command to run the container
CMD ["/docker-entrypoint.sh"]
```

## Advantages of This Approach

1. **Simpler Configuration**: All Nginx configuration in a single file
2. **Direct Main Config**: Uses the main nginx.conf file instead of directory includes
3. **Complete Control**: Template includes all necessary context blocks
4. **Reduced Fragmentation**: No need to maintain multiple config files
5. **Better Validation**: Easier to validate the entire config at once

## Verification

The configuration can be tested locally with:

```bash
./test-nginx-config.sh
```

## Expected Deployment Behavior

When deployed to Cloud Run, the container will:

1. Start up and run the entrypoint script
2. Set default environment variables if not provided
3. Use `envsubst` to process the Nginx configuration template directly to nginx.conf
4. Start Nginx with the processed configuration

## Environment Variables

The deployment relies on these environment variables being set:

- `AUTH_SERVICE_URL`: URL of the authentication service
- `BACKEND_SERVICE_URL`: URL of the backend API service