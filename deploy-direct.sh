#!/bin/bash
set -e

PROJECT_ID="415554190254"
SERVICE_NAME="main-page"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/frontend"
AUTH_SERVICE_URL="https://authentication-service-415554190254.us-central1.run.app"
BACKEND_SERVICE_URL="https://backend-415554190254.us-central1.run.app"

echo "Building and pushing Docker image..."
docker build -t ${IMAGE_NAME}:latest .
docker push ${IMAGE_NAME}:latest

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="AUTH_SERVICE_URL=${AUTH_SERVICE_URL},BACKEND_SERVICE_URL=${BACKEND_SERVICE_URL}"

echo "Deployment complete! Your frontend should be available at:"
gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)"