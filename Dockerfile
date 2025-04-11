FROM node:18 as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Remove existing package-lock.json to avoid dependency issues
RUN rm -f package-lock.json

# Install dependencies including platform-specific ones for Linux
RUN npm install

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set environment variables that will be available during container startup
ENV AUTH_SERVICE_URL="https://authentication-service-415554190254.us-central1.run.app"
ENV BACKEND_SERVICE_URL="https://backend-415554190254.us-central1.run.app"

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Use the standard nginx configuration
RUN sed -i 's/listen       80/listen       8080/g' /etc/nginx/conf.d/default.conf

# Direct configuration rather than using environment variables
RUN sed -i 's|\${AUTH_SERVICE_URL}|https://authentication-service-415554190254.us-central1.run.app|g' /etc/nginx/conf.d/default.conf
RUN sed -i 's|\${BACKEND_SERVICE_URL}|https://backend-415554190254.us-central1.run.app|g' /etc/nginx/conf.d/default.conf

# Command to run
CMD ["nginx", "-g", "daemon off;"] 