# src/core

框架无关的公共基础层：HTTP 客户端、错误归一化、Token、环境变量校验、语言、主题、设计 Token、遥测接口。

- 本目录由模板仓库的 `packages/core` 同步生成，**不要直接修改**。
- 如果项目已经从模板仓库复制出来独立维护，可以直接修改本目录，并删除本说明。
- 业务代码通过 `@/core/...` 引入，例如 `import { AppApiError } from '@/core/http/apiError'`。
