import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default tseslint.config(
  { ignores: ['dist/**', 'unpackage/**', 'coverage/**', 'node_modules/**', 'src/core/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        uni: 'readonly',
        UniApp: 'readonly',
        getCurrentPages: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // 统一通过 src/services/http.ts 请求接口（禁止直接 fetch / uni.request）
      'no-restricted-properties': [
        'error',
        {
          object: 'uni',
          property: 'request',
          message: '请使用 @/services/http 中的 http 客户端。',
        },
      ],
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
    files: ['src/services/**', '**/*.test.ts', '*.config.ts', 'scripts/**'],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
    },
  },
  {
    // Node 脚本（如 scripts/mock-server.mjs）
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
