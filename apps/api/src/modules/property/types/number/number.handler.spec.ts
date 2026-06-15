import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NumberHandler } from "./number.handler";
import { PropertyType } from "@fixspace/domain";

describe("NumberHandler", () => {
  let handler: NumberHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumberHandler],
    }).compile();

    handler = module.get<NumberHandler>(NumberHandler);
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should have type NUMBER", () => {
    expect(handler.type).toBe(PropertyType.NUMBER);
  });

  describe("validateConfig", () => {
    it("should return null for valid config with numeric defaultValue", () => {
      const config = { defaultValue: 10, format: "float" };
      expect(handler.validateConfig(config)).toBeNull();
    });

    it("should return null for valid config with null defaultValue", () => {
      const config = { defaultValue: null, format: "float" };
      expect(handler.validateConfig(config)).toBeNull();
    });

    it("should return error if defaultValue is a string", () => {
      const config = { defaultValue: "10", format: "float" };
      const errors = handler.validateConfig(config);
      expect(errors).toContain("defaultValue must be a number");
    });

    it("should return error if format is invalid", () => {
      const config = { defaultValue: 0, format: "invalid" };
      const errors = handler.validateConfig(config);
      expect(errors).toContain("format must be one of: integer, float, currency, percentage");
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultValue from config if it is a number", () => {
      const config = { defaultValue: 42, format: "float" };
      expect(handler.getDefaultValue(config)).toBe(42);
    });

    it("should return 0 if defaultValue is null", () => {
      const config = { defaultValue: null, format: "float" };
      expect(handler.getDefaultValue(config)).toBe(0);
    });

    it("should return 0 if defaultValue is undefined", () => {
      const config = { format: "float" };
      expect(handler.getDefaultValue(config)).toBe(0);
    });
  });
});
