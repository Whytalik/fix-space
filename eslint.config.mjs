import { libraryConfig } from "@fixspace/eslint-config/library";

export default [
  {
    ignores: ["apps/**", "packages/**", "dist/**", "node_modules/**"],
  },
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
];
