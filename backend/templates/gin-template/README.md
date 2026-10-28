# gin-template

Gin + GORM 的 Go API 模板，适合高并发 API、微服务和单二进制部署。

**技术栈**：Go 1.23 · Gin 1.10 · GORM（PostgreSQL）· golang-jwt v5 · x/crypto/bcrypt · log/slog · go test + httptest

> 接口契约见 `docs/API_CONTRACT.md`（模板仓库根目录；用 `npm run create` 生成的项目已复制到本项目 `docs/` 下）。分层、开发约定、测试规范见仓库 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`。

## 快速开始

```bash
./scripts/setup.sh        # 复制 .env、安装依赖
./scripts/db.sh up        # 启动 PostgreSQL
./scripts/dev.sh          # http://localhost:9000/api/health
./scripts/test.sh         # gofmt + go vet + go test（内存仓储，不需要数据库）
```

演示账号：`demo@example.com` / `password123`（admin，`SEED_DEMO_USER=true` 时自动创建）。前端模板默认代理到 `http://localhost:9000/api/v1`，直接启动前端即可联调。

## 脚本

| 脚本 | 说明 |
|---|---|
| `setup.sh` | 首次安装：复制 `.env`、安装依赖 |
| `db.sh up` / `db.sh down` | 启停本地 PostgreSQL（`docker-compose.yml`） |
| `dev.sh` | 本地开发运行，日志同时写入 `logs/app.log` |
| `test.sh` | gofmt + go vet + go test（内存仓储，不需要数据库） |
| `build.sh` | 编译静态二进制到 `bin/server` |

## 目录结构

```text
cmd/server/main.go          # 读取配置 → 日志 → 数据库 → 手动组装依赖 → 启动 / 优雅退出
internal/
├── config/                 # 环境变量 → Config（启动时校验）
├── logger/                 # slog JSON：stdout + logs/app.log
├── database/               # GORM 连接、就绪探测
├── httpx/                  # 统一响应 / 错误、中间件、绑定与校验、错误文案（中英）
├── health/                 # /api/health、/api/ready
├── token/                  # JWT + refresh token 管理、Authenticate / RequireRole 中间件
├── user/                   # model · dto · repository · service · handler · seed
├── auth/                   # dto · service · handler（/api/v1/auth/*）
└── router/                 # 路由装配 + 接口测试（内存仓储）
```

## 鉴权与错误

```go
func (h *Handler) Register(rg *gin.RouterGroup) {
	rg.Use(token.Authenticate(h.tokens))                      // 需要登录
	rg.POST("", token.RequireRole(user.RoleAdmin), h.create)  // 需要 admin
}

claims := token.ClaimsFrom(c)                                // {UserID, Role}
_ = c.Error(httpx.NotFound("ORDER_NOT_FOUND", "Order not found")); return
```

处理函数出错时 `_ = c.Error(err)` 后返回（或 `httpx.Respond(c, status, data, err)`），`httpx.ErrorHandler` 统一输出；`*httpx.Error` 按其 Status / Code 输出，其他错误一律 500。

首次使用先执行 `./scripts/setup.sh`（会 `go mod tidy` 生成 `go.sum`）。默认 `DB_AUTO_MIGRATE=true` 用 GORM AutoMigrate 建表，正式项目建议换成 golang-migrate / atlas。

## 新增业务模块

以 `users` 为参照复制一份，挂到 `/api/v1/<资源>`，补测试。各模板的对照写法见 `docs/CONVENTIONS.md`。
