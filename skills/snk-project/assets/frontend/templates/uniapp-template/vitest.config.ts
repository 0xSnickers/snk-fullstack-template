import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // uni-app 内置组件在测试中按原生自定义元素处理
          isCustomElement: (tag) =>
            ['view', 'text', 'input', 'button', 'scroll-view', 'navigator'].includes(tag),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
