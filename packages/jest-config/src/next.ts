import type { Config } from "jest";
import type { Config as ConfigNamespace } from "@jest/types";
// @ts-ignore
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  collectCoverage: false,
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "json", "jsx", "tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
