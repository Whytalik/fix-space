import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { TemplateController } from "../template.controller";
import { TemplateService } from "../template.service";
import { DuplicateTemplateUseCase } from "../providers/duplicate-template.usecase";

describe("TemplateController", () => {
  let controller: TemplateController;
  let service: jest.Mocked<TemplateService>;
  let duplicateUseCase: jest.Mocked<DuplicateTemplateUseCase>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reset: jest.fn(),
    uploadImage: jest.fn(),
  } as unknown as jest.Mocked<TemplateService>;

  const mockDuplicateUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<DuplicateTemplateUseCase>;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        { provide: TemplateService, useValue: mockService },
        { provide: DuplicateTemplateUseCase, useValue: mockDuplicateUseCase },
        { provide: AppLogger, useValue: mockLogger },
      ],
    })
      .overrideGuard(ResourceOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TemplateController>(TemplateController);
    service = module.get(TemplateService) as jest.Mocked<TemplateService>;
    duplicateUseCase = module.get(DuplicateTemplateUseCase) as jest.Mocked<DuplicateTemplateUseCase>;
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-TMPL-U-029: should call service.create with correct arguments", async () => {
      const dto = { databaseId: "db-1", name: "New Template" };
      service.create.mockResolvedValue({ id: "tpl-1" } as any);

      const result = await controller.create("user-1", dto);

      expect(result).toEqual({ id: "tpl-1" });
      expect(service.create).toHaveBeenCalledWith("db-1", dto, "user-1");
    });
  });

  describe("findAll", () => {
    it("TC-TMPL-U-030: should call service.findAll with correct arguments", async () => {
      service.findAll.mockResolvedValue([{ id: "tpl-1" }] as any);

      const result = await controller.findAll("db-1", "user-1");

      expect(result).toEqual([{ id: "tpl-1" }]);
      expect(service.findAll).toHaveBeenCalledWith("db-1", "user-1");
    });
  });

  describe("findOne", () => {
    it("TC-TMPL-U-031: should call service.findOne with correct arguments", async () => {
      service.findOne.mockResolvedValue({ id: "tpl-1" } as any);

      const result = await controller.findOne("tpl-1");

      expect(result).toEqual({ id: "tpl-1" });
      expect(service.findOne).toHaveBeenCalledWith("tpl-1");
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-032: should call service.update with correct arguments", async () => {
      const dto = { name: "Updated Name" };
      service.update.mockResolvedValue({ id: "tpl-1", name: "Updated Name" } as any);

      const result = await controller.update("tpl-1", dto);

      expect(result).toEqual({ id: "tpl-1", name: "Updated Name" });
      expect(service.update).toHaveBeenCalledWith("tpl-1", dto);
    });
  });

  describe("duplicate", () => {
    it("TC-TMPL-U-033: should call duplicateUseCase.execute with correct arguments", async () => {
      duplicateUseCase.execute.mockResolvedValue({ id: "tpl-copy" } as any);

      const result = await controller.duplicate("tpl-1");

      expect(result).toEqual({ id: "tpl-copy" });
      expect(duplicateUseCase.execute).toHaveBeenCalledWith("tpl-1");
    });
  });

  describe("remove", () => {
    it("TC-TMPL-U-034: should call service.remove with correct arguments", async () => {
      service.remove.mockResolvedValue({ id: "tpl-1" } as any);

      const result = await controller.remove("tpl-1");

      expect(result).toEqual({ id: "tpl-1" });
      expect(service.remove).toHaveBeenCalledWith("tpl-1");
    });
  });

  describe("reset", () => {
    it("TC-TMPL-U-035: should call service.reset with correct arguments", async () => {
      service.reset.mockResolvedValue({ id: "tpl-1" } as any);

      const result = await controller.reset("tpl-1");

      expect(result).toEqual({ id: "tpl-1" });
      expect(service.reset).toHaveBeenCalledWith("tpl-1");
    });
  });

  describe("uploadImage", () => {
    it("TC-TMPL-U-036: should call service.uploadImage with correct arguments", async () => {
      const file = { buffer: Buffer.from(""), originalname: "test.png" } as any;
      service.uploadImage.mockResolvedValue({ url: "img-url" } as any);

      const result = await controller.uploadImage("tpl-1", file);

      expect(result).toEqual({ url: "img-url" });
      expect(service.uploadImage).toHaveBeenCalledWith("tpl-1", file);
    });
  });
});
