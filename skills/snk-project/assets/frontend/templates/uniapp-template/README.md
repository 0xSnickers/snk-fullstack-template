# uniapp-template

uni-app（Vue 3 + Vite）跨端模板，一套代码运行在 Android / iOS（App）、H5，并可编译为微信小程序等平台。与 Web 模板共享 `src/core`（请求层、鉴权、语言包、设计 Token）。

## 技术栈

| 类别       | 选型                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| 框架       | uni-app 3（Vue 3.4 + Vite 5，DCloud 官方 vite-ts 预设）                                |
| 状态       | Pinia 2（setup store）                                                                 |
| 服务端状态 | TanStack Vue Query 5（已适配 App / 小程序运行环境）                                    |
| 请求       | Axios + `uni.request` 适配器（经 `src/core/http/createHttpClient` 封装，各端行为一致） |
| 国际化     | vue-i18n 9（同时同步 uni 内置组件语言）                                                |
| 校验       | zod                                                                                    |
| 测试       | Vitest · Vue Test Utils（`uni` 全局对象已在 setup 中模拟）                             |

> uni-app 的 Vue、Vite 版本由 DCloud 编译器锁定，升级请使用 `npx @dcloudio/uvm@latest` 统一升级 `@dcloudio/*` 依赖，不要单独升级 vue / vite。

## 快速开始

```bash
npm install
cp .env.example .env
npm run mock       # 可选：本地 Mock 后端（在模板仓库根目录或生成的项目中运行）
npm run dev:h5     # H5：http://localhost:5175
```

App 端：`npm run dev:app` 编译到 `dist/dev/app`，再用 HBuilderX 导入运行到手机 / 模拟器；也可以直接用 HBuilderX 打开本项目。

**Mock 账号**：`demo@example.com` / `password123`。App / 小程序没有同源代理，`VITE_API_BASE_URL` 必须是完整地址：Android 模拟器用 `http://10.0.2.2:9000/api/v1`，真机用电脑的局域网 IP。

## 常用命令

| 命令                                        | 说明                                                  |
| ------------------------------------------- | ----------------------------------------------------- |
| `npm run dev:h5` / `build:h5`               | H5                                                    |
| `npm run dev:app` / `build:app`             | App（Android / iOS），产物用 HBuilderX 运行或云打包   |
| `npm run dev:harmony` / `build:harmony`     | 鸿蒙 App                                              |
| `npm run dev:mp-weixin` / `build:mp-weixin` | 微信小程序（用微信开发者工具导入 `dist/*/mp-weixin`） |
| `npm run lint` / `typecheck` / `test`       | 质量检查                                              |
| `npm run check`                             | lint + typecheck + test + build:h5                    |

## 目录结构

```text
src/
├── main.ts                       # 入口：Pinia、vue-i18n、Vue Query
├── App.vue                       # 应用生命周期：偏好、鉴权初始化、会话恢复、前后台切换
├── pages.json · manifest.json    # uni-app 页面与应用配置
├── pages/                        # 页面（只做组合）
│   ├── index/ · login/ · register/
│   └── profile/                  # 需要登录（useRequireAuth）
├── core/                         # 与 Web 模板共享的基础层（由模板仓库同步）
├── config/env.ts                 # 环境变量唯一入口（VITE_*）
├── services/                     # http（uni.request 适配器）· storage · queryClient · telemetry
├── i18n/                         # vue-i18n + 项目文案
├── stores/preferencesStore.ts    # 语言 / 主题 / 深浅色
├── composables/                  # useAppTheme（CSS 变量）· usePageTitle · useAppPreferences
├── features/
│   ├── auth/                     # 登录注册、会话（core/auth/nativeAuth）、页面守卫、页面路径
│   └── users/                    # 受保护接口示例
├── components/
│   ├── ui/                       # AppButton、AppField、AppCard
│   └── layout/                   # PageContainer（注入主题变量）、AppControls
└── test/setupTests.ts            # uni 全局对象模拟
```

## 跨端注意事项

- **主题**：颜色以 CSS 变量注入到 `PageContainer` 根节点（H5 / App / 小程序通用）。每个页面最外层必须使用 `PageContainer`，组件样式使用 `var(--primary)` 等变量。
- **导航栏**：标题和颜色由 `usePageTitle('语言包 key')` 设置，随语言和深浅色变化；`pages.json` 中的标题只是首帧兜底。
- **路由守卫**：使用页面级 `useRequireAuth` / `useGuestOnly`，可以覆盖 H5 直接打开链接、App 冷启动等场景。页面路径集中在 `features/auth/routes.ts`。
- **不可用的 Web API**：App / 小程序没有 `window`、`document`、`localStorage`、`URLSearchParams`；H5 专用代码用条件编译 `// #ifdef H5`。
- **鉴权**：refreshToken 存在 `uni.setStorage`（App 为应用沙盒）。H5 端等同 localStorage，对安全要求高的 H5 建议改为 HttpOnly Cookie 方案。
- **小程序**：正式环境请求域名必须是 HTTPS 并在小程序后台配置。

## 开发约定

通用规范见 `docs/CONVENTIONS.md`。此外：

- 接口只通过 `@/services/http`，不要直接调用 `uni.request`（ESLint 会报错）。
- 新页面需要同时在 `pages.json` 注册，并把路径加入 `features/auth/routes.ts`。

> 在模板仓库中，`docs/` 位于仓库根目录；通过 `npm run create` 生成的项目会自带 `docs/`。

## 接入遥测

`src/services/telemetry.ts` 默认是空实现。接入 uni 统计、Sentry 等 SDK 后调用 `telemetry.setImplementation(...)`，业务代码无需改动。
