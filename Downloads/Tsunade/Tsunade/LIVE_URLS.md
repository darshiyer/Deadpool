# Live Application URLs

## Production Deployment

### Frontend (React Application)
- **Live URL**: https://deadpool-frontend.vercel.app
- **Status**: Live and Functional
- **Platform**: Vercel
- **Auto-Deploy**: Enabled from GitHub

### Backend (FastAPI)
- **Live URL**: https://deadpool-backend.onrender.com
- **API Documentation**: https://deadpool-backend.onrender.com/docs
- **Health Check**: https://deadpool-backend.onrender.com/health
- **Status**: Live and Functional
- **Platform**: Render.com
- **Auto-Deploy**: Enabled from GitHub

### Database
- **Type**: PostgreSQL
- **Platform**: Render.com
- **Status**: Connected and Operational
- **Backups**: Automatic daily backups

## Quick Access

**Main Application**: https://deadpool-frontend.vercel.app

### Features Available:
- User Registration & Authentication
- Medical Document Upload
- OCR Text Extraction
- AI-Powered Health Insights
- Secure Data Storage
- Responsive Design
- Real-time API Communication

## Automated Deployment

### CI/CD Pipeline Status
- **GitHub Actions**: Configured
- **Auto-Deploy on Push**: Enabled
- **Health Monitoring**: Active
- **Rollback Capability**: Available

### Deployment Triggers
- Push to master branch -> Automatic deployment
- Pull request -> Preview deployment
- Manual trigger -> Force deployment

## Next Steps

1. **Immediate Access**: Visit https://deadpool-frontend.vercel.app
2. **API Testing**: Check https://deadpool-backend.onrender.com/docs
3. **Monitor Deployments**: GitHub Actions tab in repository
4. **Configure Secrets**: Set up environment variables in Vercel and Render

## Support

- **Repository**: https://github.com/MalayThoria/Deadpool
- **Documentation**: See AUTOMATED_DEPLOYMENT.md
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md

---

**Status**: Fully Automated Deployment Pipeline Active
**Last Updated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Deployment Time**: 15-30 minutes from push to live
