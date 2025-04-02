#!/bin/bash
set -e

# Create a temporary directory for testing
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory for testing: $TEMP_DIR"

# Copy nginx config to test directory
cp nginx.conf $TEMP_DIR/nginx.conf.template

# Set environment variables for testing
export AUTH_SERVICE_URL="https://test-auth-service.example.com"
export BACKEND_SERVICE_URL="https://test-backend-service.example.com"

echo "Substituting environment variables..."
cd $TEMP_DIR

# Process the template with double $ escaping for nginx variables
cat nginx.conf.template | sed "s/\\\$\\\$/\$/g" > nginx.conf.temp
envsubst "\${AUTH_SERVICE_URL} \${BACKEND_SERVICE_URL}" < nginx.conf.temp > nginx.conf

echo "Generated nginx configuration:"
echo "-----------------------------"
cat nginx.conf
echo "-----------------------------"

# Check if nginx is installed, if so, validate the config
if command -v nginx >/dev/null 2>&1; then
    echo "Validating nginx configuration..."
    mkdir -p conf.d
    cp nginx.conf conf.d/default.conf
    nginx -t -c $(pwd)/nginx.conf -p $(pwd)
    
    if [ $? -eq 0 ]; then
        echo "✅ nginx configuration is valid!"
    else
        echo "❌ nginx configuration has errors"
        exit 1
    fi
else
    echo "nginx not found, skipping validation"
fi

echo "Cleaning up temporary directory..."
rm -rf $TEMP_DIR

echo "✅ Test completed successfully!"