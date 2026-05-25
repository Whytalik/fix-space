import { libraryConfig } from "@fixspace/eslint-config/library";

export default [
  {
    ignores: ["apps/**", "packages/**", "dist/**", "node_modules/**"],
  },
  ...libraryConfig,
  {
    parserOptions: {
      projectService: true,
    },
  },
  {
    rules: {
      // add override for any (a metric ton of them, initial conversion)
      "@typescript-eslint/no-explicit-any": "off",
      // we generally use this in isFunction, not via calling
      "@typescript-eslint/unbound-method": "off",
    },
  },
];
