#!/usr/bin/env bash
# 首次安装：复制 .env、安装依赖（postinstall 会执行 prisma generate）
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { cp .env.example .env; echo "created .env from .env.example"; }
npm install
