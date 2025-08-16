# Production Deployment Guide

## LP Assistant Healthcare Platform - Production Deployment

This guide provides comprehensive instructions for deploying the LP Assistant Healthcare Platform to production environments with proper security, performance optimizations, and monitoring.

## 📋 Prerequisites

### Required Tools
- Docker and Docker Compose
- Git
- Domain name (for SSL and public access)
- Cloud platform account (AWS, DigitalOcean, Railway, or GCP)

### Environment Setup
1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd Tsunade
   ```

2. **Configure environment variables**
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Beginners)

**Pros:** Easy setup, automatic SSL, built-in monitoring
**Cons:** Limited customization, pricing can scale up

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   chmod +x deploy-cloud.sh
   ./deploy-cloud.sh railway
   ```

3. **Configure environment variables in Railway dashboard**
   - `DATABASE_URL` (automatically provided)
   - `REDIS_URL` (automatically provided)
   - `SECRET_KEY` (generate a secure key)
   - `JWT_SECRET_KEY` (generate a secure key)

4. **Custom domain setup**
   - Go to Railway dashboard
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: DigitalOcean App Platform

**Pros:** Good balance of simplicity and control, competitive pricing
**Cons:** Some limitations on configuration

1. **Install DigitalOcean CLI**
   ```bash
   # Follow instructions at: https://docs.digitalocean.com/reference/doctl/how-to/install/
   ```

2. **Deploy**
   ```bash
   ./deploy-cloud.sh digitalocean
   ```

3. **Configure database**
   - PostgreSQL database is automatically created
   - Redis can be added from the marketplace

4. **Custom domain and SSL**
   - Automatic SSL with custom domains
   - Configure in the App Platform dashboard

### Option 3: AWS ECS with Fargate

**Pros:** Full control, enterprise-grade, scalable
**Cons:** More complex setup, requires AWS knowledge

1. **Install AWS CLI**
   ```bash
   # Follow instructions at: https://aws.amazon.com/cli/
   aws configure
   ```

2. **Deploy**
   ```bash
   ./deploy-cloud.sh aws
   ```

3. **Additional AWS setup required:**
   - Application Load Balancer (ALB)
   - RDS PostgreSQL instance
   - ElastiCache Redis
   - Route 53 for DNS
   - Certificate Manager for SSL

### Option 4: Google Cloud Run

**Pros:** Serverless, pay-per-use, automatic scaling
**Cons:** Cold starts, some limitations

1. **Install Google Cloud CLI**
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   gcloud auth login
   ```

2. **Deploy**
   ```bash
   ./deploy-cloud.sh gcp
   ```

3. **Additional GCP setup:**
   - Cloud SQL for PostgreSQL
   - Memorystore for Redis
   - Cloud Load Balancing
   - Cloud DNS

### Option 5: Self-Hosted VPS

**Pros:** Full control, cost-effective for high traffic
**Cons:** Requires server management knowledge

1. **Server requirements**
   - Ubuntu 20.04+ or similar
   - 2+ CPU cores
   - 4GB+ RAM
   - 20GB+ storage
   - Public IP address

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Deploy**
   ```bash
   # Copy files to server
   scp -r . user@your-server:/opt/lp-assistant/
   
   # On server
   cd /opt/lp-assistant
   docker-compose -f docker-compose.production.yml up -d
   ```

4. **Setup SSL**
   ```bash
   ./deploy-cloud.sh ssl
   ```

## 🔧 Configuration

### Environment Variables

Update `.env.production` with your production values:

```bash
# Security (REQUIRED - Generate secure keys)
SECRET_KEY=your-super-secure-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars

# Database (Update with your database URL)
DATABASE_URL=postgresql://username:password@host:5432/database

