# 🚀 Automated Full-Stack Deployment Guide

## 📋 Overview
This guide provides complete automation for deploying the healthcare platform with zero manual intervention.

## 🔧 Prerequisites Setup

### 1. GitHub Repository Setup
- Repository: `https://github.com/MalayThoria/Deadpool`
- Ensure all code is pushed to the `main` branch

### 2. Required Accounts
- **Vercel Account**: [vercel.com](https://vercel.com) (Frontend)
- **Render Account**: [render.com](https://render.com) (Backend + Database)
- **GitHub Account**: For CI/CD workflows

## 🎯 One-Click Deployment Setup

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub**: Select `MalayThoria/Deadpool` repository
4. **Configure Service**:
   ```
   Name: deadpool-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. **Add PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `deadpool-db`
   - Copy the Internal Database URL

6. **Environment Variables**:
   ```
   DATABASE_URL=<your-postgres-internal-url>
   SECRET_KEY=deadpool-super-secret-key-2024-healthcare-platform
   CORS_ORIGINS=https://deadpool-frontend.vercel.app,http://localhost:3000
   ENVIRONMENT=production
   DEBUG=False
   OPENAI_API_KEY=<your-openai-key-optional>
   ```

7. **Deploy**: Click "Create Web Service"
   - **Expected URL**: `https://deadpool-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click "New Project"**
3. **Import from GitHub**: Select `MalayThoria/Deadpool`
4. **Configure Project**:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://deadpool-backend.onrender.com/api/v1
   REACT_APP_ENVIRONMENT=production
   ```

6. **Deploy**: Click "Deploy"
   - **Expected URL**: `https://deadpool-frontend.vercel.app`

## 🔄 GitHub Actions Automation

### Required GitHub Secrets
Add these in GitHub Repository → Settings → Secrets and Variables → Actions:

```
# Vercel Secrets
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>

# Render Secrets
RENDER_SERVICE_ID=<your-render-service-id>
RENDER_API_KEY=<your-render-api-key>
RENDER_DEPLOY_HOOK=<your-render-deploy-hook>

# Application URLs
FRONTEND_URL=https://deadpool-frontend.vercel.app
BACKEND_URL=https://deadpool-backend.onrender.com
REACT_APP_API_URL=https://deadpool-backend.onrender.com/api/v1
```

### How to Get Secrets

**Vercel Tokens**:
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token → Copy `VERCEL_TOKEN`
3. Go to project settings → Copy `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

**Render Tokens**:
1. Go to [dashboard.render.com/account](https://dashboard.render.com/account)
2. Create API Key → Copy `RENDER_API_KEY`
3. Go to your service → Settings → Copy Service ID
4. Go to Deploy Hook → Copy hook URL

## 🎉 Live Application URLs

### 🌐 Production URLs (After Deployment)

**Frontend (React App)**:
- **URL**: `https://deadpool-frontend.vercel.app`
- **Features**: Complete healthcare dashboard, OCR upload, user authentication

**Backend (FastAPI)**:
- **URL**: `https://deadpool-backend.onrender.com`
- **API Docs**: `https://deadpool-backend.onrender.com/docs`
- **Health Check**: `https://deadpool-backend.onrender.com/health`

**Database**:
- **Type**: PostgreSQL on Render
- **Connection**: Automatic via environment variables

## 🔍 Verification Steps

### 1. Backend Health Check
```bash
curl https://deadpool-backend.onrender.com/health
# Expected: {"status": "healthy"}
```

### 2. API Documentation
Visit: `https://deadpool-backend.onrender.com/docs`

### 3. Frontend Functionality
1. Visit: `https://deadpool-frontend.vercel.app`
2. Register new account
3. Upload medical document
4. View OCR results
5. Check insights dashboard

## 🚀 Automated Deployment Flow

### Trigger Conditions
- **Push to main branch** → Automatic deployment
- **Pull request** → Preview deployment
- **Manual trigger** → Force deployment

### Deployment Pipeline
1. **Code Push** → GitHub detects changes
2. **CI/CD Runs** → Tests and builds
3. **Frontend Deploy** → Vercel automatic deployment
4. **Backend Deploy** → Render automatic deployment
5. **Health Checks** → Verify all services
6. **Notification** → Deployment status

## 🛠️ Troubleshooting

### Common Issues

**1. Build Failures**
- Check GitHub Actions logs
- Verify environment variables
- Ensure dependencies are correct

**2. CORS Errors**
- Verify `CORS_ORIGINS` includes frontend URL
- Check API URL in frontend environment

**3. Database Connection**
- Verify `DATABASE_URL` format
- Check Render database status

### Debug Commands
```bash
# Test backend
curl https://deadpool-backend.onrender.com/health

# Test API endpoint
curl https://deadpool-backend.onrender.com/api/v1/auth/health

# Check frontend
curl https://deadpool-frontend.vercel.app
```

## 📞 Support

### Deployment Status
- **Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Render**: [dashboard.render.com](https://dashboard.render.com)
- **GitHub Actions**: Repository → Actions tab

### Monitoring
- **Uptime**: Both platforms provide uptime monitoring
- **Logs**: Available in respective dashboards
- **Alerts**: Configure in platform settings

---

## 🎯 Expected Result

**After following this guide (15-30 minutes)**:
- ✅ Fully automated CI/CD pipeline
- ✅ Zero manual deployment steps
- ✅ Live frontend: `https://deadpool-frontend.vercel.app`
- ✅ Live backend: `https://deadpool-backend.onrender.com`
- ✅ Production database with automatic backups
- ✅ Health monitoring and alerts
- ✅ Automatic deployments on code changes

**Total Cost**: $0 (Free tiers)
**Maintenance**: Zero manual intervention required