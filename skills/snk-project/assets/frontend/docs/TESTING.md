# 测试规范

三个模板都使用 **Vitest + jsdom**。React / Next 使用 React Testing Library，Vue 使用 Vue Test Utils。

## 1. 写什么测试

| 对象                         | 最低要求                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| `components/ui` 基础组件     | 渲染 + 关键交互（点击、键盘、受控值）                             |
| 业务组件                     | 成功、失败、空数据、校验失败                                      |
| hooks / composables / store  | 核心状态变化                                                      |
| 接口函数                     | 一般不单测（`http` 已在 core 中覆盖）；有参数转换、数据映射时再测 |
| Next.js Route Handler        | 转发地址、请求头、敏感字段裁剪                                    |
| 纯函数（utils、redirect 等） | `it.each` 覆盖边界                                                |

普通展示页面不强制测试。

## 2. 原则

- **不请求真实后端**：mock 模块的 `api` 文件（`vi.mock('../api/authApi')`），或 mock `fetch`（Route Handler）。
- **按用户视角断言**：优先 `getByRole`、`getByLabelText`、`getByText`，避免断言 class 和内部状态。
- **测试互相独立**：每个测试新建 QueryClient（测试工具已处理），`afterEach` 清理 localStorage。
- 测试文件与被测文件同级；跨模块的集成测试放 `tests/`。
- 测试统一中文文案（setup 中已固定 `zh-CN`）。

## 3. 测试工具

| 模板  | 工具                                                           | 提供                                  |
| ----- | -------------------------------------------------------------- | ------------------------------------- |
| React | `renderWithProviders(ui, { route, routes })`                   | i18n、主题、QueryClient、MemoryRouter |
| Vue   | `mountWithPlugins(Component, { route, routes, mountOptions })` | Pinia、i18n、Vue Query、Router        |
| Next  | `renderWithProviders(ui, { user })`                            | next-intl、QueryClient、登录态        |

## 4. 示例

### React：业务组件

```tsx
vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
}));

it('logs in and redirects to the requested page', async () => {
  vi.mocked(login).mockResolvedValue(session);
  renderWithProviders(<AuthForm mode="login" />, {
    route: '/login?redirect=/settings',
    routes: [{ path: '/settings', element: <p>设置页</p> }],
  });

  await userEvent.type(screen.getByLabelText('邮箱'), 'alice@example.com');
  await userEvent.type(screen.getByLabelText('密码'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: '登录' }));

  expect(await screen.findByText('设置页')).toBeInTheDocument();
});
```

### Vue：业务组件

```ts
it('shows validation errors without calling the api', async () => {
  const { wrapper } = await mountWithPlugins(AuthForm, {
    route: '/login',
    mountOptions: { props: { mode: 'login' } },
  });

  await wrapper.find('form').trigger('submit');

  expect(wrapper.text()).toContain('请输入有效的邮箱地址。');
});
```

### Next：Route Handler

```ts
vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

const response = await GET(new Request('http://localhost/api/users?page=2'), {
  params: Promise.resolve({ path: ['users'] }),
});

expect(fetch).toHaveBeenCalledWith('http://localhost:9000/api/v1/users?page=2', expect.anything());
```

依赖 `next/navigation` 的客户端组件，在测试文件中 mock `@/i18n/navigation` 和 `next/navigation`（见 `features/auth/components/AuthForm.test.tsx`）。

## 5. 命令

```bash
npm run test            # 单次运行
npm run test:watch      # 监听模式
npm run test:coverage   # 覆盖率（需安装 @vitest/coverage-v8）
```
