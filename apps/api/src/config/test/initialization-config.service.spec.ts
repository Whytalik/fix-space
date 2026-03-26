import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { InitializationConfigService } from "../initialization-config.service";
import { defaultInitializationConfig } from "../initialization.config";

describe("InitializationConfigService", () => {
  let service: InitializationConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [InitializationConfigService],
    }).compile();

    service = module.get<InitializationConfigService>(InitializationConfigService);
  });

  describe("getConfig", () => {
    it("should return the default initialization config", () => {
      const config = service.getConfig();

      expect(config.spaceNameTemplate).toBe(defaultInitializationConfig.spaceNameTemplate);
      expect(config.sections).toEqual(defaultInitializationConfig.sections);
      expect(config.databases).toEqual(defaultInitializationConfig.databases);
    });
  });

  describe("interpolateSpaceName", () => {
    it("should replace {{username}} with the provided username", () => {
      const result = service.interpolateSpaceName("alice");

      expect(result).toBe("alice's Space");
    });
  });
});
