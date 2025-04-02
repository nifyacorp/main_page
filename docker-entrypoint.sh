#!/bin/bash
set -e

echo "Starting nginx configuration with environment variables..."

# Default values for environment variables
export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
export BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:3000}"
export NODE_ENV="production"
export REACT_APP_ENV="production"

echo "AUTH_SERVICE_URL=$AUTH_SERVICE_URL"
echo "BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL"
echo "NODE_ENV=$NODE_ENV"

# Create runtime environment JS file
mkdir -p /usr/share/nginx/html/assets
cat > /usr/share/nginx/html/assets/env-config.js << EOF
// Runtime environment configuration - updated at container startup
export const RUNTIME_CONFIG = {
  AUTH_SERVICE_URL: "${AUTH_SERVICE_URL}",
  BACKEND_SERVICE_URL: "${BACKEND_SERVICE_URL}",
  NODE_ENV: "production",
  REACT_APP_ENV: "production",
  USE_NETLIFY_REDIRECTS: false
};

// Make available globally for backward compatibility
window.RUNTIME_CONFIG = RUNTIME_CONFIG;
console.log('Runtime config loaded:', RUNTIME_CONFIG);
EOF

# Process the main nginx template
envsubst '${AUTH_SERVICE_URL} ${BACKEND_SERVICE_URL}' < /etc/nginx/nginx.template > /etc/nginx/nginx.conf

echo "Nginx configuration completed."
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"