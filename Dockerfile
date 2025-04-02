# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy production build script
COPY production-build.sh ./
RUN chmod +x ./production-build.sh

# Build using production script
ENV NODE_ENV=production
ENV BABEL_ENV=production
RUN ./production-build.sh

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