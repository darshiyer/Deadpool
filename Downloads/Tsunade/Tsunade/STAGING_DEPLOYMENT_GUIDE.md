# LP Assistant Healthcare Platform - Staging Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the LP Assistant Healthcare Platform to a staging environment for User Acceptance Testing (UAT). The staging environment replicates the production setup as closely as possible while providing a safe testing environment for external stakeholders.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 20GB free space
- **CPU**: 4+ cores recommended
- **Network**: Stable internet connection for pulling Docker images

### Required Software

1. **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum version: Docker 20.10+
   - Ensure Docker Compose is included (v2.0+)

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/downloads

### Network Requirements

- Ports that need to be available:
  - `3000`: Frontend application
  - `8000`: Backend API
  - `5432`: PostgreSQL database
  - `6379`: Redis cache
  - `27017`: MongoDB
  - `9090`: Prometheus monitoring
  - `3001`: Grafana dashboard
  - `80/443`: Nginx load balancer

## Quick Start Deployment

### Step 1: Clone the Repository

```bash
git clone https://github.com/MalayThoria/Deadpool.git
cd Deadpool
```

### Step 2: Deploy Using Scripts

#### For Windows (PowerShell)

```powershell
# Build and deploy in one command
.\deploy-staging.ps1 -Build -Deploy

# Or step by step
.\deploy-staging.ps1 -Build
.\deploy-staging.ps1 -Deploy
```

#### For Linux/macOS (Bash)

```bash
# Make script executable
chmod +x deploy-staging.sh

# Build and deploy
./deploy-staging.sh build deploy

# Or step by step
./deploy-staging.sh build
./deploy-staging.sh deploy
```

### Step 3: Verify Deployment

```bash
# Check service status
./deploy-staging.sh status  # Linux/macOS
.\deploy-staging.ps1 -Status  # Windows
```

## Manual Deployment (Alternative)

If you prefer manual deployment or the scripts don't work in your environment:

### Step 1: Build Docker Images

```bash
docker compose -f docker-compose.staging.yml build --no-cache
```

### Step 2: Start Services

```bash
# Start all services
docker compose -f docker-compose.staging.yml up -d

# Initialize database
docker compose -f docker-compose.staging.yml run --rm db-init
```

### Step 3: Verify Services

```bash
# Check running containers
docker compose -f docker-compose.staging.yml ps

# Check logs
docker compose -f docker-compose.staging.yml logs
```

## Service URLs and Access Information

Once deployed, the following services will be available:

### Primary Application

- **Frontend Application**: http://localhost:3000
  - Main user interface for testing
  - All user-facing features available

- **Backend API**: http://localhost:8000
  - RESTful API endpoints
  - WebSocket connections for real-time features

- **API Documentation**: http://localhost:8000/docs
  - Interactive Swagger/OpenAPI documentation
  - Test API endpoints directly

### Monitoring and Administration

- **Prometheus Metrics**: http://localhost:9090
  - System and application metrics
  - Performance monitoring

- **Grafana Dashboard**: http://localhost:3001
  - Username: `admin`
  - Password: `staging123`
  - Visual dashboards and alerts

### Database Access (For Administrators)

- **PostgreSQL**: `localhost:5432`
  - Database: `lp_assistant_db`
  - Username: `lp_assistant_user`
  - Password: `lp_assistant_password`

- **Redis**: `localhost:6379`
  - Password: `redis_password`

- **MongoDB**: `localhost:27017`
  - Username: `mongo_user`
  - Password: `mongo_password`
  - Database: `lp_assistant_mongo`

## Testing Guidelines for Stakeholders

### User Acceptance Testing (UAT) Checklist

#### Authentication & User Management
- [ ] User registration with email verification
- [ ] User login with email/password
- [ ] Password reset functionality
- [ ] OAuth login (Google, Facebook, Microsoft)
- [ ] User profile management
- [ ] Role-based access control (Patient, Doctor, Admin)

#### Core Healthcare Features
- [ ] Patient profile creation and management
- [ ] Medical history recording
- [ ] Appointment scheduling
- [ ] Prescription management
- [ ] Document upload and management
- [ ] Notification system
- [ ] Search and filtering capabilities

#### Security & Compliance
- [ ] Data encryption in transit and at rest
- [ ] HIPAA compliance features
- [ ] GDPR compliance (data export/deletion)
- [ ] Audit logging
- [ ] Session management
- [ ] Input validation and sanitization

#### Performance & Usability
- [ ] Page load times under 3 seconds
- [ ] Mobile responsiveness
- [ ] Accessibility features
- [ ] Error handling and user feedback
- [ ] Offline functionality (PWA)

### Test Data

The staging environment includes sample test data:

