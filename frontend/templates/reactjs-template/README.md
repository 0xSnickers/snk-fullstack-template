# reactjs-template

React 19 + Vite 8 单页应用模板，适合管理后台、高交互 SPA 和复杂业务系统。

## 技术栈

| 类别        | 选型                                                      |
| ----------- | --------------------------------------------------------- |
| 框架 / 构建 | React 19 · Vite 8 · TypeScript 6（strict）                |
| 路由        | React Router 7（data router，页面懒加载）                 |
| 服务端状态  | TanStack Query 5                                          |
| 客户端状态  | Zustand 5                                                 |
| 请求        | Axios（经 `src/core/http/createHttpClient` 封装）         |
| UI          | Tailwind CSS v4 · shadcn/ui · Radix UI · lucide-react     |
| 国际化      | react-i18next（`zh-CN` / `en-US`）                        |
| 校验        | zod                                                       |
| 测试        | Vitest · React Testing Library · jsdom                    |
| 遥测        | snk-telemetry-reactjs（Sentry + PostHog，可选、按需加载） |

## 快速开始

```bash
npm install
cp .env.example .env
npm run mock   # 可选：本地 Mock 后端（在模板仓库根目录或生成的项目中运行）
npm run dev    # http://localhost:5173
```

浏览器请求同源 `/api/*`，开发环境由 Vite 代理到 `VITE_API_PROXY_TARGET`（默认 `http://localhost:9000/api/v1`）。

## 常用命令

| 命令                              | 说明                            |
| --------------------------------- | ------------------------------- |
| `npm run dev`                     | 开发服务器                      |
| `npm run build`                   | 类型检查 + 生产构建             |
| `npm run preview`                 | 预览构建产物                    |
| `npm run lint` / `lint:fix`       | ESLint                          |
| `npm run format` / `format:check` | Prettier                        |
| `npm run typecheck`               | TypeScript 检查                 |
| `npm run test` / `test:watch`     | 单元测试                        |
| `npm run check`                   | lint + typecheck + test + build |

## 目录结构

```text
src/
├── main.tsx                    # 入口：bootstrap() + AppProviders + RouterProvider
├── app/
│   ├── AppProviders.tsx        # 应用级 Provider：偏好 → 错误边界 → QueryClient
│   ├── bootstrap.ts            # 注册鉴权拦截、初始化遥测、恢复会话
│   └── router.tsx              # 路由表（公开 / 仅游客 / 需要登录）
├── core/                       # 框架无关基础层（由模板仓库同步）
├── config/env.ts               # 环境变量唯一入口
├── services/
│   ├── http.ts                 # 唯一 HTTP 客户端 + tokenStore
│   ├── queryClient.ts          # TanStack Query 默认配置
│   └── telemetry.ts            # 唯一遥测入口
├── i18n/                       # i18next 初始化 + 项目文案
├── providers/                  # 应用级偏好（语言、主题、深浅色）
├── features/
│   ├── auth/                   # 登录注册、会话、RequireAuth / GuestOnly
│   └── users/                  # 受保护接口示例（Query Key 工厂）
├── components/
│   ├── ui/                     # shadcn/ui：button、input、form-field、dialog
│   ├── layout/                 # MainLayout、AppControls、RouteTracker
│   └── error/                  # ErrorBoundary、RouteErrorPage
├── pages/                      # 页面（只做组合）
├── hooks/                      # 通用 hook（useDocumentTitle）
├── styles/globals.css
└── test/                       # setupTests、renderWithProviders
```

## 环境变量

| 变量                                      | 说明                                              | 默认                           |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------ |
| `VITE_APP_NAME`                           | 应用名称                                          | `React App`                    |
| `VITE_APP_ENV`                            | `development` / `test` / `staging` / `production` | `development`                  |
| `VITE_APP_RELEASE`                        | 版本号（Sentry release）                          | —                              |
| `VITE_API_BASE_URL`                       | 浏览器请求前缀；也可以是完整地址                  | `/api`                         |
| `VITE_API_PROXY_TARGET`                   | 开发代理目标（仅 `npm run dev`）                  | `http://localhost:9000/api/v1` |
| `VITE_TELEMETRY_ENABLED`                  | 是否启用遥测                                      | `false`                        |
| `VITE_SENTRY_DSN` / `VITE_POSTHOG_KEY` 等 | 遥测配置                                          | —                              |

## 开发指南

- 新增业务模块、接口、状态、组件：见 `docs/CONVENTIONS.md`。
- 新增页面：在 `src/pages` 新建组件，在 `src/app/router.tsx` 对应分组中注册（需要登录的放进 `RequireAuth` 分组）。
- 架构与流程图：`docs/ARCHITECTURE.md`；测试规范：`docs/TESTING.md`。

> 在模板仓库中，`docs/` 位于仓库根目录；通过 `npm run create` 生成的项目会自带 `docs/`。
