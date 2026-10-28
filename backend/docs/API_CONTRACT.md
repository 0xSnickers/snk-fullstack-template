# 接口契约

5 个后端模板对外行为完全一致，也与 `my-frontend-template` 的请求层和 `scripts/mock-server.mjs` 一致：前端把 Mock 换成任意一个后端模板即可直接跑通。

改契约时必须同时改 5 个模板、`scripts/contract-test.mjs` 和本文件。

## 1. 基础

| 项 | 约定 |
|---|---|
| 默认端口 | `9000`（与前端 `VITE_API_PROXY_TARGET` / `API_BASE_URL` 默认值一致） |
| 业务接口前缀 | `/api/v1` |
| 运维接口 | `/api/health`、`/api/ready`（不带版本，不需要登录） |
| 请求 / 响应 | JSON，UTF-8；字段名 camelCase |
| 请求 ID | 读取请求头 `X-Request-ID`，没有则生成；原样写回响应头并记录到日志 |
| 语言 | 读取请求头 `Accept-Language`，决定错误 `message` 的语言 |
| CORS | `CORS_ORIGINS` 白名单 + `credentials: true`；允许 `Authorization`、`Content-Type`、`Accept-Language`、`X-Request-ID`，暴露 `X-Request-ID` |
| 时间 | ISO 8601 UTC 字符串 |
| ID | UUID 字符串 |

## 2. 响应结构

成功（HTTP 2xx）：

```json
{ "code": 0, "message": "success", "data": {} }
```

失败（HTTP 4xx / 5xx）：

```json
{ "code": "VALIDATION_ERROR", "message": "Invalid request parameters", "data": null, "details": { "email": ["..."] } }
```

- `code`：成功固定为数字 `0`；失败为大写下划线字符串错误码。前端以 `code === 0` 判断成功。
- `details`：可选，仅校验错误等场景返回，结构为 `{ 字段: [错误描述] }`。
- `message`：可直接展示给用户。按请求头 `Accept-Language` 返回（`zh` 开头 → 简体中文，其余 → 英文），文案见第 3 节；前端请求层会自动带上当前语言。
- 500 错误只返回通用文案，异常细节只写日志。

分页结果（`data` 部分）：

```json
{ "items": [], "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
```

查询参数 `page` 默认 1（≥1），`limit` 默认 10（1~100）。

## 3. 错误码

| HTTP | code | 场景 | zh 文案 | en 文案 |
|---|---|---|---|---|
| 400 | `VALIDATION_ERROR` | 参数、请求体、路径 ID 校验失败；JSON 解析失败 | 请求参数不合法 | Invalid request parameters |
| 401 | `UNAUTHORIZED` | 未携带 / 无效 / 过期的 accessToken；refresh_token 无效 | 未登录或登录已过期 | Authentication required |
| 401 | `INVALID_CREDENTIALS` | 登录邮箱或密码错误 | 邮箱或密码错误 | Invalid email or password |
| 403 | `FORBIDDEN` | 已登录但角色不足 | 没有权限执行该操作 | Permission denied |
| 404 | `NOT_FOUND` | 路由不存在 | 接口不存在 | Resource not found |
| 404 | `USER_NOT_FOUND` | 用户不存在（业务资源统一 `<RESOURCE>_NOT_FOUND`） | 用户不存在 | User not found |
| 405 | `METHOD_NOT_ALLOWED` | 路由存在但方法不支持（部分框架返回 404，均可接受） | 不支持的请求方法 | Method not allowed |
| 409 | `EMAIL_EXISTS` | 邮箱已被占用 | 该邮箱已注册 | Email already in use |
| 503 | `NOT_READY` | 就绪检查失败（数据库不可达） | 服务暂不可用 | Service not ready |
| 500 | `INTERNAL_ERROR` | 未处理异常 | 服务器内部错误 | Internal server error |

新增错误码时，同时在各模板的文案表里加中英文（Express `utils/messages.ts`、NestJS `common/http/messages.ts`、Django `apps/core/messages.py`、Gin `httpx/messages.go`、Spring `common/Messages.java`）。没有登记文案的错误码原样返回抛出时的 message。

## 4. 鉴权

- **accessToken**：JWT（HS256），`sub` 为用户 ID，`role` 为角色；有效期 `ACCESS_TOKEN_TTL` 秒（默认 900）。放在响应体里返回，前端只存内存，请求时带 `Authorization: Bearer <token>`。
- **refresh_token**：随机不透明字符串，数据库只存 SHA-256 哈希；有效期 `REFRESH_TOKEN_TTL` 秒（默认 7 天）。通过 Cookie 下发：
  `refresh_token=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=<ttl>`，`COOKIE_SECURE=true` 时加 `Secure`。
- refresh 不轮换 token（与 Next.js BFF 的 `/auth/session` 兼容），登出时吊销。
- 角色：`user`、`admin`。

| 方法 | 路径 | 鉴权 | 请求 | `data` |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | - | `{ name, email, password }` | `{ user, accessToken }` + Set-Cookie（201） |
| POST | `/api/v1/auth/login` | - | `{ email, password }` | `{ user, accessToken }` + Set-Cookie |
| POST | `/api/v1/auth/refresh` | Cookie | - | `{ user, accessToken }` |
| POST | `/api/v1/auth/session` | Cookie | - | 同 refresh（Next.js BFF 使用） |
| POST | `/api/v1/auth/logout` | Cookie（可选） | - | `{ success: true }` + 清除 Cookie |
| GET | `/api/v1/auth/me` | Bearer | - | `user` |

校验规则：`name` 去首尾空格后 2~50 字符；`email` 去空格并转小写后为合法邮箱；`password` 8~72 字符。

## 5. 用户

```json
{ "id": "uuid", "name": "Demo User", "email": "demo@example.com", "role": "admin", "createdAt": "...", "updatedAt": "..." }
```

永远不返回密码哈希。

| 方法 | 路径 | 鉴权 | 请求 | `data` |
|---|---|---|---|---|
| GET | `/api/v1/users?page=1&limit=10` | Bearer | - | 分页 `user` |
| GET | `/api/v1/users/:id` | Bearer | - | `user` |
| POST | `/api/v1/users` | admin | `{ name, email, password, role? }` | `user`（201） |
| PUT | `/api/v1/users/:id` | admin | `{ name?, email?, role? }` | `user` |
| DELETE | `/api/v1/users/:id` | admin | - | `{ id }` |

列表按 `createdAt` 倒序。

## 6. 运维接口

| 方法 | 路径 | `data` | 说明 |
|---|---|---|---|
| GET | `/api/health` | `{ status: "ok" }` | 存活检查，不访问外部资源 |
| GET | `/api/ready` | `{ status: "ready" }` | 执行 `SELECT 1`，失败返回 503 `NOT_READY` |

## 7. 演示账号

`SEED_DEMO_USER=true`（开发环境默认）时，启动时若不存在则创建：`demo@example.com` / `password123`，角色 `admin`。与前端 Mock 的演示账号一致。生产环境务必关闭。

## 8. 数据表

| 表 | 字段 |
|---|---|
| `users` | `id uuid PK`、`email varchar(255) UNIQUE`、`name varchar(50)`、`password_hash varchar(255)`、`role varchar(20) DEFAULT 'user'`、`created_at`、`updated_at` |
| `refresh_tokens` | `id uuid PK`、`user_id uuid FK → users ON DELETE CASCADE`、`token_hash varchar(64) UNIQUE`、`expires_at`、`created_at` |
