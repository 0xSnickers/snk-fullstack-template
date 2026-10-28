# AGENTS.md（模板仓库）

本仓库维护 6 个前端模板：Web（React / Vue 3 / Next.js）和跨端（uni-app / React Native / Flutter）。修改前先阅读本文件，再阅读 `README.md` 和 `docs/`。

## 仓库规则

- **公共逻辑只改 `packages/core/src`**，改完运行 `npm run sync:core`。不要直接修改 `templates/*/src/core`（`npm run check:core` 会报错）。
- core 必须保持框架无关：不能引用 React / Vue / Next，也不能引用模板中的代码。core 的改动需要补 `packages/core/tests`。
- 各模板的目录语义、命名、文案 key 保持一致。在一个模板中新增通用能力时，评估是否需要同步到其他模板（Flutter 需要用 Dart 实现同样的约定）。
- 模板中的示例业务（auth、users、profile）是约定的演示，修改时保持各模板行为一致。
- Flutter 的 `lib/l10n/*.arb`、`lib/core/generated/*` 由 `sync:core` 生成，不要手改。
- 不随意新增依赖；新增依赖需要说明理由，并确认其他模板是否也需要。uni-app 的 vue / vite 版本由 DCloud 锁定，Expo 依赖用 `npx expo install` 安装。
- 文档：通用规范写在 `docs/`，模板特有内容写在模板的 `README.md` / `AGENTS.md`。

## 修改后检查

```bash
npm run verify          # check:core + Web 与 uni-app / RN 模板的 lint / typecheck / test / build
npm run verify:flutter  # Flutter（需要 Flutter SDK）
```

只改了单个模板时，可以在该模板目录运行 `npm run check`。无法运行某个命令时，在回复中说明原因。

## 回复要求

- 修改了哪些文件；是否同步了 core、是否影响其他模板。
- 新增或更新了哪些测试；运行了哪些检查以及结果。
- 未完成项或需要人工确认的风险。
