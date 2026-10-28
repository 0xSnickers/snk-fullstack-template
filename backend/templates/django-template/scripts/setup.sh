#!/usr/bin/env bash
# 首次安装：复制 .env、用 uv 创建 .venv 并安装依赖
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { cp .env.example .env; echo "created .env from .env.example"; }
uv sync
