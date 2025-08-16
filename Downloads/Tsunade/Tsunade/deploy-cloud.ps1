# Cloud Deployment Script for LP Assistant Healthcare Platform (PowerShell)
# Supports Railway, DigitalOcean, AWS, and other cloud platforms

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("railway", "digitalocean", "aws", "gcp", "ssl", "monitoring", "menu")]
    [string]$Platform = "menu",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "lp-assistant",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to deploy to Railway
function Deploy-Railway {
    Write-Status "Deploying to Railway..."
    
    if (-not (Test-Command "railway")) {
        Write-Error "Railway CLI not found. Installing..."
        try {
            npm install -g @railway/cli
            Write-Success "Railway CLI installed successfully"
        }
        catch {
            Write-Error "Failed to install Railway CLI. Please install Node.js first."
            return
        }
    }
    
    # Login to Railway
    Write-Status "Logging into Railway..."
    railway login
    
    # Create new project or link existing
    Write-Status "Linking Railway project..."
    railway link
    
    # Set environment variables
    Write-Status "Setting environment variables..."
    railway variables set ENVIRONMENT=production
    railway variables set NODE_ENV=production
    
    # Deploy
    Write-Status "Deploying application..."
    railway up
    
    Write-Success "Railway deployment completed!"
    Write-Status "Your application will be available at the Railway-provided URL"
    Write-Status "Check your Railway dashboard for the deployment URL"
}

