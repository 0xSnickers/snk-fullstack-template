import { createSSRApp } from 'vue';
import * as Pinia from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { i18n } from './i18n';
import { queryClient } from './services/queryClient';

/** uni-app 入口：必须导出 createApp，Pinia 需要以 Pinia 导出供 App 端使用。 */
export function createApp() {
  const app = createSSRApp(App);
  app.use(Pinia.createPinia()).use(i18n).use(VueQueryPlugin, { queryClient });

  return { app, Pinia };
}
