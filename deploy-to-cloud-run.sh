#!/bin/bash
set -e

# Configuration
PROJECT_ID="415554190254"
SERVICE_NAME="frontend"
REGION="us-central1"
AUTH_SERVICE_URL="https://authentication-service-415554190254.us-central1.run.app"
BACKEND_SERVICE_URL="https://backend-415554190254.us-central1.run.app"

# Build image using Cloud Build
echo "Building Docker image using Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml --substitutions=_AUTH_SERVICE_URL=$AUTH_SERVICE_URL,_BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL

echo "Deployment completed successfully!"
echo "Your frontend should be available at: https://frontend-$PROJECT_ID.$REGION.run.app"