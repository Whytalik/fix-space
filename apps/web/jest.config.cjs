/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  coverageProvider: "v8",
  collectCoverage: true,
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "json", "jsx", "tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],
};

module.exports = createJestConfig(customJestConfig);

