# vue3-template

Vue 3.5 + Vite 8 单页应用模板，适合中小型 SPA、快速交付和轻量业务系统。

## 技术栈

| 类别        | 选型                                                                  |
| ----------- | --------------------------------------------------------------------- |
| 框架 / 构建 | Vue 3.5（`<script setup>`）· Vite 8 · TypeScript 6（strict）· vue-tsc |
| 路由        | Vue Router 5（页面懒加载、`meta` 路由守卫）                           |
| 服务端状态  | TanStack Vue Query 5                                                  |
| 客户端状态  | Pinia 3（setup store）                                                |
| 请求        | Axios（经 `src/core/http/createHttpClient` 封装）                     |
| UI          | Tailwind CSS v4 · reka-ui · @lucide/vue · class-variance-authority    |
| 国际化      | vue-i18n 11（Composition API，`zh-CN` / `en-US`）                     |
| 校验        | zod                                                                   |
| 测试        | Vitest · Vue Test Utils · jsdom                                       |
| 遥测        | snk-telemetry-vue3（Sentry + PostHog，可选、按需加载）                |

## 快速开始

```bash
npm install
cp .env.example .env
npm run mock   # 可选：本地 Mock 后端（在模板仓库根目录或生成的项目中运行）
npm run dev    # http://localhost:5174
```

浏览器请求同源 `/api/*`，开发环境由 Vite 代理到 `VITE_API_PROXY_TARGET`（默认 `http://localhost:9000/api/v1`）。

## 常用命令

| 命令                              | 说明                            |
| --------------------------------- | ------------------------------- |
| `npm run dev`                     | 开发服务器                      |
| `npm run build`                   | vue-tsc 类型检查 + 生产构建     |
| `npm run preview`                 | 预览构建产物                    |
| `npm run lint` / `lint:fix`       | ESLint                          |
| `npm run format` / `format:check` | Prettier                        |
| `npm run typecheck`               | vue-tsc 检查                    |
| `npm run test` / `test:watch`     | 单元测试                        |
| `npm run check`                   | lint + typecheck + test + build |

## 目录结构

```text
src/
├── main.ts                     # 入口：插件安装、偏好初始化、鉴权、遥测
├── App.vue                     # 错误边界 + 页面标题
├── app/router.ts               # 路由表（meta.requiresAuth / guestOnly / titleKey）
├── core/                       # 框架无关基础层（由模板仓库同步）
├── config/env.ts               # 环境变量唯一入口
├── services/
│   ├── http.ts                 # 唯一 HTTP 客户端 + tokenStore
│   ├── queryClient.ts          # TanStack Query 默认配置
│   └── telemetry.ts            # 唯一遥测入口
├── i18n/                       # vue-i18n 初始化 + 项目文案
├── composables/                # 通用 composable（应用偏好、页面标题）
├── features/
│   ├── auth/                   # 登录注册、会话、路由守卫（guards.ts）
│   └── users/                  # 受保护接口示例（Query Key 工厂）
├── components/
│   ├── ui/                     # Button、Input、FormField、Dialog
│   ├── layout/                 # MainLayout、AppControls
│   └── error/                  # ErrorBoundary
├── pages/                      # 页面（只做组合）
├── styles/globals.css
└── test/                       # setupTests、mountWithPlugins
```

## 环境变量

| 变量                                      | 说明                                              | 默认                           |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------ |
| `VITE_APP_NAME`                           | 应用名称                                          | `Vue App`                      |
| `VITE_APP_ENV`                            | `development` / `test` / `staging` / `production` | `development`                  |
| `VITE_APP_RELEASE`                        | 版本号（Sentry release）                          | —                              |
| `VITE_API_BASE_URL`                       | 浏览器请求前缀；也可以是完整地址                  | `/api`                         |
| `VITE_API_PROXY_TARGET`                   | 开发代理目标（仅 `npm run dev`）                  | `http://localhost:9000/api/v1` |
| `VITE_TELEMETRY_ENABLED`                  | 是否启用遥测                                      | `false`                        |
| `VITE_SENTRY_DSN` / `VITE_POSTHOG_KEY` 等 | 遥测配置                                          | —                              |

## 开发指南

- 新增业务模块、接口、状态、组件：见 `docs/CONVENTIONS.md`。
- 新增页面：在 `src/pages` 新建组件，在 `src/app/router.ts` 注册；需要登录的页面加 `meta: { requiresAuth: true }`。
- 表单控件使用 `FormField` 的作用域插槽传递无障碍属性：

  ```vue
  <FormField v-slot="field" :label="t('auth.fields.email')" :error="emailError">
    <Input v-model="email" v-bind="field" type="email" />
  </FormField>
  ```

- 架构与流程图：`docs/ARCHITECTURE.md`；测试规范：`docs/TESTING.md`。

> 在模板仓库中，`docs/` 位于仓库根目录；通过 `npm run create` 生成的项目会自带 `docs/`。
