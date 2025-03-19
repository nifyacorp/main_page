#!/bin/bash
# Script to check build issues before deploying

echo "Checking frontend build..."
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the build
echo "Running build check..."
npm run build:netlify

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ Build successful! Ready for deployment."
  exit 0
else
  echo "❌ Build failed! Fix the errors before deploying."
  exit 1
fi