# Domain (Update with your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DOMAIN_NAME=yourdomain.com

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
REACT_APP_SENTRY_DSN=your-frontend-sentry-dsn
```

### SSL Certificate Setup

**For self-hosted deployments:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**For cloud platforms:**
- Most cloud platforms provide automatic SSL
- Configure custom domain in platform dashboard

### Database Setup

1. **PostgreSQL Configuration**
   ```sql
   -- Create database
   CREATE DATABASE lp_assistant_prod;
   
   -- Create user
   CREATE USER lp_user WITH PASSWORD 'secure_password';
   
   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE lp_assistant_prod TO lp_user;
   ```

2. **Redis Configuration**
   ```bash
   # Redis with password
   requirepass your_redis_password
   ```

## 📊 Monitoring and Logging

### Prometheus and Grafana

1. **Access monitoring**
   - Prometheus: `https://yourdomain.com:9090`
   - Grafana: `https://yourdomain.com:3001`
   - Default Grafana login: admin/admin

2. **Key metrics to monitor**
   - Application response time
   - Database connections
   - Memory and CPU usage
   - Error rates
   - User activity

### Log Management

1. **Application logs**
   ```bash
   # View logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **Log rotation**
   - Configured automatically in production
   - Logs retained for 30 days
   - Located in `/app/logs/`

## 🔒 Security Checklist

### Pre-deployment
- [ ] Change all default passwords
- [ ] Generate secure secret keys
- [ ] Configure CORS origins
- [ ] Set up rate limiting
- [ ] Enable HTTPS redirect
- [ ] Configure security headers

### Post-deployment
- [ ] Test SSL certificate
- [ ] Verify HTTPS redirect
- [ ] Test rate limiting
- [ ] Check security headers
- [ ] Monitor error logs
- [ ] Set up backup strategy

## 🚦 Performance Optimization

### Frontend Optimizations
- Gzip compression enabled
- Static file caching (1 year)
- CDN integration ready
- Bundle size optimization
- Lazy loading implemented

### Backend Optimizations
- Database connection pooling
- Redis caching
- API response compression
- Database query optimization
- Background task processing

### Infrastructure Optimizations
- Load balancing
- Auto-scaling (cloud platforms)
- Database read replicas
- CDN for static assets
- Image optimization

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

1. **Create `.github/workflows/deploy.yml`**
   ```yaml
   name: Deploy to Production
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to Railway
           run: |
             npm install -g @railway/cli
             railway login --token ${{ secrets.RAILWAY_TOKEN }}
             railway up
   ```

2. **Set up secrets in GitHub**
   - `RAILWAY_TOKEN` or platform-specific tokens
   - `DATABASE_URL`
   - `SECRET_KEY`

## 📱 Mobile App Deployment

### React Native (Future)
- App Store deployment
- Google Play deployment
- CodePush for updates
- Deep linking configuration

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check database URL
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate
   openssl s_client -connect yourdomain.com:443
   
   # Renew certificate
   sudo certbot renew
   ```

3. **High memory usage**
   ```bash
   # Check container stats
   docker stats
   
   # Restart services
   docker-compose restart
   ```

### Support
- Check application logs first
- Monitor system resources
- Review error tracking (Sentry)
- Contact support with specific error messages

## 📞 Support and Maintenance

### Regular Maintenance
- [ ] Weekly: Review logs and metrics
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Annually: Infrastructure review

### Backup Strategy
- Database: Daily automated backups
- Files: Weekly backup to cloud storage
- Configuration: Version controlled
- Recovery: Tested monthly

### Updates
- Security updates: Immediate
- Feature updates: Scheduled maintenance windows
- Database migrations: Tested in staging first

---

## 🎉 Deployment Complete!

Your LP Assistant Healthcare Platform is now running in production!

### Next Steps
1. Configure monitoring alerts
2. Set up backup verification
3. Plan regular maintenance schedule
4. Monitor user feedback
5. Scale based on usage patterns

### Access URLs
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api/v1
- **Documentation**: https://yourdomain.com/docs
- **Monitoring**: https://yourdomain.com:9090 (Prometheus)
- **Dashboard**: https://yourdomain.com:3001 (Grafana)

**Remember to:**
- Keep your environment variables secure
- Monitor your application regularly
- Keep dependencies updated
- Have a backup and recovery plan

For additional support or questions, please refer to the project documentation or contact the development team.