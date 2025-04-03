# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Make it clear this is a Vite project, not a Next.js project
RUN echo "This is a Vite project" > .vitebuild
RUN rm -f .next* next.config.js tsconfig.json
RUN touch tsconfig.json
RUN echo '{"compilerOptions":{"target":"ESNext","useDefineForClassFields":true,"lib":["DOM","DOM.Iterable","ESNext"],"allowJs":true,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true,"strict":true,"forceConsistentCasingInFileNames":true,"module":"ESNext","moduleResolution":"Node","resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx"},"include":["src"],"references":[{"path":"./tsconfig.node.json"}]}' > tsconfig.json

# Add typescript as explicit dependency to avoid Next.js trying to install it
RUN npm install --save-dev typescript@5.5.3

# Build using production script
ENV NODE_ENV=production
ENV BABEL_ENV=production
ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_NEXT_TYPESCRIPT=true

# Use explicit build command instead of script
RUN npm run build

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