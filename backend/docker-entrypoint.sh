#!/bin/sh
set -e

npx prisma migrate deploy
node dist/infrastructure/seed/seed.js
exec node dist/main.js
