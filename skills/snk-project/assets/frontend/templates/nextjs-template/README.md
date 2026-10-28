# nextjs-template

Next.js 16（App Router）模板，适合官网、内容站和需要 SEO / SSR 的 Web 应用。浏览器只访问同源 BFF，accessToken 只在服务端出现。

## 技术栈

| 类别       | 选型                                                           |
| ---------- | -------------------------------------------------------------- |
| 框架       | Next.js 16 · React 19 · TypeScript 6（strict）                 |
| 路由       | App Router · `[locale]` 语言前缀 · `proxy.ts`（原 middleware） |
| 服务端状态 | TanStack Query 5（客户端组件）                                 |
| 客户端状态 | Zustand 5（按请求创建 store）                                  |
| 请求       | 浏览器：Axios → `/api/*`；服务端：`src/server/bff.ts` → 后端   |
| UI         | Tailwind CSS v4 · shadcn/ui · Radix UI · lucide-react          |
| 国际化     | next-intl 4（`zh-CN` / `en-US`，类型安全的 key）               |
| 校验       | zod                                                            |
| 测试       | Vitest · React Testing Library · jsdom                         |

## 快速开始

```bash
npm install
cp .env.example .env
npm run mock   # 可选：本地 Mock 后端（在模板仓库根目录或生成的项目中运行）
npm run dev    # http://localhost:3000 → 自动跳转 /zh-CN
```

## 常用命令

| 命令                              | 说明                            |
| --------------------------------- | ------------------------------- |
| `npm run dev`                     | 开发服务器                      |
| `npm run build` / `start`         | 生产构建 / 启动                 |
| `npm run lint` / `lint:fix`       | ESLint（含 Next.js 规则）       |
| `npm run format` / `format:check` | Prettier                        |
| `npm run typecheck`               | TypeScript 检查                 |
| `npm run test` / `test:watch`     | 单元测试                        |
| `npm run check`                   | lint + typecheck + test + build |

## 目录结构

```text
src/
├── proxy.ts                        # next-intl：语言前缀、语言检测
├── app/
│   ├── layout.tsx                  # 根布局（只透传 children）
│   ├── [locale]/
│   │   ├── layout.tsx              # <html lang>、防闪烁脚本、i18n、AppProviders、AppShell
│   │   ├── page.tsx                # 首页（交互部分在 _components/）
│   │   ├── login/ · register/      # 仅游客：服务端 redirectIfAuthenticated
│   │   ├── profile/                # 需要登录：服务端 requireSession
│   │   ├── error.tsx · not-found.tsx · [...rest]/
│   └── api/
│       ├── auth/{login,register,logout,session}/   # 鉴权 BFF（剔除 accessToken）
│       └── [...path]/route.ts      # 通用透传：/api/xxx → API_BASE_URL/xxx
├── core/                           # 框架无关基础层（由模板仓库同步）
├── config/
│   ├── env.ts                      # 公开配置（NEXT_PUBLIC_*）
│   └── env.server.ts               # 服务端配置（server-only）
├── server/bff.ts                   # fetchBackend、toBffResponse、Set-Cookie 透传
├── services/                       # 浏览器 http、queryClient、telemetry
├── i18n/                           # routing、navigation、request、messages、类型增强
├── providers/                      # AppProviders、AppPreferencesProvider（主题 / 深浅色）
├── features/
│   ├── auth/                       # 客户端：表单、store、hooks；server/：会话与守卫
│   └── users/                      # 受保护接口示例
├── components/{ui,layout}/
├── styles/globals.css
└── test/                           # setupTests、renderWithProviders、server-only 替身
```

## 环境变量

| 变量                   | 可见范围        | 说明                   | 默认                           |
| ---------------------- | --------------- | ---------------------- | ------------------------------ |
| `NEXT_PUBLIC_APP_NAME` | 浏览器 + 服务端 | 应用名称               | `Next.js App`                  |
| `NEXT_PUBLIC_APP_ENV`  | 浏览器 + 服务端 | 运行环境               | `development`                  |
| `API_BASE_URL`         | 仅服务端        | 后端地址，BFF 转发目标 | `http://localhost:9000/api/v1` |
| `API_TIMEOUT_MS`       | 仅服务端        | 请求后端超时           | `10000`                        |

## 开发指南

- **新接口**：前端直接 `http.get('/orders')`，`app/api/[...path]` 会自动带上登录态转发，不需要写 Route Handler。需要裁剪字段或聚合多个接口时，在 `app/api/orders/route.ts` 写具体路由（优先级更高），使用 `src/server/bff.ts` 中的工具。
- **新页面**：在 `src/app/[locale]/` 下新建目录和 `page.tsx`；默认是服务端组件，交互部分拆成 `'use client'` 组件放在 `_components/`。需要登录时调用 `requireSession(locale, '/路径')`。
- **跳转**：使用 `@/i18n/navigation` 的 `Link` / `useRouter` / `redirect`，会自动带语言前缀。
- **服务端代码**必须 `import 'server-only'`；客户端组件不能引用 `config/env.server.ts`、`src/server/*`、`features/*/server/*`。
- 通用规范：`docs/CONVENTIONS.md`；架构与流程图：`docs/ARCHITECTURE.md`；测试：`docs/TESTING.md`。

> 在模板仓库中，`docs/` 位于仓库根目录；通过 `npm run create` 生成的项目会自带 `docs/`。

## 接入遥测

模板默认是空实现（`src/services/telemetry.ts`）。推荐使用 `@sentry/nextjs` 官方集成，初始化后调用 `telemetry.setImplementation(...)`，业务代码无需改动。
