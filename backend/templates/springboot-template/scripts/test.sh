#!/usr/bin/env bash
# 测试（H2 内存库 + Flyway，不需要 PostgreSQL）
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/mvn.sh -B test
