#!/bin/bash

# Custom build script for Vercel deployment
# This script fixes permission issues with react-scripts

set -e

echo "Starting custom build process..."

# Ensure we're in the frontend directory
cd "$(dirname "$0")"

# Set execute permissions for node_modules binaries
chmod +x node_modules/.bin/* 2>/dev/null || true

# Use npx to run react-scripts (bypasses permission issues)
echo "Building React application..."
CI=false npx react-scripts build

echo "Build completed successfully!"