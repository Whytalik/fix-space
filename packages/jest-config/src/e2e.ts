import type { Config } from "jest";
import { config as baseConfig } from "./base";

export const e2eConfig = {
  ...baseConfig,
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverage: false,
} as const satisfies Config;
