# LP Assistant Healthcare Platform - Staging Deployment Script
# PowerShell script for deploying to staging environment

param(
    [switch]$Build,
    [switch]$Deploy,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Status,
    [switch]$Clean,
    [string]$Service = ""
)

# Configuration
$COMPOSE_FILE = "docker-compose.staging.yml"
$ENV_FILE = ".env.staging"
$PROJECT_NAME = "lp-assistant-staging"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info($message) {
    Write-ColorOutput $Blue "[INFO] $message"
}

function Log-Success($message) {
    Write-ColorOutput $Green "[SUCCESS] $message"
}

function Log-Warning($message) {
    Write-ColorOutput $Yellow "[WARNING] $message"
}

function Log-Error($message) {
    Write-ColorOutput $Red "[ERROR] $message"
}

function Check-Prerequisites {
    Log-Info "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        $dockerVersion = docker --version
        Log-Success "Docker found: $dockerVersion"
    } catch {
        Log-Error "Docker is not installed or not in PATH"
        Log-Error "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        $composeVersion = docker compose version
        Log-Success "Docker Compose found: $composeVersion"
    } catch {
        Log-Error "Docker Compose is not available"
        exit 1
    }
    
    # Check if Docker daemon is running
    try {
        docker info | Out-Null
        Log-Success "Docker daemon is running"
    } catch {
        Log-Error "Docker daemon is not running. Please start Docker Desktop"
        exit 1
    }
    
    # Check if environment file exists
    if (!(Test-Path $ENV_FILE)) {
        Log-Warning "Environment file $ENV_FILE not found"
        Log-Info "Creating staging environment file..."
        # The file should already be created by the deployment process
    }
    
    Log-Success "Prerequisites check completed"
}

function Build-Images {
    Log-Info "Building Docker images for staging..."
    
    try {
        docker compose -f $COMPOSE_FILE build --no-cache
        Log-Success "Docker images built successfully"
    } catch {
        Log-Error "Failed to build Docker images"
        exit 1
    }
}

function Deploy-Services {
    Log-Info "Deploying services to staging environment..."
    
    try {
        # Pull latest images for external services
        Log-Info "Pulling external service images..."
        docker compose -f $COMPOSE_FILE pull postgres redis mongodb prometheus grafana nginx
        
        # Start services
        Log-Info "Starting services..."
        docker compose -f $COMPOSE_FILE up -d
        
        # Wait for services to be healthy
        Log-Info "Waiting for services to be healthy..."
        Start-Sleep -Seconds 30
        
        # Initialize database
        Log-Info "Initializing database..."
        docker compose -f $COMPOSE_FILE run --rm db-init
        
        Log-Success "Staging deployment completed successfully"
        
        # Show service status
        Show-Status
        
    } catch {
        Log-Error "Failed to deploy services"
        Show-Logs
        exit 1
    }
}

function Stop-Services {
    Log-Info "Stopping staging services..."
    
    try {
        docker compose -f $COMPOSE_FILE down
        Log-Success "Services stopped successfully"
    } catch {
        Log-Error "Failed to stop services"
        exit 1
    }
}

function Show-Logs {
    if ($Service) {
        Log-Info "Showing logs for service: $Service"
        docker compose -f $COMPOSE_FILE logs -f $Service
    } else {
        Log-Info "Showing logs for all services"
        docker compose -f $COMPOSE_FILE logs -f
    }
}

function Show-Status {
    Log-Info "Service Status:"
    docker compose -f $COMPOSE_FILE ps
    
    Log-Info ""
    Log-Info "Service URLs:"
    Log-Info "Frontend: http://localhost:3000"
    Log-Info "Backend API: http://localhost:8000"
    Log-Info "API Documentation: http://localhost:8000/docs"
    Log-Info "Prometheus: http://localhost:9090"
    Log-Info "Grafana: http://localhost:3001 (admin/staging123)"
    Log-Info "PostgreSQL: localhost:5432"
    Log-Info "Redis: localhost:6379"
    Log-Info "MongoDB: localhost:27017"
}

function Clean-Environment {
    Log-Warning "Cleaning staging environment (this will remove all data)..."
    $confirmation = Read-Host "Are you sure? Type 'yes' to continue"
    
    if ($confirmation -eq "yes") {
        try {
            # Stop and remove containers
            docker compose -f $COMPOSE_FILE down -v --remove-orphans
            
            # Remove images
            docker compose -f $COMPOSE_FILE down --rmi all
            
            # Prune unused volumes and networks
            docker volume prune -f
            docker network prune -f
            
            Log-Success "Environment cleaned successfully"
        } catch {
            Log-Error "Failed to clean environment"
            exit 1
        }
    } else {
        Log-Info "Clean operation cancelled"
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "LP Assistant Staging Deployment Script" -ForegroundColor $Blue
    Write-Host "=========================================" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Usage: .\deploy-staging.ps1 [OPTIONS]" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $Yellow
    Write-Host "  -Build          Build Docker images"
    Write-Host "  -Deploy         Deploy services to staging"
    Write-Host "  -Stop           Stop all services"
    Write-Host "  -Logs           Show service logs"
    Write-Host "  -Status         Show service status"
    Write-Host "  -Clean          Clean environment (removes all data)"
    Write-Host "  -Service <name> Specify service for logs"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Yellow
    Write-Host "  .\deploy-staging.ps1 -Build -Deploy"
    Write-Host "  .\deploy-staging.ps1 -Status"
    Write-Host "  .\deploy-staging.ps1 -Logs -Service backend"
    Write-Host "  .\deploy-staging.ps1 -Stop"
    Write-Host "  .\deploy-staging.ps1 -Clean"
    Write-Host ""
}

# Main execution
Log-Info "LP Assistant Staging Deployment Script"
Log-Info "======================================="

if (-not ($Build -or $Deploy -or $Stop -or $Logs -or $Status -or $Clean)) {
    Show-Help
    exit 0
}

Check-Prerequisites

if ($Build) {
    Build-Images
}

if ($Deploy) {
    Deploy-Services
}

if ($Stop) {
    Stop-Services
}

if ($Logs) {
    Show-Logs
}

if ($Status) {
    Show-Status
}

if ($Clean) {
    Clean-Environment
}

Log-Success "Script execution completed"