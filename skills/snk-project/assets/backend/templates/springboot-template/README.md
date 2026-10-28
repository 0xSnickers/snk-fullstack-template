# springboot-template

Spring Boot 3.4 + Spring Data JPA + Flyway 的 API 模板（Java 21 / Maven），适合 Java 技术栈的企业服务。

**技术栈**：Spring Boot 3.4 · Spring MVC · Spring Data JPA · Flyway · jjwt 0.12 · spring-security-crypto（BCrypt）· JUnit 5 + MockMvc + H2

> 接口契约见 `docs/API_CONTRACT.md`（模板仓库根目录；用 `npm run create` 生成的项目已复制到本项目 `docs/` 下）。分层、开发约定、测试规范见仓库 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`。

## 快速开始

```bash
./scripts/setup.sh        # 复制 .env、安装依赖
./scripts/db.sh up        # 启动 PostgreSQL（表结构由启动时 Flyway 迁移创建）
./scripts/dev.sh          # http://localhost:9000/api/health
./scripts/test.sh         # MockMvc 测试（H2 + Flyway，不需要 PostgreSQL）
```

演示账号：`demo@example.com` / `password123`（admin，`SEED_DEMO_USER=true` 时自动创建）。前端模板默认代理到 `http://localhost:9000/api/v1`，直接启动前端即可联调。

## 脚本

| 脚本 | 说明 |
|---|---|
| `setup.sh` | 首次安装：复制 `.env`、安装依赖 |
| `db.sh up` / `db.sh down` | 启停本地 PostgreSQL（`docker-compose.yml`） |
| `dev.sh` | 本地开发运行，日志同时写入 `logs/app.log` |
| `test.sh` | MockMvc 测试（H2 + Flyway，不需要 PostgreSQL） |
| `build.sh` | 打包可执行 jar 到 `target/` |
| `mvn.sh <args>` | 运行任意 Maven 命令（自动处理 Maven 安装） |

## 目录结构

```text
src/main/java/com/example/app/
├── Application.java
├── config/          # AppProperties（app.* 配置，启动校验）· WebConfig（CORS、鉴权拦截器）
├── common/          # ApiResponse · PageResult · AppException · GlobalExceptionHandler · Messages（中英）· RequestIdFilter
├── security/        # @RequireAuth · AuthInterceptor · JwtService · AuthClaims
├── health/          # /api/health、/api/ready
├── auth/            # AuthController · AuthService · AuthDtos · RefreshToken(+Repository/Service)
└── user/            # User · UserRepository · UserDtos · UserService · UserController · DemoUserSeeder
src/main/resources/
├── application.yml  # 全部走环境变量，自动读取 .env；日志写 logs/app.log
└── db/migration/V1__init.sql
src/test/            # ApiTest（MockMvc）+ application-test.yml
```

## 鉴权与错误

```java
@RestController
@RequestMapping("/api/v1/orders")
@RequireAuth                                         // 需要登录
public class OrderController {
    @PostMapping
    @RequireAuth(roles = User.ROLE_ADMIN)            // 需要 admin（方法级覆盖类级）
    public ApiResponse<OrderResponse> create(@RequestAttribute(AuthClaims.ATTRIBUTE) AuthClaims auth, ...) { ... }
}

throw AppException.notFound("ORDER_NOT_FOUND", "Order not found");
```

不引入 Spring Security 全家桶：鉴权由一个 `HandlerInterceptor` + `@RequireAuth` 完成，密码只用 `spring-security-crypto` 的 BCrypt。需要本机 JDK 21+；Maven 可选，脚本统一通过 `scripts/mvn.sh` 调用（本机没有 mvn 时自动下载 Maven 3.9.9 到 `~/.m2/wrapper`）。

## 新增业务模块

以 `users` 为参照复制一份，挂到 `/api/v1/<资源>`，补测试。各模板的对照写法见 `docs/CONVENTIONS.md`。
