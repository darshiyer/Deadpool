# GitHub Actions + Railway + Vercel Deployment Guide

This guide explains how to deploy the Deadpool backend using GitHub Actions to Railway and connect it with the Vercel frontend.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ GitHub Actions  │───▶│    Railway      │
│                 │    │                 │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐                            ┌─────────────────┐
│     Vercel      │◀───────────────────────────│   API Endpoint  │
│   (Frontend)    │                            │                 │
└─────────────────┘                            └─────────────────┘
```

## Step 1: Set Up Railway Account

1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project
3. Connect your GitHub repository
4. Generate a Railway API token:
   - Go to Account Settings → Tokens
   - Create a new token
   - Copy the token (you'll need it for GitHub secrets)

## Step 2: Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `RAILWAY_TOKEN` | Railway API token | `railway_xxxxxxxxxxxxx` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `REDIS_URL` | Redis connection URL | `redis://user:pass@host:port` |
| `SECRET_KEY` | JWT secret key | `your-super-secret-jwt-key` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxxxxxxxxxxxxxxx` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxxxxxxxxxxxxx` |

### Optional Secrets (if using Slack notifications)

| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK` | Slack webhook URL for deployment notifications |

## Step 3: Railway Configuration

The `railway.toml` file is already configured with:

- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health` endpoint
- **Auto-scaling**: 1-3 instances
- **Memory**: 512MB
- **CPU**: 0.5 cores

## Step 4: GitHub Actions Workflow

The workflow is configured to:

1. **Trigger**: On push to `master` branch
2. **Dependencies**: Runs after backend tests and security scans pass
3. **Deploy**: Uses Railway CLI to deploy the backend
4. **Health Check**: Verifies the deployment is healthy
5. **Notifications**: Sends Slack notifications (if configured)

### Workflow Steps:

```yaml
- Install Railway CLI
- Login with RAILWAY_TOKEN
- Deploy to Railway
- Get deployment URL
- Run health check
- Send notifications
```

## Step 5: Update Vercel Frontend Configuration

After successful Railway deployment:

1. Get your Railway backend URL (e.g., `https://your-app.railway.app`)
2. Update your Vercel environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-app.railway.app/api/v1`

### Vercel Environment Variables

```bash
# In Vercel Dashboard → Project → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-app.railway.app
NEXT_PUBLIC_API_BASE_URL=https://your-app.railway.app/api/v1
```

## Step 6: Test the Deployment

### Backend Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Rx Assistant API"
}
```

### API Endpoints Test
```bash
# Test root endpoint
curl https://your-app.railway.app/

# Test API documentation
open https://your-app.railway.app/docs
```

### Frontend Integration Test
1. Deploy frontend to Vercel with updated environment variables
2. Test user registration/login
3. Test API calls from frontend to Railway backend
4. Verify CORS configuration is working

## Step 7: Environment Variables on Railway

Railway will automatically set these environment variables:

- `PORT` - Automatically assigned by Railway
- `RAILWAY_ENVIRONMENT` - Set to "production"

You may need to manually add:

- `MONGODB_URI`
- `REDIS_URL`
- `SECRET_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `ALLOWED_ORIGINS` - Set to your Vercel domain

## Troubleshooting

### Common Issues

1. **Railway CLI Installation Fails**
   - Check GitHub Actions logs
   - Verify the installation script URL

2. **Authentication Fails**
   - Verify `RAILWAY_TOKEN` is correct
   - Check token permissions

3. **Health Check Fails**
   - Check Railway logs
   - Verify `/health` endpoint is accessible
   - Check if all dependencies are installed

4. **CORS Issues**
   - Update `ALLOWED_ORIGINS` environment variable
   - Include your Vercel domain

### Debugging Commands

```bash
# Check Railway deployment status
railway status

# View Railway logs
railway logs

# Test local deployment
cd backend
uvicorn main:app --reload
```

## Benefits of This Architecture

1. **Automated Deployment**: Push to master triggers automatic deployment
2. **Scalability**: Railway handles auto-scaling based on traffic
3. **Reliability**: Health checks ensure deployment success
4. **Cost-Effective**: Pay only for what you use
5. **Easy Monitoring**: Railway provides built-in monitoring
6. **Fast Deployment**: Typically deploys in 2-3 minutes

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain for Railway backend
3. Set up staging environment
4. Implement database migrations
5. Add performance monitoring

## Support

If you encounter issues:

1. Check GitHub Actions logs
2. Check Railway deployment logs
3. Verify all environment variables are set
4. Test endpoints manually
5. Check CORS configuration

For Railway-specific issues, consult the [Railway Documentation](https://docs.railway.app/).