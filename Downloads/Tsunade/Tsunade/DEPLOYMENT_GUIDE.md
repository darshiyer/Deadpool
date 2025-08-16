# Healthcare Platform Deployment Guide

This guide explains how to deploy the LP Assistant Healthcare Platform to make it fully functional with both frontend and backend services.

## Current Status

✅ **Frontend**: Successfully deployed to Vercel  
🔄 **Backend**: Needs cloud deployment  
🔄 **Database**: Needs production setup  

## Frontend Deployment (Completed)

The frontend is already deployed to Vercel:
- **Live URL**: https://tsunade-frontend.vercel.app
- **Configuration**: `vercel.json` configured for static build
- **Environment**: Production-ready

## Backend Deployment Options

### Option 1: Render.com (Recommended)

1. **Create Render Account**: Go to [render.com](https://render.com)
2. **Connect GitHub**: Link your repository
3. **Create Web Service**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Python Version: 3.11

4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=https://tsunade-frontend.vercel.app,http://localhost:3000
   ENVIRONMENT=production
   DEBUG=False
   ```

5. **Database Setup**:
   - Add PostgreSQL database in Render
   - Copy DATABASE_URL to environment variables

### Option 2: Railway

1. **Install Railway CLI**: `npm install -g @railway/cli`
2. **Login**: `railway login`
3. **Deploy**: `railway up` from backend directory
4. **Add Database**: `railway add postgresql`
5. **Set Environment Variables** in Railway dashboard

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create App**: `heroku create your-app-name`
3. **Add PostgreSQL**: `heroku addons:create heroku-postgresql:hobby-dev`
4. **Deploy**: `git push heroku main`
5. **Set Environment Variables**: `heroku config:set KEY=value`

## Database Setup

### PostgreSQL (Recommended)

1. **Cloud Options**:
   - Render PostgreSQL (free tier available)
   - Railway PostgreSQL
   - Heroku PostgreSQL
   - Supabase
   - ElephantSQL

2. **Connection String Format**:
   ```
   postgresql://username:password@hostname:port/database_name
   ```

3. **Database Migration**:
   ```bash
   # After deployment, run migrations
   alembic upgrade head
   ```

## Frontend Configuration Update

Once backend is deployed, update frontend environment:

1. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Set `REACT_APP_API_URL` to your backend URL
   - Example: `https://your-backend.onrender.com/api/v1`

2. **Redeploy Frontend**:
   ```bash
   npx vercel --prod
   ```

## Testing Full-Stack Integration

### API Endpoints to Test

1. **Health Check**: `GET /health`
2. **Authentication**: `POST /api/v1/auth/login`
3. **User Profile**: `GET /api/v1/users/me`
4. **OCR Service**: `POST /api/v1/ocr`
5. **Medical Insights**: `GET /api/insights`

### Frontend Features to Test

1. **User Registration/Login**
2. **Document Upload & OCR**
3. **Medical Insights Dashboard**
4. **Profile Management**
5. **Data Visualization**

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to repository
   - Use platform-specific environment variable management
   - Rotate keys regularly

2. **CORS Configuration**:
   - Only allow trusted origins
   - Update CORS_ORIGINS when frontend URL changes

3. **Database Security**:
   - Use SSL connections
   - Implement proper access controls
   - Regular backups

## Monitoring & Maintenance

1. **Logging**:
   - Monitor application logs
   - Set up error tracking (Sentry)
   - Performance monitoring

2. **Health Checks**:
   - Implement uptime monitoring
   - Database connection checks
   - API response time monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS_ORIGINS environment variable
   - Ensure frontend URL is included

2. **Database Connection**:
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure SSL requirements

3. **Build Failures**:
   - Check Python version compatibility
   - Verify requirements.txt
   - Review build logs

### Debug Commands

```bash
# Check backend health
curl https://your-backend-url/health

# Test API endpoint
curl https://your-backend-url/api/v1/auth/health

# Check database connection
# (from backend container/server)
python -c "from database import engine; print(engine.execute('SELECT 1').scalar())"
```

## Next Steps

1. Choose a backend deployment platform
2. Set up production database
3. Deploy backend with environment variables
4. Update frontend API URL
5. Test full-stack functionality
6. Set up monitoring and alerts

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variable configuration
4. Test API endpoints individually

---

**Note**: This deployment guide ensures your healthcare platform will be fully functional with proper frontend-backend communication and database integration.