#!/bin/bash
# Test nginx config file syntax

# Check if nginx template has valid syntax after substitution
echo "Testing nginx configuration..."

# Create temporary environment variables
export AUTH_SERVICE_URL="http://localhost:3001"
export BACKEND_SERVICE_URL="http://localhost:3000"

# Create a temp directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Create a temporary test environment
cp nginx.template $TEMP_DIR/nginx.template

# Process the environment variables
envsubst '${AUTH_SERVICE_URL} ${BACKEND_SERVICE_URL}' < $TEMP_DIR/nginx.template > $TEMP_DIR/nginx.conf

# Show the processed config
echo "Processed configuration:"
cat $TEMP_DIR/nginx.conf

# Check if nginx config is valid (if nginx is installed)
if command -v nginx &> /dev/null; then
    echo "Validating nginx configuration..."
    nginx -t -c $TEMP_DIR/nginx.conf
else
    echo "Nginx not installed, skipping validation"
fi

# Clean up
rm -rf $TEMP_DIR

echo "Configuration test completed"