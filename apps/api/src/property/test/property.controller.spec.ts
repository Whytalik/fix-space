import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { PropertyResponseDto } from "@nucleus/domain";
import { PropertyController } from "../property.controller";
import { PropertyService } from "../property.service";

describe("PropertyController", () => {
  let controller: PropertyController;

  const mockPropertyResponse = {
    id: "prop-123",
    databaseId: "db-123",
    name: "Title",
    type: "text",
    position: 0,
    icon: null,
    color: null,
    isRequired: false,
    isPrimary: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    config: {},
  } as unknown as PropertyResponseDto;

  const mockPropertyService = {
    create: jest.fn<() => Promise<PropertyResponseDto>>(),
    findAll: jest.fn<() => Promise<PropertyResponseDto[]>>(),
    findOne: jest.fn<() => Promise<PropertyResponseDto>>(),
    update: jest.fn<() => Promise<PropertyResponseDto>>(),
    remove: jest.fn<() => Promise<PropertyResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyController],
      providers: [
        {
          provide: PropertyService,
          useValue: mockPropertyService,
        },
      ],
    }).compile();

    controller = module.get<PropertyController>(PropertyController);
  });

  describe("create", () => {
    it("should call propertyService.create with databaseId, dto and userId", async () => {
      const dto = {
        name: "Title",
        type: "text" as any,
      };
      mockPropertyService.create.mockResolvedValue(mockPropertyResponse);

      const result = await controller.create("db-123", "user-123", dto);

      expect(result).toEqual(mockPropertyResponse);
      expect(mockPropertyService.create).toHaveBeenCalledWith("db-123", dto, "user-123");
      expect(mockPropertyService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should call propertyService.findAll with databaseId and userId", async () => {
      mockPropertyService.findAll.mockResolvedValue([mockPropertyResponse]);

      const result = await controller.findAll("db-123", "user-123");

      expect(result).toEqual([mockPropertyResponse]);
      expect(mockPropertyService.findAll).toHaveBeenCalledWith("db-123", "user-123");
      expect(mockPropertyService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should call propertyService.findOne with id and userId", async () => {
      mockPropertyService.findOne.mockResolvedValue(mockPropertyResponse);

      const result = await controller.findOne("prop-123", "user-123");

      expect(result).toEqual(mockPropertyResponse);
      expect(mockPropertyService.findOne).toHaveBeenCalledWith("prop-123", "user-123");
      expect(mockPropertyService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should call propertyService.update with id, dto and userId", async () => {
      const dto = {
        name: "Updated Title",
      };
      const updatedResponse = {
        ...mockPropertyResponse,
        name: "Updated Title",
      } as unknown as PropertyResponseDto;
      mockPropertyService.update.mockResolvedValue(updatedResponse);

      const result = await controller.update("prop-123", "user-123", dto);

      expect(result).toEqual(updatedResponse);
      expect(mockPropertyService.update).toHaveBeenCalledWith("prop-123", dto, "user-123");
      expect(mockPropertyService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should call propertyService.remove with id and userId", async () => {
      mockPropertyService.remove.mockResolvedValue(mockPropertyResponse);

      const result = await controller.remove("prop-123", "user-123");

      expect(result).toEqual(mockPropertyResponse);
      expect(mockPropertyService.remove).toHaveBeenCalledWith("prop-123", "user-123");
      expect(mockPropertyService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
