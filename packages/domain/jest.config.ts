import { domainConfig } from "@fixspace/jest-config";

export default {
  ...domainConfig,
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.test.json" }],
  },
};
