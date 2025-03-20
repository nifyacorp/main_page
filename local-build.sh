#!/bin/bash

# Simple local build script for WSL environments

echo "🔨 Building frontend locally..."

# Create a minimal .env.local for the build
cat > .env.local << EOL
# Local Build Configuration
VITE_ENV=local
VITE_USE_NETLIFY_REDIRECTS=false
VITE_LOG_LEVEL=debug
EOL

# Run the build
npm run build

echo "✅ Build complete!"
echo ""
echo "To serve the build locally, run:"
echo "npm run preview"
echo ""