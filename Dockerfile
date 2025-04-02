# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext bash

# Copy the built app to nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration 
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-api.conf.template /etc/nginx/templates/api.conf.template

# Create a shell script to handle configuration
COPY <<'EOF' /docker-entrypoint.sh
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
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Command to run the container
CMD ["/docker-entrypoint.sh"]