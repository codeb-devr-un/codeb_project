#!/bin/sh
set -e

# Load environment variables from .env file if it exists
if [ -f /app/.env ]; then
    echo "Loading environment variables from /app/.env"
    export $(cat /app/.env | grep -v '^#' | xargs)
fi

# Debug: Print DATABASE_URL status (masked for security)
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL is set (length: ${#DATABASE_URL})"
else
    echo "WARNING: DATABASE_URL is not set!"
fi

# Debug: Print REDIS_URL status (masked for security)
if [ -n "$REDIS_URL" ]; then
    echo "REDIS_URL is set (length: ${#REDIS_URL})"
else
    echo "WARNING: REDIS_URL is not set!"
fi

# Run Prisma migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ] && [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running Prisma migrations..."
    npx prisma db push --accept-data-loss || echo "Migration failed or skipped"
fi

# Execute the main command
exec "$@"
