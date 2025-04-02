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