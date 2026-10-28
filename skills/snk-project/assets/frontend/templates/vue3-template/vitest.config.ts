import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Let jsdom supply browser storage instead of Node's process-wide Web Storage.
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    css: false,
  },
});
