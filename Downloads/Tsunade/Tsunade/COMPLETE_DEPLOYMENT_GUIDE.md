# Complete Cloud Deployment Guide

## 🎯 Deployment Overview

This guide provides step-by-step instructions to deploy the LP Assistant Healthcare Platform to cloud services with a single working live URL.

## 📋 Pre-Deployment Checklist

### ✅ Application Components Audit

**Frontend (React):**
- ✅ All dependencies configured in package.json
- ✅ Build scripts properly set up
- ✅ Tailwind CSS configured
- ✅ Proxy configuration for local development
- ⚠️ Production environment variables need updating

**Backend (FastAPI):**
- ✅ All Python dependencies in requirements.txt
- ✅ FastAPI with SQLAlchemy and Alembic
- ✅ Authentication system (FastAPI-Users)
- ✅ Database migrations configured
- ⚠️ Production database URL needs configuration
- ⚠️ Secret keys need generation

**Missing Components Identified:**
1. Production database configuration
2. Secure secret key generation
3. CORS origins update for actual deployment URLs
4. Environment variable synchronization

## 🚀 Step 1: Create Vercel Project

### Manual Setup Process:

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Repository:**
   - Click "New Project"
   - Import from GitHub: `MalayThoria/Deadpool`
   - Configure settings:
     - Framework Preset: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://deadpool-backend.onrender.com/api/v1
   REACT_APP_ENVIRONMENT=production
   REACT_APP_APP_NAME=LP Assistant Healthcare Platform
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy:**
   - Click "Deploy"
   - Note the assigned URL (e.g., `deadpool-frontend-xyz.vercel.app`)

## 🚀 Step 2: Create Render Service

### Backend Deployment:

1. **Go to Render Dashboard:**
   ```
   https://render.com/dashboard
   ```

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect GitHub repository: `MalayThoria/Deadpool`
   - Configure:
     - Name: `deadpool-backend`
     - Environment: `Python 3`
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
     - Auto-Deploy: `Yes`

3. **Create PostgreSQL Database:**
   - Click "New" → "PostgreSQL"
   - Name: `deadpool-db`
   - Plan: `Free`
   - Note the connection details

### Environment Variables for Render:
```
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<generate-secure-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=<from-render-postgres>
CORS_ORIGINS=https://deadpool-frontend.vercel.app,http://localhost:3000
API_V1_STR=/api/v1
PROJECT_NAME=LP Assistant Healthcare Platform
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
RATE_LIMIT_PER_MINUTE=60
```

## 🔐 Step 3: Generate Secure Secrets

### Secret Key Generation:
```python
import secrets
import string

# Generate a secure secret key
def generate_secret_key(length=64):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

print(generate_secret_key())
```

### Required Secrets:
1. **SECRET_KEY** - For JWT token signing
2. **DATABASE_URL** - From Render PostgreSQL
3. **CORS_ORIGINS** - Actual Vercel URL

## 🔗 Step 4: Configure GitHub Secrets

### Repository Secrets Setup:

1. **Go to GitHub Repository:**
   ```
   https://github.com/MalayThoria/Deadpool/settings/secrets/actions
   ```

2. **Add Secrets:**
   ```
   VERCEL_TOKEN=<from-vercel-account-settings>
   VERCEL_ORG_ID=<from-vercel-team-settings>
   VERCEL_PROJECT_ID=<from-vercel-project-settings>
   RENDER_API_KEY=<from-render-account-settings>
   REACT_APP_API_URL=<actual-render-backend-url>
   SECRET_KEY=<generated-secure-key>
   DATABASE_URL=<render-postgres-url>
   ```

## 🔄 Step 5: Update Configuration Files

### Update vercel.json:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### Update render.yaml:
```yaml
services:
  - type: web
    name: deadpool-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: SECRET_KEY
        fromSecret: SECRET_KEY
      - key: DATABASE_URL
        fromDatabase:
          name: deadpool-db
          property: connectionString
      - key: CORS_ORIGINS
        value: https://deadpool-frontend.vercel.app,http://localhost:3000

databases:
  - name: deadpool-db
    databaseName: deadpool_db
    user: deadpool_user
```

## 🧪 Step 6: Test Deployment

### Verification Steps:

1. **Frontend Test:**
   ```bash
   curl -I https://deadpool-frontend.vercel.app
   # Should return 200 OK
   ```

2. **Backend Test:**
   ```bash
   curl -I https://deadpool-backend.onrender.com/health
   # Should return 200 OK
   ```

3. **API Integration Test:**
   ```bash
   curl https://deadpool-backend.onrender.com/api/v1/health
   # Should return JSON response
   ```

## 🎯 Step 7: Final Integration

### Update Frontend Environment:
1. Update Vercel environment variables with actual backend URL
2. Redeploy frontend to pick up new environment variables

### Update Backend CORS:
1. Update Render environment variables with actual frontend URL
2. Restart backend service

## 📱 Expected Live URLs

**Primary Application URL:**
```
https://deadpool-frontend.vercel.app
```

**Backend API URL:**
```
https://deadpool-backend.onrender.com
```

**API Documentation:**
```
https://deadpool-backend.onrender.com/docs
https://deadpool-backend.onrender.com/redoc
```

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Verify CORS_ORIGINS includes actual frontend URL
   - Check environment variable spelling

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check database service status

3. **Build Failures:**
   - Check build logs in Vercel/Render dashboards
   - Verify all dependencies are listed

4. **Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names

## ⏱️ Deployment Timeline

- **Manual Setup:** 30-45 minutes
- **First Deployment:** 10-15 minutes
- **Testing & Verification:** 10-15 minutes
- **Total Time:** ~1 hour

## 🎉 Success Criteria

✅ Frontend accessible at Vercel URL
✅ Backend API responding at Render URL
✅ Database connected and migrations applied
✅ Authentication system working
✅ CORS properly configured
✅ All features functional end-to-end

---

**Next Step:** Follow this guide step-by-step to create the actual cloud deployments and obtain the single working live URL.