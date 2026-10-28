import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Let jsdom supply browser storage instead of Node's process-wide Web Storage.
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
  },
});
