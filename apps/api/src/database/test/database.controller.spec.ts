import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseResponseDto } from "@nucleus/domain";
import { DatabaseController } from "../database.controller";
import { DatabaseService } from "../database.service";
import { DuplicateDatabaseUseCase } from "../providers/duplicate-database.usecase";

describe("DatabaseController", () => {
  let controller: DatabaseController;

  const mockDatabaseResponse = {
    id: "db-123",
    spaceId: "space-123",
    name: "Test DB",
    title: "Test Database",
    icon: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    sectionId: null,
    config: {},
  } as unknown as DatabaseResponseDto;

  const mockDatabaseService = {
    create: jest.fn<() => Promise<DatabaseResponseDto>>(),
    findAll: jest.fn<() => Promise<DatabaseResponseDto[]>>(),
    findOne: jest.fn<() => Promise<DatabaseResponseDto>>(),
    update: jest.fn<() => Promise<DatabaseResponseDto>>(),
    remove: jest.fn<() => Promise<DatabaseResponseDto>>(),
  };

  const mockDuplicateDatabaseUseCase = {
    execute: jest.fn<any>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: DuplicateDatabaseUseCase, useValue: mockDuplicateDatabaseUseCase },
        Reflector,
      ],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
  });

  describe("create", () => {
    it("should call databaseService.create with dto.spaceId, dto and userId", async () => {
      const dto = {
        name: "Test DB",
        title: "Test Database",
        spaceId: "space-123",
      };
      mockDatabaseService.create.mockResolvedValue(mockDatabaseResponse);

      const result = await controller.create("user-123", dto);

      expect(result).toEqual(mockDatabaseResponse);
      expect(mockDatabaseService.create).toHaveBeenCalledWith("space-123", dto, "user-123");
      expect(mockDatabaseService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should call databaseService.findAll with spaceId query param and userId", async () => {
      mockDatabaseService.findAll.mockResolvedValue([mockDatabaseResponse]);

      const result = await controller.findAll("space-123", "user-123");

      expect(result).toEqual([mockDatabaseResponse]);
      expect(mockDatabaseService.findAll).toHaveBeenCalledWith("space-123", "user-123");
      expect(mockDatabaseService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should call databaseService.findOne with id", async () => {
      mockDatabaseService.findOne.mockResolvedValue(mockDatabaseResponse);

      const result = await controller.findOne("db-123");

      expect(result).toEqual(mockDatabaseResponse);
      expect(mockDatabaseService.findOne).toHaveBeenCalledWith("db-123");
      expect(mockDatabaseService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should call databaseService.update with id and dto", async () => {
      const dto = {
        name: "Updated DB",
      };
      const updatedResponse = {
        ...mockDatabaseResponse,
        name: "Updated DB",
      } as unknown as DatabaseResponseDto;
      mockDatabaseService.update.mockResolvedValue(updatedResponse);

      const result = await controller.update("db-123", dto);

      expect(result).toEqual(updatedResponse);
      expect(mockDatabaseService.update).toHaveBeenCalledWith("db-123", dto);
      expect(mockDatabaseService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("duplicate", () => {
    it("should call duplicateDatabaseUseCase.execute with the database id", async () => {
      mockDuplicateDatabaseUseCase.execute.mockResolvedValue(mockDatabaseResponse);

      const result = await controller.duplicate("db-123");

      expect(result).toEqual(mockDatabaseResponse);
      expect(mockDuplicateDatabaseUseCase.execute).toHaveBeenCalledWith("db-123");
      expect(mockDuplicateDatabaseUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should call databaseService.remove with id", async () => {
      mockDatabaseService.remove.mockResolvedValue(mockDatabaseResponse);

      const result = await controller.remove("db-123");

      expect(result).toEqual(mockDatabaseResponse);
      expect(mockDatabaseService.remove).toHaveBeenCalledWith("db-123");
      expect(mockDatabaseService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
