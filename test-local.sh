#!/bin/bash
set -e

echo "Building Docker image..."
docker build -t frontend-local .

echo "Running container with test environment..."
docker run -d -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app \
  -e BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --name frontend-test-container frontend-local

echo "Waiting for container to start..."
sleep 3

echo "Checking container logs..."
docker logs frontend-test-container

echo "Testing nginx configuration..."
docker exec frontend-test-container cat /etc/nginx/conf.d/default.conf
docker exec frontend-test-container cat /etc/nginx/conf.d/api.conf

echo "To clean up the test container, run:"
echo "docker stop frontend-test-container && docker rm frontend-test-container"