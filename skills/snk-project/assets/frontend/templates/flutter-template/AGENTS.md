# AGENTS.md

开始修改前先阅读本文件和 `README.md`；通用规范见 `docs/`（模板仓库中位于根目录 `docs/`）。

## 项目上下文

Flutter（Android / iOS / Web）· Dart 3 · Riverpod 2 · go_router · dio · flutter_secure_storage · gen-l10n。

## 必须遵守

- **接口**：只通过 `apiClientProvider`（`core/http/api_client.dart`）调用；接口类写在 `features/<模块>/data/`。不要在页面 / Widget 中直接创建 Dio 或调用 http 包。
- **鉴权**：accessToken 只放 `TokenStore`（内存），refreshToken 只放 `KeyValueStorage`（安全存储）。不要把 Token 写入 SharedPreferences 或日志。
- **状态**：Riverpod 是唯一的依赖注入和状态方案；不要引入 Provider / Bloc / GetX。
- **路由**：使用 go_router（`context.go` / `context.push`），新页面在 `app/router.dart` 注册；需要登录的页面加入 `protectedPaths`。
- **文案**：用户可见文案通过 `AppLocalizations.of(context)` 读取，不要写死中文 / 英文。
- **样式**：颜色用 `context.colors` / `colorScheme`，尺寸用 `AppSpacing` / `AppRadius` / `AppFontSize`。
- **生成文件**：`lib/l10n/*.arb`、`lib/core/generated/*` 在模板仓库中由 `npm run sync:core` 生成，不要手改；在生成的独立项目中可以修改。
- **平台工程**：`android/`、`ios/` 原生配置改动需要在回复中说明（权限、签名、最低系统版本）。
- 环境配置放 `env/*.json`（不提交），不要把密钥写进代码。

## 修改后检查

```bash
flutter analyze
dart format --output=none --set-exit-if-changed .
flutter test
```

无法运行某个命令时，在回复中说明原因。

## 回复要求

- 修改了哪些文件；新增或更新了哪些测试。
- 运行了哪些检查以及结果。
- 风险或未完成项（尤其是平台差异：Android / iOS / Web）。
