# flutter-template

Flutter 跨端模板（Android / iOS / Web），与 React / Vue / Next.js / uni-app / React Native 模板共享同一套接口约定、鉴权流程、语言包和设计 Token。

## 技术栈

| 类别            | 选型                                                               |
| --------------- | ------------------------------------------------------------------ |
| 框架            | Flutter ≥ 3.32 · Dart ≥ 3.8 · Material 3                           |
| 状态 / 依赖注入 | flutter_riverpod 2                                                 |
| 路由            | go_router（统一的 redirect 鉴权守卫）                              |
| 请求            | dio（`lib/core/http/api_client.dart` 封装）                        |
| 存储            | flutter_secure_storage（refreshToken）· shared_preferences（偏好） |
| 国际化          | flutter_localizations + gen-l10n（ARB 由 core 语言包生成）         |
| 测试            | flutter_test                                                       |

## 快速开始

```bash
# 1. 首次使用：生成 android/ ios/ web/ 平台工程，并配置本地联调网络权限
./tool/setup_platforms.sh com.yourcompany

# 2. 环境配置
cp env/dev.example.json env/dev.json

# 3. 启动（另开终端在模板仓库根目录运行 npm run mock 可启动 Mock 后端）
flutter run --dart-define-from-file=env/dev.json             # 默认设备
flutter run -d chrome --dart-define-from-file=env/dev.json   # H5（Web）
```

> 模板只维护 `lib/`、`test/` 等跨平台代码，`android/`、`ios/`、`web/` 由 `flutter create` 生成，避免模板里堆积随 Flutter 版本变化的原生文件。生成后提交到你的项目仓库即可。

**Mock 账号**：`demo@example.com` / `password123`。Android 模拟器把 `API_BASE_URL` 改为 `http://10.0.2.2:9000/api/v1`，真机改为电脑的局域网 IP。

## 常用命令

| 命令                                                      | 说明                                             |
| --------------------------------------------------------- | ------------------------------------------------ |
| `flutter run --dart-define-from-file=env/dev.json`        | 运行                                             |
| `flutter build apk --dart-define-from-file=env/prod.json` | Android 安装包                                   |
| `flutter build ipa --dart-define-from-file=env/prod.json` | iOS 安装包                                       |
| `flutter build web --dart-define-from-file=env/prod.json` | H5                                               |
| `flutter analyze`                                         | 静态检查                                         |
| `dart format .`                                           | 格式化（行宽 100，见 analysis_options.yaml）     |
| `flutter test`                                            | 单元测试 / Widget 测试                           |
| `flutter gen-l10n`                                        | 重新生成多语言代码（`flutter run` 时会自动执行） |

## 目录结构

```text
lib/
├── main.dart                         # 入口：SharedPreferences、错误上报、ProviderScope
├── app/
│   ├── app.dart                      # MaterialApp.router：主题、语言、深浅色
│   ├── router.dart                   # 路由表 + 鉴权守卫（protectedPaths / guestPaths）
│   └── providers.dart                # 应用级依赖：ApiClient、TokenStore、存储、遥测
├── core/                             # 与业务无关的基础层（对应 Web 模板的 src/core）
│   ├── config/env.dart               # 环境变量唯一入口（--dart-define）
│   ├── http/                         # ApiClient（拦截器、业务码、401 刷新去重）、ApiException、PageResult
│   ├── auth/                         # TokenStore、安全存储、User / AuthSession、表单校验规则
│   ├── theme/app_theme.dart          # 由设计 Token + 品牌色生成 ThemeData，context.colors
│   ├── telemetry/                    # 遥测接口 + 空实现
│   ├── utils/
│   └── generated/design_tokens.g.dart  # 由模板仓库 npm run sync:core 生成，勿手改
├── l10n/                             # app_zh.arb / app_en.arb 由 core 语言包生成，勿手改
├── features/                         # 业务模块：data（接口）/ application（状态）/ presentation（页面、组件）
│   ├── auth/
│   ├── users/
│   ├── home/ · profile/ · not_found/
└── shared/
    ├── preferences/                  # 语言 / 主题 / 深浅色偏好
    └── widgets/                      # AppButton、AppTextField、AppCard、PageScaffold、AppControls
test/                                 # 与 lib/ 目录对应
env/                                  # dev.example.json（复制为 dev.json / prod.json，不提交）
tool/setup_platforms.sh               # 生成平台工程
```

## 与其他模板的对应关系

| 能力        | Web / RN / uni-app（TypeScript） | Flutter                                                                        |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------ |
| HTTP 客户端 | `core/http/createHttpClient.ts`  | `core/http/api_client.dart`                                                    |
| 接口错误    | `AppApiError`                    | `ApiException`                                                                 |
| App 端鉴权  | `core/auth/nativeAuth.ts`        | `features/auth/data/auth_api.dart`                                             |
| 登录态      | Zustand / Pinia store            | `AuthController`（Riverpod Notifier）                                          |
| 接口数据    | TanStack Query                   | `FutureProvider` + `ref.invalidate`                                            |
| 语言包      | `core/i18n/messages`             | `lib/l10n/*.arb`（自动生成，key 为驼峰：`home.signedInAs` → `homeSignedInAs`） |
| 设计 Token  | `core/theme/tokens.ts`           | `core/generated/design_tokens.g.dart` + `context.colors`                       |

## 开发约定

- **接口**：只通过 `ApiClient`（`apiClientProvider`）调用，接口类写在 `features/<模块>/data/*_api.dart`；页面里不要直接使用 Dio。
- **状态**：接口数据用 `FutureProvider` / `AsyncNotifierProvider`；跨页面状态用 `Notifier`；只属于单个组件的状态用 `StatefulWidget`。
- **路由**：新页面在 `app/router.dart` 注册；需要登录的路径加入 `protectedPaths`。
- **文案**：用户可见文案通过 `AppLocalizations.of(context)` 读取。在模板仓库中修改 `packages/core` 的语言包后运行 `npm run sync:core`；生成的独立项目直接修改 `lib/l10n/*.arb`（两个文件的 key 保持一致，带占位符的文案在 `app_zh.arb` 中声明 `@key.placeholders`）。
- **样式**：颜色只用 `context.colors.xxx` 和 `Theme.of(context).colorScheme`，间距 / 圆角用 `AppSpacing` / `AppRadius`，不要硬编码。
- **校验规则**：`core/auth/validators.dart` 与 TS 模板的 zod 规则保持一致。

## 接入遥测

`app/providers.dart` 中的 `telemetryProvider` 默认是空实现。接入 Sentry / Firebase 时实现 `Telemetry` 接口并替换该 Provider，业务代码无需改动。
