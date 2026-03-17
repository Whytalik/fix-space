import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../../property/types";
import { PropertyValueRepository } from "../property-value.repository";
import { PropertyValueService } from "../property-value.service";

describe("PropertyValueService", () => {
  let service: PropertyValueService;

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
    formatValue: jest.fn((v: unknown) => v),
    getDefaultValue: jest.fn<any>().mockReturnValue(""),
  };

  const mockTypeRegistry = {
    getConfigHandler: jest.fn<any>().mockReturnValue(mockHandler),
    getValueHandler: jest.fn<any>().mockReturnValue(mockHandler),
  };

  const mockPvRepo = {
    findRecordByOwner: jest.fn<any>(),
    findPropertyById: jest.fn<any>(),
    findByIdWithOwner: jest.fn<any>(),
    findAllByRecord: jest.fn<any>(),
    upsert: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
  };

  const mockRecord = { id: "record-123", databaseId: "db-123", name: "Test Record" };

  const mockProperty = {
    id: "prop-123",
    databaseId: "db-123",
    name: "Title",
    type: "text",
    config: { defaultValue: "", isRichText: false },
  };

  const mockPropertyValue = {
    id: "pv-123",
    recordId: "record-123",
    propertyId: "prop-123",
    value: "Hello",
    computed: false,
  };

  const mockPropertyValueWithProperty = { ...mockPropertyValue, property: mockProperty };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyValueService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: PropertyValueRepository, useValue: mockPvRepo },
      ],
    }).compile();

    service = module.get<PropertyValueService>(PropertyValueService);
  });

  describe("create", () => {
    it("should upsert a property value and return PropertyValueResponseDto", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockPvRepo.upsert.mockResolvedValue(mockPropertyValue);

      const result = await service.create(
        "record-123",
        { recordId: "record-123", propertyId: "prop-123", value: "Hello" },
        "user-123",
      );

      expect(result.id).toBe("pv-123");
      expect(result.value).toBe("Hello");
      expect(mockPvRepo.findRecordByOwner).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockPvRepo.findPropertyById).toHaveBeenCalledWith("prop-123");
      expect(mockHandler.validateValue).toHaveBeenCalledWith("Hello", mockProperty.config);
      expect(mockHandler.formatValue).toHaveBeenCalledWith("Hello", mockProperty.config);
      expect(mockPvRepo.upsert).toHaveBeenCalledWith("record-123", "prop-123", "Hello", false);
      expect(mockLogger.log).toHaveBeenCalledWith("Property value created", {
        propertyValueId: "pv-123",
        recordId: "record-123",
      });
    });

    it("should update existing pre-seeded null row when property value already exists", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockPvRepo.upsert.mockResolvedValue({ ...mockPropertyValue, value: "New" });

      const result = await service.create(
        "record-123",
        { recordId: "record-123", propertyId: "prop-123", value: "New" },
        "user-123",
      );

      expect(result.value).toBe("New");
      expect(mockPvRepo.upsert).toHaveBeenCalledWith("record-123", "prop-123", "New", false);
    });

    it("should use handler.getDefaultValue when dto.value is undefined", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockPvRepo.upsert.mockResolvedValue({ ...mockPropertyValue, value: "" });

      await service.create(
        "record-123",
        { recordId: "record-123", propertyId: "prop-123" },
        "user-123",
      );

      expect(mockHandler.getDefaultValue).toHaveBeenCalledWith(mockProperty.config);
      expect(mockHandler.validateValue).toHaveBeenCalledWith("", mockProperty.config);
    });

    it("should throw NotFoundException when record not found", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(null);

      await expect(
        service.create("record-nonexistent", { recordId: "record-nonexistent", propertyId: "prop-123" }, "user-123"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create("record-nonexistent", { recordId: "record-nonexistent", propertyId: "prop-123" }, "user-123"),
      ).rejects.toThrow("Record with id record-nonexistent not found");
    });

    it("should throw NotFoundException when property not found", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue(null);

      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-nonexistent" }, "user-123"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-nonexistent" }, "user-123"),
      ).rejects.toThrow("Property with id prop-nonexistent not found");
    });

    it("should throw ConflictException when property belongs to a different database", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue({ ...mockProperty, databaseId: "db-other" });

      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-123" }, "user-123"),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-123" }, "user-123"),
      ).rejects.toThrow("Property does not belong to the same database as the record");
    });

    it("should throw BadRequestException when value validation fails", async () => {
      mockPvRepo.findRecordByOwner.mockResolvedValue(mockRecord);
      mockPvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockHandler.validateValue
        .mockReturnValueOnce(["Text value must be a string or null"])
        .mockReturnValueOnce(["Text value must be a string or null"]);

      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-123", value: 123 }, "user-123"),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create("record-123", { recordId: "record-123", propertyId: "prop-123", value: 123 }, "user-123"),
      ).rejects.toThrow("Invalid value for property type text");
    });
  });

  describe("findAll", () => {
    it("should return array of PropertyValueResponseDto", async () => {
      const values = [mockPropertyValueWithProperty, { ...mockPropertyValueWithProperty, id: "pv-456", value: "World" }];
      mockPvRepo.findAllByRecord.mockResolvedValue(values);

      const result = await service.findAll("record-123", "user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("pv-123");
      expect(result[1].id).toBe("pv-456");
      expect(mockPvRepo.findAllByRecord).toHaveBeenCalledWith("record-123", "user-123");
    });

    it("should return empty array when no property values", async () => {
      mockPvRepo.findAllByRecord.mockResolvedValue([]);

      const result = await service.findAll("record-123", "user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return PropertyValueResponseDto for valid id", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValueWithProperty);

      const result = await service.findOne("pv-123", "user-123");

      expect(result.id).toBe("pv-123");
      expect(result.value).toBe("Hello");
      expect(mockPvRepo.findByIdWithOwner).toHaveBeenCalledWith("pv-123", "user-123");
    });

    it("should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(
        "PropertyValue with id nonexistent not found",
      );
    });
  });

  describe("update", () => {
    it("should update property value and return PropertyValueResponseDto", async () => {
      const updatedValue = { ...mockPropertyValue, value: "Updated" };
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValueWithProperty);
      mockPvRepo.update.mockResolvedValue(updatedValue);

      const result = await service.update("pv-123", { value: "Updated" }, "user-123");

      expect(result.value).toBe("Updated");
      expect(mockHandler.validateValue).toHaveBeenCalledWith("Updated", mockProperty.config);
      expect(mockHandler.formatValue).toHaveBeenCalledWith("Updated", mockProperty.config);
      expect(mockPvRepo.update).toHaveBeenCalledWith("pv-123", expect.objectContaining({ value: "Updated" }));
      expect(mockLogger.log).toHaveBeenCalledWith("Property value updated", { id: "pv-123" });
    });

    it("should update only computed flag without value validation when value is undefined", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValueWithProperty);
      mockPvRepo.update.mockResolvedValue({ ...mockPropertyValue, computed: true });

      await service.update("pv-123", { computed: true }, "user-123");

      expect(mockHandler.validateValue).not.toHaveBeenCalled();
      expect(mockHandler.formatValue).not.toHaveBeenCalled();
      expect(mockPvRepo.update).toHaveBeenCalledWith("pv-123", { computed: true });
    });

    it("should not include computed in data when not provided in DTO", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValueWithProperty);
      mockPvRepo.update.mockResolvedValue({ ...mockPropertyValue, value: "Updated" });

      await service.update("pv-123", { value: "Updated" }, "user-123");

      const updateCall = mockPvRepo.update.mock.calls[0][1] as Record<string, unknown>;
      expect(updateCall).not.toHaveProperty("computed");
    });

    it("should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.update("nonexistent", { value: "Updated" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.update("nonexistent", { value: "Updated" }, "user-123")).rejects.toThrow(
        "PropertyValue with id nonexistent not found",
      );
    });

    it("should throw BadRequestException when updated value is invalid", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValueWithProperty);
      mockHandler.validateValue
        .mockReturnValueOnce(["Text value must be a string or null"])
        .mockReturnValueOnce(["Text value must be a string or null"]);

      await expect(service.update("pv-123", { value: 999 }, "user-123")).rejects.toThrow(BadRequestException);
      await expect(service.update("pv-123", { value: 999 }, "user-123")).rejects.toThrow(
        "Invalid value for property type text",
      );
    });
  });

  describe("remove", () => {
    it("should delete property value and return PropertyValueResponseDto", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(mockPropertyValue);
      mockPvRepo.delete.mockResolvedValue(mockPropertyValue);

      const result = await service.remove("pv-123", "user-123");

      expect(result.id).toBe("pv-123");
      expect(mockPvRepo.findByIdWithOwner).toHaveBeenCalledWith("pv-123", "user-123");
      expect(mockPvRepo.delete).toHaveBeenCalledWith("pv-123");
      expect(mockLogger.log).toHaveBeenCalledWith("Property value removed", { id: "pv-123" });
    });

    it("should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(
        "PropertyValue with id nonexistent not found",
      );
    });
  });
});
