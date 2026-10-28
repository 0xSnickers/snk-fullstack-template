#!/usr/bin/env bash
# 一键验证全部模板：临时 PostgreSQL（端口 5433，数据在 .verify/pgdata，结束后删除）
# 每个模板依次执行：安装 → 迁移 → 自带测试 → 构建 → 启动 → 接口契约测试（24 项）。
# 依赖：PostgreSQL 客户端工具（initdb / pg_ctl / createdb）、Node 20+、uv、Go 1.23+、JDK 21+。
#   ./scripts/verify-all.sh                 # 全部
#   ./scripts/verify-all.sh gin springboot  # 只验证指定模板
set -o pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
V="$ROOT/.verify"
mkdir -p "$V"
[ $# -gt 0 ] && TEMPLATES=("$@") || TEMPLATES=(express nestjs django gin springboot)
FAILED=()

step() { echo; echo "===== $1 ====="; }

# serve <name> <command...>: start the app, wait for /api/ready, run the contract test, stop the app.
serve() {
  local name=$1; shift
  ("$@" > "$V/$name.server.log" 2>&1 &)   # subshell: no job-control noise when stopped
  for _ in $(seq 60); do curl -fs http://localhost:9000/api/ready >/dev/null 2>&1 && break; sleep 2; done
  (cd "$ROOT" && node scripts/contract-test.mjs) > "$V/$name.contract.log" 2>&1
  local code=$?
  grep -E "✗|passed," "$V/$name.contract.log"
  lsof -ti tcp:9000 | xargs kill 2>/dev/null; sleep 2
  return $code
}

run_express_like() { # express | nestjs
  cd "$ROOT/templates/$1-template" || return 1
  export DATABASE_URL="postgresql://app@localhost:5433/$1_template?schema=public"
  ./scripts/setup.sh > "$V/$1.setup.log" 2>&1 && npx prisma migrate deploy > /dev/null || return 1
  ./scripts/test.sh > "$V/$1.test.log" 2>&1 || { tail -20 "$V/$1.test.log"; return 1; }
  ./scripts/build.sh > /dev/null 2>&1 && serve "$1" node dist/main.js
}

run_express() { run_express_like express; }
run_nestjs() { run_express_like nestjs; }

run_django() {
  cd "$ROOT/templates/django-template" || return 1
  export DATABASE_URL="postgresql://app@localhost:5433/django_template"
  ./scripts/setup.sh > "$V/django.setup.log" 2>&1 && uv run python manage.py migrate -v0 || return 1
  ./scripts/test.sh > "$V/django.test.log" 2>&1 || { tail -20 "$V/django.test.log"; return 1; }
  serve django uv run gunicorn config.wsgi:application --bind 127.0.0.1:9000 --workers 2
}

run_gin() {
  cd "$ROOT/templates/gin-template" || return 1
  export DATABASE_URL="postgres://app@localhost:5433/gin_template?sslmode=disable"
  ./scripts/setup.sh > "$V/gin.setup.log" 2>&1 || return 1
  ./scripts/test.sh > "$V/gin.test.log" 2>&1 || { tail -20 "$V/gin.test.log"; return 1; }
  ./scripts/build.sh > /dev/null && serve gin ./bin/server
}

run_springboot() {
  cd "$ROOT/templates/springboot-template" || return 1
  export DB_URL="jdbc:postgresql://localhost:5433/springboot_template" DB_USERNAME=app DB_PASSWORD=""
  [ -f .env ] || cp .env.example .env
  ./scripts/test.sh > "$V/springboot.test.log" 2>&1 || { grep -E "Tests run|FAIL|ERROR" "$V/springboot.test.log" | head -20; return 1; }
  ./scripts/build.sh > /dev/null 2>&1 && serve springboot java -jar target/springboot-template-0.1.0.jar
}

step "PostgreSQL (temporary, port 5433)"
rm -rf "$V/pgdata"
initdb -D "$V/pgdata" -U app --auth=trust > "$V/pg.log" 2>&1 \
  && pg_ctl -D "$V/pgdata" -o "-p 5433 -k $V" -l "$V/pg.log" -w start > /dev/null || { echo "cannot start PostgreSQL"; exit 1; }
for t in "${TEMPLATES[@]}"; do createdb -h localhost -p 5433 -U app "${t}_template"; done
export SEED_DEMO_USER=true PORT=9000 LOG_FILE=

for t in "${TEMPLATES[@]}"; do
  step "$t"
  if "run_$t"; then echo "OK"; else echo "FAILED (logs: .verify/$t.*.log)"; FAILED+=("$t"); fi
done

step "cleanup"
pg_ctl -D "$V/pgdata" -m fast stop > /dev/null; rm -rf "$V/pgdata"

echo
if [ ${#FAILED[@]} -eq 0 ]; then echo "ALL PASSED: ${TEMPLATES[*]}"; else echo "FAILED: ${FAILED[*]}"; exit 1; fi
