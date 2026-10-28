#!/usr/bin/env bash
# 格式检查 + vet + 测试（测试使用内存仓储，不需要数据库）
set -euo pipefail
cd "$(dirname "$0")/.."

unformatted="$(gofmt -l .)"
[ -z "$unformatted" ] || { echo "gofmt needed:"; echo "$unformatted"; exit 1; }
go vet ./...
go test ./...
