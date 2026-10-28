import { createBrowserRouter } from 'react-router';
import { RouteErrorPage } from '@/components/error/RouteErrorPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { GuestOnly, RequireAuth } from '@/features/auth';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * 路由表。页面使用 lazy 按需加载，新增页面：
 * 1. 在 src/pages 新建页面组件；
 * 2. 在下方对应分组（公开 / 仅游客 / 需要登录）中注册。
 */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
      },
      {
        element: <GuestOnly />,
        children: [
          {
            path: 'login',
            lazy: async () => ({ Component: (await import('@/pages/LoginPage')).LoginPage }),
          },
          {
            path: 'register',
            lazy: async () => ({ Component: (await import('@/pages/RegisterPage')).RegisterPage }),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          // 需要登录的页面放这里
          {
            path: 'profile',
            lazy: async () => ({ Component: (await import('@/pages/ProfilePage')).ProfilePage }),
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
