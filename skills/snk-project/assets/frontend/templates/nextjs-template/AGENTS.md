# AGENTS.md

开始修改前先阅读本文件，再阅读 `README.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`（模板仓库中位于根目录 `docs/`）。

## 项目上下文

Next.js 16 App Router + React 19 + TypeScript 6。next-intl（`[locale]` 路由）· TanStack Query · Zustand · Axios（仅浏览器）· BFF Route Handlers · Tailwind CSS v4 · shadcn/ui · Vitest + Testing Library。

## 必须遵守

- **服务端 / 客户端边界**：页面默认是服务端组件；只有需要交互、状态、浏览器 API 的组件加 `'use client'`。服务端模块（`src/server`、`features/*/server`、`config/env.server.ts`）必须 `import 'server-only'`，禁止在客户端组件中引用。
- **接口**：浏览器侧只能通过 `@/services/http` 请求同源 `/api/*`；接口函数写在 `src/features/<模块>/api/*Api.ts`。禁止在客户端直接请求后端地址，禁止 `import axios`。
- **BFF**：默认依赖 `app/api/[...path]` 透传；新增具体 Route Handler 时使用 `src/server/bff.ts` 的 `fetchBackend` / `toBffResponse`，**永远不要把 accessToken 返回给浏览器**。
- **会话**：服务端用 `getServerSession()`（已 `cache` 去重）；需要登录的页面用 `requireSession()`，仅游客页面用 `redirectIfAuthenticated()`。
- **状态**：服务端数据用 TanStack Query（`getQueryClient()`）；Zustand store 必须通过工厂 + Context 按请求创建（参考 `features/auth/store/authStore.ts`），不要用模块级单例保存用户数据。
- **导航**：使用 `@/i18n/navigation` 的 `Link` / `useRouter` / `usePathname` / `redirect`，不要直接用 `next/link`、`next/navigation` 的导航 API（`useSearchParams`、`notFound` 除外）。
- **文案**：用户可见文案进入语言包，插值用 `{name}`；`useTranslations()` / `getTranslations()` 的 key 有类型检查。
- **样式**：只用语义色，不要硬编码颜色；主题相关逻辑在 `providers/AppPreferencesProvider.tsx`。
- **环境变量**：公开配置从 `@/config/env`，服务端配置从 `@/config/env.server`；新增变量同步 `.env.example` 和 schema。
- **`src/core`**：在模板仓库中不要直接修改（改 `packages/core` 后同步）；生成的独立项目中可以修改。
- 不提交真实密钥、Token、用户隐私数据或 `.env`。

## 修改后检查

```bash
npm run check   # lint + typecheck + test + build
```

无法运行某个命令时，在回复中说明原因。

## 回复要求

- 修改了哪些文件；新增或更新了哪些测试。
- 运行了哪些检查以及结果。
- 风险或未完成项（尤其是服务端 / 客户端边界和缓存行为）。
