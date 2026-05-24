import type { Config } from "jest";
import { config as baseConfig } from "./base";

export const domainConfig = {
  ...baseConfig,
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }],
  },
  collectCoverageFrom: ["**/*.ts"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
} as const satisfies Config;
