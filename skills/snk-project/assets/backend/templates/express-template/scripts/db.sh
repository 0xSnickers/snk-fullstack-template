#!/usr/bin/env bash
# 数据库：./scripts/db.sh up|down|migrate|reset
set -euo pipefail
cd "$(dirname "$0")/.."

case "${1:-up}" in
  up)
    docker compose up -d --wait postgres
    npx prisma migrate deploy
    ;;
  down) docker compose down ;;
  migrate) npx prisma migrate dev ${2:+--name "$2"} ;;
  reset) npx prisma migrate reset --force ;;
  *) echo "usage: $0 up|down|migrate [name]|reset" >&2; exit 1 ;;
esac
