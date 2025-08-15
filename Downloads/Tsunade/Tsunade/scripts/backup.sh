#!/bin/bash

# LP Assistant Healthcare Platform Backup Script
# This script creates comprehensive backups of all critical data

set -e  # Exit on any error

# Configuration
BACKUP_BASE_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BACKUP_BASE_DIR/$TIMESTAMP"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6
ENCRYPTION_KEY_FILE="/etc/backup/encryption.key"
S3_BUCKET="lp-assistant-backups"
LOG_FILE="$BACKUP_BASE_DIR/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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
    
    # Check if required tools are installed
    for tool in pg_dump mongodump redis-cli tar gzip gpg aws; do
        if ! command -v $tool &> /dev/null; then
            warn "$tool is not installed. Some backups may fail."
        fi
    done
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Check disk space (require at least 10GB free)
    AVAILABLE_SPACE=$(df "$BACKUP_BASE_DIR" | awk 'NR==2 {print $4}')
    REQUIRED_SPACE=10485760  # 10GB in KB
    
    if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
        error "Insufficient disk space. Available: ${AVAILABLE_SPACE}KB, Required: ${REQUIRED_SPACE}KB"
    fi
    
    log "Prerequisites check completed."
}

# Backup PostgreSQL database
backup_postgresql() {
    log "Starting PostgreSQL backup..."
    
    local DB_HOST=${POSTGRES_HOST:-postgres}
    local DB_PORT=${POSTGRES_PORT:-5432}
    local DB_NAME=${POSTGRES_DB:-lp_assistant_db}
    local DB_USER=${POSTGRES_USER:-lp_assistant_user}
    local DB_PASSWORD=${POSTGRES_PASSWORD}
    
    if [ -z "$DB_PASSWORD" ]; then
        warn "PostgreSQL password not set. Backup may fail."
        return 1
    fi
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Create database dump
    local DUMP_FILE="$BACKUP_DIR/postgresql_${TIMESTAMP}.sql"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --if-exists --create --format=custom \
        --file="${DUMP_FILE}.custom" 2>> "$LOG_FILE"; then
        
        # Also create plain SQL dump for easier restoration
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --verbose --clean --if-exists --create \
            --file="$DUMP_FILE" 2>> "$LOG_FILE"
        
        # Compress the dumps
        gzip -$COMPRESSION_LEVEL "$DUMP_FILE"
        gzip -$COMPRESSION_LEVEL "${DUMP_FILE}.custom"
        
        log "PostgreSQL backup completed successfully."
    else
        error "PostgreSQL backup failed."
    fi
    
    unset PGPASSWORD
}

# Backup MongoDB database
backup_mongodb() {
    log "Starting MongoDB backup..."
    
    local MONGO_HOST=${MONGODB_HOST:-mongodb}
    local MONGO_PORT=${MONGODB_PORT:-27017}
    local MONGO_DB=${MONGODB_DB:-lp_assistant_db}
    local MONGO_USER=${MONGODB_USER}
    local MONGO_PASSWORD=${MONGODB_PASSWORD}
    
    local DUMP_DIR="$BACKUP_DIR/mongodb_$TIMESTAMP"
    mkdir -p "$DUMP_DIR"
    
    # Build mongodump command
    local MONGODUMP_CMD="mongodump --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --out $DUMP_DIR"
    
    if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASSWORD" ]; then
        MONGODUMP_CMD="$MONGODUMP_CMD --username $MONGO_USER --password $MONGO_PASSWORD --authenticationDatabase admin"
    fi
    
    if eval "$MONGODUMP_CMD" 2>> "$LOG_FILE"; then
        # Create archive
        tar -czf "$BACKUP_DIR/mongodb_${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" "mongodb_$TIMESTAMP"
        rm -rf "$DUMP_DIR"
        
        log "MongoDB backup completed successfully."
    else
        error "MongoDB backup failed."
    fi
}

