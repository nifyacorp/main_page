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
RUN apk add --no-cache gettext

# Copy the built app to nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx template directory if it doesn't exist
RUN mkdir -p /etc/nginx/templates

# Copy nginx configuration as a template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Create entrypoint script
RUN echo '#!/bin/sh\n\
# Substitute environment variables in nginx config\n\
envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
# Start nginx\n\
exec nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Command to run the container
CMD ["/docker-entrypoint.sh"]