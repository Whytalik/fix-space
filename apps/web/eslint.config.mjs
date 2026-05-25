import { nextJsConfig } from '@fixspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ['.next/**'],
  },
];
