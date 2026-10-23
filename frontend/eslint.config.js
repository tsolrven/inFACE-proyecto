import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: 'src', prefix: '@' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*', '@/features/*/**'],
              message:
                'Importa desde el índice público de la feature (@/features/nombre), no desde archivos internos de otra feature.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  eslintConfigPrettier,
]);
