import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma, prisma } from "@nucleus/database";
import { SectionOperationType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SectionService } from "../providers/section.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    section: {
      create: jest.fn<any>(),
      findFirst: jest.fn<any>(),
    },
  },
}));

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSection = {
  id: "section-123",
  name: "Routine",
  position: 0,
  icon: null,
  color: null,
  spaceId: "space-123",
};

const mockTxSection = {
  findUnique: jest.fn<any>(),
  findFirst: jest.fn<any>(),
  create: jest.fn<any>(),
  update: jest.fn<any>(),
  delete: jest.fn<any>(),
};

const mockTx = {
  section: mockTxSection,
} as unknown as Prisma.TransactionClient;

describe("SectionService", () => {
  let service: SectionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionService, { provide: AppLogger, useValue: mockLogger }],
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
      (prisma.section.create as jest.Mock<any>).mockResolvedValue(sectionData);

      const result = await service.create("space-123", { name: "New Section", position: 1 });

      expect(result).toEqual(expect.objectContaining({ id: "section-new", name: "New Section" }));
      expect(prisma.section.create).toHaveBeenCalledWith({
        data: { name: "New Section", position: 1, icon: undefined, color: undefined, spaceId: "space-123" },
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
        mockTxSection.create.mockResolvedValue({ ...mockSection, id: "section-new" });

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.CREATE,
            create: { name: "New Section", position: 1 },
          },
        ]);

        expect(mockTxSection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: "New Section",
            spaceId: "space-123",
          }),
        });
      });

      it("should auto-assign position when not provided", async () => {
        mockTxSection.findFirst.mockResolvedValue({ position: 2 });
        mockTxSection.create.mockResolvedValue(mockSection);

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.CREATE,
            create: { name: "Auto Position" },
          },
        ]);

        expect(mockTxSection.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ position: 3 }),
        });
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
        mockTxSection.findUnique.mockResolvedValue(mockSection);
        mockTxSection.findFirst.mockResolvedValue(null);
        mockTxSection.update.mockResolvedValue({ ...mockSection, name: "Updated" });

        await service.processOperations(mockTx, "space-123", [
          {
            operation: SectionOperationType.UPDATE,
            id: "section-123",
            update: { name: "Updated" },
          },
        ]);

        expect(mockTxSection.update).toHaveBeenCalledWith({
          where: { id: "section-123" },
          data: {
            name: "Updated",
            position: undefined,
            icon: undefined,
            color: undefined,
          },
        });
      });

      it("should throw BadRequestException when id is missing", async () => {
        await expect(
          service.processOperations(mockTx, "space-123", [{ operation: SectionOperationType.UPDATE }]),
        ).rejects.toThrow('UPDATE operation requires "id" field');
      });

      it("should throw NotFoundException when section not found", async () => {
        mockTxSection.findUnique.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.UPDATE, id: "nonexistent" },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw BadRequestException when section belongs to different space", async () => {
        mockTxSection.findUnique.mockResolvedValue({ ...mockSection, spaceId: "other-space" });

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.UPDATE, id: "section-123" },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it("should throw BadRequestException on duplicate section name", async () => {
        mockTxSection.findUnique.mockResolvedValue(mockSection);
        mockTxSection.findFirst.mockResolvedValue({ id: "other-section", name: "Duplicate" });

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
        mockTxSection.findUnique.mockResolvedValue(mockSection);
        mockTxSection.delete.mockResolvedValue(mockSection);

        await service.processOperations(mockTx, "space-123", [
          { operation: SectionOperationType.DELETE, id: "section-123" },
        ]);

        expect(mockTxSection.delete).toHaveBeenCalledWith({ where: { id: "section-123" } });
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
        mockTxSection.findUnique.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.DELETE, id: "nonexistent" },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw BadRequestException when section belongs to different space", async () => {
        mockTxSection.findUnique.mockResolvedValue({ ...mockSection, spaceId: "other-space" });

        await expect(
          service.processOperations(mockTx, "space-123", [
            { operation: SectionOperationType.DELETE, id: "section-123" },
          ]),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
