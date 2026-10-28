import { defineConfig, globalIgnores } from 'eslint/config';
import expo from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...expo,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // 统一通过 src/services/http.ts 请求接口
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: '请使用 @/services/http 中的 http 客户端。' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: '请使用 @/services/http 中的 http 客户端，不要直接引入 axios。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/**', '**/*.test.{ts,tsx}', 'scripts/**'],
    rules: { 'no-restricted-imports': 'off', 'no-restricted-globals': 'off' },
  },
  prettier,
  globalIgnores([
    'node_modules/**',
    '.expo/**',
    'dist/**',
    'coverage/**',
    'src/core/**',
    'expo-env.d.ts',
    'android/**',
    'ios/**',
  ]),
]);
