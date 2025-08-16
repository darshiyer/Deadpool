#!/bin/bash

# Set environment variables
export CI=false
export NODE_ENV=production

# Change to frontend directory
cd "$(dirname "$0")"

# Fix permissions for node_modules binaries
chmod +x node_modules/.bin/* 2>/dev/null || true

# Run the build using npx to bypass permission issues
echo "Starting React build with npx..."
npx react-scripts build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    exit 0
else
    echo "Build failed!"
    exit 1
fi