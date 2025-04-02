# Frontend Deployment Guide

This document outlines the process for deploying the NIFYA frontend to Google Cloud Run.

## Local Testing

Before deploying to Cloud Run, you can test the Docker build locally:

1. Run the test script:
   ```bash
   ./test-local-docker.sh
   ```

2. Open `http://localhost:8080` in your browser to verify the application is working.

3. Check the logs to ensure environment variables are being correctly substituted:
   ```bash
   docker logs nifya-frontend-test
   ```

4. When finished testing, clean up:
   ```bash
   docker stop nifya-frontend-test && docker rm nifya-frontend-test
   ```

## Deploying to Cloud Run

### Manual Deployment

1. Build the Docker image:
   ```bash
   docker build -t gcr.io/PROJECT_ID/frontend:latest .
   ```

2. Push to Google Container Registry:
   ```bash
   docker push gcr.io/PROJECT_ID/frontend:latest
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy frontend \
     --image gcr.io/PROJECT_ID/frontend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars=AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app
   ```

### Using Cloud Build

Alternatively, you can use the included Cloud Build configuration:

1. Submit the build:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

## Environment Variables

The following environment variables must be set for proper API routing:

- `AUTH_SERVICE_URL`: URL of the authentication service (e.g., `https://authentication-service-415554190254.us-central1.run.app`)
- `BACKEND_SERVICE_URL`: URL of the backend service (e.g., `https://backend-415554190254.us-central1.run.app`)

## Troubleshooting

If you encounter issues with the deployment:

1. Check that the environment variables are properly set in Cloud Run.
2. Verify that the entrypoint script is correctly substituting variables by examining the logs.
3. Test the Docker image locally before deploying to Cloud Run.
4. Check for nginx configuration errors in the logs.