# AGENTS.md

开始修改前先阅读本文件，再阅读 `README.md`、`docs/CONVENTIONS.md`、`docs/TESTING.md`（模板仓库中位于根目录 `docs/`）。

## 项目上下文

uni-app 3（Vue 3.4 + Vite 5）· Pinia · TanStack Vue Query · Axios（uni.request 适配器）· vue-i18n · Vitest。目标平台：App（Android / iOS）、H5，可编译小程序。

## 必须遵守

- **跨端优先**：业务代码只使用 uni API 和 uni 组件（`view`、`text`、`input` 等）。不要使用 `window`、`document`、`localStorage`、`URLSearchParams`、DOM 操作；H5 专用代码必须用 `// #ifdef H5` 条件编译。
- **版本锁定**：`vue`、`vite`、`@dcloudio/*` 版本由 DCloud 编译器决定，不要单独升级，统一使用 `npx @dcloudio/uvm@latest`。
- **接口**：只能通过 `@/services/http` 调用，接口函数写在 `src/features/<模块>/api/*Api.ts`。禁止直接 `uni.request`、`fetch`、`import axios`。
- **页面**：新页面放 `src/pages/<名称>/index.vue`，同时在 `pages.json` 注册、把路径加入 `features/auth/routes.ts`；页面最外层使用 `PageContainer`，标题用 `usePageTitle`；需要登录的页面调用 `useRequireAuth`。
- **状态**：接口数据用 Vue Query；跨页面状态用 Pinia setup store；页面内共享用 provide / inject。
- **样式**：颜色只用 CSS 变量（`var(--primary)` 等），不要硬编码；尺寸统一使用 px（`manifest.json` 中 `transformPx` 为 false），需要按屏宽缩放时使用 rpx。
- **文案**：用户可见文案进入语言包，插值用 `{name}`；避免直接使用 `@`、`|`、`{`、`}`。
- **`src/core`**：在模板仓库中不要直接修改（改 `packages/core` 后同步）；生成的独立项目中可以修改。

## 修改后检查

```bash
npm run check            # lint + typecheck + test + build:h5
npm run build:app        # 涉及 App 端能力时
npm run build:mp-weixin  # 涉及小程序时
```

无法运行某个命令时，在回复中说明原因。

## 回复要求

- 修改了哪些文件；新增或更新了哪些测试。
- 运行了哪些检查以及结果。
- 风险或未完成项（尤其是 App / H5 / 小程序的平台差异）。
