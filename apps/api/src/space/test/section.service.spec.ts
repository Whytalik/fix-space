import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Prisma } from "@nucleus/database";
import { SectionOperationType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SectionRepository } from "../providers/section.repository";
import { SectionService } from "../providers/section.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSectionRepo = {
  create: jest.fn<any>(),
  findById: jest.fn<any>(),
  findLastPosition: jest.fn<any>(),
  findDuplicate: jest.fn<any>(),
  update: jest.fn<any>(),
  delete: jest.fn<any>(),
};

const mockSection = {
  id: "section-123",
  name: "Routine",
  position: 0,
  icon: null,
  color: null,
  spaceId: "space-123",
};

const mockTx = {} as unknown as Prisma.TransactionClient;

describe("SectionService", () => {
  let service: SectionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SectionRepository, useValue: mockSectionRepo },
      ],
    }).compile();

    service = module.get<SectionService>(SectionService);
  });

  describe("create", () => {
    it("should create a section without a transaction and return SectionResponseDto", async () => {
      const sectionData = {
        id: "section-new",
        name: "New Section",
        position: 1,
        icon: null,
        color: null,
        spaceId: "space-123",
      };
      mockSectionRepo.create.mockResolvedValue(sectionData);

      const result = await service.create("space-123", { name: "New Section", position: 1 });

      expect(result).toEqual(expect.objectContaining({ id: "section-new", name: "New Section" }));
      expect(mockSectionRepo.create).toHaveBeenCalledWith({
        name: "New Section",
        position: 1,
        icon: undefined,
        color: undefined,
        spaceId: "space-123",
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Section created", {
        sectionId: "section-new",
        spaceId: "space-123",
      });
    });
  });

  describe("processOperations", () => {
    describe("CREATE operation", () => {
      it("should create a section via transaction", async () => {
        mockSectionRepo.create.mockResolvedValue({ ...mockSection, id: "section-new" });

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.CREATE,
            create: { name: "New Section", position: 1 },
          },
        ]);

        expect(mockSectionRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New Section",
            spaceId: "space-123",
          }),
          mockTx,
        );
      });

      it("should auto-assign position when not provided", async () => {
        mockSectionRepo.findLastPosition.mockResolvedValue({ position: 2 });
        mockSectionRepo.create.mockResolvedValue(mockSection);

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.CREATE,
            create: { name: "Auto Position" },
          },
        ]);

        expect(mockSectionRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ position: 3 }),
          mockTx,
        );
      });

      it("should throw BadRequestException when create field is missing", async () => {
        await expect(
          service.processOperations(mockTx, "space-123", [{ operation: SectionOperationType.CREATE }]),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.processOperations(mockTx, "space-123", [{ operation: SectionOperationType.CREATE }]),
        ).rejects.toThrow('CREATE operation requires "create" field with section data');
      });
    });

    describe("UPDATE operation", () => {
      it("should update a section via transaction", async () => {
        mockSectionRepo.findById.mockResolvedValue(mockSection);
        mockSectionRepo.findDuplicate.mockResolvedValue(null);
        mockSectionRepo.update.mockResolvedValue({ ...mockSection, name: "Updated" });

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.UPDATE,
            id: "section-123",
            update: { name: "Updated" },
          },
        ]);

        expect(mockSectionRepo.update).toHaveBeenCalledWith(
          "section-123",
          {
            name: "Updated",
            position: undefined,
            icon: undefined,
            color: undefined,
          },
          mockTx,
        );
      });

      it("should throw BadRequestException when id is missing", async () => {
        await expect(
          service.processOperations(mockTx, "space-123", [{ operation: SectionOperationType.UPDATE }]),
        ).rejects.toThrow('UPDATE operation requires "id" field');
      });

      it("should throw NotFoundException when section not found", async () => {
        mockSectionRepo.findById.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.UPDATE, id: "nonexistent" },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw BadRequestException when section belongs to different space", async () => {
        mockSectionRepo.findById.mockResolvedValue({ ...mockSection, spaceId: "other-space" });

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.UPDATE, id: "section-123" },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it("should throw BadRequestException on duplicate section name", async () => {
        mockSectionRepo.findById.mockResolvedValue(mockSection);
        mockSectionRepo.findDuplicate.mockResolvedValue({ id: "other-section", name: "Duplicate" });

        await expect(
          service.processOperations(mockTx, "space-123", [
            {
              operation: SectionOperationType.UPDATE,
              id: "section-123",
              update: { name: "Duplicate" },
            },
          ]),
        ).rejects.toThrow('Section with name "Duplicate" already exists in this space');
      });
    });

    describe("DELETE operation", () => {
      it("should delete a section via transaction", async () => {
        mockSectionRepo.findById.mockResolvedValue(mockSection);
        mockSectionRepo.delete.mockResolvedValue(mockSection);

        await service.processOperations(mockTx, "space-123", [
          { operation: SectionOperationType.DELETE, id: "section-123" },
        ]);

        expect(mockSectionRepo.delete).toHaveBeenCalledWith("section-123", mockTx);
        expect(mockLogger.log).toHaveBeenCalledWith("Section deleted", {
          sectionId: "section-123",
          spaceId: "space-123",
        });
      });

      it("should throw BadRequestException when id is missing", async () => {
        await expect(
          service.processOperations(mockTx, "space-123", [{ operation: SectionOperationType.DELETE }]),
        ).rejects.toThrow('DELETE operation requires "id" field');
      });

      it("should throw NotFoundException when section not found", async () => {
        mockSectionRepo.findById.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.DELETE, id: "nonexistent" },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw BadRequestException when section belongs to different space", async () => {
        mockSectionRepo.findById.mockResolvedValue({ ...mockSection, spaceId: "other-space" });

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.DELETE, id: "section-123" },
          ]),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
