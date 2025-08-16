# Koyeb Deployment Guide for Tsunade FastAPI Backend

This guide will walk you through migrating your FastAPI backend from Render to Koyeb for better reliability and performance.

## Prerequisites

- GitHub repository with your FastAPI backend code
- Koyeb account (free tier available)
- Current environment variables from your Render deployment

## Step 1: Create Koyeb Account

1. Go to [https://www.koyeb.com](https://www.koyeb.com)
2. Sign up for a free account
3. Connect your GitHub account
4. Verify your email address

## Step 2: Prepare Your Repository

✅ **Already Done**: `koyeb.yaml` configuration file has been created in your project root.

The configuration includes:
- FastAPI service setup
- Environment variables mapping
- Health check configuration
- Managed PostgreSQL database

## Step 3: Create New Service on Koyeb

1. **Login to Koyeb Dashboard**
   - Go to [https://app.koyeb.com](https://app.koyeb.com)
   - Sign in with your account

2. **Create New Service**
   - Click "Create Service"
   - Select "GitHub" as source
   - Choose your repository: `Tsunade`
   - Select branch: `master`

3. **Configure Build Settings**
   - Build command: `pip install -r backend/requirements.txt`
   - Run command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Port: `8000`
   - Health check path: `/health`

## Step 4: Set Up Environment Variables

In the Koyeb dashboard, add these environment variables:

### Required Variables:
```
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=[Generate a new secret key]
CORS_ORIGINS=https://lp-assistant-healthcare.vercel.app,http://localhost:3000
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_V1_STR=/api/v1
PROJECT_NAME=LP Assistant Healthcare Platform
```

### Database Variables (will be set after database creation):
```
DATABASE_URL=[Will be provided by Koyeb managed PostgreSQL]
```

### Optional Variables (if using external services):
```
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=lp_assistant_mongo
```

## Step 5: Create Managed PostgreSQL Database

1. **In Koyeb Dashboard**
   - Go to "Databases" section
   - Click "Create Database"
   - Select "PostgreSQL"
   - Choose "Hobby" plan (free tier)
   - Name: `tsunade-db`
   - Region: `Washington (US East)`

2. **Get Connection String**
   - Once created, copy the connection string
   - Add it as `DATABASE_URL` environment variable in your service

## Step 6: Deploy the Service

1. **Review Configuration**
   - Ensure all environment variables are set
   - Verify build and run commands
   - Check health check path

2. **Deploy**
   - Click "Deploy"
   - Monitor the build logs
   - Wait for deployment to complete

3. **Get Service URL**
   - Once deployed, copy the service URL
   - Format: `https://[service-name]-[random-id].koyeb.app`

## Step 7: Test the Deployment

1. **Health Check**
   ```bash
   curl https://your-service-url.koyeb.app/health
   ```

2. **API Endpoints**
   ```bash
   curl https://your-service-url.koyeb.app/api/v1/
   ```

## Step 8: Update Frontend Configuration

1. **Update API Base URL**
   - In your frontend `.env.production` file
   - Change from Render URL to Koyeb URL
   - Example: `REACT_APP_API_URL=https://your-service-url.koyeb.app`

2. **Redeploy Frontend**
   - Push changes to trigger Vercel redeploy
   - Test frontend-backend integration

## Step 9: Optional - Custom Domain

1. **Add Custom Domain**
   - In Koyeb dashboard, go to service settings
   - Add your custom domain (e.g., `api.yourdomain.com`)
   - Configure DNS records as instructed

2. **Update CORS Origins**
   - Add your custom domain to CORS_ORIGINS
   - Redeploy the service

## Migration Checklist

- [ ] Koyeb account created and GitHub connected
- [ ] Service created with correct build/run commands
- [ ] All environment variables configured
- [ ] PostgreSQL database created and connected
- [ ] Service deployed successfully
- [ ] Health check endpoint responding
- [ ] API endpoints tested and working
- [ ] Frontend updated with new API URL
- [ ] Frontend-backend integration tested
- [ ] Custom domain configured (optional)

## Troubleshooting

### Build Failures
- Check build logs in Koyeb dashboard
- Verify `requirements.txt` path is correct
- Ensure Python version compatibility

### Runtime Errors
- Check service logs for error messages
- Verify environment variables are set correctly
- Test database connection

### Health Check Failures
- Ensure `/health` endpoint exists in your FastAPI app
- Check if service is binding to correct port
- Verify health check path in configuration

## Benefits of Koyeb Migration

✅ **Better Reliability**: No cold starts, runs on bare metal
✅ **Improved Performance**: Faster response times
✅ **Generous Free Tier**: 1 service + 1 database included
✅ **Global Regions**: Better latency for users
✅ **Easy Scaling**: Simple upgrade path as you grow

## Support

- Koyeb Documentation: [https://www.koyeb.com/docs](https://www.koyeb.com/docs)
- Koyeb Community: [https://community.koyeb.com](https://community.koyeb.com)
- FastAPI on Koyeb Guide: [https://www.koyeb.com/docs/deploy/fastapi](https://www.koyeb.com/docs/deploy/fastapi)

---

**Next Steps**: Follow this guide step by step to complete your migration from Render to Koyeb. The migration should provide better reliability and performance for your FastAPI backend.