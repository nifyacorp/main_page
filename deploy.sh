#!/bin/bash
set -e

PROJECT_ID="415554190254"
REGION="us-central1"
SERVICE_NAME="main-page"
IMAGE_NAME="gcr.io/${PROJECT_ID}/frontend"
VERSION=$(date +"%Y%m%d%H%M%S")

echo "Building and deploying frontend version ${VERSION}"

# Build the Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:latest .

# Push the Docker image to Container Registry
echo "Pushing to Google Container Registry..."
docker push ${IMAGE_NAME}:${VERSION}
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:${VERSION} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --quiet

echo "Deployment complete!"
echo "Service URL:"
gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)"