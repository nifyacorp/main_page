# Frontend Deployment Instructions

This document provides step-by-step instructions for deploying the frontend to Google Cloud Run.

## 🔧 Prerequisites

- Google Cloud SDK installed and configured
- Docker installed (for local testing)
- Access to the project's Google Cloud project

## 📄 Files Overview

- **Dockerfile**: Multi-stage build for React + Nginx
- **nginx.conf**: Base nginx configuration for static files
- **nginx-api.conf.template**: Template for API proxy configuration
- **cloudbuild.yaml**: Configuration for Cloud Build automated deployments
- **deploy.sh**: Script for direct deployment
- **test-local.sh**: Script for local testing

## 🚀 Deployment Options

### Option 1: Direct Deployment (Recommended)

Use the provided deployment script for a quick and reliable deployment:

```bash
./deploy.sh
```

This script:
1. Builds the Docker image
2. Tags it with a timestamp and 'latest'
3. Pushes to Google Container Registry
4. Deploys to Cloud Run with proper environment variables

### Option 2: Cloud Build Deployment

Submit a build to Cloud Build for automated deployment:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

This uses the cloudbuild.yaml configuration to handle the deployment process.

## 🧪 Local Testing

Before deploying, you can test the container locally:

```bash
./test-local.sh
```

This script:
1. Builds the Docker image
2. Runs it with test environment variables
3. Shows logs and configuration for verification
4. Leaves the container running for manual testing

## 🔍 Environment Variables

The frontend requires these environment variables:

- **AUTH_SERVICE_URL**: URL of the authentication service
  - Example: https://authentication-service-415554190254.us-central1.run.app

- **BACKEND_SERVICE_URL**: URL of the backend service
  - Example: https://backend-415554190254.us-central1.run.app

These are used in the nginx configuration to correctly proxy API requests.

## 🛠️ Configuration Details

### Nginx Configuration

The nginx setup consists of two parts:
1. **Base configuration** (nginx.conf): Static file serving, compression, SPA routing
2. **API proxying** (nginx-api.conf.template): Proxies requests to auth and backend services

This separation makes troubleshooting easier and avoids issues with environment variable substitution.

### Docker Container

The Docker container:
1. Builds the React app with npm
2. Sets up nginx with the configurations
3. Uses an entrypoint script to handle environment variables
4. Tests the configuration before starting

## 🔄 Updating the Deployment

When making changes:

1. Update the application code
2. Test locally with `./test-local.sh`
3. Deploy the changes with `./deploy.sh`

## 📋 Troubleshooting

### Common Issues

1. **404 for API requests**: Check the API service URLs in environment variables
2. **502 Bad Gateway**: Backend service may be unavailable
3. **Nginx configuration error**: Check logs for specific error messages

### Checking Logs

To view logs from the deployed service:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=main-page" --limit 50
```

### Debugging Container

To debug the container configuration:

```bash
gcloud run services describe main-page --region us-central1
```