#### Test User Accounts

1. **Patient Account**
   - Email: `patient@staging.com`
   - Password: `Staging123!`
   - Role: Patient

2. **Doctor Account**
   - Email: `doctor@staging.com`
   - Password: `Staging123!`
   - Role: Doctor

3. **Admin Account**
   - Email: `admin@staging.com`
   - Password: `Staging123!`
   - Role: Admin

## Troubleshooting

### Common Issues

#### Docker Issues

**Problem**: "Docker daemon is not running"
**Solution**: Start Docker Desktop or Docker service

```bash
# Windows: Start Docker Desktop application
# Linux: sudo systemctl start docker
# macOS: Start Docker Desktop application
```

**Problem**: "Port already in use"
**Solution**: Stop conflicting services or change ports

```bash
# Find process using port
netstat -tulpn | grep :3000  # Linux
netstat -ano | findstr :3000  # Windows

# Kill process or stop conflicting services
```

#### Application Issues

**Problem**: "Database connection failed"
**Solution**: Ensure PostgreSQL container is healthy

```bash
# Check container status
docker compose -f docker-compose.staging.yml ps

# Check database logs
docker compose -f docker-compose.staging.yml logs postgres

# Restart database
docker compose -f docker-compose.staging.yml restart postgres
```

**Problem**: "Frontend not loading"
**Solution**: Check frontend container and nginx configuration

```bash
# Check frontend logs
docker compose -f docker-compose.staging.yml logs frontend

# Check nginx logs
docker compose -f docker-compose.staging.yml logs nginx
```

### Getting Help

1. **Check Logs**: Always start by checking service logs
   ```bash
   # All services
   docker compose -f docker-compose.staging.yml logs
   
   # Specific service
   docker compose -f docker-compose.staging.yml logs backend
   ```

2. **Service Status**: Verify all services are running
   ```bash
   docker compose -f docker-compose.staging.yml ps
   ```

3. **Resource Usage**: Check system resources
   ```bash
   docker stats
   ```

## Maintenance Commands

### Viewing Logs

```bash
# All services
./deploy-staging.sh logs  # Linux/macOS
.\deploy-staging.ps1 -Logs  # Windows

# Specific service
./deploy-staging.sh logs backend  # Linux/macOS
.\deploy-staging.ps1 -Logs -Service backend  # Windows
```

### Stopping Services

```bash
./deploy-staging.sh stop  # Linux/macOS
.\deploy-staging.ps1 -Stop  # Windows
```

### Cleaning Environment

```bash
# WARNING: This removes all data
./deploy-staging.sh clean  # Linux/macOS
.\deploy-staging.ps1 -Clean  # Windows
```

### Updating Application

```bash
# Pull latest code
git pull origin master

# Rebuild and redeploy
./deploy-staging.sh build deploy  # Linux/macOS
.\deploy-staging.ps1 -Build -Deploy  # Windows
```

## Security Considerations

### Staging Environment Security

- **Network Access**: Limit access to staging environment
- **Test Data**: Use only synthetic/anonymized data
- **Credentials**: Use staging-specific credentials
- **SSL/TLS**: Configure HTTPS for production-like testing
- **Monitoring**: Enable audit logging and monitoring

### Data Protection

- No real patient data should be used in staging
- All test data should be clearly marked as synthetic
- Regular cleanup of test data
- Secure disposal of staging environment data

## Performance Monitoring

### Metrics to Monitor

- **Response Times**: API and page load times
- **Resource Usage**: CPU, memory, disk usage
- **Database Performance**: Query times, connection counts
- **Error Rates**: Application and system errors
- **User Activity**: Login rates, feature usage

### Monitoring Tools

- **Prometheus**: http://localhost:9090 - Metrics collection
- **Grafana**: http://localhost:3001 - Visualization dashboards
- **Application Logs**: Centralized logging for debugging

## Feedback and Reporting

### Bug Reporting

When reporting issues, please include:

1. **Steps to Reproduce**: Detailed steps that led to the issue
2. **Expected Behavior**: What should have happened
3. **Actual Behavior**: What actually happened
4. **Environment**: Browser, OS, device information
5. **Screenshots**: Visual evidence of the issue
6. **Logs**: Relevant application logs

### Feature Feedback

For feature requests and improvements:

1. **Use Case**: Describe the business need
2. **Current Workflow**: How it's done now
3. **Proposed Solution**: Suggested improvement
4. **Priority**: Business impact and urgency

## Support Contacts

- **Technical Issues**: [technical-support@lpassistant.com]
- **Business Questions**: [business-support@lpassistant.com]
- **Security Concerns**: [security@lpassistant.com]

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Environment**: Staging  
**Deployment Type**: Docker Compose