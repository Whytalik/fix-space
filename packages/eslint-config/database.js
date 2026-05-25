import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for the @nucleus/database package.
 * Handles Prisma generated files properly.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const databaseConfig = [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
  {
    rules: {
      "turbo/no-undeclared-env-vars": [
        "error",
        {
          allowList: ["NODE_ENV"],
        },
      ],
    },
  },
  {
    files: ["generated/**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  {
    ignores: [".turbo/", "node_modules/", "dist/", "generated/", "prisma.config.ts"],
  },
];

export default databaseConfig;
