# AGENTS.md

开始修改前先阅读本文件，再阅读 `README.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`（模板仓库中位于根目录 `docs/`）。

## 项目上下文

React 19 + Vite 8 + TypeScript 6 SPA。React Router 7（data router）· TanStack Query · Zustand · Axios · react-i18next · Tailwind CSS v4 · shadcn/ui · Vitest + Testing Library。

## 必须遵守

- **接口**：只能通过 `@/services/http` 的 `http` 调用，接口函数写在 `src/features/<模块>/api/*Api.ts`。禁止 `fetch`、禁止 `import axios`（ESLint 会报错）。
- **服务端数据**：用 TanStack Query，Query Key 用模块内的 key 工厂（参考 `features/users/hooks/useUsers.ts`），不要把接口数据复制进 Zustand。
- **全局状态**：只有跨页面、需要持久的客户端状态才进 Zustand；页面 / 模块内共享用功能级 Provider；同一组 props 不要连续透传 3 层以上。
- **页面**：放 `src/pages`，在 `src/app/router.tsx` 注册并使用 `lazy`；页面只做组合。
- **业务模块**：放 `src/features/<模块>`，模块外只从其 `index.ts` 引入。
- **基础组件**：放 `src/components/ui`，遵循 shadcn/ui 风格（kebab-case 文件名、`data-slot`、cva 变体），不能引用 features / services。
- **文案**：用户可见文案进入语言包（`src/i18n/messages.ts` 或 core 基础语言包），插值用 `{name}`。
- **样式**：只用语义色（`bg-background`、`text-muted-foreground`、`bg-primary`……），不要硬编码颜色，否则深色模式和主题色失效。
- **环境变量**：只从 `@/config/env` 读取；新增变量同步 `.env.example`、schema 和 `src/vite-env.d.ts`。
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
- 风险或未完成项。
