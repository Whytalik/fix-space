import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseResponseDto } from "@nucleus/domain";
import { DatabaseController } from "../database.controller";
import { DatabaseService } from "../database.service";

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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
  });

  describe("create", () => {
    it("should call databaseService.create with spaceId, dto and userId", async () => {
      const dto = {
        name: "Test DB",
        title: "Test Database",
      };
      mockDatabaseService.create.mockResolvedValue(mockDatabaseResponse);

      const result = await controller.create("space-123", "user-123", dto);

      expect(result).toEqual(mockDatabaseResponse);
      expect(mockDatabaseService.create).toHaveBeenCalledWith("space-123", dto, "user-123");
      expect(mockDatabaseService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should call databaseService.findAll with spaceId and userId", async () => {
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
