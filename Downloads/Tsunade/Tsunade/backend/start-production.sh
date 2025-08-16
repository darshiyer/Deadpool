#!/bin/bash

# Production startup script for LP Assistant Backend
# This script handles database migrations and starts the application with Gunicorn

set -e

echo "Starting LP Assistant Backend in Production Mode..."

# Wait for database to be ready
echo "Waiting for database connection..."
while ! python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')" 2>/dev/null; do
    echo "Database not ready, waiting..."
    sleep 2
done
echo "Database connection established!"

# Run database migrations
echo "Running database migrations..."
python -c "
import asyncio
from alembic.config import Config
from alembic import command
from database.database import engine
from sqlalchemy import text

# Create database if it doesn't exist
try:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
        print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)

# Run Alembic migrations
try:
    alembic_cfg = Config('alembic.ini')
    command.upgrade(alembic_cfg, 'head')
    print('Database migrations completed successfully')
except Exception as e:
    print(f'Migration failed: {e}')
    exit(1)
"

# Initialize database with default data if needed
echo "Initializing database..."
python init_db.py

# Create log directory if it doesn't exist
mkdir -p /app/logs

# Start the application with Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn main:app \
    --bind 0.0.0.0:8000 \
    --workers ${WORKERS:-4} \
    --worker-class uvicorn.workers.UvicornWorker \
    --worker-connections ${WORKER_CONNECTIONS:-1000} \
    --max-requests ${MAX_REQUESTS:-1000} \
    --max-requests-jitter ${MAX_REQUESTS_JITTER:-100} \
    --preload \
    --timeout 120 \
    --keep-alive ${KEEP_ALIVE:-2} \
    --log-level info \
    --log-file /app/logs/gunicorn.log \
    --access-logfile /app/logs/access.log \
    --error-logfile /app/logs/error.log \
    --capture-output \
    --enable-stdio-inheritance