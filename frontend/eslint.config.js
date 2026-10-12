import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'eslint.config.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowedNames: ['createAppStore'] },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        { allowedNames: ['createAppStore'] },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: true },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          custom: { regex: '^T[A-Z]', match: true },
        },
        { selector: 'enum', format: ['PascalCase'], custom: { regex: '^[IT][A-Z]', match: false } },
        { selector: 'class', format: ['PascalCase'] },
      ],
    },
  },
  {
    files: ['**/__test__/**/*.{ts,tsx}', 'src/shared/lib/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowedNames: ['createAppStore', 'createTestStore'] },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  prettierConfig,
]);
