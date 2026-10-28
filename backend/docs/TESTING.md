# 测试

## 两层测试

| 层 | 在哪 | 需要数据库 | 作用 |
|---|---|---|---|
| 模板自带测试 | 各模板 `scripts/test.sh` | 否 | 覆盖每个端点的成功 / 失败路径 |
| 契约测试 | 根目录 `scripts/contract-test.mjs` | 视被测服务而定 | 对**正在运行**的服务逐条验证 [API_CONTRACT.md](API_CONTRACT.md) |

模板自带测试都不需要 PostgreSQL：

| 模板 | 框架 | 持久化替身 |
|---|---|---|
| Express | Vitest + supertest | `vi.mock` 替换仓储为内存实现（`tests/support/memory.ts`） |
| NestJS | Jest + supertest | `overrideProvider` 替换仓储为内存实现（`test/support/memory.ts`） |
| Django | pytest-django | 内存 sqlite（`config/test_settings.py`） |
| Gin | `go test` + httptest | 内存仓储实现接口（`internal/router/memory_test.go`） |
| Spring Boot | JUnit 5 + MockMvc | H2（PostgreSQL 模式）+ Flyway 迁移 |

## 契约测试

任意模板启动后（需开启 `SEED_DEMO_USER`）：

```bash
npm run contract                                  # 默认 http://localhost:9000
BASE_URL=http://localhost:9100 npm run contract
```

覆盖 24 项：运维接口、404、校验错误、非法 JSON、错误文案多语言、注册 / 登录 / me / refresh / session / logout、Cookie 属性、401 / 403、分页默认值、admin CRUD、409、吊销后 refresh 失败。

改了接口行为时，先改 `API_CONTRACT.md` 和 `contract-test.mjs`，再改 5 个模板，最后对每个模板跑一遍契约测试。

## 写测试的约定

- 断言 HTTP 状态码 **和** `code` 错误码，不只断言其一。
- 每个业务错误码至少一个用例；鉴权接口覆盖 401 / 403。
- 测试之间不共享状态：每个用例或每个文件重建内存数据（Spring Boot 用不同邮箱隔离）。
- 不在测试里连接真实外部服务；需要集成测试时单独建目录并在 CI 中准备数据库。