# Function to deploy to DigitalOcean App Platform
function Deploy-DigitalOcean {
    Write-Status "Deploying to DigitalOcean App Platform..."
    
    if (-not (Test-Command "doctl")) {
        Write-Error "DigitalOcean CLI not found. Please install it first:"
        Write-Host "Download from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        return
    }
    
    # Create app spec directory
    if (-not (Test-Path ".do")) {
        New-Item -ItemType Directory -Path ".do" -Force
    }
    
    # Create app spec
    $appSpec = @"
name: $AppName
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
    value: `${db.DATABASE_URL}
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
"@
    
    $appSpec | Out-File -FilePath ".do\app.yaml" -Encoding UTF8
    
    # Deploy
    Write-Status "Creating DigitalOcean app..."
    doctl apps create --spec .do\app.yaml
    
    Write-Success "DigitalOcean deployment initiated!"
    Write-Status "Check your DigitalOcean dashboard for deployment status"
}

# Function to deploy to AWS ECS
function Deploy-AWS {
    Write-Status "Deploying to AWS ECS with Fargate..."
    
    if (-not (Test-Command "aws")) {
        Write-Error "AWS CLI not found. Please install it first:"
        Write-Host "Download from: https://aws.amazon.com/cli/"
        return
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    }
    catch {
        Write-Error "AWS credentials not configured. Run 'aws configure' first."
        return
    }
    
    $accountId = (aws sts get-caller-identity --query Account --output text)
    
    # Create ECR repositories
    Write-Status "Creating ECR repositories..."
    try {
        aws ecr create-repository --repository-name "$AppName-backend" --region $Region
    } catch {}
    try {
        aws ecr create-repository --repository-name "$AppName-frontend" --region $Region
    } catch {}
    
    # Get ECR login
    Write-Status "Logging into ECR..."
    $loginCommand = aws ecr get-login-password --region $Region
    $loginCommand | docker login --username AWS --password-stdin "$accountId.dkr.ecr.$Region.amazonaws.com"
    
    # Build and push images
    Write-Status "Building and pushing Docker images..."
    
    # Backend
    Write-Status "Building backend image..."
    docker build -f backend\Dockerfile.production -t "$AppName-backend" .\backend
    docker tag "$AppName-backend:latest" "$accountId.dkr.ecr.$Region.amazonaws.com/$AppName-backend:latest"
    docker push "$accountId.dkr.ecr.$Region.amazonaws.com/$AppName-backend:latest"
    
    # Frontend
    Write-Status "Building frontend image..."
    docker build -f frontend\Dockerfile.production -t "$AppName-frontend" .\frontend
    docker tag "$AppName-frontend:latest" "$accountId.dkr.ecr.$Region.amazonaws.com/$AppName-frontend:latest"
    docker push "$accountId.dkr.ecr.$Region.amazonaws.com/$AppName-frontend:latest"
    
    # Create ECS cluster
    Write-Status "Creating ECS cluster..."
    try {
        aws ecs create-cluster --cluster-name "$AppName-cluster" --region $Region
    } catch {}
    
    Write-Success "AWS ECS deployment setup completed!"
    Write-Status "Please configure ALB, security groups, and subnets in AWS Console"
    Write-Status "Task definition and service creation can be done through AWS Console"
}

# Function to deploy to Google Cloud Run
function Deploy-GCP {
    Write-Status "Deploying to Google Cloud Run..."
    
    if (-not (Test-Command "gcloud")) {
        Write-Error "Google Cloud CLI not found. Please install it first:"
        Write-Host "Download from: https://cloud.google.com/sdk/docs/install"
        return
    }
    
    # Set project
    $projectId = Read-Host "Enter your GCP Project ID"
    gcloud config set project $projectId
    
    # Enable required APIs
    Write-Status "Enabling required APIs..."
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    
    # Build and deploy backend
    Write-Status "Building and deploying backend..."
    gcloud builds submit --tag "gcr.io/$projectId/$AppName-backend" .\backend
    gcloud run deploy "$AppName-backend" `
        --image "gcr.io/$projectId/$AppName-backend" `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated
    
    # Build and deploy frontend
    Write-Status "Building and deploying frontend..."
    gcloud builds submit --tag "gcr.io/$projectId/$AppName-frontend" .\frontend
    gcloud run deploy "$AppName-frontend" `
        --image "gcr.io/$projectId/$AppName-frontend" `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated
    
    Write-Success "Google Cloud Run deployment completed!"
}

# Function to setup monitoring
function Setup-Monitoring {
    Write-Status "Setting up monitoring with Prometheus and Grafana..."
    
    if (-not (Test-Command "docker-compose")) {
        Write-Error "Docker Compose not found. Please install Docker Desktop first."
        return
    }
    
    # Deploy monitoring stack
    docker-compose -f docker-compose.production.yml up -d prometheus grafana
    
    Write-Success "Monitoring setup completed!"
    Write-Status "Prometheus: http://your-domain:9090"
    Write-Status "Grafana: http://your-domain:3001 (admin/admin)"
}

# Function to show menu
function Show-Menu {
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "  LP Assistant Cloud Deployment" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "1. Deploy to Railway" -ForegroundColor White
    Write-Host "2. Deploy to DigitalOcean App Platform" -ForegroundColor White
    Write-Host "3. Deploy to AWS ECS (Fargate)" -ForegroundColor White
    Write-Host "4. Deploy to Google Cloud Run" -ForegroundColor White
    Write-Host "5. Setup Monitoring" -ForegroundColor White
    Write-Host "6. Exit" -ForegroundColor White
    Write-Host "======================================" -ForegroundColor Cyan
}

# Function to validate environment
function Test-Environment {
    Write-Status "Validating deployment environment..."
    
    # Check if .env.production exists
    if (-not (Test-Path ".env.production")) {
        Write-Warning ".env.production not found. Creating from template..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env.production"
            Write-Warning "Please update .env.production with your production values"
        }
    }
    
    # Check Docker
    if (-not (Test-Command "docker")) {
        Write-Warning "Docker not found. Some deployment options may not work."
    }
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Warning "Node.js not found. Railway deployment may not work."
    }
    
    Write-Success "Environment validation completed"
}

# Main script execution
Write-Host "LP Assistant Healthcare Platform - Cloud Deployment" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Validate environment first
Test-Environment

# Handle command line parameters or show menu
if ($Platform -eq "menu") {
    do {
        Show-Menu
        $choice = Read-Host "Please select an option (1-6)"
        
        switch ($choice) {
            "1" { Deploy-Railway; break }
            "2" { Deploy-DigitalOcean; break }
            "3" { Deploy-AWS; break }
            "4" { Deploy-GCP; break }
            "5" { Setup-Monitoring; break }
            "6" { Write-Host "Goodbye!" -ForegroundColor Green; exit 0 }
            default { Write-Error "Invalid option. Please try again." }
        }
    } while ($choice -notin @("1", "2", "3", "4", "5", "6"))
} else {
    switch ($Platform) {
        "railway" { Deploy-Railway }
        "digitalocean" { Deploy-DigitalOcean }
        "aws" { Deploy-AWS }
        "gcp" { Deploy-GCP }
        "monitoring" { Setup-Monitoring }
        default { 
            Write-Error "Invalid platform. Use: railway, digitalocean, aws, gcp, or monitoring"
            exit 1
        }
    }
}

Write-Host ""
Write-Success "Deployment script completed!"
Write-Status "Please refer to PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions"
Write-Status "Don't forget to:"
Write-Host "  - Configure your domain and SSL" -ForegroundColor Yellow
Write-Host "  - Set up monitoring and alerts" -ForegroundColor Yellow
Write-Host "  - Test your deployment thoroughly" -ForegroundColor Yellow
Write-Host "  - Set up backup and recovery procedures" -ForegroundColor Yellow