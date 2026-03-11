import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { PropertyValueResponseDto } from "@nucleus/domain";
import { PropertyValueController } from "../property-value.controller";
import { PropertyValueService } from "../property-value.service";

describe("PropertyValueController", () => {
  let controller: PropertyValueController;

  const mockPropertyValueResponse = {
    id: "pv-123",
    recordId: "record-123",
    propertyId: "prop-123",
    value: "Hello",
    computed: false,
  } as unknown as PropertyValueResponseDto;

  const mockPropertyValueService = {
    create: jest.fn<() => Promise<PropertyValueResponseDto>>(),
    findAll: jest.fn<() => Promise<PropertyValueResponseDto[]>>(),
    findOne: jest.fn<() => Promise<PropertyValueResponseDto>>(),
    update: jest.fn<() => Promise<PropertyValueResponseDto>>(),
    remove: jest.fn<() => Promise<PropertyValueResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyValueController],
      providers: [
        {
          provide: PropertyValueService,
          useValue: mockPropertyValueService,
        },
      ],
    }).compile();

    controller = module.get<PropertyValueController>(PropertyValueController);
  });

  describe("create", () => {
    it("should call propertyValueService.create with dto.recordId, dto and userId", async () => {
      const dto = {
        propertyId: "prop-123",
        value: "Hello",
        recordId: "record-123",
      };
      mockPropertyValueService.create.mockResolvedValue(mockPropertyValueResponse);

      const result = await controller.create("user-123", dto);

      expect(result).toEqual(mockPropertyValueResponse);
      expect(mockPropertyValueService.create).toHaveBeenCalledWith("record-123", dto, "user-123");
      expect(mockPropertyValueService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should call propertyValueService.findAll with recordId query param and userId", async () => {
      mockPropertyValueService.findAll.mockResolvedValue([mockPropertyValueResponse]);

      const result = await controller.findAll("record-123", "user-123");

      expect(result).toEqual([mockPropertyValueResponse]);
      expect(mockPropertyValueService.findAll).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockPropertyValueService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should call propertyValueService.findOne with id and userId", async () => {
      mockPropertyValueService.findOne.mockResolvedValue(mockPropertyValueResponse);

      const result = await controller.findOne("pv-123", "user-123");

      expect(result).toEqual(mockPropertyValueResponse);
      expect(mockPropertyValueService.findOne).toHaveBeenCalledWith("pv-123", "user-123");
      expect(mockPropertyValueService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should call propertyValueService.update with id, dto and userId", async () => {
      const dto = {
        value: "Updated",
      };
      const updatedResponse = {
        ...mockPropertyValueResponse,
        value: "Updated",
      } as unknown as PropertyValueResponseDto;
      mockPropertyValueService.update.mockResolvedValue(updatedResponse);

      const result = await controller.update("pv-123", "user-123", dto);

      expect(result).toEqual(updatedResponse);
      expect(mockPropertyValueService.update).toHaveBeenCalledWith("pv-123", dto, "user-123");
      expect(mockPropertyValueService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should call propertyValueService.remove with id and userId", async () => {
      mockPropertyValueService.remove.mockResolvedValue(mockPropertyValueResponse);

      const result = await controller.remove("pv-123", "user-123");

      expect(result).toEqual(mockPropertyValueResponse);
      expect(mockPropertyValueService.remove).toHaveBeenCalledWith("pv-123", "user-123");
      expect(mockPropertyValueService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