# Backup Redis data
backup_redis() {
    log "Starting Redis backup..."
    
    local REDIS_HOST=${REDIS_HOST:-redis}
    local REDIS_PORT=${REDIS_PORT:-6379}
    local REDIS_PASSWORD=${REDIS_PASSWORD}
    
    local DUMP_FILE="$BACKUP_DIR/redis_${TIMESTAMP}.rdb"
    
    # Build redis-cli command
    local REDIS_CMD="redis-cli -h $REDIS_HOST -p $REDIS_PORT"
    
    if [ -n "$REDIS_PASSWORD" ]; then
        REDIS_CMD="$REDIS_CMD -a $REDIS_PASSWORD"
    fi
    
    # Trigger BGSAVE and wait for completion
    if $REDIS_CMD BGSAVE 2>> "$LOG_FILE"; then
        # Wait for background save to complete
        while [ "$($REDIS_CMD LASTSAVE 2>/dev/null)" = "$($REDIS_CMD LASTSAVE 2>/dev/null)" ]; do
            sleep 1
        done
        
        # Copy the RDB file
        if $REDIS_CMD --rdb "$DUMP_FILE" 2>> "$LOG_FILE"; then
            gzip -$COMPRESSION_LEVEL "$DUMP_FILE"
            log "Redis backup completed successfully."
        else
            warn "Redis RDB copy failed, trying alternative method..."
            # Alternative: copy from Redis data directory (if accessible)
            if [ -f "/data/dump.rdb" ]; then
                cp /data/dump.rdb "$DUMP_FILE"
                gzip -$COMPRESSION_LEVEL "$DUMP_FILE"
                log "Redis backup completed using alternative method."
            else
                error "Redis backup failed."
            fi
        fi
    else
        error "Redis BGSAVE command failed."
    fi
}

