import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { ViewController } from "../view.controller";
import { ViewService } from "../view.service";

describe("ViewController", () => {
  let controller: ViewController;
  let service: jest.Mocked<ViewService>;

  const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    reorder: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    duplicate: jest.fn(),
  } as unknown as jest.Mocked<ViewService>;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewController],
      providers: [
        { provide: ViewService, useValue: mockService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    })
      .overrideGuard(ResourceOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ViewController>(ViewController);
    service = module.get(ViewService) as jest.Mocked<ViewService>;
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("TC-VIEW-U-028: should call service.findAll with correct arguments", async () => {
      service.findAll.mockResolvedValue([{ id: "v-1" }] as any);

      const result = await controller.findAll("db-1", "user-1");

      expect(result).toEqual([{ id: "v-1" }]);
      expect(service.findAll).toHaveBeenCalledWith("db-1", "user-1");
    });
  });

  describe("create", () => {
    it("TC-VIEW-U-029: should call service.create with correct arguments", async () => {
      const dto = { name: "New View" };
      service.create.mockResolvedValue({ id: "v-1" } as any);

      const result = await controller.create("db-1", dto, "user-1");

      expect(result).toEqual({ id: "v-1" });
      expect(service.create).toHaveBeenCalledWith("db-1", dto, "user-1");
    });
  });

  describe("reorder", () => {
    it("TC-VIEW-U-030: should call service.reorder with correct arguments", async () => {
      const body = { viewOrders: [{ id: "v-1", position: 1 }] };
      service.reorder.mockResolvedValue([{ id: "v-1" }] as any);

      const result = await controller.reorder("db-1", body);

      expect(result).toEqual([{ id: "v-1" }]);
      expect(service.reorder).toHaveBeenCalledWith("db-1", body.viewOrders);
    });
  });

  describe("findOne", () => {
    it("TC-VIEW-U-031: should call service.findOne with correct arguments", async () => {
      service.findOne.mockResolvedValue({ id: "v-1" } as any);

      const result = await controller.findOne("v-1");

      expect(result).toEqual({ id: "v-1" });
      expect(service.findOne).toHaveBeenCalledWith("v-1");
    });
  });

  describe("update", () => {
    it("TC-VIEW-U-032: should call service.update with correct arguments", async () => {
      const dto = { name: "New Name" };
      service.update.mockResolvedValue({ id: "v-1", name: "New Name" } as any);

      const result = await controller.update("v-1", dto);

      expect(result).toEqual({ id: "v-1", name: "New Name" });
      expect(service.update).toHaveBeenCalledWith("v-1", dto);
    });
  });

  describe("remove", () => {
    it("TC-VIEW-U-033: should call service.delete with correct arguments", async () => {
      service.delete.mockResolvedValue({ id: "v-1" } as any);

      const result = await controller.remove("v-1");

      expect(result).toEqual({ id: "v-1" });
      expect(service.delete).toHaveBeenCalledWith("v-1");
    });
  });

  describe("duplicate", () => {
    it("TC-VIEW-U-034: should call service.duplicate with correct arguments", async () => {
      service.duplicate.mockResolvedValue({ id: "v-copy" } as any);

      const result = await controller.duplicate("v-1");

      expect(result).toEqual({ id: "v-copy" });
      expect(service.duplicate).toHaveBeenCalledWith("v-1");
    });
  });
});
