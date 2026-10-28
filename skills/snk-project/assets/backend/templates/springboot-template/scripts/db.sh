#!/usr/bin/env bash
# 数据库：./scripts/db.sh up|down（表结构由启动时 Flyway 迁移创建）
set -euo pipefail
cd "$(dirname "$0")/.."

case "${1:-up}" in
  up) docker compose up -d --wait postgres ;;
  down) docker compose down ;;
  *) echo "usage: $0 up|down" >&2; exit 1 ;;
esac
