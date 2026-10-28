# express-template

Express 5 + TypeScript + Prisma 的轻量 API 模板，适合 CRUD 服务、BFF、Webhook、内部工具。

**技术栈**：Express 5 · TypeScript（ESM, strict）· Prisma 6 · Zod · jsonwebtoken · bcryptjs · pino · Vitest + supertest

> 接口契约见 `docs/API_CONTRACT.md`（模板仓库根目录；用 `npm run create` 生成的项目已复制到本项目 `docs/` 下）。分层、开发约定、测试规范见仓库 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`。

## 快速开始

```bash
./scripts/setup.sh        # 复制 .env、安装依赖
./scripts/db.sh up        # 启动 PostgreSQL并执行 Prisma 迁移
./scripts/dev.sh          # http://localhost:9000/api/health
./scripts/test.sh         # 类型检查 + ESLint + Vitest（内存仓储，不需要数据库）
```

演示账号：`demo@example.com` / `password123`（admin，`SEED_DEMO_USER=true` 时自动创建）。前端模板默认代理到 `http://localhost:9000/api/v1`，直接启动前端即可联调。

## 脚本

| 脚本                      | 说明                                                 |
| ------------------------- | ---------------------------------------------------- |
| `setup.sh`                | 首次安装：复制 `.env`、安装依赖                      |
| `db.sh up` / `db.sh down` | 启停本地 PostgreSQL（`docker-compose.yml`）          |
| `dev.sh`                  | 本地开发运行，日志同时写入 `logs/app.log`            |
| `test.sh`                 | 类型检查 + ESLint + Vitest（内存仓储，不需要数据库） |
| `db.sh migrate <name>`    | 修改 `prisma/schema.prisma` 后生成迁移               |
| `db.sh reset`             | 重置数据库                                           |
| `build.sh`                | 编译到 `dist/`                                       |

## 目录结构

```text
src/
├── main.ts                    # 启动、种子账号、优雅退出
├── app.ts                     # createApp()：中间件装配（测试直接复用）
├── routes.ts                  # /api/health、/api/ready + 挂载模块路由
├── config/env.ts              # Zod 校验环境变量，非法立即退出
├── lib/                       # logger（stdout + logs/app.log）、prisma、password
├── middleware/                # requestId、auth（authenticate / requireRole）、errorHandler
├── utils/                     # AppError、ok / fail / pageResult、错误文案（中英）
└── modules/
    ├── auth/                  # schema · routes · service · token.service · refreshToken.repository
    └── users/                 # schema · routes · service · repository · seed
tests/                         # ops / auth / users + support（内存仓储）
prisma/                        # schema.prisma + migrations
```

## 鉴权与错误

```ts
userRoutes.use(authenticate); // 需要登录，req.auth = { userId, role }
userRoutes.post('/', requireRole('admin'), handler); // 需要 admin
throw AppError.notFound('ORDER_NOT_FOUND', 'Order not found');
```

## 新增业务模块

以 `users` 为参照复制一份，挂到 `/api/v1/<资源>`，补测试。各模板的对照写法见 `docs/CONVENTIONS.md`。
