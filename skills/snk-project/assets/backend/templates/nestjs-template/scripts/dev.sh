#!/usr/bin/env bash
# 本地开发（nest start --watch）。日志同时写入 logs/app.log
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo ".env not found, run ./scripts/setup.sh first" >&2; exit 1; }
exec npm run dev
