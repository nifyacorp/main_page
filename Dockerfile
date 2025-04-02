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

# Copy the built app to nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# Create a basic nginx configuration
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Enable gzip compression \
    gzip on; \
    gzip_min_length 1000; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript; \
    \
    # Handle SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache"; \
    } \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 30d; \
        add_header Cache-Control "public, max-age=2592000"; \
    } \
    \
    # Error pages \
    error_page 404 /index.html; \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf.template

# Create entrypoint script to handle environment variables
RUN echo '#!/bin/bash' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx configuration with environment variables..."' >> /docker-entrypoint.sh && \
    echo 'AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"' >> /docker-entrypoint.sh && \
    echo 'BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:3000}"' >> /docker-entrypoint.sh && \
    echo 'echo "AUTH_SERVICE_URL=$AUTH_SERVICE_URL"' >> /docker-entrypoint.sh && \
    echo 'echo "BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL"' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "# Auth service location" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "location /api/auth/ {" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_pass $AUTH_SERVICE_URL/api/auth/;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header Host \\$host;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Real-IP \\$remote_addr;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Forwarded-Proto \\$scheme;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "}" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "# Backend service location" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "location /api/ {" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_pass $BACKEND_SERVICE_URL/api/;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header Host \\$host;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Real-IP \\$remote_addr;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "    proxy_set_header X-Forwarded-Proto \\$scheme;" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "}" >> /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Configuration complete, testing nginx config..."' >> /docker-entrypoint.sh && \
    echo 'nginx -t' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Command to run the container
CMD ["/docker-entrypoint.sh"]