# 🔧 How to Update Vercel Environment Variables

## Step-by-Step Guide to Connect Your Frontend with Railway Backend

### 📋 Prerequisites
- Your Railway backend is live at: `https://deadpool-production.up.railway.app`
- You have a Vercel account and your frontend project deployed
- You have access to your Vercel dashboard

---

## 🚀 Method 1: Using Vercel Dashboard (Recommended)

### Step 1: Access Your Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your **LP Assistant Healthcare Platform** project
3. Click on your project name to open the project dashboard

### Step 2: Open Environment Variables Settings
1. In your project dashboard, click on the **"Settings"** tab
2. In the left sidebar, click on **"Environment Variables"**

### Step 3: Add/Update Environment Variables
Add or update these environment variables:

| **Variable Name** | **Value** | **Environment** |
|-------------------|-----------|----------------|
| `REACT_APP_API_URL` | `https://deadpool-production.up.railway.app/api/v1` | Production |
| `REACT_APP_ENVIRONMENT` | `production` | Production |
| `REACT_APP_APP_NAME` | `LP Assistant Healthcare Platform` | Production |
| `GENERATE_SOURCEMAP` | `false` | Production |

### Step 4: Set Each Variable
For each variable:
1. Click **"Add New"** button
2. Enter the **Variable Name** (e.g., `REACT_APP_API_URL`)
3. Enter the **Value** (e.g., `https://deadpool-production.up.railway.app/api/v1`)
4. Select **"Production"** environment
5. Click **"Save"**

### Step 5: Redeploy Your Application
1. Go to the **"Deployments"** tab
2. Click **"Redeploy"** on your latest deployment
3. Or push a new commit to trigger automatic deployment

---

## 🖥️ Method 2: Using Vercel CLI

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Navigate to Your Project
```bash
cd path/to/your/frontend/project
```

### Step 4: Set Environment Variables
```bash
# Set API URL
vercel env add REACT_APP_API_URL production
# When prompted, enter: https://deadpool-production.up.railway.app/api/v1

# Set Environment
vercel env add REACT_APP_ENVIRONMENT production
# When prompted, enter: production

# Set App Name
vercel env add REACT_APP_APP_NAME production
# When prompted, enter: LP Assistant Healthcare Platform

# Set Source Map
vercel env add GENERATE_SOURCEMAP production
# When prompted, enter: false
```

### Step 5: Redeploy
```bash
vercel --prod
```

---

## 🔍 Method 3: Using Environment Variables File

### Step 1: Create .env.production.local
In your frontend project root, create or update `.env.production.local`:

```env
REACT_APP_API_URL=https://deadpool-production.up.railway.app/api/v1
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=LP Assistant Healthcare Platform
GENERATE_SOURCEMAP=false
```

### Step 2: Commit and Push
```bash
git add .env.production.local
git commit -m "Update production environment variables for Railway backend"
git push origin main
```

---

## ✅ Verification Steps

### 1. Check Deployment Status
- Go to your Vercel dashboard
- Ensure the latest deployment shows "Ready"
- Check that environment variables are listed in Settings

### 2. Test Your Live Application
1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Open browser developer tools (F12)
3. Check the **Network** tab for API calls
4. Verify API calls are going to `https://deadpool-production.up.railway.app/api/v1`

### 3. Test API Connection
In your browser console, test the connection:
```javascript
fetch('https://deadpool-production.up.railway.app/health')
  .then(response => response.json())
  .then(data => console.log('Backend health:', data))
  .catch(error => console.error('Connection error:', error));
```

Expected response:
```json
{"status":"healthy","service":"LP Assistant API"}
```

---

## 🚨 Troubleshooting

### Issue: Environment Variables Not Applied
**Solution:**
- Ensure you selected "Production" environment when adding variables
- Redeploy your application after adding variables
- Clear browser cache and try again

### Issue: CORS Errors
**Solution:**
- Verify the API URL is exactly: `https://deadpool-production.up.railway.app/api/v1`
- Check that your backend CORS settings allow your Vercel domain

### Issue: API Calls Failing
**Solution:**
1. Test backend health: `https://deadpool-production.up.railway.app/health`
2. Check browser network tab for exact error messages
3. Verify environment variables are correctly set in Vercel dashboard

---

## 📱 Quick Reference

### Your Backend URLs:
- **Health Check:** `https://deadpool-production.up.railway.app/health`
- **API Base:** `https://deadpool-production.up.railway.app/api/v1`
- **Full Backend:** `https://deadpool-production.up.railway.app`

### Required Environment Variables:
```
REACT_APP_API_URL=https://deadpool-production.up.railway.app/api/v1
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=LP Assistant Healthcare Platform
GENERATE_SOURCEMAP=false
```

---

## 🎉 Next Steps

After updating environment variables and redeploying:

1. **Test your complete application flow**
2. **Verify all features work correctly**
3. **Monitor for any errors in browser console**
4. **Check Vercel deployment logs if issues occur**

**Your LP Assistant Healthcare Platform will be fully operational once these steps are completed!** 🚀