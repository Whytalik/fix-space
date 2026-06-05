import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Prisma } from "@fixspace/database";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { SectionService } from "../providers/section.service";
import { SectionRepository } from "../repositories/section.repository";
import { SectionOperationType } from "@fixspace/domain";

jest.mock("@fixspace/database", () => ({
  prisma: {
    section: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("SectionService", () => {
  let service: SectionService;
  let sectionRepo: jest.Mocked<SectionRepository>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSectionRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findLastPosition: jest.fn(),
    findDuplicate: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionService, { provide: SectionRepository, useValue: mockSectionRepo }, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<SectionService>(SectionService);
    sectionRepo = module.get(SectionRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-SEC-U-001: should create section with correct parameters", async () => {
      const createdSection = {
        id: "sec-1",
        name: "Analytics",
        position: 1,
        icon: "📈",
        color: "blue",
        spaceId: "space-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSectionRepo.create.mockResolvedValue(createdSection);

      const result = await service.create("space-1", {
        name: "Analytics",
        position: 1,
        icon: "📈",
        color: "blue",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("sec-1");
      expect(sectionRepo.create).toHaveBeenCalledWith({
        name: "Analytics",
        position: 1,
        icon: "📈",
        color: "blue",
        spaceId: "space-1",
      });
    });
  });

  describe("processOperations", () => {
    describe("CREATE", () => {
      it("TC-SEC-U-002: should compute position as lastPosition + 1 when not specified", async () => {
        mockSectionRepo.findLastPosition.mockResolvedValue({ position: 3 });
        mockSectionRepo.create.mockResolvedValue({ id: "sec-1", name: "New Section", position: 4 });

        await service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
          { operation: SectionOperationType.CREATE, create: { name: "New Section" } },
        ]);

        expect(sectionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: "New Section", position: 4 }), prisma);
      });

      it("TC-SEC-U-002: should use position 0 when no sections exist", async () => {
        mockSectionRepo.findLastPosition.mockResolvedValue(null);
        mockSectionRepo.create.mockResolvedValue({ id: "sec-1", name: "First Section", position: 0 });

        await service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
          { operation: SectionOperationType.CREATE, create: { name: "First Section" } },
        ]);

        expect(sectionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: "First Section", position: 0 }), prisma);
      });

      it("TC-SEC-U-005: should throw BadRequestException when CREATE has no data", async () => {
        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [{ operation: SectionOperationType.CREATE }]),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("UPDATE", () => {
      it("TC-SEC-U-003: should throw BadRequestException on duplicate name", async () => {
        mockSectionRepo.findById.mockResolvedValue({
          id: "sec-1",
          name: "Old Name",
          spaceId: "space-1",
          position: 0,
        });
        mockSectionRepo.findDuplicate.mockResolvedValue({
          id: "sec-2",
          name: "Trading",
          spaceId: "space-1",
          position: 1,
        });

        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
            { operation: SectionOperationType.UPDATE, id: "sec-1", update: { name: "Trading" } },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it("TC-SEC-U-005: should throw BadRequestException when UPDATE has no id", async () => {
        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
            { operation: SectionOperationType.UPDATE, update: { name: "New Name" } },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it("TC-SEC-U-005: should throw BadRequestException when section belongs to different space", async () => {
        mockSectionRepo.findById.mockResolvedValue({
          id: "sec-1",
          name: "Section",
          spaceId: "other-space",
          position: 0,
        });

        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
            { operation: SectionOperationType.UPDATE, id: "sec-1", update: { name: "New Name" } },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it("TC-SEC-U-003: should throw NotFoundException when section not found", async () => {
        mockSectionRepo.findById.mockResolvedValue(null);

        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
            { operation: SectionOperationType.UPDATE, id: "nonexistent", update: { name: "New Name" } },
          ]),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe("DELETE", () => {
      it("TC-SEC-U-004: should delete section successfully", async () => {
        mockSectionRepo.findById.mockResolvedValue({
          id: "sec-1",
          name: "Section",
          spaceId: "space-1",
          position: 0,
        });
        mockSectionRepo.delete.mockResolvedValue({ id: "sec-1" });

        await service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
          { operation: SectionOperationType.DELETE, id: "sec-1" },
        ]);

        expect(sectionRepo.delete).toHaveBeenCalledWith("sec-1", prisma);
      });

      it("TC-SEC-U-005: should throw BadRequestException when DELETE has no id", async () => {
        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [{ operation: SectionOperationType.DELETE }]),
        ).rejects.toThrow(BadRequestException);
      });

      it("TC-SEC-U-004: should throw NotFoundException when section not found", async () => {
        mockSectionRepo.findById.mockResolvedValue(null);

        await expect(
          service.processOperations(prisma as unknown as Prisma.TransactionClient, "space-1", [
            { operation: SectionOperationType.DELETE, id: "nonexistent" },
          ]),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
