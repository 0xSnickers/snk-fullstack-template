# 开发约定

适用于全部 5 个模板。

## 1. 新增一个业务模块（以「订单」为例）

1. **契约先行**：在项目的 `docs/API_CONTRACT.md` 写清路径、权限、请求、响应、错误码。
2. **数据表**：加模型并生成迁移（Prisma / Django migrations / Flyway SQL / GORM 模型加入 AutoMigrate）。
3. **按 `users` 模块复制一份**，保持同样的文件划分：

| 模板 | 目录 | 文件 |
|---|---|---|
| Express | `src/modules/orders/` | `order.schema.ts` · `order.repository.ts` · `order.service.ts` · `order.routes.ts` |
| NestJS | `src/modules/orders/` | `order.dto.ts` · `orders.repository.ts` · `orders.service.ts` · `orders.controller.ts` · `orders.module.ts` |
| Django | `apps/orders/` | `models.py` · `serializers.py` · `services.py` · `views.py` · `urls.py` |
| Gin | `internal/order/` | `model.go` · `dto.go` · `repository.go` · `service.go` · `handler.go` |
| Spring Boot | `com.example.app.order` | `Order` · `OrderRepository` · `OrderDtos` · `OrderService` · `OrderController` |

4. **挂载路由**：`/api/v1/orders`，需要登录的加鉴权（见下表）。
5. **补测试**：至少一个成功用例 + 每个业务错误码一个失败用例。

| 模板 | 需要登录 | 需要角色 |
|---|---|---|
| Express | `router.use(authenticate)` | `requireRole('admin')` |
| NestJS | `@UseGuards(AuthGuard)` | `@Roles('admin')` |
| Django | `permission_classes = [IsAuthenticated]` | `IsAdmin` / `IsAdminForWrites` |
| Gin | `rg.Use(token.Authenticate(m))` | `token.RequireRole("admin")` |
| Spring Boot | `@RequireAuth` | `@RequireAuth(roles = "admin")` |

当前用户：Express `req.auth`、NestJS `@CurrentUser()`、Django `request.user`、Gin `token.ClaimsFrom(c)`、Spring `@RequestAttribute(AuthClaims.ATTRIBUTE)`。

## 2. 分层职责

| 层 | 做 | 不做 |
|---|---|---|
| 路由 / 控制器 | 解析与校验输入、调用 service、返回 `ok(data)` | 写业务规则、直接访问数据库 |
| Service | 业务规则、跨仓储协作、抛业务异常 | 读写 HTTP 请求 / 响应对象 |
| Repository | 查询与持久化；默认只选公开字段 | 业务判断 |

## 3. 响应与错误

- 成功只通过模板提供的工具返回（`ok()` / `ApiResponse.ok()` / `httpx.OK` / NestJS 直接 `return`）。
- 业务错误抛模板的业务异常，错误码大写下划线：`<RESOURCE>_NOT_FOUND`、`<FIELD>_EXISTS`、`<ACTION>_NOT_ALLOWED`。
- 不要在业务代码里拼错误 JSON，也不要把异常信息、SQL、堆栈返回给前端。
- 新增错误码时同步更新 `API_CONTRACT.md` 的错误码表。

## 4. 输入校验

- 所有外部输入（body / query / path）都要校验；邮箱 trim + 小写，名称 trim。
- 路径中的 ID 先校验 UUID 格式，非法返回 400 而不是 404 / 500。
- 分页统一 `page`（≥1，默认 1）、`limit`（1~100，默认 10）。

## 5. 配置

- 只从环境变量读取；新增配置项同时改 `.env.example` 和启动时的配置校验。
- 密钥类配置不允许有生产可用的默认值。

## 6. 数据库

- 表名复数 snake_case，主键 `id uuid`，时间字段 `created_at` / `updated_at`（带时区）。
- 结构变更必须通过迁移；已发布的迁移不修改，只追加。
- Gin 模板的 AutoMigrate 只适合起步，进入正式开发后建议换成 golang-migrate / atlas。

## 7. Run & Debug

一律使用模板 `scripts/` 下的脚本，不直接敲包管理器命令：

| 脚本 | 作用 |
|---|---|
| `setup.sh` | 复制 `.env`、安装依赖 |
| `db.sh up\|down` | 启停 PostgreSQL（并执行迁移） |
| `dev.sh` | 本地开发运行，日志写 `logs/` |
| `test.sh` | lint + 类型检查 + 测试 |
| `build.sh` | 构建产物（Django 无需构建） |

## 8. 代码规模

- 动态语言（TS / Python）单文件尽量不超过 300 行，静态语言（Go / Java）不超过 400 行。
- 每个目录的文件尽量不超过 8 个，超过就拆子目录。
- 不引入未被需要的依赖和抽象：模板刻意不带缓存、队列、DI 框架（Gin）、Spring Security 全家桶等。
