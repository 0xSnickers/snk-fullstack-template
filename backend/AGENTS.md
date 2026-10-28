# AGENTS.md（模板仓库）

本仓库维护 Express / NestJS / Django / Gin / Spring Boot 五个后端模板。修改前先读本文件，再读 `README.md` 和 `docs/`。

## 仓库规则

- **接口契约以 `docs/API_CONTRACT.md` 为唯一真源**。改接口行为（路径、字段、错误码、Cookie、状态码）时，按顺序改：契约文档 → `scripts/contract-test.mjs` → 5 个模板。
- 5 个模板的目录语义、分层、错误码、配置项名称保持一致。在一个模板加通用能力时，评估是否需要同步到其他 4 个。
- 契约同时被 `my-frontend-template`（请求层与 `scripts/mock-server.mjs`）依赖：改动响应结构或鉴权流程前，确认前端是否需要同步。
- `users` / `auth` 是约定的演示业务，修改时保持 5 端行为一致。
- 不随意新增依赖；新增需要说明理由。模板刻意不带缓存、队列、DI 框架（Gin）、Spring Security 等重量级组件。
- 通用规范写在 `docs/`；模板特有内容写在模板的 `README.md` / `AGENTS.md`。
- 遵守 `docs/CONVENTIONS.md` 的代码规模约束：单文件 ≤300 行（TS / Python）/ ≤400 行（Go / Java），单目录 ≤8 个文件。

## 修改后检查

```bash
templates/<name>/scripts/test.sh                   # 改了哪个模板就跑哪个
# 启动该模板后：
npm run contract                                   # 契约测试，必须 24/24 通过
```

无法运行某个命令时（例如本机没有 Go / JDK），在回复中说明原因和未验证的范围。

## 回复要求

- 修改了哪些文件；是否改了契约、是否影响其他模板或前端模板。
- 新增或更新了哪些测试；运行了哪些检查以及结果。
- 未完成项或需要人工确认的风险。
