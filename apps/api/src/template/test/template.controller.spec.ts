import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateTemplateDto, UpdateTemplateDto } from "@nucleus/domain";
import { TemplateController } from "../template.controller";
import { TemplateService } from "../template.service";

const mockTemplateService = {
  create: jest.fn<any>(),
  findAll: jest.fn<any>(),
  findOne: jest.fn<any>(),
  update: jest.fn<any>(),
  remove: jest.fn<any>(),
};

const mockTemplate = {
  id: "tmpl-1",
  databaseId: "db-1",
  name: "My Template",
  isDefault: false,
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  values: [],
};

describe("TemplateController", () => {
  let controller: TemplateController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [{ provide: TemplateService, useValue: mockTemplateService }],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
  });

  describe("create", () => {
    it("should delegate to templateService.create", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", name: "My Template" };
      mockTemplateService.create.mockResolvedValue(mockTemplate);

      const result = await controller.create("user-1", dto);

      expect(mockTemplateService.create).toHaveBeenCalledWith("db-1", dto, "user-1");
      expect(result).toEqual(mockTemplate);
    });
  });

  describe("findAll", () => {
    it("should delegate to templateService.findAll", async () => {
      mockTemplateService.findAll.mockResolvedValue([mockTemplate]);

      const result = await controller.findAll("db-1", "user-1");

      expect(mockTemplateService.findAll).toHaveBeenCalledWith("db-1", "user-1");
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe("findOne", () => {
    it("should delegate to templateService.findOne", async () => {
      mockTemplateService.findOne.mockResolvedValue(mockTemplate);

      const result = await controller.findOne("tmpl-1", "user-1");

      expect(mockTemplateService.findOne).toHaveBeenCalledWith("tmpl-1", "user-1");
      expect(result).toEqual(mockTemplate);
    });
  });

  describe("update", () => {
    it("should delegate to templateService.update", async () => {
      const dto: UpdateTemplateDto = { name: "Updated" };
      mockTemplateService.update.mockResolvedValue({ ...mockTemplate, name: "Updated" });

      const result = await controller.update("tmpl-1", "user-1", dto);

      expect(mockTemplateService.update).toHaveBeenCalledWith("tmpl-1", dto, "user-1");
      expect(result.name).toBe("Updated");
    });
  });

  describe("remove", () => {
    it("should delegate to templateService.remove", async () => {
      mockTemplateService.remove.mockResolvedValue(mockTemplate);

      const result = await controller.remove("tmpl-1", "user-1");

      expect(mockTemplateService.remove).toHaveBeenCalledWith("tmpl-1", "user-1");
      expect(result).toEqual(mockTemplate);
    });
  });
});
