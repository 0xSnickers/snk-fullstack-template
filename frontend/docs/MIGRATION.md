# 与旧模板的差异

本仓库由 `frontend/` 下的 `nextjs-template`、`reactjs-template`、`vue3-template`、`react-native-template` 整理而来，并新增了 `uniapp-template`、`flutter-template`。技术栈和主要版本保持不变（React 19 / Vue 3.5 / Next.js 16 / Vite 8 / TypeScript 6 / Tailwind v4），变化集中在结构和一致性上。

## 1. 结构变化

| 旧                                                                | 新                                                      | 原因                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| 三个模板各自维护 `httpClient`、`apiError`、`theme`、`i18n/config` | 抽到 `packages/core`，同步到 `src/core`                 | 同一段逻辑只维护一份；core 带单元测试                 |
| `services/api/*Api.ts` 集中放所有接口                             | `features/<模块>/api/*Api.ts`                           | 按业务模块内聚，删除模块时一起删除                    |
| `store/` `hooks/` 按类型平铺                                      | `features/<模块>/{store,hooks}`                         | 同上                                                  |
| `services/api/httpClient.ts` 直接实例化 axios                     | `services/http.ts` 调用 `createHttpClient()`            | 刷新 Token、错误上报通过注册函数接入，不再互相 import |
| `services/api/authToken.ts`                                       | `services/http.ts` 中的 `tokenStore`                    | 统一入口                                              |
| React `routes/index.tsx` + `BrowserRouter`                        | `app/router.tsx` + `createBrowserRouter`（data router） | 路由级懒加载、`errorElement`                          |
| Vue `components/ui/ErrorBoundary.vue`                             | `components/error/ErrorBoundary.vue`                    | 与 React 目录一致                                     |
| Next `app/api/users/route.ts` 等逐个转发                          | `app/api/[...path]/route.ts` 通用透传                   | 新接口不需要写 Route Handler                          |
| Next 根 `layout.tsx` 写死 `lang=defaultLocale`                    | `[locale]/layout.tsx` 渲染 `<html lang={locale}>`       | lang 跟随 URL                                         |
| 文档在每个模板中重复（GUIDE / TEST / MERMAID）                    | 根目录 `docs/` + 模板 README / AGENTS                   | 通用规范只写一次                                      |

## 2. 统一的约定

| 项            | 旧                                                | 新                                                                              |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| 语言代码      | Next 用 `zh` / `en`，SPA 用 `zh-CN` / `en-US`     | 三端统一 `zh-CN` / `en-US`                                                      |
| 插值语法      | i18next `{{name}}`，vue-i18n / next-intl `{name}` | 统一 `{name}`（i18next 已配置）                                                 |
| 服务端状态    | 仅 React 使用 TanStack Query                      | 三端统一 TanStack Query（Vue 使用 `@tanstack/vue-query`）                       |
| 分页结构      | `PaginatedResponse` 与 `UserListData` 两种        | 统一 `PageResult<T> = { items, pagination }`                                    |
| 基础组件      | Vue 只有简化版 `BaseButton`                       | 三端同一套 Button 变体（cva），Vue 增加 Input / FormField / Dialog              |
| `cn()`        | Vue 版本不合并冲突类                              | 三端统一 `clsx + tailwind-merge`                                                |
| 设计 Token    | React / Next 有完整 Token，Vue 只有两种颜色       | 三端共享 `tokens.css`，新增深色模式                                             |
| 环境变量      | `VITE_API_BASE_URL` 既是代理目标又被改写成 `/api` | `VITE_API_BASE_URL`（浏览器前缀）与 `VITE_API_PROXY_TARGET`（开发代理目标）分开 |
| Tailwind 接入 | Vite 模板用 PostCSS 插件                          | Vite 模板改用 `@tailwindcss/vite`（更快）；Next 继续用 PostCSS                  |
| 路由守卫      | 无                                                | React `RequireAuth` / `GuestOnly`，Vue `meta`，Next 服务端 `requireSession`     |

## 3. 修复的问题

