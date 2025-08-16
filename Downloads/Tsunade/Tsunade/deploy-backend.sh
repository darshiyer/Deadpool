#!/bin/bash

# Backend Deployment Script for Cloud Platforms
# This script prepares the backend for deployment

echo "Preparing backend for deployment..."

# Navigate to backend directory
cd backend

# Copy production requirements
cp requirements-prod.txt requirements.txt

# Create runtime.txt for Python version
echo "python-3.11.0" > runtime.txt

# Create app.py for some platforms that expect it
cp main.py app.py

# Set environment variables for production
export ENVIRONMENT=production
export DEBUG=False

echo "Backend prepared for deployment!"
echo "Files created:"
echo "- requirements.txt (production dependencies)"
echo "- runtime.txt (Python version)"
echo "- Procfile (process configuration)"
echo "- app.py (alternative entry point)"
echo ""
echo "Next steps:"
echo "1. Push to GitHub repository"
echo "2. Connect to Render/Railway/Heroku"
echo "3. Set environment variables in platform dashboard"
echo "4. Deploy!"

echo ""
echo "Required environment variables:"
echo "- DATABASE_URL"
echo "- SECRET_KEY"
echo "- CORS_ORIGINS"
echo "- OPENAI_API_KEY (optional)"