# Backup application files
backup_application_files() {
    log "Starting application files backup..."
    
    local FILES_DIR="$BACKUP_DIR/application_files_$TIMESTAMP"
    mkdir -p "$FILES_DIR"
    
    # Backup uploaded files
    if [ -d "/app/uploads" ]; then
        info "Backing up uploaded files..."
        cp -r /app/uploads "$FILES_DIR/" 2>> "$LOG_FILE" || warn "Failed to backup uploads"
    fi
    
    # Backup configuration files
    if [ -d "/app/config" ]; then
        info "Backing up configuration files..."
        cp -r /app/config "$FILES_DIR/" 2>> "$LOG_FILE" || warn "Failed to backup config"
    fi
    
    # Backup logs (last 7 days)
    if [ -d "/app/logs" ]; then
        info "Backing up recent logs..."
        find /app/logs -name "*.log" -mtime -7 -exec cp {} "$FILES_DIR/" \; 2>> "$LOG_FILE" || warn "Failed to backup logs"
    fi
    
    # Backup SSL certificates
    if [ -d "/etc/ssl/certs/lp-assistant" ]; then
        info "Backing up SSL certificates..."
        cp -r /etc/ssl/certs/lp-assistant "$FILES_DIR/ssl" 2>> "$LOG_FILE" || warn "Failed to backup SSL certs"
    fi
    
    # Create archive
    if [ "$(ls -A $FILES_DIR)" ]; then
        tar -czf "$BACKUP_DIR/application_files_${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" "application_files_$TIMESTAMP"
        rm -rf "$FILES_DIR"
        log "Application files backup completed successfully."
    else
        warn "No application files found to backup."
        rm -rf "$FILES_DIR"
    fi
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    local MANIFEST_FILE="$BACKUP_DIR/manifest.json"
    
    cat > "$MANIFEST_FILE" << EOF
{
  "backup_timestamp": "$TIMESTAMP",
  "backup_date": "$(date -Iseconds)",
  "backup_type": "full",
  "retention_days": $RETENTION_DAYS,
  "files": [
EOF
    
    # List all backup files
    local FIRST=true
    for file in "$BACKUP_DIR"/*; do
        if [ -f "$file" ] && [ "$(basename "$file")" != "manifest.json" ]; then
            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                echo "," >> "$MANIFEST_FILE"
            fi
            
            local FILENAME=$(basename "$file")
            local FILESIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            local CHECKSUM=$(sha256sum "$file" | cut -d' ' -f1)
            
            cat >> "$MANIFEST_FILE" << EOF
    {
      "filename": "$FILENAME",
      "size": $FILESIZE,
      "checksum": "$CHECKSUM"
    }EOF
        fi
    done
    
    cat >> "$MANIFEST_FILE" << EOF

  ],
  "total_size": $(du -sb "$BACKUP_DIR" | cut -f1),
  "backup_host": "$(hostname)",
  "backup_version": "1.0"
}
EOF
    
    log "Backup manifest created successfully."
}

# Encrypt backup
encrypt_backup() {
    if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
        warn "Encryption key file not found. Skipping encryption."
        return 0
    fi
    
    log "Encrypting backup files..."
    
    for file in "$BACKUP_DIR"/*.{sql.gz,tar.gz,rdb.gz}; do
        if [ -f "$file" ]; then
            info "Encrypting $(basename "$file")..."
            if gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
                --passphrase-file "$ENCRYPTION_KEY_FILE" \
                --output "${file}.gpg" "$file" 2>> "$LOG_FILE"; then
                rm "$file"
            else
                warn "Failed to encrypt $(basename "$file")"
            fi
        fi
    done
    
    log "Backup encryption completed."
}

# Upload to cloud storage
upload_to_cloud() {
    if [ -z "$S3_BUCKET" ] || ! command -v aws &> /dev/null; then
        warn "S3 bucket not configured or AWS CLI not available. Skipping cloud upload."
        return 0
    fi
    
    log "Uploading backup to cloud storage..."
    
    local S3_PREFIX="lp-assistant-backups/$(date +%Y/%m/%d)/$TIMESTAMP"
    
    if aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/$S3_PREFIX" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256 2>> "$LOG_FILE"; then
        
        # Set lifecycle policy for automatic cleanup
        aws s3api put-object-lifecycle-configuration \
            --bucket "$S3_BUCKET" \
            --lifecycle-configuration file:///etc/backup/s3-lifecycle.json 2>> "$LOG_FILE" || warn "Failed to set S3 lifecycle policy"
        
        log "Cloud upload completed successfully."
    else
        error "Cloud upload failed."
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Remove local backups older than retention period
    find "$BACKUP_BASE_DIR" -type d -name "[0-9]*_[0-9]*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>> "$LOG_FILE" || warn "Failed to cleanup some old backups"
    
    # Cleanup old log entries (keep last 1000 lines)
    if [ -f "$LOG_FILE" ]; then
        tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
    
    log "Cleanup completed."
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    local VERIFICATION_FAILED=false
    
    # Verify checksums from manifest
    if [ -f "$BACKUP_DIR/manifest.json" ]; then
        while IFS= read -r line; do
            if echo "$line" | grep -q '"filename"'; then
                local FILENAME=$(echo "$line" | sed 's/.*"filename": "\([^"]*\)".*/\1/')
                local EXPECTED_CHECKSUM=$(echo "$line" | sed 's/.*"checksum": "\([^"]*\)".*/\1/')
                
                if [ -f "$BACKUP_DIR/$FILENAME" ]; then
                    local ACTUAL_CHECKSUM=$(sha256sum "$BACKUP_DIR/$FILENAME" | cut -d' ' -f1)
                    if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]; then
                        error "Checksum mismatch for $FILENAME"
                        VERIFICATION_FAILED=true
                    fi
                else
                    warn "File $FILENAME listed in manifest but not found"
                    VERIFICATION_FAILED=true
                fi
            fi
        done < "$BACKUP_DIR/manifest.json"
    fi
    
    if [ "$VERIFICATION_FAILED" = true ]; then
        error "Backup verification failed"
    else
        log "Backup verification completed successfully."
    fi
}

# Send notification
send_notification() {
    local STATUS=$1
    local MESSAGE=$2
    
    # Send email notification (if configured)
    if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$MESSAGE" | mail -s "LP Assistant Backup $STATUS" "$NOTIFICATION_EMAIL"
    fi
    
    # Send Slack notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local COLOR="good"
        if [ "$STATUS" = "FAILED" ]; then
            COLOR="danger"
        elif [ "$STATUS" = "WARNING" ]; then
            COLOR="warning"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$COLOR\",\"title\":\"LP Assistant Backup $STATUS\",\"text\":\"$MESSAGE\"}]}" \
            "$SLACK_WEBHOOK_URL" 2>> "$LOG_FILE" || warn "Failed to send Slack notification"
    fi
}

# Main backup function
main() {
    local START_TIME=$(date +%s)
    
    log "Starting LP Assistant Healthcare Platform backup..."
    
    # Check prerequisites
    check_prerequisites
    
    # Perform backups
    backup_postgresql || warn "PostgreSQL backup failed"
    backup_mongodb || warn "MongoDB backup failed"
    backup_redis || warn "Redis backup failed"
    backup_application_files || warn "Application files backup failed"
    
    # Create manifest
    create_manifest
    
    # Encrypt if configured
    encrypt_backup
    
    # Verify backup
    verify_backup
    
    # Upload to cloud
    upload_to_cloud || warn "Cloud upload failed"
    
    # Cleanup old backups
    cleanup_old_backups
    
    local END_TIME=$(date +%s)
    local DURATION=$((END_TIME - START_TIME))
    local BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    
    local SUCCESS_MESSAGE="Backup completed successfully in ${DURATION}s. Backup size: $BACKUP_SIZE. Location: $BACKUP_DIR"
    log "$SUCCESS_MESSAGE"
    
    send_notification "SUCCESS" "$SUCCESS_MESSAGE"
}

# Error handling
trap 'error "Backup script interrupted"' INT TERM

# Run main function
main "$@"