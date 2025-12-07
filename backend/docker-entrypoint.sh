#!/bin/sh
set -e

echo "Creating uploads directories..."
mkdir -p /app/uploads/avatars /app/uploads/images /app/uploads/files
chown -R node:node /app/uploads
chmod -R 755 /app/uploads

echo "Waiting for database to be ready..."
sleep 15

echo "Starting application..."
exec su-exec node node dist/src/main.js


