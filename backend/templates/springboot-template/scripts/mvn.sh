#!/usr/bin/env bash
# 运行 Maven：优先用本机 mvn；没有时自动下载 Maven 到 ~/.m2/wrapper（只需 JDK 21+）
set -euo pipefail
cd "$(dirname "$0")/.."

MAVEN_VERSION=3.9.9
if command -v mvn >/dev/null 2>&1; then
  exec mvn "$@"
fi

MAVEN_HOME="$HOME/.m2/wrapper/apache-maven-$MAVEN_VERSION"
if [ ! -x "$MAVEN_HOME/bin/mvn" ]; then
  echo "mvn not found, downloading Maven $MAVEN_VERSION to $MAVEN_HOME ..." >&2
  mkdir -p "$HOME/.m2/wrapper"
  curl -fsSL "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.tar.gz" \
    | tar -xz -C "$HOME/.m2/wrapper"
fi
exec "$MAVEN_HOME/bin/mvn" "$@"
