#!/bin/bash

# Cloud Deployment Script for LP Assistant Healthcare Platform
# Supports AWS ECS, DigitalOcean, Railway, and other cloud platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="lp-assistant"
REGION="us-east-1"
ENVIRONMENT="production"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_error "Railway CLI not found. Please install it first:"
        echo "npm install -g @railway/cli"
        exit 1
    fi
    
    # Login to Railway
    railway login
    
    # Create new project or link existing
    railway link
    
    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set ENVIRONMENT=production
    railway variables set DATABASE_URL="\${{DATABASE_URL}}"
    railway variables set REDIS_URL="\${{REDIS_URL}}"
    
    # Deploy
    railway up
    
    print_success "Railway deployment completed!"
    print_status "Your application will be available at the Railway-provided URL"
}

# Function to deploy to DigitalOcean App Platform
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    if ! command_exists doctl; then
        print_error "DigitalOcean CLI not found. Please install it first:"
        echo "https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    # Create app spec
    cat > .do/app.yaml << EOF
name: ${APP_NAME}
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/your-repo
    branch: main
  run_command: gunicorn main:app --bind 0.0.0.0:8000 --workers 2 --worker-class uvicorn.workers.UvicornWorker
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8000
  envs:
  - key: ENVIRONMENT
    value: production
  - key: DATABASE_URL
    value: \${db.DATABASE_URL}
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/your-repo
    branch: main
  run_command: serve -s build -l 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
databases:
- name: db
  engine: PG
  version: "15"
  size: basic-xs
EOF
    
    # Deploy
    doctl apps create --spec .do/app.yaml
    
    print_success "DigitalOcean deployment initiated!"
    print_status "Check your DigitalOcean dashboard for deployment status"
}

# Function to deploy to AWS ECS with Fargate
deploy_aws_ecs() {
    print_status "Deploying to AWS ECS with Fargate..."
    
    if ! command_exists aws; then
        print_error "AWS CLI not found. Please install it first:"
        echo "https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    
    # Create ECR repositories
    print_status "Creating ECR repositories..."
    aws ecr create-repository --repository-name ${APP_NAME}-backend --region ${REGION} || true
    aws ecr create-repository --repository-name ${APP_NAME}-frontend --region ${REGION} || true
    
    # Get ECR login
    aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com
    
    # Build and push images
    print_status "Building and pushing Docker images..."
    
    # Backend
    docker build -f backend/Dockerfile.production -t ${APP_NAME}-backend ./backend
    docker tag ${APP_NAME}-backend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-backend:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-backend:latest
    
    # Frontend
    docker build -f frontend/Dockerfile.production -t ${APP_NAME}-frontend ./frontend
    docker tag ${APP_NAME}-frontend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-frontend:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-frontend:latest
    
    # Create ECS cluster
    print_status "Creating ECS cluster..."
    aws ecs create-cluster --cluster-name ${APP_NAME}-cluster --region ${REGION} || true
    
    # Create task definition
    print_status "Creating ECS task definition..."
    cat > task-definition.json << EOF
{
  "family": "${APP_NAME}-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${APP_NAME}",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${APP_NAME}",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF
    
    aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${REGION}
    
    print_success "AWS ECS deployment setup completed!"
    print_status "Please configure ALB, security groups, and subnets in AWS Console"
}

# Function to deploy to Google Cloud Run
deploy_gcp_run() {
    print_status "Deploying to Google Cloud Run..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud CLI not found. Please install it first:"
        echo "https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Set project
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    
    # Build and deploy backend
    print_status "Building and deploying backend..."
    gcloud builds submit --tag gcr.io/$PROJECT_ID/${APP_NAME}-backend ./backend
    gcloud run deploy ${APP_NAME}-backend \
        --image gcr.io/$PROJECT_ID/${APP_NAME}-backend \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated
    
    # Build and deploy frontend
    print_status "Building and deploying frontend..."
    gcloud builds submit --tag gcr.io/$PROJECT_ID/${APP_NAME}-frontend ./frontend
    gcloud run deploy ${APP_NAME}-frontend \
        --image gcr.io/$PROJECT_ID/${APP_NAME}-frontend \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated
    
    print_success "Google Cloud Run deployment completed!"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL with Let's Encrypt..."
    
    if ! command_exists certbot; then
        print_error "Certbot not found. Please install it first:"
        echo "sudo apt-get install certbot python3-certbot-nginx"
        exit 1
    fi
    
    read -p "Enter your domain name: " DOMAIN_NAME
    read -p "Enter your email address: " EMAIL
    
    # Generate SSL certificate
    sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email $EMAIL --agree-tos --non-interactive
    
    # Setup auto-renewal
    sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
    
    print_success "SSL certificate setup completed!"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring with Prometheus and Grafana..."
    
    # Deploy monitoring stack
    docker-compose -f docker-compose.production.yml up -d prometheus grafana
    
    print_success "Monitoring setup completed!"
    print_status "Prometheus: http://your-domain:9090"
    print_status "Grafana: http://your-domain:3001 (admin/admin)"
}

# Main menu
show_menu() {
    echo "======================================"
    echo "  LP Assistant Cloud Deployment"
    echo "======================================"
    echo "1. Deploy to Railway"
    echo "2. Deploy to DigitalOcean App Platform"
    echo "3. Deploy to AWS ECS (Fargate)"
    echo "4. Deploy to Google Cloud Run"
    echo "5. Setup SSL Certificate"
    echo "6. Setup Monitoring"
    echo "7. Exit"
    echo "======================================"
}

# Main script
if [ $# -eq 0 ]; then
    while true; do
        show_menu
        read -p "Please select an option (1-7): " choice
        case $choice in
            1) deploy_railway; break;;
            2) deploy_digitalocean; break;;
            3) deploy_aws_ecs; break;;
            4) deploy_gcp_run; break;;
            5) setup_ssl; break;;
            6) setup_monitoring; break;;
            7) echo "Goodbye!"; exit 0;;
            *) print_error "Invalid option. Please try again.";;
        esac
    done
else
    case $1 in
        railway) deploy_railway;;
        digitalocean) deploy_digitalocean;;
        aws) deploy_aws_ecs;;
        gcp) deploy_gcp_run;;
        ssl) setup_ssl;;
        monitoring) setup_monitoring;;
        *) echo "Usage: $0 [railway|digitalocean|aws|gcp|ssl|monitoring]"; exit 1;;
    esac
fi