#!/bin/bash

# Hybrid development script for NIFYA Frontend
# Runs the frontend locally while connecting to remote backend services

echo "🚀 Starting NIFYA Frontend in hybrid development mode"
echo "📡 Frontend: Local | Backend: Remote Cloud Services"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local file not found!"
  echo "Please create the .env.local file first with the correct remote service URLs."
  exit 1
fi

# Display environment configuration
echo "🔧 Environment Configuration:"
echo "----------------------------------------"
grep -v "^#" .env.local
echo "----------------------------------------"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the development server
echo "🌐 Starting development server..."
echo "When the server is running, access the app at: http://localhost:5173"
echo "Debug page is available at: http://localhost:5173/debug"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Pass VITE_DEBUG flag to enable additional logging
VITE_DEBUG=true npm run dev