import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { TemplatePropertyValueController } from "../template-property-value.controller";
import { TemplatePropertyValueService } from "../template-property-value.service";

describe("TemplatePropertyValueController", () => {
  let controller: TemplatePropertyValueController;
  let service: jest.Mocked<TemplatePropertyValueService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<TemplatePropertyValueService>;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatePropertyValueController],
      providers: [
        { provide: TemplatePropertyValueService, useValue: mockService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    })
      .overrideGuard(ResourceOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TemplatePropertyValueController>(TemplatePropertyValueController);
    service = module.get(TemplatePropertyValueService) as jest.Mocked<TemplatePropertyValueService>;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-TMPL-U-024: should call service.create with correct arguments", async () => {
      const dto = { templateId: "tpl-1", propertyId: "prop-1", value: "val" };
      service.create.mockResolvedValue({ id: "val-1" } as any);

      const result = await controller.create("user-1", dto);

      expect(result).toEqual({ id: "val-1" });
      expect(service.create).toHaveBeenCalledWith(dto, "user-1");
    });
  });

  describe("findAll", () => {
    it("TC-TMPL-U-025: should call service.findAll with correct arguments", async () => {
      service.findAll.mockResolvedValue([{ id: "val-1" }] as any);

      const result = await controller.findAll("tpl-1", "user-1");

      expect(result).toEqual([{ id: "val-1" }]);
      expect(service.findAll).toHaveBeenCalledWith("tpl-1", "user-1");
    });
  });

  describe("findOne", () => {
    it("TC-TMPL-U-026: should call service.findOne with correct arguments", async () => {
      service.findOne.mockResolvedValue({ id: "val-1" } as any);

      const result = await controller.findOne("val-1");

      expect(result).toEqual({ id: "val-1" });
      expect(service.findOne).toHaveBeenCalledWith("val-1");
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-027: should call service.update with correct arguments", async () => {
      const dto = { value: "new-val" };
      service.update.mockResolvedValue({ id: "val-1", value: "new-val" } as any);

      const result = await controller.update("val-1", dto);

      expect(result).toEqual({ id: "val-1", value: "new-val" });
      expect(service.update).toHaveBeenCalledWith("val-1", dto);
    });
  });

  describe("remove", () => {
    it("TC-TMPL-U-028: should call service.remove with correct arguments", async () => {
      service.remove.mockResolvedValue({ id: "val-1" } as any);

      const result = await controller.remove("val-1");

      expect(result).toEqual({ id: "val-1" });
      expect(service.remove).toHaveBeenCalledWith("val-1");
    });
  });
});
