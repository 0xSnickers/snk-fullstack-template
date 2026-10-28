import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import { getActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import type { Component } from 'vue';
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router';
import { i18n } from '@/i18n';

interface MountWithPluginsOptions<T extends Component> {
  /** 初始路由，默认 `/`。 */
  route?: string;
  /** 额外注册的路由，用于断言跳转结果。 */
  routes?: RouteRecordRaw[];
  mountOptions?: ComponentMountingOptions<T>;
}

/** 带全套应用插件（Pinia、i18n、Vue Query、Router）挂载组件。 */
export async function mountWithPlugins<T extends Component>(
  component: T,
  options: MountWithPluginsOptions<T> = {},
) {
  const { route = '/', routes = [], mountOptions = {} } = options;
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: route.split('?')[0]!, component: { template: '<div />' } }, ...routes],
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  await router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    ...mountOptions,
    global: {
      plugins: [getActivePinia()!, i18n, router, [VueQueryPlugin, { queryClient }]],
      ...mountOptions.global,
    },
  } as ComponentMountingOptions<T>);

  return { wrapper, router, queryClient };
}
