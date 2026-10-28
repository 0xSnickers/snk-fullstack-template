# 开发约定

适用于全部模板。Web 模板（React / Vue / Next）的差异以「React / Vue / Next」分别标注；跨端模板（uni-app / React Native / Flutter）的特有约定见 1.4 节和各模板 README。

## 1. 新增一个业务模块（推荐流程）

以「订单」为例，所有代码放在 `src/features/orders/`：

```text
src/features/orders/
├── api/orderApi.ts          # 1. 接口
├── types.ts                 # 2. 类型（模块私有；跨模块共享的放 src/types）
├── hooks/useOrders.ts       # 3. 数据 hook（Vue: composables/useOrders.ts）
├── components/OrderTable.*  # 4. 业务组件
├── store/orderStore.ts      # 5. 可选：跨页面共享的客户端状态（Vue: stores/）
└── index.ts                 # 6. 对外导出，模块外只从这里引入
```

然后在页面中组合（React/Vue：`src/pages` + 路由表；Next：`src/app/[locale]/orders/page.tsx`），补测试，补语言包。

### 1.1 接口

```ts
// src/features/orders/api/orderApi.ts
import type { PageParams, PageResult } from '@/core/http/types';
import { http } from '@/services/http';
import type { Order, CreateOrderInput } from '../types';

export const getOrders = (params: PageParams) => http.get<PageResult<Order>>('/orders', { params });
export const createOrder = (input: CreateOrderInput) => http.post<Order>('/orders', input);
```

- `http.get/post/put/patch/delete` 直接返回 `data`（已解包 `{ code, message, data }`）。
- 业务码非 0 / 200、HTTP 错误、网络错误统一抛出 `AppApiError`（含 `code`、`status`、`message`）。
- 需要原始响应（下载文件、读响应头）时用 `http.instance`。
- **禁止**在业务代码中 `fetch(...)` 或 `import axios`（ESLint 已拦截）。

### 1.2 数据 hook

```ts
// React / Next
export const orderKeys = {
  all: ['orders'] as const,
  list: (params: PageParams) => [...orderKeys.all, 'list', params] as const,
};

export function useOrders(params: PageParams) {
  return useQuery({ queryKey: orderKeys.list(params), queryFn: () => getOrders(params) });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
```

Vue 写法相同，`useQuery` 来自 `@tanstack/vue-query`，参数可传 `ref` / getter（见 `features/users/composables/useUsers.ts`）。

### 1.3 Next.js 特有

- 新接口默认由 `app/api/[...path]` 自动转发到后端，**不需要**新建 Route Handler。
- 页面默认是服务端组件；需要交互的部分拆成 `'use client'` 组件，页面私有组件放在路由目录的 `_components/` 下。
- 需要登录的页面在服务端调用 `requireSession(locale, '/当前路径')`。
- 服务端代码（`src/server`、`features/*/server`、`config/env.server.ts`）必须 `import 'server-only'`。

### 1.4 跨端模板特有

|          | uni-app                                                                 | React Native                                       | Flutter                                               |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| 模块目录 | `src/features/<模块>/{api,components,composables,stores}`               | `src/features/<模块>/{api,components,hooks,store}` | `lib/features/<模块>/{data,application,presentation}` |
| 新页面   | `src/pages/<名称>/index.vue` + `pages.json` + `features/auth/routes.ts` | `src/app/<名称>.tsx`                               | 页面组件 + `lib/app/router.dart`                      |
| 需要登录 | `useRequireAuth(routes.xxx)`                                            | 用 `RequireAuth` 包裹                              | 路径加入 `protectedPaths`                             |
| 接口     | `@/services/http`（禁止 `uni.request`）                                 | `@/services/http`                                  | `apiClientProvider`                                   |

- 跨端代码只使用框架 / 平台 API，不要直接使用 `window`、`document`、`localStorage`（uni-app H5 专用代码用 `// #ifdef H5`）。
- Token 只能放内存（accessToken）和安全存储（refreshToken），不要写进普通持久化状态或日志。
- 接口地址必须是完整 URL；Android 模拟器访问电脑用 `10.0.2.2`，真机用局域网 IP；生产环境使用 HTTPS。
- 依赖升级：uni-app 用 `npx @dcloudio/uvm@latest`，Expo 用 `npx expo install --fix`，Flutter 用 `flutter pub upgrade`。

## 2. 组件

| 目录                    | 放什么                                 | 规则                                                     |
| ----------------------- | -------------------------------------- | -------------------------------------------------------- |
| `components/ui`         | Button、Input、Dialog 等无业务基础组件 | 不引用 `features`、`services`；React/Next 遵循 shadcn/ui |
| `components/layout`     | 页面外壳、导航、偏好切换               | 不写业务逻辑                                             |
| `components/error`      | 错误边界、错误兜底                     | 统一上报 `telemetry.captureError`                        |
| `features/*/components` | 业务组件                               | 通过模块 `index.ts` 对外暴露                             |

