#!/bin/bash
set -e

# Build the Docker image
echo "Building the Docker image..."
docker build -t nifya-frontend:local .

# Run the container with environment variables
echo "Running the container..."
docker run -d -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app \
  -e BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --name nifya-frontend-test nifya-frontend:local

echo "Container is running on http://localhost:8080"
echo "To see logs, run: docker logs nifya-frontend-test"
echo "To stop the container, run: docker stop nifya-frontend-test && docker rm nifya-frontend-test"