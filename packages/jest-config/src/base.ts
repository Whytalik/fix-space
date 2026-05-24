import type { Config } from "jest";

export const config = {
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleFileExtensions: ["js", "ts", "json"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
} as const satisfies Config;
