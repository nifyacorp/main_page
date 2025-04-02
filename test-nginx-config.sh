#!/bin/bash
# Test nginx config file syntax

# Check if nginx-api.conf.template has valid syntax after substitution
echo "Testing nginx configuration..."

# Create temporary environment variables
export AUTH_SERVICE_URL="http://localhost:3001"
export BACKEND_SERVICE_URL="http://localhost:3000"

# Create a temp directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Create a temporary test environment
cp nginx.conf $TEMP_DIR/default.conf
cp nginx-api.conf.template $TEMP_DIR/api.conf.template

# Process the environment variables
envsubst < $TEMP_DIR/api.conf.template > $TEMP_DIR/api.conf

# Show the processed config
echo "Processed configuration:"
cat $TEMP_DIR/api.conf

# Clean up
rm -rf $TEMP_DIR

echo "Configuration test completed"