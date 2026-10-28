#!/usr/bin/env bash
# 类型检查 + Lint + 测试（测试使用内存仓储，不需要数据库）
set -euo pipefail
cd "$(dirname "$0")/.."

npm run typecheck
npm run lint
npm test
