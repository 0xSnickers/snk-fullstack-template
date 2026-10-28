# django-template

Django 5 + Django REST Framework 的 API 模板，适合 Python 技术栈和数据类服务。依赖用 uv 管理。

**技术栈**：Django 5.2 · DRF 3.16 · PyJWT · django-cors-headers · dj-database-url · gunicorn · pytest-django · ruff · uv

> 接口契约见 `docs/API_CONTRACT.md`（模板仓库根目录；用 `npm run create` 生成的项目已复制到本项目 `docs/` 下）。分层、开发约定、测试规范见仓库 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`。

## 快速开始

```bash
./scripts/setup.sh        # 复制 .env、安装依赖
./scripts/db.sh up        # 启动 PostgreSQL并执行 Django 迁移
./scripts/dev.sh          # http://localhost:9000/api/health
./scripts/test.sh         # ruff + pytest（内存 sqlite，不需要数据库）
```

演示账号：`demo@example.com` / `password123`（admin，`SEED_DEMO_USER=true` 时自动创建）。前端模板默认代理到 `http://localhost:9000/api/v1`，直接启动前端即可联调。

## 脚本

| 脚本 | 说明 |
|---|---|
| `setup.sh` | 首次安装：复制 `.env`、安装依赖 |
| `db.sh up` / `db.sh down` | 启停本地 PostgreSQL（`docker-compose.yml`） |
| `dev.sh` | 本地开发运行，日志同时写入 `logs/app.log` |
| `test.sh` | ruff + pytest（内存 sqlite，不需要数据库） |
| `db.sh makemigrations` | 修改模型后生成迁移 |
| `db.sh migrate` | 执行迁移 |

## 目录结构

```text
config/
├── settings.py        # 全部来自环境变量；DATABASE_URL 缺省回落到 sqlite；日志写 logs/app.log
├── test_settings.py   # pytest 专用（内存 sqlite、快速哈希）
├── urls.py            # /api/、/api/v1/auth/、/api/v1/users、JSON 404 兜底
└── wsgi.py            # 入口；SEED_DEMO_USER 时创建演示账号
apps/
├── core/              # responses · exceptions（统一异常处理）· messages（中英文案）· middleware · views
├── auth/              # models(RefreshToken) · tokens · authentication（Bearer / 权限类）· serializers · views · urls
└── users/             # models · serializers · services · views · urls · seed
tests/                 # conftest + ops / auth / users
```

## 鉴权与错误

```python
class OrderListView(APIView):
    permission_classes = [IsAuthenticated]  # 需要登录，request.user = AccessClaims(user_id, role)


class OrderAdminView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]  # 需要 admin（读写分离用 IsAdminForWrites）


raise AppError.not_found("ORDER_NOT_FOUND", "Order not found")
```

用户模型 `apps.users.User` 独立于 `django.contrib.auth`（模板不启用 Django Admin / Session）；密码用 Django 自带的 PBKDF2 哈希。

## 新增业务模块

以 `users` 为参照复制一份，挂到 `/api/v1/<资源>`，补测试。各模板的对照写法见 `docs/CONVENTIONS.md`。