- Vue 模板 `refreshAccessToken` 没有并发去重，多个请求同时 401 会触发多次刷新。现在由 core 统一去重。
- React / Vue 的 ESLint 配置引用了 `@eslint/js`、`globals`，但 `package.json` 没有声明。
- Next.js 模板 `serverApi.ts` 引入了 `server-only`，但没有声明依赖；缺少 `.gitignore`、`.prettierrc`。
- `.env.example` 中 API 端口是 9000，代码默认值却是 3000；现在统一为 9000。
- Next.js `AppShell` 的应用名只读取默认语言文案，切换语言不生效。
- `tsconfig.tsbuildinfo`、`.env` 被放在模板目录中；现在已在 `.gitignore` 中忽略，`create` 时也不会复制。
- 登录后的 `redirect` 参数未校验，存在开放重定向风险；现在统一经过 `getSafeRedirect()`。
- `localStorage` 在隐私模式 / 禁用存储时会抛错导致白屏；现在统一走 `safeStorage`。
- Next.js 后端不可达时 Route Handler 直接抛 500；现在返回标准结构的 502。

## 4. 新增能力

- `npm run create` 一键生成独立项目；`npm run mock` 本地 Mock 后端（含刷新 Token 流程）。
- `npm run check:core` 校验各模板 core 一致性，适合放进 CI。
- 深色模式（浅色 / 深色 / 跟随系统）+ 首屏防闪烁。
- zod 表单校验规则三端共享（`core/auth/types.ts`）。
- 遥测改为可替换代理：未开启时 SDK 不进入首屏包（按需 `import()`）。
- ESLint 禁止业务代码直接 `fetch` / `import axios`。
- 示例页「个人信息」演示受保护路由。

## 5. 移除的内容

- Telemetry 调试页（`/debug`、`/debug/sentry`、`/debug/posthog`）。它们是 SDK 联调工具，不属于通用业务模板；如需保留，建议作为 `features/telemetry-debug` 模块按需加入，并只在开发环境注册路由。
- `react-router-dom`：React Router 7 起统一使用 `react-router` 包。

## 6. 跨端模板

### react-native-template（升级）

| 旧                                                | 新                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Expo SDK 56 · RN 0.85                             | Expo SDK 58 · RN 0.88 · React 19.3（与当时最新稳定版对齐）                              |
| React Navigation 手写 Stack                       | Expo Router 文件路由（`src/app/`），H5 走 react-native-web                              |
| 登录、注册、受保护接口全部写在 `HomeScreen.tsx`   | 拆分为 `features/auth`、`features/users`，页面只做组合                                  |
| `services/api/httpClient.ts` 独立实现             | 复用 core `createHttpClient` + `createNativeAuthClient`                                 |
| 请求状态手写 useState                             | TanStack Query（App 回到前台自动刷新）                                                  |
| 无国际化、无深色模式                              | i18next（core 语言包）+ 品牌主题 + 深浅色                                               |
| Jest + RNTL 13                                    | Jest 30 + RNTL 14（异步 API）                                                           |
| Telemetry 调试页、snk-telemetry-react-native 依赖 | 移除；遥测改为可替换代理（带原生代码的 SDK 需要 development build，不适合放进默认模板） |

### uniapp-template（新增）

基于 DCloud 官方 vite-ts 预设，补齐与其他模板一致的请求层（axios + `uni.request` 适配器）、App 端鉴权、Pinia、Vue Query、vue-i18n、主题 / 深浅色和测试。已验证 H5、App（`build:app`）、微信小程序（`build:mp-weixin`）均可编译。

### flutter-template（新增）

Riverpod + go_router + dio + flutter_secure_storage + gen-l10n。语言包和设计 Token 由 core 生成；平台工程（android / ios / web）由 `tool/setup_platforms.sh` 调用 `flutter create` 生成，并自动配置本地联调所需的网络权限。

### Mock 后端

`scripts/mock-server.mjs` 新增 App 模式（请求体 `clientType: 'native'` 时在响应体返回 refreshToken，刷新时旋转），并开启 CORS，App 的 H5 版本可以直接跨域访问。
