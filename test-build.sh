#!/bin/bash
set -e

echo "Building Docker image..."
docker build -t frontend-test:latest .

echo "Running container with test environment..."
docker run -d -p 8080:8080 \
  -e AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app \
  -e BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --name frontend-test frontend-test:latest

echo "Waiting for container to start..."
sleep 3

echo "Checking container logs..."
docker logs frontend-test

echo "Checking nginx configuration in container..."
docker exec frontend-test cat /etc/nginx/conf.d/default.conf

echo "Testing container HTTP response..."
curl -I http://localhost:8080

echo "To stop the test container, run:"
echo "docker stop frontend-test && docker rm frontend-test"