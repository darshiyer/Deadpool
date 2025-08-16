# Live Deployment Instructions

## 🚀 Deploy to Live Cloud Services

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier available)
- Render account (free tier available)

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 1.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `MalayThoria/Deadpool`
3. Configure the service:
   ```
   Name: deadpool-backend
   Environment: Python 3
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### 1.3 Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   ```
   Name: deadpool-db
   Database: deadpool_db
   User: deadpool_user
   Region: Oregon (US West)
   Plan: Free
   ```
3. **Save the connection details** - you'll need them for environment variables

### 1.4 Set Environment Variables
In your Render web service, add these environment variables:
```
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=@d0B$1$jMI5$9Wy&BINb7afAx4eNG6WQTnpaxGNB9wu27BiN^WZkX3QjeX^rxOfL
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=[Use the connection string from your PostgreSQL database]
CORS_ORIGINS=https://deadpool-frontend.vercel.app,http://localhost:3000
API_V1_STR=/api/v1
PROJECT_NAME=LP Assistant Healthcare Platform
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
RATE_LIMIT_PER_MINUTE=60
```

### 1.5 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://deadpool-backend-[random].onrender.com`

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### 2.2 Import Project
1. Click "New Project"
2. Import from GitHub: `MalayThoria/Deadpool`
3. Configure:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

### 2.3 Set Environment Variables
In Vercel project settings, add:
```
REACT_APP_API_URL=https://[your-actual-render-url]/api/v1
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=LP Assistant Healthcare Platform
GENERATE_SOURCEMAP=false
```

### 2.4 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL: `https://deadpool-frontend-[random].vercel.app`

## Step 3: Update Cross-Service Configuration

### 3.1 Update Backend CORS
1. Go back to your Render service
2. Update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://[your-actual-vercel-url],http://localhost:3000
   ```
3. Redeploy the service

### 3.2 Update Frontend API URL
1. Go back to your Vercel project
2. Update the `REACT_APP_API_URL` environment variable:
   ```
   REACT_APP_API_URL=https://[your-actual-render-url]/api/v1
   ```
3. Redeploy the project

## Step 4: Test Your Live Application

### 4.1 Test Frontend
1. Visit your Vercel URL
2. Verify the application loads
3. Check browser console for errors

### 4.2 Test Backend
1. Visit `https://[your-render-url]/docs`
2. Verify API documentation loads
3. Test a simple API endpoint

### 4.3 Test Integration
1. Try logging in through the frontend
2. Test creating a patient record
3. Verify data persistence

## 🎯 Expected Results

After completing these steps, you will have:

✅ **Live Frontend URL**: `https://deadpool-frontend-[random].vercel.app`
✅ **Live Backend URL**: `https://deadpool-backend-[random].onrender.com`
✅ **Live API Docs**: `https://deadpool-backend-[random].onrender.com/docs`
✅ **Full Integration**: Frontend and backend communicating properly
✅ **Database**: PostgreSQL database with all tables created
✅ **Authentication**: User registration and login working
✅ **All Features**: Complete healthcare platform functionality

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render/Vercel dashboards
   - Verify all dependencies are in requirements.txt/package.json

2. **CORS Errors**:
   - Ensure CORS_ORIGINS matches your actual frontend URL
   - Check for typos in environment variables

3. **Database Connection**:
   - Verify DATABASE_URL is correctly formatted
   - Check database service status in Render

4. **API Not Responding**:
   - Check backend service logs
   - Verify start command is correct
   - Ensure port binding is using $PORT

## ⏱️ Timeline

- **Backend Setup**: 15-20 minutes
- **Frontend Setup**: 10-15 minutes
- **Configuration Updates**: 5-10 minutes
- **Testing**: 10-15 minutes
- **Total**: 40-60 minutes

## 📞 Support

If you encounter issues:
1. Check service logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure your GitHub repository is accessible
4. Check that all files are committed and pushed

---

**🎉 Once completed, you'll have a fully functional live healthcare platform with a single working URL!**