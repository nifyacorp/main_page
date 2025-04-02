# Frontend Deployment Guide

This document details how to deploy the frontend application to Google Cloud Run.

## Prerequisites

- Google Cloud SDK installed and configured
- Docker installed for local testing
- Access to the project's Google Cloud project

## Configuration Files

The deployment uses the following configuration files:

1. **Dockerfile**: Builds the application and configures the nginx server
2. **nginx.conf**: Template for the nginx configuration with environment variables
3. **cloudbuild.yaml**: Configuration for Cloud Build deployment

## Environment Variables

The following environment variables must be set for the application to work correctly:

- `AUTH_SERVICE_URL`: URL of the authentication service
  - Example: https://authentication-service-415554190254.us-central1.run.app
- `BACKEND_SERVICE_URL`: URL of the backend API service
  - Example: https://backend-415554190254.us-central1.run.app

## Local Testing

### 1. Build and test the Docker image locally:

```bash
# Build the Docker image
docker build -t frontend-test .

# Run with environment variables
docker run -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app \
  -e BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --name frontend-test frontend-test
```

### 2. Verify the configuration:

```bash
# Check container logs
docker logs frontend-test

# Execute into the container to check configuration
docker exec -it frontend-test sh
cat /etc/nginx/conf.d/default.conf
```

### 3. Clean up:

```bash
docker stop frontend-test
docker rm frontend-test
```

## Cloud Run Deployment

### Using gcloud command line:

```bash
# Build the image using Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/frontend

# Deploy to Cloud Run
gcloud run deploy main-page \
  --image gcr.io/PROJECT_ID/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app
```

### Using Cloud Build Configuration:

```bash
# Submit the build with Cloud Build configuration
gcloud builds submit --config=cloudbuild.yaml
```

## Troubleshooting

### Environment Variable Substitution

The Docker entrypoint script handles environment variable substitution in the nginx configuration. Common issues:

1. **Missing Environment Variables**: Check that both `AUTH_SERVICE_URL` and `BACKEND_SERVICE_URL` are set.

2. **Nginx Variable Conflicts**: The nginx.conf template uses `$$` to escape nginx variables like `$host` and `$remote_addr`.

3. **Invalid Nginx Configuration**: If the container fails to start, check the logs for nginx configuration errors:

```bash
# Check recent container logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=main-page"
```

### Verifying Deployment

1. Once deployed, visit the Cloud Run service URL.

2. Check that API requests to `/api/auth/` and `/api/` are proxied correctly:
   - Open browser developer tools, go to Network tab
   - Make actions that trigger API calls
   - Verify requests are sent to the proper backend services

## Updating the Deployment

When making changes to the application:

1. Update the code
2. Rebuild and test locally
3. Push changes and redeploy

```bash
# For a quick redeployment with the same configuration
gcloud run services update main-page \
  --region us-central1 \
  --image gcr.io/PROJECT_ID/frontend:latest
```