#\!/bin/bash
# Production-optimized build script for React frontend

# Set environment variables
export NODE_ENV=production
export REACT_ENV=production
export VITE_APP_ENV=production
export VITE_USE_NETLIFY_REDIRECTS=false
export BABEL_ENV=production

echo "Starting production build..."
echo "NODE_ENV: $NODE_ENV"

# Install required Babel dependencies if not present
if [ \! -d "node_modules/@babel/preset-react" ]; then
  echo "Installing Babel dependencies..."
  npm install --save-dev @babel/preset-react @babel/plugin-transform-react-jsx terser
fi

# Run TypeScript check
echo "Checking TypeScript types..."
npx tsc --noEmit

# Clean existing build output
echo "Cleaning build directory..."
rm -rf dist
mkdir -p dist

# Run production build
echo "Building application in production mode..."
npx vite build --mode production

# Generate runtime environment script
echo "Creating runtime environment script..."
mkdir -p dist/assets
cat > dist/assets/env-config.js << ENVFILE
// Runtime environment configuration
window.RUNTIME_CONFIG = {
  AUTH_SERVICE_URL: "\${AUTH_SERVICE_URL:-PLACEHOLDER_AUTH_URL}",
  BACKEND_SERVICE_URL: "\${BACKEND_SERVICE_URL:-PLACEHOLDER_BACKEND_URL}",
  NODE_ENV: "production",
  REACT_APP_ENV: "production",
  USE_NETLIFY_REDIRECTS: false
};
console.log('Runtime config loaded:', window.RUNTIME_CONFIG);
ENVFILE

echo "Production build completed successfully\!"
echo "Output directory: $(pwd)/dist"
