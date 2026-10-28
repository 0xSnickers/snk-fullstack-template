# 框架选择与运行

| 前端标识 | 框架 | 适合的需求 | 安装 / 启动（在 web/） |
|---|---|---|---|
| react | React + Vite | SPA、管理后台 | `npm install` / `npm run dev` |
| vue | Vue 3 + Vite | Vue 技术栈的 SPA | `npm install` / `npm run dev` |
| next | Next.js App Router | SEO、SSR、内容站 | `npm install` / `npm run dev` |
| uniapp | uni-app | H5、国内小程序、App | `npm install` / `npm run dev:h5` |
| rn | React Native + Expo | React 技术栈的原生 App | `npm install` / `npm run start` |
| flutter | Flutter | Dart、多端 UI、动画 | `./tool/setup_platforms.sh <组织标识>` / `flutter run --dart-define-from-file=env/dev.json` |

Flutter 平台生成需要用户的组织标识；没有提供时询问或保留为待办。需要 Flutter SDK。其他前端使用模板 README 声明的 Node/npm 版本；Expo 原生依赖使用 `npx expo install`。

| 后端标识 | 框架 | 适合的需求 | 工具链 |
|---|---|---|---|
| express | Express + TypeScript | 轻量 API、BFF、Webhook | Node/npm |
| nestjs | NestJS | 多模块、依赖注入 | Node/npm |
| django | Django + DRF | Python、数据服务 | Python/uv |
| gin | Gin | Go、单二进制服务 | Go |
| springboot | Spring Boot | Java 技术栈 | Java 21/Maven |

后端统一在 `server/` 运行 `./scripts/setup.sh`，用 `./scripts/test.sh` 检查。数据库使用 PostgreSQL，`./scripts/db.sh up` 需要 Docker，并会执行迁移；启动是 `./scripts/dev.sh`。实际依赖与命令以所选模板 README 为准。

## API 地址

- React / Vue：`.env` 中 `VITE_API_PROXY_TARGET`。
- Next.js：`.env` 中服务端 `API_BASE_URL`，浏览器经同源 BFF 请求。
- uni-app：`.env` 中 `VITE_API_BASE_URL`。
- React Native：`.env` 中 `EXPO_PUBLIC_API_BASE_URL`。
- Flutter：`env/dev.json` 中 `API_BASE_URL`。

浏览器和 iOS 模拟器默认使用电脑 `http://localhost:9000/api/v1`；Android 标准模拟器使用 `http://10.0.2.2:9000/api/v1`；真机使用电脑局域网 IP。涉及浏览器直连时按模板配置 `CORS_ORIGINS`。

## 单端项目

仅前端时可在 `web/` 启动 `npm run mock`；Flutter 使用 `node scripts/mock-server.mjs`。仅后端时不创建前端。生成项目属于用户，模板中的 users 等示例可以按业务需要替换。
