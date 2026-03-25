import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { PropertyRepository } from "../property.repository";
import { PropertyTypeRegistry } from "../types";
import { PropertyService } from "../property.service";

describe("PropertyService", () => {
  let service: PropertyService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockHandler = {
    type: PropertyType.TEXT,
    getDefaultConfig: jest.fn<any>().mockReturnValue({ defaultValue: "", isRichText: false }),
    validateConfig: jest.fn<any>().mockReturnValue(null),
    validateValue: jest.fn<any>().mockReturnValue(null),
    formatValue: jest.fn<any>((v: unknown) => v),
    getDefaultValue: jest.fn<any>().mockReturnValue(""),
  };

  const mockTypeRegistry = {
    getConfigHandler: jest.fn<any>().mockReturnValue(mockHandler),
  };

  const mockPropertyRepo = {
    findDatabaseByOwner: jest.fn<any>(),
    findByNameInDatabase: jest.fn<any>(),
    findByIdWithOwner: jest.fn<any>(),
    findByNameExcluding: jest.fn<any>(),
    findAllByDatabase: jest.fn<any>(),
    create: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
    transaction: jest.fn<any>(),
  };

  const mockDatabase = {
    id: "db-123",
    spaceId: "space-123",
    name: "Test Database",
  };

  const mockProperty = {
    id: "prop-123",
    databaseId: "db-123",
    name: "Title",
    type: "text",
    position: 0,
    icon: null,
    isRequired: false,
    isVisible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    config: { defaultValue: "", isRichText: false },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  describe("create", () => {
    function setupCreateMocks(overrides: { property?: unknown } = {}) {
      const mockTx = {
        record: { findMany: jest.fn<any>().mockResolvedValue([]) },
        propertyValue: { createMany: jest.fn<any>().mockResolvedValue({ count: 0 }) },
      };
      mockPropertyRepo.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx));
      mockPropertyRepo.create.mockResolvedValue(overrides.property ?? mockProperty);
      return { mockTx };
    }

    it("should create a property and return PropertyResponseDto", async () => {
      mockPropertyRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(null);
      setupCreateMocks();

      const result = await service.create(
        "db-123",
        { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
        "user-123",
      );

      expect(result.id).toBe("prop-123");
      expect(result.name).toBe("Title");
      expect(mockPropertyRepo.findDatabaseByOwner).toHaveBeenCalledWith("db-123", "user-123");
      expect(mockTypeRegistry.getConfigHandler).toHaveBeenCalledWith(PropertyType.TEXT);
      expect(mockHandler.getDefaultConfig).toHaveBeenCalled();
      expect(mockHandler.validateConfig).toHaveBeenCalled();
      expect(mockPropertyRepo.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith("Property created", {
        propertyId: "prop-123",
        databaseId: "db-123",
      });
    });

    it("should merge user-supplied config with handler default config", async () => {
      mockPropertyRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(null);
      setupCreateMocks();

      await service.create(
        "db-123",
        { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0, config: { isRichText: true } },
        "user-123",
      );

      expect(mockHandler.validateConfig).toHaveBeenCalledWith({
        defaultValue: "",
        isRichText: true,
      });
      expect(mockPropertyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          config: { defaultValue: "", isRichText: true },
        }),
        expect.anything(),
      );
    });

    it("should throw NotFoundException when database not found", async () => {
      mockPropertyRepo.findDatabaseByOwner.mockResolvedValue(null);

      await expect(
        service.create(
          "db-nonexistent",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(
          "db-nonexistent",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow("Database not found");
    });

    it("should throw ConflictException when property name already taken", async () => {
      mockPropertyRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(mockProperty);

      await expect(
        service.create(
          "db-123",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create(
          "db-123",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow("Property name is already taken in this database.");
    });

    it("should throw BadRequestException when config validation fails", async () => {
      mockPropertyRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(null);
      mockHandler.validateConfig
        .mockReturnValueOnce(["defaultValue must be a string"])
        .mockReturnValueOnce(["defaultValue must be a string"]);

      await expect(
        service.create(
          "db-123",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(
          "db-123",
          { databaseId: "db-123", name: "Title", type: PropertyType.TEXT, position: 0 },
          "user-123",
        ),
      ).rejects.toThrow("Invalid config for TEXT");
    });
  });

  describe("findAll", () => {
    it("should return array of PropertyResponseDto ordered by position", async () => {
      const properties = [mockProperty, { ...mockProperty, id: "prop-456", name: "Status", position: 1 }];
      mockPropertyRepo.findAllByDatabase.mockResolvedValue(properties);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("prop-123");
      expect(result[1].id).toBe("prop-456");
      expect(mockPropertyRepo.findAllByDatabase).toHaveBeenCalledWith("db-123", "user-123");
    });

    it("should return empty array when no properties", async () => {
      mockPropertyRepo.findAllByDatabase.mockResolvedValue([]);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return PropertyResponseDto for valid id", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);

      const result = await service.findOne("prop-123", "user-123");

      expect(result.id).toBe("prop-123");
      expect(result.name).toBe("Title");
      expect(mockPropertyRepo.findByIdWithOwner).toHaveBeenCalledWith("prop-123", "user-123");
    });

    it("should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(
        "Property with id nonexistent not found",
      );
    });
  });

  describe("update", () => {
    function setupUpdateTx(updatedProperty: unknown) {
      const mockTx = {
        propertyValue: { updateMany: jest.fn<any>().mockResolvedValue({ count: 0 }) },
      };
      mockPropertyRepo.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx));
      mockPropertyRepo.update.mockResolvedValue(updatedProperty);
      return { mockTx };
    }

    it("should update property fields and return PropertyResponseDto", async () => {
      const updatedProperty = { ...mockProperty, name: "Updated Title", icon: "🔤" };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      mockPropertyRepo.findByNameExcluding.mockResolvedValue(null);
      setupUpdateTx(updatedProperty);

      const result = await service.update("prop-123", { name: "Updated Title", icon: "🔤" }, "user-123");

      expect(result.name).toBe("Updated Title");
      expect(result.icon).toBe("🔤");
      expect(mockPropertyRepo.findByIdWithOwner).toHaveBeenCalledWith("prop-123", "user-123");
      expect(mockPropertyRepo.update).toHaveBeenCalledWith(
        "prop-123",
        expect.objectContaining({ name: "Updated Title", icon: "🔤" }),
        expect.anything(),
      );
      expect(mockLogger.log).toHaveBeenCalledWith("Property updated", { id: "prop-123" });
    });

    it("should not check name conflict when name is unchanged", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      setupUpdateTx(mockProperty);

      await service.update("prop-123", { name: "Title" }, "user-123");

      // findByIdWithOwner called once for ownership check, NOT again for name conflict
      expect(mockPropertyRepo.findByIdWithOwner).toHaveBeenCalledTimes(1);
      expect(mockPropertyRepo.findByNameExcluding).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(
        "Property with id nonexistent not found",
      );
    });

    it("should throw ConflictException when new name is taken by another property", async () => {
      const anotherProperty = { ...mockProperty, id: "prop-other", name: "New Name" };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      mockPropertyRepo.findByNameExcluding.mockResolvedValue(anotherProperty);

      await expect(service.update("prop-123", { name: "New Name" }, "user-123")).rejects.toThrow(ConflictException);
      await expect(service.update("prop-123", { name: "New Name" }, "user-123")).rejects.toThrow(
        "Property name is already taken in this database.",
      );
    });

    it("should reset config to new handler default when type changes", async () => {
      const newDefaultConfig = { format: "number", precision: 2 };
      const newMockHandler = {
        ...mockHandler,
        type: PropertyType.NUMBER,
        getDefaultConfig: jest.fn<any>().mockReturnValue(newDefaultConfig),
        validateConfig: jest.fn<any>().mockReturnValue(null),
      };
      mockTypeRegistry.getConfigHandler.mockReturnValueOnce(newMockHandler);
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      setupUpdateTx({ ...mockProperty, type: "number", config: newDefaultConfig });

      await service.update("prop-123", { type: PropertyType.NUMBER }, "user-123");

      expect(newMockHandler.getDefaultConfig).toHaveBeenCalled();
    });

    it("should null out existing PropertyValues when type changes", async () => {
      const newMockHandler = {
        ...mockHandler,
        type: PropertyType.NUMBER,
        getDefaultConfig: jest.fn<any>().mockReturnValue({ format: "number" }),
        validateConfig: jest.fn<any>().mockReturnValue(null),
      };
      mockTypeRegistry.getConfigHandler.mockReturnValueOnce(newMockHandler);
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      const { mockTx } = setupUpdateTx({ ...mockProperty, type: "number" });

      await service.update("prop-123", { type: PropertyType.NUMBER }, "user-123");

      expect(mockTx.propertyValue.updateMany).toHaveBeenCalledWith({
        where: { propertyId: "prop-123" },
        data: { value: expect.anything() },
      });
    });

    it("should not clear PropertyValues when type does not change", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      mockPropertyRepo.findByNameExcluding.mockResolvedValue(null);
      const { mockTx } = setupUpdateTx(mockProperty);

      await service.update("prop-123", { name: "New name" }, "user-123");

      expect(mockTx.propertyValue.updateMany).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when config validation fails on update", async () => {
      mockHandler.validateConfig.mockReturnValueOnce(["invalid field"]);
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);

      await expect(service.update("prop-123", { config: { badField: "bad" } }, "user-123")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("remove", () => {
    it("should delete property and return PropertyResponseDto", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(mockProperty);
      mockPropertyRepo.delete.mockResolvedValue(mockProperty);

      const result = await service.remove("prop-123", "user-123");

      expect(result.id).toBe("prop-123");
      expect(mockPropertyRepo.findByIdWithOwner).toHaveBeenCalledWith("prop-123", "user-123");
      expect(mockPropertyRepo.delete).toHaveBeenCalledWith("prop-123");
      expect(mockLogger.log).toHaveBeenCalledWith("Property removed", { id: "prop-123" });
    });

    it("should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow("Property with id nonexistent not found");
    });
  });
});
