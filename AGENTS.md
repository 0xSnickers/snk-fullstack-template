# SNK Fullstack Template

本仓库维护个人前后端架构模板和 snk-project skill。

- `frontend/`：6 个前端模板、公共 core、生成脚本与规范。修改前读该目录 AGENTS.md。
- `backend/`：5 个后端模板、接口契约、生成脚本与规范。修改前读该目录 AGENTS.md。
- `skills/snk-project/`：可由 npx skills 安装的 skill。
- `scripts/bundle.mjs`：把前后端模板源码打包到 skill assets。

模板源码只在 frontend/、backend/ 维护；不要手改 skills/snk-project/assets/。改完模板先按对应目录规则验证，再从根目录运行 `npm run bundle` 和 `npm test`，将更新后的 assets 一并提交。

原模板文档中的 my-frontend-template 指本仓库 frontend/，my-backend-tempalte 或 my-backend-template 指 backend/。接口契约以 backend/docs/API_CONTRACT.md 为准。生成后的项目独立演进。

不提交本地 .env、依赖、构建缓存。用户本地环境配置不属于模板资源。

Node 工具链统一使用 26（当前验证版本 26.12.1），保持 .nvmrc、engines、Docker 和 CI 一致；遇到新 Node 兼容问题修复工具链，不通过降级解决。
