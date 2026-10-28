# SNK Fullstack Template

个人前后端统一架构入口：通过一段提示词选择框架，使用现成模板创建独立项目。支持 React、Vue 3、Next.js、uni-app、React Native、Flutter，以及 Express、NestJS、Django、Gin、Spring Boot；可只创建一端。

## 安装

统一使用 Node.js 26（已验证 26.12.1）及 npx。仓库：`0xSnickers/snk-fullstack-template`。无需发布 npm 包：

```bash
# 全局安装到 Codex 和 Claude Code
npx skills add 0xSnickers/snk-fullstack-template --skill snk-project -g -a codex claude-code

# 也可以不加 -a，通过 CLI 选择要安装到的 Agent
npx skills add 0xSnickers/snk-fullstack-template --skill snk-project -g
```

本仓库为公开仓库，下载安装无需 GitHub 登录。

本地预览安装（在本目录执行）：

```bash
npx skills add . --skill snk-project -g -a codex
```

如仍安装着旧 `snk-frontend-template`，先备份并移出 Agent 的 skills 搜索目录，再安装新版，避免旧 skill 继续被匹配。新 skill 名称为 `snk-project`。

## 使用提示词

```text
使用 $snk-project 帮我创建一个新项目。
先询问我要使用的前端框架、后端框架、项目名称和保存位置，
等我回答后使用模板生成项目，并完成依赖安装和基础检查。
```

Claude Code 等使用斜杠命令的 Agent 可用其技能入口选择 `snk-project`，或写“使用 snk-project skill”。显式选择 skill 最容易确保触发；自然语言触发取决于 Agent。

AI 会询问缺失的选择，用户可回答：

```text
前端 React，后端 NestJS。
项目名称 my-admin，放在 ~/projects/my-admin。
```

已明确的选项不会重复问。选择“不需要后端”或“不需要前端”可创建单端项目。

```text
my-admin/
├── AGENTS.md              # 项目开发入口
├── CLAUDE.md              # 引用 AGENTS.md
├── README.md              # 所选框架的启动说明
├── snk-project.json       # 选择结果和模板内容版本
├── web/                   # 选择前端时生成
└── server/                # 选择后端时生成
```

生成器不会安装依赖或启动数据库；skill 会指导 Agent 根据当前环境继续初始化，缺少 SDK / Docker 时明确报告未验证范围。

## 维护与打包

所有源码和安装资源都在同一个仓库中：

```text
snk-fullstack-template/
├── frontend/              # 6 个前端模板、core、脚本、开发规范
├── backend/               # 5 个后端模板、契约、脚本、开发规范
├── skills/snk-project/    # skill 入口、统一生成器及打包资源
├── scripts/bundle.mjs     # 从 frontend/、backend/ 生成 skill assets
└── tests/                 # 生成与分发验证
```

原模板文档中的 `my-frontend-template` 对应 `frontend/`，`my-backend-tempalte` / `my-backend-template` 对应 `backend/`。

修改公共前端 core 时，先在前端仓库按其 AGENTS.md 执行同步。发布前，在本目录运行：

```bash
npm run bundle
npm test
```

`bundle` 从源码生成 `skills/snk-project/assets/`，排除依赖、本地环境配置和构建产物。**assets 必须一起提交**，安装 CLI 只需要下载本仓库，使用时不依赖作者电脑，也不需要相邻模板源码。不要手改 assets；修改 frontend/ 或 backend/ 后重新打包。安装使用不需要执行 bundle。

`npm test` 验证全部 11 种模板的项目生成、安装目录迁移、单端创建、非空目录保护及失败清理；不代表已安装并构建所有框架或完成真实数据库联调。

模板清单记录内容 SHA-256，生成项目也保存该版本。已有项目独立演进，不会被模板更新覆盖。

## 直接使用生成脚本

```bash
node skills/snk-project/scripts/create-project.mjs \
  --name my-admin --target /absolute/path/my-admin \
  --frontend react --backend nestjs
```

前端：`react|vue|next|uniapp|rn|flutter|none`；后端：`express|nestjs|django|gin|springboot|none`。至少选择一端。Gin 可加 `--module github.com/you/my-admin`。目标目录必须不存在或为空。脚本按自身路径定位模板，可在任何工作目录执行。

## 模板源码

- [前端使用与维护说明](frontend/README.md)
- [后端使用与维护说明](backend/README.md)
- [统一接口契约](backend/docs/API_CONTRACT.md)

仓库根目录只负责 skill 打包；直接开发模板时在 frontend/ 或 backend/ 执行各自命令。
