# Backend Templates

Express / NestJS / Django / Gin / Spring Boot 后端通用项目模板。5 个模板实现**同一份接口契约**（统一响应、错误码、JWT + HttpOnly Cookie 鉴权、用户 CRUD），并且与 `my-frontend-template` 的请求层和 Mock 完全一致——前端把 Mock 换成任意一个后端即可直接跑通。

模板刻意保持精简：只放每个项目都需要的骨架，不预设缓存、队列、文件上传、第三方登录等能力，需要时按项目加。

## 模板选择

| 模板 | 技术栈 | 适用场景 |
|---|---|---|
| [`express-template`](templates/express-template) | Express 5 · TypeScript · Prisma · Zod · pino | 轻量 API、BFF、Webhook、内部工具 |
| [`nestjs-template`](templates/nestjs-template) | NestJS 11 · Prisma · class-validator · @nestjs/jwt | 模块多、需要依赖注入、长期维护的服务 |
| [`django-template`](templates/django-template) | Django 5 · DRF · PyJWT · uv | Python 技术栈、数据类服务 |
| [`gin-template`](templates/gin-template) | Gin · GORM · golang-jwt · slog | 高并发 API、微服务、单二进制部署 |
| [`springboot-template`](templates/springboot-template) | Spring Boot 3.4 · JPA · Flyway · jjwt（Java 21） | Java 技术栈的企业服务 |

共同基础：PostgreSQL 16 · 默认端口 9000 · `/api/v1` · `X-Request-ID` · 日志写 `logs/app.log` · Docker 镜像 · `scripts/*.sh` 统一启停。

## 快速开始

```bash
# 1. 生成一个独立的新项目（不依赖本仓库）
npm run create -- express ../my-api            # 或 nestjs / django / gin / springboot
cd ../my-api

# 2. 安装、起数据库、运行
./scripts/setup.sh                             # 复制 .env + 安装依赖
./scripts/db.sh up                             # 启动 PostgreSQL（并执行迁移）
./scripts/dev.sh                               # http://localhost:9000/api/health

# 3. 验证（另开终端，在本仓库根目录）
npm run contract                               # 对运行中的服务跑 24 项契约测试
```

演示账号（`SEED_DEMO_USER=true` 时自动创建）：`demo@example.com` / `password123`，角色 admin。

前端对接：`my-frontend-template` 的 `VITE_API_PROXY_TARGET` / `API_BASE_URL` 默认就是 `http://localhost:9000/api/v1`，不启动 Mock、直接启动任一后端即可。

## 仓库结构

```text
.
├── templates/
│   ├── express-template/
│   ├── nestjs-template/
│   ├── django-template/
│   ├── gin-template/
│   └── springboot-template/
├── scripts/
│   ├── create-app.mjs        # npm run create：复制模板并改名
│   └── contract-test.mjs     # npm run contract：零依赖接口契约测试
└── docs/
    ├── API_CONTRACT.md       # 接口契约（唯一真源）
    ├── ARCHITECTURE.md       # 分层、5 个模板的目录对照、鉴权流程
    ├── CONVENTIONS.md        # 新增模块流程、分层职责、错误码、配置、脚本
    └── TESTING.md            # 测试分层、契约测试
```

## 每个模板都有

```text
scripts/            setup.sh · db.sh · dev.sh · test.sh · build.sh
.env.example        全部配置项（同名变量，含注释）
docker-compose.yml  本地 PostgreSQL
Dockerfile          多阶段构建，默认 9000 端口
README.md           技术栈、命令、目录结构
AGENTS.md           AI Agent / 贡献者约束（CLAUDE.md 引用它）
```

内置能力：

- **统一响应**：成功 `{ code: 0, message, data }`，失败 `{ code: "ERROR_CODE", message, data: null, details? }`
- **鉴权**：JWT accessToken（响应体）+ refresh_token（HttpOnly Cookie，库里只存哈希，可吊销）；`user` / `admin` 角色
- **用户模块**：分页列表、详情，admin 才能增删改；密码 bcrypt / PBKDF2 哈希，永不返回
- **工程**：启动时校验配置、请求日志带 requestId、未处理异常兜底、优雅退出、健康 / 就绪检查

## 维护模板

改接口行为的顺序：`docs/API_CONTRACT.md` → `scripts/contract-test.mjs` → 5 个模板 → 每个模板跑 `scripts/test.sh` 和契约测试。详见 [AGENTS.md](AGENTS.md)。
