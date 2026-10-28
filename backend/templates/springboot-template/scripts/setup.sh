#!/usr/bin/env bash
# 首次安装：复制 .env、下载依赖（需要 JDK 21+；没有 Maven 时自动下载）
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { cp .env.example .env; echo "created .env from .env.example"; }
./scripts/mvn.sh -q -B dependency:resolve
