import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { createAppRouter } from './app/router';
import { initAppPreferences } from './composables/useAppPreferences';
import { installAuthGuards, restoreSession, setupAuth } from './features/auth';
import { i18n } from './i18n';
import { queryClient } from './services/queryClient';
import { initTelemetry, telemetry } from './services/telemetry';
import './styles/globals.css';

const app = createApp(App);
const router = createAppRouter();

// 插件顺序：Pinia 必须在鉴权初始化之前安装。
app.use(createPinia()).use(i18n).use(VueQueryPlugin, { queryClient });

initAppPreferences();
setupAuth();
void restoreSession();
installAuthGuards(router);
void initTelemetry(app, router);

app.config.errorHandler = (error, _instance, info) => {
  telemetry.captureError(error, { source: 'vue_error_handler', info });
  if (import.meta.env.DEV) console.error(error);
};
router.onError((error) => telemetry.captureError(error, { source: 'vue_router_error' }));
router.afterEach((to) => telemetry.pageView(to.fullPath, { name: String(to.name ?? '') }));

app.use(router).mount('#app');
