# Quick GitHub Secrets Setup Guide

## 🔐 Required GitHub Repository Secrets

Since GitHub CLI is not available, please set up the following secrets manually:

### Step 1: Go to GitHub Repository Settings

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add Required Secrets

Add the following secrets one by one:

#### ✅ Railway Token (Already Provided)
- **Name**: `RAILWAY_TOKEN`
- **Value**: `thoria=181c843c-29d4-4297-af37-2d72080adc88`

#### 🔑 Database & API Keys (Required)
- **Name**: `MONGODB_URI`
- **Value**: Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/db`)

- **Name**: `REDIS_URL`
- **Value**: Your Redis connection URL (e.g., `redis://user:pass@host:port`)

- **Name**: `SECRET_KEY`
- **Value**: A secure random string for JWT tokens (generate one at https://randomkeygen.com/)

- **Name**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk-`)

#### 🔐 OAuth Keys (Optional)
- **Name**: `GOOGLE_OAUTH_CLIENT_ID`
- **Value**: Your Google OAuth client ID

- **Name**: `GOOGLE_OAUTH_CLIENT_SECRET`
- **Value**: Your Google OAuth client secret

#### 📢 Notifications (Optional)
- **Name**: `SLACK_WEBHOOK`
- **Value**: Your Slack webhook URL for deployment notifications

### Step 3: Verify Secrets

After adding all secrets, you should see them listed in the repository secrets section. The values will be hidden for security.

### Step 4: Trigger Deployment

Once all secrets are configured:

1. Push any change to the `master` branch
2. GitHub Actions will automatically trigger the Railway deployment
3. Monitor the deployment in the **Actions** tab of your repository

### 🚀 Quick Test Commands

After deployment completes, test your backend:

```bash
# Replace with your actual Railway URL
curl https://your-app.railway.app/health
curl https://your-app.railway.app/docs
```

### 🔧 Railway Environment Variables

Don't forget to also set these environment variables in your Railway dashboard:

- `MONGODB_URI`
- `REDIS_URL`
- `SECRET_KEY`
- `OPENAI_API_KEY`
- `ALLOWED_ORIGINS` (set to your Vercel domain)
- `GOOGLE_OAUTH_CLIENT_ID` (if using)
- `GOOGLE_OAUTH_CLIENT_SECRET` (if using)

### ⚡ Next Steps

1. Set up the GitHub secrets above
2. Configure Railway environment variables
3. Push to master branch to trigger deployment
4. Use `update-vercel-config.ps1` to configure frontend
5. Deploy frontend to Vercel
6. Test the complete application

---

**Note**: The Railway token `thoria=181c843c-29d4-4297-af37-2d72080adc88` is already provided and ready to use!