# AGENTS.md

开始修改前先阅读本文件，再阅读 `README.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`（模板仓库中位于根目录 `docs/`）。

## 项目上下文

Expo SDK 58 + React Native 0.88 + TypeScript。Expo Router · TanStack Query · Zustand · Axios · i18next · expo-secure-store · Jest + RNTL 14。

**Expo 每个 SDK 版本都有破坏性变更**。涉及 Expo / RN API 时，先确认 `package.json` 中 `expo` 的主版本，再查对应版本文档：`https://docs.expo.dev/versions/v<主版本>.0.0/`，不要凭记忆写 API。

## 必须遵守

- **依赖**：使用 `npx expo install <包名>` 安装，保证与 SDK 兼容；修改后运行 `npm run doctor`。
- **路由**：页面放 `src/app/`（Expo Router 文件路由），导航用 `expo-router` 的 `Link` / `router`；非页面代码不要放进 `src/app/`。需要登录的页面用 `RequireAuth` 包裹。
- **接口**：只能通过 `@/services/http` 调用，接口函数写在 `src/features/<模块>/api/*Api.ts`。禁止 `fetch`、禁止 `import axios`。
- **鉴权**：accessToken 只放内存，refreshToken 只放 `secureStorage`；不要把 Token 写进 Zustand 持久化或日志。
- **状态**：接口数据用 TanStack Query；跨页面客户端状态用 Zustand；页面 / 模块内共享用 Context。
- **样式**：颜色只用 `useAppTheme().colors`；不要硬编码颜色和魔法数字，尺寸参考 `spacing` / `radius` / `fontSize`。
- **原生配置**：不要手动创建或修改 `android/`、`ios/`（Continuous Native Generation），原生行为通过 `app.json` 和 config plugin 配置。
- **文案**：用户可见文案进入语言包，插值用 `{name}`。
- **`src/core`**：在模板仓库中不要直接修改（改 `packages/core` 后同步）；生成的独立项目中可以修改。

## 修改后检查

```bash
npm run check   # lint + typecheck + test + build:web
```

无法运行某个命令时，在回复中说明原因。

## 回复要求

- 修改了哪些文件；新增或更新了哪些测试。
- 运行了哪些检查以及结果。
- 风险或未完成项（尤其是 Android / iOS / Web 的平台差异）。
