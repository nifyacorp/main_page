#!/bin/bash
# Script to deploy the NIFYA frontend to Cloud Run

set -e # Exit immediately if a command exits with a non-zero status

# Configuration
PROJECT_ID="nifya-platform"  # Replace with your actual Google Cloud project ID
REGION="us-central1"
SERVICE_NAME="nifya-frontend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# Get the current timestamp for versioning
TIMESTAMP=$(date +%Y%m%d%H%M%S)
VERSION_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:$TIMESTAMP"

# Environment variables for the service
AUTH_SERVICE_URL="https://authentication-service-415554190254.us-central1.run.app"
BACKEND_SERVICE_URL="https://backend-415554190254.us-central1.run.app"

echo "🚀 Starting deployment of NIFYA frontend to Cloud Run..."

# Build the frontend for production
echo "📦 Building frontend assets..."
npm run build

# Build the Docker image
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME -t $VERSION_TAG .

# Push the Docker image to Container Registry
echo "📤 Pushing Docker image to Container Registry..."
docker push $IMAGE_NAME
docker push $VERSION_TAG

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "AUTH_SERVICE_URL=$AUTH_SERVICE_URL,BACKEND_SERVICE_URL=$BACKEND_SERVICE_URL" \
  --port 8080

echo "✅ Deployment complete!"
echo "Your frontend is now available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"