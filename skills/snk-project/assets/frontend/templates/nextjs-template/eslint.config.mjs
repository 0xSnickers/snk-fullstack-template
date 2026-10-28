import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // 浏览器侧统一通过 src/services/http.ts 请求同源 BFF
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
    files: ['src/services/**', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'coverage/**',
    'node_modules/**',
    'src/core/**',
    'next-env.d.ts',
  ]),
]);
