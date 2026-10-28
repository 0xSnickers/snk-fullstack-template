#!/usr/bin/env bash
# Lint + 格式检查 + 测试（测试使用内存 sqlite，不需要数据库）
set -euo pipefail
cd "$(dirname "$0")/.."

uv run ruff check .
uv run ruff format --check .
uv run pytest
