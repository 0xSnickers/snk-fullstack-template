#!/usr/bin/env bash
# 首次安装：复制 .env、拉取依赖并生成 go.sum
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { cp .env.example .env; echo "created .env from .env.example"; }
go mod tidy
