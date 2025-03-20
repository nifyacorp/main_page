#!/bin/bash

# Hybrid development script for WSL - runs frontend locally while connecting to cloud services
# Simplified version that assumes port might be in use and uses a different port

# Let's try a different port than the default 5173
PORT=5174

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

echo "📱 Starting hybrid development mode in WSL..."
echo "🔌 Frontend: Local"
echo "🌐 Backend: Remote (via proxy)"
echo "🔐 Auth: Remote (via proxy)"
echo ""
echo "🔍 Debug page available at: http://localhost:$PORT/debug"
echo ""

# Start development server with proxy configuration and custom port
npm run dev -- --port $PORT --strictPort false