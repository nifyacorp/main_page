#!/bin/bash

# Hybrid development script - runs frontend locally while connecting to cloud services
# This allows testing frontend changes against production backend/auth services

# Function to check if a port is in use
check_port() {
  if netstat -tuln | grep -q ":$1 "; then
    return 0  # Port is in use
  else
    return 1  # Port is available
  fi
}

# Find an available port starting from the given base port
find_available_port() {
  local base_port=$1
  local port=$base_port
  
  while check_port $port; do
    echo "Port $port is in use, trying next port..."
    port=$((port + 1))
  done
  
  echo $port
}

# Default port and find an available one if it's in use
DEFAULT_PORT=5173
PORT=$(find_available_port $DEFAULT_PORT)

echo "Using port $PORT for development server"

# Create .env.local with proxy configuration
cat > .env.local << EOL
# Hybrid Development Configuration
VITE_ENV=hybrid
VITE_ALLOW_DEBUG=true

# API URLs - Leave empty to use proxy in vite.config.ts
VITE_API_URL=
VITE_AUTH_URL=

# Enable more verbose logging
VITE_LOG_LEVEL=debug
EOL

echo "📱 Starting hybrid development mode..."
echo "🔌 Frontend: Local"
echo "🌐 Backend: Remote (via proxy)"
echo "🔐 Auth: Remote (via proxy)"
echo ""
echo "🔍 Debug page available at: http://localhost:$PORT/debug"
echo ""

# Start development server with proxy configuration and custom port
npm run dev -- --port $PORT --strictPort false