const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("../tsconfig.integration.json");

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".integration-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.integration.json" }],
  },
  maxWorkers: 1,
  globalSetup: "./utils/global-setup.ts",
  globalTeardown: "./utils/global-teardown.ts",
  collectCoverage: false,
  moduleNameMapper: {
    "^@fixspace/database$": "<rootDir>/../../../packages/database/src/client.ts",
    
    "^@/modules/(.*)$": "<rootDir>/../src/modules/$1",
    ...pathsToModuleNameMapper(compilerOptions.paths ?? {}, { prefix: "<rootDir>/../" }),
  },
};
