# GitHub Secrets Configuration Guide

## 🔐 Required GitHub Repository Secrets

To enable automated deployments, you need to configure the following secrets in your GitHub repository.

## 📍 How to Access GitHub Secrets

1. Go to your GitHub repository: `https://github.com/MalayThoria/Deadpool`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

## 🔑 Required Secrets List

### Vercel Deployment Secrets

#### VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: [Get from Vercel Account Settings → Tokens]
```
**How to get:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the generated token

#### VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: [Get from Vercel Team Settings]
```
**How to get:**
1. Go to https://vercel.com/teams/[your-team]/settings
2. Copy the "Team ID" value
3. If personal account, use your user ID from account settings

#### VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: [Get from Vercel Project Settings]
```
**How to get:**
1. Create your Vercel project first (see deploy-live.md)
2. Go to project settings
3. Copy the "Project ID" value

### Render Deployment Secrets

#### RENDER_API_KEY
```
Name: RENDER_API_KEY
Value: [Get from Render Account Settings]
```
**How to get:**
1. Go to https://dashboard.render.com/account
2. Click "API Keys" tab
3. Click "Create API Key"
4. Copy the generated key

### Application Configuration Secrets

#### REACT_APP_API_URL
```
Name: REACT_APP_API_URL
Value: https://deadpool-backend.onrender.com/api/v1
```
**Note:** Update this with your actual Render backend URL after deployment

#### SECRET_KEY
```
Name: SECRET_KEY
Value: @d0B$1$jMI5$9Wy&BINb7afAx4eNG6WQTnpaxGNB9wu27BiN^WZkX3QjeX^rxOfL
```
**Note:** This is the secure key we generated for JWT token signing

#### DATABASE_URL
```
Name: DATABASE_URL
Value: [Get from Render PostgreSQL Database]
```
**How to get:**
1. Create PostgreSQL database in Render (see deploy-live.md)
2. Go to database dashboard
3. Copy the "External Database URL"

## 📋 Complete Secrets Checklist

Once you've added all secrets, verify you have:

- [ ] VERCEL_TOKEN
- [ ] VERCEL_ORG_ID  
- [ ] VERCEL_PROJECT_ID
- [ ] RENDER_API_KEY
- [ ] REACT_APP_API_URL
- [ ] SECRET_KEY
- [ ] DATABASE_URL

## 🔄 GitHub Actions Workflows

With these secrets configured, your GitHub Actions workflows will be able to:

✅ **Automatically deploy frontend to Vercel** when you push to master
✅ **Automatically deploy backend to Render** when you push to master
✅ **Run tests** before deployment
✅ **Update environment variables** automatically

## 🚀 Triggering Deployments

After setting up secrets:

1. **Commit and push any changes:**
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin master
   ```

2. **Monitor deployments:**
   - GitHub Actions: `https://github.com/MalayThoria/Deadpool/actions`
   - Vercel Dashboard: `https://vercel.com/dashboard`
   - Render Dashboard: `https://dashboard.render.com`

## 🔧 Troubleshooting

### Common Issues:

1. **Invalid Token Errors:**
   - Regenerate tokens in Vercel/Render
   - Ensure no extra spaces in secret values
   - Check token permissions

2. **Project Not Found:**
   - Verify VERCEL_PROJECT_ID is correct
   - Ensure project exists in Vercel dashboard
   - Check team/organization access

3. **Database Connection Errors:**
   - Verify DATABASE_URL format
   - Check database service status
   - Ensure database allows external connections

## 📝 Security Best Practices

✅ **Never commit secrets to code**
✅ **Use environment-specific secrets**
✅ **Rotate tokens regularly**
✅ **Limit token permissions**
✅ **Monitor secret usage in logs**

## 🎯 Next Steps

After configuring these secrets:

1. Follow the **deploy-live.md** guide to create actual cloud services
2. Update the secret values with real service URLs
3. Push changes to trigger automated deployments
4. Test the live application

---

**⚠️ Important:** Keep these secrets secure and never share them publicly. They provide full access to your cloud services.