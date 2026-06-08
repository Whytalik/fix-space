import { nestJsConfig } from '@fixspace/eslint-config/nest-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
