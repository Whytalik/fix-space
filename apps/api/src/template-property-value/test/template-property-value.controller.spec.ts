import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { CreateTemplatePropertyValueDto, UpdateTemplatePropertyValueDto } from "@nucleus/domain";
import { TemplatePropertyValueController } from "../template-property-value.controller";
import { TemplatePropertyValueService } from "../template-property-value.service";

const mockService = {
  create: jest.fn<any>(),
  findAll: jest.fn<any>(),
  findOne: jest.fn<any>(),
  update: jest.fn<any>(),
  remove: jest.fn<any>(),
};

const mockValue = { id: "val-1", templateId: "tmpl-1", propertyId: "prop-1", value: null };

describe("TemplatePropertyValueController", () => {
  let controller: TemplatePropertyValueController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatePropertyValueController],
      providers: [{ provide: TemplatePropertyValueService, useValue: mockService }],
    }).compile();

    controller = module.get<TemplatePropertyValueController>(TemplatePropertyValueController);
  });

  describe("create", () => {
    it("should delegate to service.create", async () => {
      const dto: CreateTemplatePropertyValueDto = { templateId: "tmpl-1", propertyId: "prop-1" };
      mockService.create.mockResolvedValue(mockValue);

      const result = await controller.create("user-1", dto);

      expect(mockService.create).toHaveBeenCalledWith(dto, "user-1");
      expect(result).toEqual(mockValue);
    });
  });

  describe("findAll", () => {
    it("should delegate to service.findAll", async () => {
      mockService.findAll.mockResolvedValue([mockValue]);

      const result = await controller.findAll("tmpl-1", "user-1");

      expect(mockService.findAll).toHaveBeenCalledWith("tmpl-1", "user-1");
      expect(result).toEqual([mockValue]);
    });
  });

  describe("findOne", () => {
    it("should delegate to service.findOne", async () => {
      mockService.findOne.mockResolvedValue(mockValue);

      const result = await controller.findOne("val-1", "user-1");

      expect(mockService.findOne).toHaveBeenCalledWith("val-1", "user-1");
      expect(result).toEqual(mockValue);
    });
  });

  describe("update", () => {
    it("should delegate to service.update", async () => {
      const dto: UpdateTemplatePropertyValueDto = { value: "updated" };
      mockService.update.mockResolvedValue({ ...mockValue, value: "updated" });

      const result = await controller.update("val-1", "user-1", dto);

      expect(mockService.update).toHaveBeenCalledWith("val-1", dto, "user-1");
      expect(result.value).toBe("updated");
    });
  });

  describe("remove", () => {
    it("should delegate to service.remove", async () => {
      mockService.remove.mockResolvedValue(mockValue);

      const result = await controller.remove("val-1", "user-1");

      expect(mockService.remove).toHaveBeenCalledWith("val-1", "user-1");
      expect(result).toEqual(mockValue);
    });
  });
});
