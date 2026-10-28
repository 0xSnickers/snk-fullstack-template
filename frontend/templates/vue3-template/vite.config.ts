import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv, type Plugin, type ProxyOptions } from 'vite';
import { themeInitScript } from './src/core/theme/theme';

/**
 * 当 VITE_API_BASE_URL 是相对路径（如 /api）时，开发环境把它代理到 VITE_API_PROXY_TARGET。
 * 例：/api/users -> http://localhost:9000/api/v1/users
 */
function createApiProxy(env: Record<string, string>): Record<string, ProxyOptions> | undefined {
  const apiBase = env.VITE_API_BASE_URL || '/api';
  const target = env.VITE_API_PROXY_TARGET;

  if (!apiBase.startsWith('/') || !target) return undefined;

  const targetUrl = new URL(target);
  const targetPath = targetUrl.pathname.replace(/\/$/, '');

  return {
    [apiBase]: {
      target: targetUrl.origin,
      changeOrigin: true,
      rewrite: (path) => `${targetPath}${path.slice(apiBase.length)}`,
    },
  };
}

/** 首屏防闪烁：渲染前同步应用已保存的主题色和深浅色（脚本来自 src/core/theme）。 */
function themeInitPlugin(): Plugin {
  return {
    name: 'theme-init',
    transformIndexHtml: () => [
      { tag: 'script', children: themeInitScript, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue(), tailwindcss(), themeInitPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5174,
      proxy: createApiProxy(env),
    },
    build: {
      // 遥测 SDK（Sentry + PostHog）是按需加载的独立 chunk，体积较大属预期。
      chunkSizeWarningLimit: 700,
    },
  };
});
