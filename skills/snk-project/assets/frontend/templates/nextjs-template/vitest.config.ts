import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 测试环境中 server-only 是空模块
      'server-only': fileURLToPath(new URL('./src/test/server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Let jsdom supply browser storage instead of Node's process-wide Web Storage.
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
