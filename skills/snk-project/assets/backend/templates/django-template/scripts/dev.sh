#!/usr/bin/env bash
# 本地开发（自动重载）。日志同时写入 logs/app.log
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo ".env not found, run ./scripts/setup.sh first" >&2; exit 1; }
PORT="$(grep -E '^PORT=' .env | cut -d= -f2)"
exec uv run python manage.py runserver "0.0.0.0:${PORT:-9000}"
