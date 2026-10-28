# Frontend Templates

前端通用项目模板：3 个 Web 模板 + 3 个跨端模板（Android / iOS / H5）。所有模板共享同一套**接口约定、鉴权流程、状态边界、语言包、设计 Token 和质量要求**，换框架时只有视图层写法不同。

## 模板选择

### Web

| 模板                                             | 技术栈                                                                                    | 适用场景                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`reactjs-template`](templates/reactjs-template) | React 19 · Vite 8 · React Router 7 · TanStack Query · Zustand · react-i18next · shadcn/ui | 管理后台、高交互 SPA、复杂业务系统       |
| [`vue3-template`](templates/vue3-template)       | Vue 3.5 · Vite 8 · Vue Router 5 · TanStack Vue Query · Pinia · vue-i18n · reka-ui         | 中小型 SPA、快速交付、轻量业务系统       |
| [`nextjs-template`](templates/nextjs-template)   | Next.js 16 · App Router · next-intl · TanStack Query · Zustand · shadcn/ui · BFF          | 官网、内容站、需要 SEO / SSR 的 Web 应用 |

### 跨端（Android / iOS / H5）

| 模板                                                       | 技术栈                                                                   | 适用场景                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`uniapp-template`](templates/uniapp-template)             | uni-app 3（Vue 3）· Pinia · TanStack Vue Query · vue-i18n                | 国内业务、需要同时出 App + H5 + 小程序，Vue 技术栈团队  |
| [`react-native-template`](templates/react-native-template) | Expo SDK 58 · React Native 0.88 · Expo Router · TanStack Query · Zustand | 原生体验要求较高的 App，React 技术栈团队，需要 OTA 更新 |
| [`flutter-template`](templates/flutter-template)           | Flutter · Riverpod · go_router · dio · gen-l10n                          | 对性能、动画、多端 UI 一致性要求高的 App                |

共同约定：统一响应 `{ code, message, data }`、401 自动刷新 Token（并发只刷新一次）、`zh-CN` / `en-US` 双语、品牌主题色 + 深浅色、登录后安全跳回 `redirect`、业务按 `features/<模块>` 内聚。

## 快速开始

```bash
# 1. 生成一个独立的新项目（不依赖本仓库）
npm run create -- react ../my-admin      # react / vue / next / uniapp / rn / flutter
cd ../my-admin
npm install

# 2. 没有后端时，先启动本地 Mock（另开一个终端）
npm run mock                             # http://localhost:9000/api/v1，账号 demo@example.com / password123

# 3. 启动
npm run dev
```

每个生成的项目都会在终端打印对应的下一步命令（如 uni-app 是 `npm run dev:h5`，Flutter 需要先运行 `./tool/setup_platforms.sh` 生成平台工程）。

在本仓库中直接开发模板：

```bash
npm install                 # Web 模板（npm workspaces）
npm run install:mobile      # uni-app、React Native（独立安装，避免与 Web 模板的依赖版本冲突）
npm run mock                # 本地 Mock 后端

npm run dev:react           # http://localhost:5173
npm run dev:vue             # http://localhost:5174
npm run dev:next            # http://localhost:3000
npm run dev:uniapp          # http://localhost:5175（H5）
npm run dev:rn              # Expo：扫码 / 按 a、i、w
npm run dev:flutter         # Flutter Web（需安装 Flutter SDK）
```

> 需要 Node.js 20.19+（推荐 22，见 `.nvmrc`）和 npm 11（`npm i -g npm@11`；npm 10 安装时可能报 `Cannot read properties of null (reading 'edgesOut')`）。Flutter 模板需要 Flutter 3.32+。

## 仓库结构

```text
.
├── packages/core/          # 框架无关的公共基础层（唯一真源 + 单元测试）
│   └── src/
│       ├── http/           # createHttpClient：拦截器、业务码、401 刷新去重、错误归一化
│       ├── auth/           # tokenStore、nativeAuth（App 端鉴权）、User、登录注册 zod 校验
│       ├── config/         # 环境变量校验工具
│       ├── i18n/           # 语言列表、语言检测、共享基础语言包
│       ├── theme/          # 主题色、深浅色、tokens.ts（JS 版设计 Token）
│       ├── styles/         # tokens.css（CSS 版设计 Token）
│       ├── telemetry/      # 遥测接口与可替换代理
│       └── utils/
├── templates/
│   ├── reactjs-template/ · vue3-template/ · nextjs-template/          # Web
│   └── uniapp-template/ · react-native-template/ · flutter-template/  # 跨端
├── scripts/
│   ├── create-app.mjs      # npm run create
│   ├── sync-core.mjs       # npm run sync:core / check:core（TS 复制 + Flutter 代码生成）
│   └── mock-server.mjs     # npm run mock（支持 Web Cookie 和 App refreshToken 两种模式，已开启 CORS）
└── docs/
    ├── ARCHITECTURE.md     # 分层、目录对照、请求 / 鉴权 / 状态流程图、跨端说明
    ├── CONVENTIONS.md      # 新模块开发流程、组件、状态、i18n、主题、命名
    ├── TESTING.md          # 测试规范和示例
    └── MIGRATION.md        # 与旧模板的差异、修复的问题
```

## core 如何在六个模板间共享

| 模板                   | 共享方式                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| React / Vue / Next.js  | `packages/core/src` 完整复制到 `src/core`                                                                                                  |
| uni-app / React Native | 复制到 `src/core`（不含 Tailwind 相关的 `cn.ts`、`tokens.css`），HTTP 客户端通过适配器复用                                                 |
| Flutter                | 由 core 生成 `lib/l10n/*.arb`（语言包）和 `lib/core/generated/design_tokens.g.dart`（颜色、圆角、间距）；HTTP / 鉴权按同一约定用 Dart 实现 |

修改公共逻辑时**只改 `packages/core`**，然后运行 `npm run sync:core`；CI 中运行 `npm run check:core` 确认没有遗漏。

## 维护模板

```bash
npm run sync:core      # 修改 packages/core 后同步到各模板
npm run verify         # core 一致性 + Web 模板 + uni-app / RN 的 lint、typecheck、test、build
npm run verify:flutter # Flutter：analyze + test（需要 Flutter SDK）
```

## Agent 协作

AI Agent 修改前先读根目录 [`AGENTS.md`](AGENTS.md)，再读对应模板的 `AGENTS.md` 和 `docs/`。
