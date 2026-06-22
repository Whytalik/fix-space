import { nextJsConfig } from '@fixspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ['.next/**', 'coverage/**'],
  },
  {
    files: ['next.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
];
