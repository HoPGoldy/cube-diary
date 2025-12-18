#!/bin/sh

set -e

mkdir -p /app/packages/backend/storage
chown -R backenduser:nodejs /app/packages/backend/storage
chmod -R 775 /app/packages/backend/storage

printf "\nRunning database migrations...\n"
gosu backenduser:nodejs pnpm prisma migrate deploy

printf "\nStarting service...\n"
exec gosu backenduser:nodejs node dist/index.js
