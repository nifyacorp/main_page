FROM node:18 as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set environment variables that will be available during container startup
ENV AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app
ENV BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Install envsubst utility
RUN apk add --no-cache gettext

# Start script that processes the nginx template
RUN echo $'#!/bin/sh\n\
envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Command to run
CMD ["/start.sh"] 