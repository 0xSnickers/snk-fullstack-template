#!/usr/bin/env bash
# 编译静态二进制到 bin/server
set -euo pipefail
cd "$(dirname "$0")/.."

CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/server ./cmd/server
echo "built bin/server"
