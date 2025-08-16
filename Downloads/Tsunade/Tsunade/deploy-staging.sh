#!/bin/bash

# LP Assistant Healthcare Platform - Staging Deployment Script
# Bash script for deploying to staging environment on Linux/macOS

set -e  # Exit on any error

# Configuration
COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE=".env.staging"
PROJECT_NAME="lp-assistant-staging"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        log_error "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    local docker_version=$(docker --version)
    log_success "Docker found: $docker_version"
    
    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        log_error "Please install Docker Compose or update Docker to a newer version"
        exit 1
    fi
    
    local compose_version=$(docker compose version)
    log_success "Docker Compose found: $compose_version"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        log_error "Please start Docker daemon"
        exit 1
    fi
    
    log_success "Docker daemon is running"
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file $ENV_FILE not found"
        log_info "Please ensure the staging environment file is created"
    fi
    
    log_success "Prerequisites check completed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images for staging..."
    
    if docker compose -f "$COMPOSE_FILE" build --no-cache; then
        log_success "Docker images built successfully"
    else
        log_error "Failed to build Docker images"
        exit 1
    fi
}

# Deploy services
deploy_services() {
    log_info "Deploying services to staging environment..."
    
    # Pull latest images for external services
    log_info "Pulling external service images..."
    docker compose -f "$COMPOSE_FILE" pull postgres redis mongodb prometheus grafana nginx || true
    
    # Start services
    log_info "Starting services..."
    if docker compose -f "$COMPOSE_FILE" up -d; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        show_logs
        exit 1
    fi
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Initialize database
    log_info "Initializing database..."
    if docker compose -f "$COMPOSE_FILE" run --rm db-init; then
        log_success "Database initialized successfully"
    else
        log_warning "Database initialization may have failed, check logs"
    fi
    
    log_success "Staging deployment completed successfully"
    
    # Show service status
    show_status
}

# Stop services
stop_services() {
    log_info "Stopping staging services..."
    
    if docker compose -f "$COMPOSE_FILE" down; then
        log_success "Services stopped successfully"
    else
        log_error "Failed to stop services"
        exit 1
    fi
}

# Show logs
show_logs() {
    if [ -n "$SERVICE" ]; then
        log_info "Showing logs for service: $SERVICE"
        docker compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    else
        log_info "Showing logs for all services"
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Show status
show_status() {
    log_info "Service Status:"
    docker compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Service URLs:"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API Documentation: http://localhost:8000/docs"
    echo "Prometheus: http://localhost:9090"
    echo "Grafana: http://localhost:3001 (admin/staging123)"
    echo "PostgreSQL: localhost:5432"
    echo "Redis: localhost:6379"
    echo "MongoDB: localhost:27017"
}

# Clean environment
clean_environment() {
    log_warning "Cleaning staging environment (this will remove all data)..."
    read -p "Are you sure? Type 'yes' to continue: " confirmation
    
    if [ "$confirmation" = "yes" ]; then
        # Stop and remove containers
        docker compose -f "$COMPOSE_FILE" down -v --remove-orphans || true
        
        # Remove images
        docker compose -f "$COMPOSE_FILE" down --rmi all || true
        
        # Prune unused volumes and networks
        docker volume prune -f || true
        docker network prune -f || true
        
        log_success "Environment cleaned successfully"
    else
        log_info "Clean operation cancelled"
    fi
}

# Show help
show_help() {
    echo ""
    echo -e "${BLUE}LP Assistant Staging Deployment Script${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
    echo -e "${GREEN}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  build           Build Docker images"
    echo "  deploy          Deploy services to staging"
    echo "  stop            Stop all services"
    echo "  logs [service]  Show service logs"
    echo "  status          Show service status"
    echo "  clean           Clean environment (removes all data)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 build deploy"
    echo "  $0 status"
    echo "  $0 logs backend"
    echo "  $0 stop"
    echo "  $0 clean"
    echo ""
}

# Main execution
log_info "LP Assistant Staging Deployment Script"
log_info "======================================="

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

check_prerequisites

# Process command line arguments
while [ $# -gt 0 ]; do
    case $1 in
        build)
            build_images
            shift
            ;;
        deploy)
            deploy_services
            shift
            ;;
        stop)
            stop_services
            shift
            ;;
        logs)
            if [ -n "$2" ] && [[ $2 != -* ]]; then
                SERVICE="$2"
                shift
            fi
            show_logs
            shift
            ;;
        status)
            show_status
            shift
            ;;
        clean)
            clean_environment
            shift
            ;;
        help|--help|-h)
            show_help
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

log_success "Script execution completed"