#!/usr/bin/env bash
# 编译到 dist/
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
