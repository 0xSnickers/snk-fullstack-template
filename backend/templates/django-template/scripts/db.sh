#!/usr/bin/env bash
# 数据库：./scripts/db.sh up|down|migrate|makemigrations
set -euo pipefail
cd "$(dirname "$0")/.."

case "${1:-up}" in
  up)
    docker compose up -d --wait postgres
    uv run python manage.py migrate
    ;;
  down) docker compose down ;;
  migrate) uv run python manage.py migrate ;;
  makemigrations) uv run python manage.py makemigrations ;;
  *) echo "usage: $0 up|down|migrate|makemigrations" >&2; exit 1 ;;
esac
