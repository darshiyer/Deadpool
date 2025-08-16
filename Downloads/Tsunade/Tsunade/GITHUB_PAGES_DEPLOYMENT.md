# GitHub Pages Frontend Deployment Guide

## Overview

This guide sets up automatic deployment of the React frontend to GitHub Pages as an alternative to Vercel, which was experiencing persistent permission issues.

## ✅ Solution Implemented

### 1. GitHub Actions Workflow

Created `.github/workflows/deploy-frontend.yml` that:
- Triggers on pushes to master branch (frontend changes)
- Builds the React app with CI=false
- Sets REACT_APP_API_URL to Railway backend
- Deploys to GitHub Pages automatically

### 2. Package.json Updates

Updated `frontend/package.json` with:
- `homepage`: "https://malaythoria.github.io/Deadpool"
- `predeploy` and `deploy` scripts
- `gh-pages` dev dependency
- Fixed build script to use `react-scripts` directly

## 🚀 Deployment URLs

- **Frontend (GitHub Pages)**: https://malaythoria.github.io/Deadpool
- **Backend (Railway)**: https://deadpool-production.up.railway.app

## 📋 Setup Steps

### 1. Enable GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select branch: `gh-pages`
5. Folder: `/ (root)`

### 2. Verify Workflow Permissions

1. Go to repository Settings → Actions → General
2. Under "Workflow permissions", select:
   - "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### 3. Manual Deployment (if needed)

```bash
cd frontend
npm install
npm run deploy
```

## 🔧 Configuration Details

### Environment Variables

The GitHub Actions workflow automatically sets:
- `REACT_APP_API_URL=https://deadpool-production.up.railway.app`
- `CI=false` (prevents warnings from failing the build)

### Build Process

1. **Install**: `npm ci` for faster, reliable installs
2. **Build**: `CI=false npm run build` 
3. **Deploy**: Uses `peaceiris/actions-gh-pages@v3` action
4. **Output**: Static files deployed to `gh-pages` branch

## 🎯 Advantages Over Vercel

1. **No Permission Issues**: GitHub Actions runs in controlled environment
2. **Free Hosting**: GitHub Pages is free for public repositories
3. **Automatic SSL**: HTTPS enabled by default
4. **Custom Domains**: Easy to configure custom domains
5. **Reliable Builds**: No mysterious permission denied errors
6. **Version Control**: Deployment history tracked in git

## 🔍 Troubleshooting

### Build Fails
- Check Actions tab for detailed logs
- Verify all dependencies are in package.json
- Ensure REACT_APP_API_URL is correctly set

### 404 Errors
- Verify GitHub Pages is enabled
- Check that `gh-pages` branch exists
- Confirm homepage URL in package.json

### API Connection Issues
- Verify Railway backend is running
- Check CORS settings in backend
- Confirm API URL in environment variables

## 🔄 Deployment Workflow

1. **Push to master** → Triggers GitHub Actions
2. **Actions builds** → React app with production settings
3. **Auto-deploy** → Updates GitHub Pages site
4. **Live in ~2-3 minutes** → Site available at GitHub Pages URL

## 📝 Next Steps

1. **Monitor first deployment** in Actions tab
2. **Test frontend-backend integration**
3. **Configure custom domain** (optional)
4. **Set up monitoring** for uptime tracking

This solution provides a much more reliable deployment pipeline compared to Vercel's permission issues!