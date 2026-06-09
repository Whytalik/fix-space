import { nestConfig } from "@fixspace/jest-config";

export default {
  ...nestConfig,
  moduleNameMapper: {
    ...nestConfig.moduleNameMapper,
    "^@/(.*)$": "<rootDir>/$1",
  },
};
