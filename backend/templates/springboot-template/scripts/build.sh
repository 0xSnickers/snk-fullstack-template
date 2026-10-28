#!/usr/bin/env bash
# 打包可执行 jar 到 target/
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/mvn.sh -q -B package -DskipTests
ls target/*.jar
