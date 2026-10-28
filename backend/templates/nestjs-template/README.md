# nestjs-template

NestJS 11 + Prisma 的模块化 API 模板，适合模块较多、需要依赖注入和长期维护的服务。

**技术栈**：NestJS 11 · Prisma 6 · class-validator · @nestjs/jwt · bcryptjs · Jest + supertest

> 接口契约见 `docs/API_CONTRACT.md`（模板仓库根目录；用 `npm run create` 生成的项目已复制到本项目 `docs/` 下）。分层、开发约定、测试规范见仓库 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`。

## 快速开始

```bash
./scripts/setup.sh        # 复制 .env、安装依赖
./scripts/db.sh up        # 启动 PostgreSQL并执行 Prisma 迁移
./scripts/dev.sh          # http://localhost:9000/api/health
./scripts/test.sh         # 类型检查 + ESLint + Jest e2e（内存仓储，不需要数据库）
```

演示账号：`demo@example.com` / `password123`（admin，`SEED_DEMO_USER=true` 时自动创建）。前端模板默认代理到 `http://localhost:9000/api/v1`，直接启动前端即可联调。

## 脚本

| 脚本                      | 说明                                                   |
| ------------------------- | ------------------------------------------------------ |
| `setup.sh`                | 首次安装：复制 `.env`、安装依赖                        |
| `db.sh up` / `db.sh down` | 启停本地 PostgreSQL（`docker-compose.yml`）            |
| `dev.sh`                  | 本地开发运行，日志同时写入 `logs/app.log`              |
| `test.sh`                 | 类型检查 + ESLint + Jest e2e（内存仓储，不需要数据库） |
| `db.sh migrate <name>`    | 修改 `prisma/schema.prisma` 后生成迁移                 |
| `db.sh reset`             | 重置数据库                                             |
| `build.sh`                | 编译到 `dist/`                                         |

## 目录结构

```text
src/
├── main.ts                        # 文件日志、helmet、CORS、启动
├── app.module.ts                  # Config（校验）· Prisma · Auth · Users · RequestId 中间件
├── config/env.ts                  # 环境变量校验
├── prisma/                        # 全局 PrismaService
├── health/health.controller.ts    # /api/health、/api/ready
├── common/
│   ├── setup-app.ts               # 全局前缀 / cookie-parser / 管道 / 过滤器 / 拦截器（main 与测试共用）
│   ├── file-logger.ts             # 控制台 + logs/app.log
│   ├── page.ts                    # PageQueryDto、pageResult
│   └── http/                      # AppException、异常过滤器、响应拦截器、RequestId、管道、错误文案
└── modules/
    ├── auth/                      # controller · service · dto · token.module/service · auth.guard · refresh-token.repository
    └── users/                     # controller · service · repository · dto · demo-user.seeder · module
test/                              # e2e + support（内存仓储）
```

## 鉴权与错误

```ts
@Controller('v1/orders')
@UseGuards(AuthGuard)                  // 需要登录
export class OrdersController {
  @Post() @Roles('admin')              // 需要 admin
  create(@CurrentUser() auth: AccessClaims, @Body() dto: CreateOrderDto) { ... }
}
```

控制器直接 `return` 数据，`TransformInterceptor` 包装成 `{ code: 0, data }`；业务错误抛 `AppException`。`TokenModule` 不依赖 `UsersModule`，业务模块只需 `imports: [TokenModule]` 即可使用 `AuthGuard`。

## 新增业务模块

以 `users` 为参照复制一份，挂到 `/api/v1/<资源>`，补测试。各模板的对照写法见 `docs/CONVENTIONS.md`。