- Props 必须声明类型；单个组件超过 300 行考虑拆分。
- 组件不直接读取 `import.meta.env` / `process.env`，统一读 `@/config/env`。
- 颜色只使用语义 Token：`bg-background`、`text-foreground`、`bg-primary`、`text-muted-foreground`、`border`……不要写 `text-slate-600`、`#2563eb`，否则深色模式和主题色会失效。
- 表单字段使用 `FormField` + `Input`，自动关联 label、`aria-invalid`、错误提示。

## 3. 状态管理

| 场景                                                   | 方案                                                  |
| ------------------------------------------------------ | ----------------------------------------------------- |
| 接口数据                                               | TanStack Query（三端一致）                            |
| 单个组件的临时状态                                     | `useState` / `ref`                                    |
| 同一页面或模块内多个组件共享（筛选条件、选中项、步骤） | 功能级 Provider（React Context / Vue provide-inject） |
| 跨页面共享、需要持久化（登录态）                       | Zustand（React / Next）/ Pinia（Vue）                 |
| 语言、主题、深浅色                                     | `AppPreferences`（已内置）                            |

Provider 规则：

- 2 层以内的传值直接用 props；同一组 props 连续透传 3 层以上时，改用功能级 Provider。
- Provider 作用域越小越好，放在页面或模块边界，不要堆到应用根部。
- Next.js 中 store 必须按请求创建（参考 `features/auth/store/authStore.ts` 的工厂 + Context 写法），不能用模块级单例保存用户数据。

## 4. 国际化

- 用户可见文案全部进入语言包；三端插值统一 `{name}` 语法。
- 通用文案（按钮、错误、登录表单）在 `core/i18n/messages`；项目文案在 `src/i18n/messages.ts` 的 `extra` 中按模块分组。
- 两种语言的 key 必须一致（core 有单元测试校验基础语言包）。
- 语言代码统一 `zh-CN` / `en-US`。Next.js 路由前缀同样使用这两个值：`/zh-CN/login`。
- 页面跳转：React 用 `react-router` 的 `Link`；Vue 用 `RouterLink`；Next 用 `@/i18n/navigation` 的 `Link` / `useRouter`（自动带语言前缀）。

## 5. 主题

- 品牌主题色在 `core/theme/theme.ts` 的 `themes` 中增加；对应名称加到 `settings.themeNames`。
- 设计 Token（颜色、圆角、字体）在 `core/styles/tokens.css`，`.dark` 中定义深色值。
- 首屏防闪烁脚本由 `themeInitScript` 统一生成，Vite 模板通过插件注入 `index.html`，Next 在 `[locale]/layout.tsx` 注入。

## 6. 环境变量

- 只通过 `src/config/env.ts` 读取，新增变量时同步更新 `.env.example`（附注释）和 schema。
- 校验失败会在启动时直接报错，并列出具体变量。
- SPA 的 `VITE_` 变量会打进前端包，**不要放密钥**。Next.js 只有 `NEXT_PUBLIC_` 前缀会暴露给浏览器，服务端变量写在 `env.server.ts`。

## 7. 错误处理与遥测

- 接口错误：组件中用 `getErrorMessage(error, t('xxx.fallback'))` 展示。
- 渲染错误：错误边界兜底并上报。
- 业务埋点：`telemetry.track('order_created', { amount })`；事件名用 `snake_case`，`对象_动作`。
- 遥测实现可替换：业务代码只依赖 `core/telemetry` 接口，接入 / 更换 SDK 只改 `services/telemetry.ts`。

## 8. 命名

| 类型               | 规则                          | 示例                           |
| ------------------ | ----------------------------- | ------------------------------ |
| React 组件文件     | PascalCase                    | `OrderTable.tsx`               |
| shadcn/ui 组件文件 | kebab-case                    | `button.tsx`、`form-field.tsx` |
| Vue 组件文件       | PascalCase                    | `OrderTable.vue`、`Button.vue` |
| hook / composable  | `use` 前缀                    | `useOrders.ts`                 |
| 接口文件           | `<模块>Api.ts`                | `orderApi.ts`                  |
| store              | `<模块>Store.ts`              | `authStore.ts`                 |
| 测试               | 与被测文件同级 `*.test.ts(x)` | `orderApi.test.ts`             |

## 9. 提交前检查

```bash
npm run lint
npm run typecheck
npm run test
npm run build
# 或一次执行：
npm run check
```
