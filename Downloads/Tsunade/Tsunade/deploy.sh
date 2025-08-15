#!/bin/bash

# LP Assistant Healthcare Platform Deployment Script
# This script automates the deployment process for the LP Assistant platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="lp-assistant"
DOCKER_COMPOSE_FILE="docker-compose.yml"
PRODUCTION_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        warn ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            warn "Please edit .env file with your configuration before continuing."
            read -p "Press Enter to continue after editing .env file..."
        else
            error ".env.example file not found. Cannot create .env file."
        fi
    fi
    
    log "Prerequisites check completed."
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./logs"
    mkdir -p "./backend/uploads"
    mkdir -p "./backend/logs"
    
    log "Directories setup completed."
}

# Backup existing data
backup_data() {
    log "Creating backup..."
    
    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    if docker-compose ps | grep -q "postgres"; then
        info "Backing up PostgreSQL database..."
        docker-compose exec -T postgres pg_dump -U lp_assistant_user lp_assistant_db > "$BACKUP_PATH/postgres_backup.sql" || warn "PostgreSQL backup failed"
    fi
    
    # Backup Redis
    if docker-compose ps | grep -q "redis"; then
        info "Backing up Redis data..."
        docker-compose exec -T redis redis-cli --rdb - > "$BACKUP_PATH/redis_backup.rdb" || warn "Redis backup failed"
    fi
    
    # Backup MongoDB
    if docker-compose ps | grep -q "mongodb"; then
        info "Backing up MongoDB data..."
        docker-compose exec -T mongodb mongodump --archive > "$BACKUP_PATH/mongodb_backup.archive" || warn "MongoDB backup failed"
    fi
    
    # Backup uploads
    if [ -d "./backend/uploads" ]; then
        info "Backing up uploaded files..."
        cp -r ./backend/uploads "$BACKUP_PATH/" || warn "Uploads backup failed"
    fi
    
    log "Backup completed: $BACKUP_PATH"
}

# Build and deploy
deploy() {
    local ENVIRONMENT=${1:-development}
    
    log "Starting deployment for $ENVIRONMENT environment..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Build custom images
    log "Building custom Docker images..."
    docker-compose build --no-cache
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down
    
    # Start services
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Starting services in production mode..."
        if [ -f "$PRODUCTION_COMPOSE_FILE" ]; then
            docker-compose -f "$DOCKER_COMPOSE_FILE" -f "$PRODUCTION_COMPOSE_FILE" up -d
        else
            warn "Production compose file not found. Using default configuration."
            docker-compose up -d
        fi
    else
        log "Starting services in development mode..."
        docker-compose up -d
    fi
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Run health checks
    health_check
    
    log "Deployment completed successfully!"
}

# Health check
health_check() {
    log "Running health checks..."
    
    local MAX_RETRIES=10
    local RETRY_COUNT=0
    
    # Check backend health
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            log "Backend health check passed"
            break
        else
            warn "Backend health check failed. Retrying in 10 seconds... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
            sleep 10
            RETRY_COUNT=$((RETRY_COUNT + 1))
        fi
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        error "Backend health check failed after $MAX_RETRIES attempts"
    fi
    
    # Check frontend health
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:80/health > /dev/null 2>&1; then
            log "Frontend health check passed"
            break
        else
            warn "Frontend health check failed. Retrying in 10 seconds... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
            sleep 10
            RETRY_COUNT=$((RETRY_COUNT + 1))
        fi
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        error "Frontend health check failed after $MAX_RETRIES attempts"
    fi
    
    log "All health checks passed!"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run Alembic migrations
    docker-compose exec backend alembic upgrade head || warn "Migration failed"
    
    log "Database migrations completed"
}

# Setup SSL certificates (placeholder)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # This is a placeholder for SSL setup
    # In production, you would use Let's Encrypt or your own certificates
    
    if [ ! -d "./ssl" ]; then
        mkdir -p ./ssl
        warn "SSL directory created. Please add your SSL certificates to ./ssl/"
    fi
    
    log "SSL setup completed"
}

# Monitor deployment
monitor() {
    log "Starting monitoring..."
    
    # Show container status
    docker-compose ps
    
    # Show logs
    echo -e "\n${BLUE}Recent logs:${NC}"
    docker-compose logs --tail=50
    
    # Show resource usage
    echo -e "\n${BLUE}Resource usage:${NC}"
    docker stats --no-stream
}

# Rollback function
rollback() {
    local BACKUP_PATH=$1
    
    if [ -z "$BACKUP_PATH" ]; then
        error "Backup path not specified for rollback"
    fi
    
    if [ ! -d "$BACKUP_PATH" ]; then
        error "Backup path does not exist: $BACKUP_PATH"
    fi
    
    log "Rolling back to backup: $BACKUP_PATH"
    
    # Stop current services
    docker-compose down
    
    # Restore database
    if [ -f "$BACKUP_PATH/postgres_backup.sql" ]; then
        info "Restoring PostgreSQL database..."
        docker-compose up -d postgres
        sleep 10
        docker-compose exec -T postgres psql -U lp_assistant_user -d lp_assistant_db < "$BACKUP_PATH/postgres_backup.sql"
    fi
    
    # Restore uploads
    if [ -d "$BACKUP_PATH/uploads" ]; then
        info "Restoring uploaded files..."
        rm -rf ./backend/uploads
        cp -r "$BACKUP_PATH/uploads" ./backend/
    fi
    
    # Start services
    docker-compose up -d
    
    log "Rollback completed"
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 7 backups
    find "$BACKUP_DIR" -type d -name "backup_*" | sort -r | tail -n +8 | xargs rm -rf
    
    log "Backup cleanup completed"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy [dev|prod]     Deploy the application (default: dev)"
    echo "  backup               Create a backup of current data"
    echo "  rollback [path]      Rollback to a specific backup"
    echo "  health               Run health checks"
    echo "  monitor              Show monitoring information"
    echo "  migrate              Run database migrations"
    echo "  ssl                  Setup SSL certificates"
    echo "  cleanup              Cleanup old backups"
    echo "  logs                 Show application logs"
    echo "  stop                 Stop all services"
    echo "  restart              Restart all services"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy dev        Deploy in development mode"
    echo "  $0 deploy prod       Deploy in production mode"
    echo "  $0 backup            Create a backup"
    echo "  $0 rollback ./backups/backup_20231201_120000"
}

# Main script logic
main() {
    local COMMAND=${1:-help}
    
    case $COMMAND in
        "deploy")
            check_prerequisites
            setup_directories
            backup_data
            deploy ${2:-development}
            run_migrations
            ;;
        "backup")
            backup_data
            ;;
        "rollback")
            rollback $2
            ;;
        "health")
            health_check
            ;;
        "monitor")
            monitor
            ;;
        "migrate")
            run_migrations
            ;;
        "ssl")
            setup_ssl
            ;;
        "cleanup")
            cleanup_backups
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "stop")
            log "Stopping all services..."
            docker-compose down
            ;;
        "restart")
            log "Restarting all services..."
            docker-compose restart
            ;;
        "help")
            show_usage
            ;;
        *)
            error "Unknown command: $COMMAND"
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"