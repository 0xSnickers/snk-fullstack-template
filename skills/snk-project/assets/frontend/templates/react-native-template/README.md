# react-native-template

React Native + Expo 跨端模板（Android / iOS / H5），与 Web 模板共享 `src/core`（请求层、鉴权、语言包、设计 Token）。

## 技术栈

| 类别       | 选型                                                              |
| ---------- | ----------------------------------------------------------------- |
| 框架       | Expo SDK 58 · React Native 0.88 · React 19 · TypeScript（strict） |
| 路由       | Expo Router（文件路由，`src/app/`；H5 走 react-native-web）       |
| 服务端状态 | TanStack Query 5（App 回到前台自动刷新）                          |
| 客户端状态 | Zustand 5                                                         |
| 请求       | Axios（经 `src/core/http/createHttpClient` 封装）                 |
| 存储       | expo-secure-store（refreshToken、偏好；H5 退化为 localStorage）   |
| 国际化     | i18next + react-i18next + expo-localization                       |
| 测试       | Jest（jest-expo）· React Native Testing Library 14                |

## 快速开始

```bash
npm install
cp .env.example .env
npm run mock     # 可选：本地 Mock 后端（在模板仓库根目录或生成的项目中运行）
npm run start    # 扫码用 Expo Go 打开，或按 a / i / w 打开 Android / iOS / Web
npm run web      # 直接打开 H5
```

**Mock 账号**：`demo@example.com` / `password123`。Android 模拟器把 `EXPO_PUBLIC_API_BASE_URL` 改为 `http://10.0.2.2:9000/api/v1`，真机改为电脑的局域网 IP。

> 依赖升级、新增带原生代码的库时使用 `npx expo install <包名>`，它会选择与当前 SDK 兼容的版本。带原生代码的库在 Expo Go 中不可用，需要 development build（`npx expo run:android` / `run:ios` 或 EAS Build）。

## 常用命令

| 命令                                        | 说明                                |
| ------------------------------------------- | ----------------------------------- |
| `npm run start` / `android` / `ios` / `web` | 开发                                |
| `npm run build:web`                         | 导出 H5 静态站点到 `dist/`          |
| `npx eas-cli build -p android` / `-p ios`   | 云端打包安装包（需配置 EAS）        |
| `npm run lint` / `typecheck` / `test`       | 质量检查                            |
| `npm run doctor`                            | 检查依赖与 SDK 兼容性               |
| `npm run check`                             | lint + typecheck + test + build:web |

## 目录结构

```text
src/
├── app/                            # Expo Router：每个文件是一个页面
│   ├── _layout.tsx                 # 根布局：QueryClient、Stack、错误边界、启动流程
│   ├── index.tsx                   # 首页
│   ├── login.tsx · register.tsx    # 仅游客（GuestOnly）
│   ├── profile.tsx                 # 需要登录（RequireAuth）
│   └── +not-found.tsx
├── core/                           # 与 Web 模板共享的基础层（由模板仓库同步）
├── config/env.ts                   # 环境变量唯一入口（EXPO_PUBLIC_*）
├── services/                       # http · storage（安全存储）· queryClient · telemetry
├── i18n/                           # i18next 初始化 + 项目文案
├── stores/preferencesStore.ts      # 语言 / 主题 / 深浅色（持久化）
├── theme/useAppTheme.ts            # 设计 Token + 品牌色 + 深浅色
├── features/
│   ├── auth/                       # 登录注册、会话（core/auth/nativeAuth）、路由守卫
│   └── users/                      # 受保护接口示例
├── components/
│   ├── ui/                         # Button、TextField、Card、Screen
│   └── layout/AppControls.tsx
└── test/                           # setupTests、renderWithProviders
```

## 鉴权

移动端没有 HttpOnly Cookie，模板使用：

- accessToken 只放内存（`services/http.ts` 的 `tokenStore`）；
- refreshToken 放 Keychain / Keystore（`services/storage.ts`），请求体带 `clientType: 'native'`，刷新时后端旋转 refreshToken；
- 启动时自动用 refreshToken 恢复会话；接口 401 自动刷新并重试，并发请求只刷新一次。

## 开发约定

- 通用规范：`docs/CONVENTIONS.md`；架构：`docs/ARCHITECTURE.md`；测试：`docs/TESTING.md`。
- 页面放 `src/app/`（只做组合），业务代码放 `src/features/<模块>`，非页面文件不要放进 `src/app/`。
- 颜色只用 `useAppTheme().colors`，不要硬编码；样式用 `StyleSheet.create`。
- 接口只通过 `@/services/http`；禁止 `fetch` 和 `import axios`（ESLint 会报错）。

> 在模板仓库中，`docs/` 位于仓库根目录；通过 `npm run create` 生成的项目会自带 `docs/`。

## 接入遥测

`src/services/telemetry.ts` 默认是空实现。接入 `@sentry/react-native` 或 `snk-telemetry-react-native` 后调用 `telemetry.setImplementation(...)`，业务代码无需改动（需要 development build）。
