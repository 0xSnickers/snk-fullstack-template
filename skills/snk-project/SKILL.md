---
name: snk-project
description: "使用 SNK 统一架构模板创建前端、后端或全栈项目。询问缺失的框架选择和项目信息，通过内置脚本生成项目并初始化。适用于新建项目、搭建前后端骨架、使用个人模板开项目；不用于无关项目的日常修改或强制迁移现有架构。"
---

# SNK Project

使用随 skill 安装的模板创建独立项目；不依赖作者电脑的路径，不从记忆重新编写骨架。

## 先收集选择

用户要求新建项目时，在写入前一次性询问尚未明确的信息，并等待回答：

- 项目名称及目标目录。
- 前端：React / Vue 3 / Next.js / uni-app / React Native（Expo）/ Flutter / 不需要。
- 后端：Express / NestJS / Django / Gin / Spring Boot / 不需要。

用户已指定的选择不要重复询问；明确“仅前端”或“仅后端”即另一端为 `none`。如果用户不知道怎么选，读取 [框架与运行说明](references/frameworks.md)，根据产品需求给出推荐并等待其选择。不要自行默认 React + Express。询问是框架选择，不要再追加一次笼统的执行确认。

使用当前 Agent 的提问能力；若不可用，直接用对话提问。可多选的工具不一定能列出所有框架，始终允许用户输入框架名称。

## 生成项目

1. 检查目标目录及其适用的 `AGENTS.md`。目标必须不存在或为空；遇到已有项目先说明冲突并请求另一个目录，不覆盖或清空。
2. 将 `<skill-dir>` 替换成当前读取的 `SKILL.md` 所在真实目录。命令从任何工作目录都能运行：

   ```bash
   node "<skill-dir>/scripts/create-project.mjs" --name my-app --target "<absolute-target>" --frontend react --backend nestjs
   ```

   框架标识：前端 `react|vue|next|uniapp|rn|flutter|none`，后端 `express|nestjs|django|gin|springboot|none`。两端不能都为 `none`。Go 可附加 `--module github.com/owner/project`；用户未提供则保留模板的可修改占位值，并在交付时说明。

3. 前端生成到 `web/`（App 框架也沿用此目录），后端生成到 `server/`。生成器附带项目说明、开发规则和模板版本记录。它不安装依赖或启动服务。
4. 阅读生成项目根目录以及已选两端的 `AGENTS.md`、`README.md` 和所需 `docs/`，后续开发遵守项目自身规范。在生成项目里 `src/core` 已归项目所有，不再同步模板仓库。

## 初始化和交付

读取 [框架与运行说明](references/frameworks.md) 中已选框架的部分。按用户任务继续安装依赖、完成必要配置及可运行的检查，不要只生成空壳后停止。环境缺少 SDK / Docker 或依赖安装失败时保留已生成项目，清楚说明受阻步骤，不声称验证通过。

- 浏览器前端默认连接 `http://localhost:9000/api/v1`；有真实后端时无需同时启动 Mock。
- App 真机与 Android 模拟器不能直接沿用电脑的 localhost。确认运行设备后设置实际地址；尚未确定设备时保留默认值并说明如何修改。
- 后端通过 `server/scripts/*.sh` 安装、测试和启动。只创建用户选择的数据库或服务资源；生成本地开发配置不代表授权发布。
- 有后端时，契约以 `server/docs/API_CONTRACT.md` 为准。服务就绪后可从项目根运行 `node server/scripts/contract-test.mjs`，需要本地演示账号。检查数量和结果以实际输出为准。
- 前端根据自身 README 运行检查；不要为当前项目安装其他十种模板的运行时。
- 汇报生成位置、已选框架、完成的初始化和验证、未完成项以及启动命令。用户有具体业务需求时继续按需求开发。
