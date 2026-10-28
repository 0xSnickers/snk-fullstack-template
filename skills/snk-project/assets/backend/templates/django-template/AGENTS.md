# AGENTS.md — django-template

修改前先读本文件和本目录 `README.md`；接口行为以 `docs/API_CONTRACT.md` 为准。

## 本模板

- 依赖管理、运行、测试一律通过 uv（`uv add` / `uv run`），虚拟环境目录固定为 `.venv`；Run & Debug 使用 `scripts/*.sh`。
- 每个业务一个 app：`apps/<name>`，`AppConfig.name = "apps.<name>"`。
- 视图保持很薄：Serializer 校验输入、`services.py` 写业务、视图用 `apps.core.responses.ok()` 返回。
- 业务错误抛 `apps.core.exceptions.AppError`；新错误码在 `apps/core/messages.py` 补中英文。
- 输出字段 camelCase（Serializer 里 `source=` 映射），模型字段 snake_case。
- 数据结构尽量强类型（Serializer / dataclass）；需要使用无结构 dict 时先说明理由。
- 改模型后 `./scripts/db.sh makemigrations` 并提交迁移文件。

## 通用约束（5 个模板一致）

- 对外行为以 `docs/API_CONTRACT.md` 为准：成功 `{ code: 0, message, data }`，失败 `{ code: "ERROR_CODE", message, data: null, details? }`；不要新增其他响应形态。改契约前先确认前端模板（`my-frontend-template`）是否需要同步。
- 分层：路由 / 控制器只做输入校验与响应，业务规则放 service，数据访问放 repository；依赖只能自上而下，不允许循环依赖。
- 业务错误用模板的业务异常抛出，错误码大写下划线（如 `ORDER_NOT_FOUND`），并在错误文案表补中英文。
- 配置只从环境变量读取；新增配置项同步更新 `.env.example` 和启动时的配置校验。
- 改数据库结构必须提交迁移，已发布的迁移不修改。
- 每个新接口至少一个成功用例 + 每个业务错误码一个失败用例。
- Run & Debug 一律使用 `scripts/*.sh`；脚本失败先修脚本。日志写 `logs/`。
- 单文件 ≤300 行（TS / Python）/ ≤400 行（Go / Java），单目录 ≤8 个文件。
- 不引入未被需要的大型依赖（缓存、队列、DI 框架等），需要时先说明理由。
- `users` / `auth` 是约定的演示业务；作为新项目落地后，可以保留鉴权、替换或删除用户管理示例。

## 修改后检查

```bash
./scripts/test.sh
```

启动服务后，在模板仓库根目录运行 `npm run contract` 做契约测试。无法运行时在回复中说明原因。
