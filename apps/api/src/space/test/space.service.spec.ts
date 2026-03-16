import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SettingsService } from "../../settings/settings.service";
import { SectionService } from "../providers/section.service";
import { SpaceService } from "../space.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    space: {
      create: jest.fn<any>(),
      findMany: jest.fn<any>(),
      findUnique: jest.fn<any>(),
      update: jest.fn<any>(),
      updateMany: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  },
}));

const sectionsInclude = {
  sections: {
    orderBy: { position: "asc" },
    include: {
      databases: {
        orderBy: { createdAt: "asc" },
      },
    },
  },
  databases: {
    orderBy: { createdAt: "asc" },
  },
};

describe("SpaceService", () => {
  let service: SpaceService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockSectionService = {
    processOperations: jest.fn<any>(),
  };

  const mockSettingsService = {
    getSettings: jest.fn<any>(),
  };

  const mockSpaceSettings = {
    defaultDatabaseIcon: "📊",
    defaultSectionIcon: "📁",
    sidebarCollapsed: false,
    sidebarWidth: 280,
  };

  const mockSpace = {
    id: "space-123",
    ownerId: "user-123",
    name: "Test Space",
    icon: "🚀",
    createdAt: new Date("2024-01-01"),
    config: null,
    sections: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock<any>).mockImplementation((cb) => cb(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
        {
          provide: SectionService,
          useValue: mockSectionService,
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
  });

  describe("create", () => {
    it("should create a space and return SpaceResponseDto", async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      (prisma.space.create as jest.Mock<any>).mockResolvedValue(mockSpace);

      const result = await service.create("user-123", {
        name: "Test Space",
        icon: "🚀",
      });

      expect(result.id).toBe("space-123");
      expect(result.name).toBe("Test Space");
      expect(prisma.space.create).toHaveBeenCalledWith({
        data: {
          name: "Test Space",
          icon: "🚀",
          isDefault: false,
          ownerId: "user-123",
        },
        include: sectionsInclude,
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Space created", {
        spaceId: "space-123",
        ownerId: "user-123",
      });
    });

    it("should rethrow unknown errors", async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      (prisma.space.create as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(service.create("user-123", { name: "Test" })).rejects.toThrow("DB error");
    });

    it("should unset other default spaces before creating when isDefault is true", async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      (prisma.space.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });
      (prisma.space.create as jest.Mock<any>).mockResolvedValue({ ...mockSpace, isDefault: true });

      await service.create("user-123", { name: "Default Space", isDefault: true });

      expect(prisma.space.updateMany).toHaveBeenCalledWith({
        where: { ownerId: "user-123", isDefault: true },
        data: { isDefault: false },
      });
      expect(prisma.space.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isDefault: true }) }),
      );
    });
  });

  describe("findAll", () => {
    it("should return array of SpaceResponseDto for owner", async () => {
      const spaces = [
        mockSpace,
        {
          ...mockSpace,
          id: "space-456",
          name: "Space 2",
        },
      ];
      (prisma.space.findMany as jest.Mock<any>).mockResolvedValue(spaces);

      const result = await service.findAll("user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("space-123");
      expect(result[1].id).toBe("space-456");
      expect(prisma.space.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: "user-123",
        },
        include: sectionsInclude,
      });
    });

    it("should return empty array when no spaces", async () => {
      (prisma.space.findMany as jest.Mock<any>).mockResolvedValue([]);

      const result = await service.findAll("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return SpaceResponseDto for valid id", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(mockSpace);

      const result = await service.findOne("space-123");

      expect(result.id).toBe("space-123");
      expect(result.name).toBe("Test Space");
      expect(prisma.space.findUnique).toHaveBeenCalledWith({
        where: {
          id: "space-123",
        },
        include: sectionsInclude,
      });
    });

    it("should throw NotFoundException when space not found", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent")).rejects.toThrow("Space with id nonexistent not found");
    });
  });

  describe("update", () => {
    it("should update space name and return SpaceResponseDto", async () => {
      const updatedSpace = {
        ...mockSpace,
        name: "Updated Name",
      };
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof updatedSpace>>().mockResolvedValue(updatedSpace),
        },
      };
      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const result = await service.update("space-123", {
        name: "Updated Name",
      });

      expect(result.name).toBe("Updated Name");
      expect(mockTx.space.update).toHaveBeenCalledWith({
        where: {
          id: "space-123",
        },
        data: {
          name: "Updated Name",
          icon: undefined,
        },
        include: sectionsInclude,
      });
    });

    it("should process section operations before updating space", async () => {
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof mockSpace>>().mockResolvedValue(mockSpace),
        },
      };
      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const sectionOps = [
        {
          operation: "CREATE" as const,
          create: {
            name: "New Section",
          },
        },
      ];

      await service.update("space-123", {
        name: "Test",
        sectionOperations: sectionOps as any,
      });

      expect(mockSectionService.processOperations).toHaveBeenCalledWith(mockTx, "space-123", sectionOps);
    });

    it("should not process section operations when empty", async () => {
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof mockSpace>>().mockResolvedValue(mockSpace),
        },
      };
      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await service.update("space-123", { name: "Test" });

      expect(mockSectionService.processOperations).not.toHaveBeenCalled();
    });

    it("should unset other default spaces before updating when isDefault is true", async () => {
      const updatedSpace = { ...mockSpace, isDefault: true };
      const mockTxWithDefault = {
        space: {
          findUnique: jest.fn<any>().mockResolvedValue({ ownerId: "user-123" }),
          updateMany: jest.fn<any>().mockResolvedValue({ count: 1 }),
          update: jest.fn<any>().mockResolvedValue(updatedSpace),
        },
      };
      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: typeof mockTxWithDefault) => Promise<unknown>) => cb(mockTxWithDefault),
      );

      await service.update("space-123", { isDefault: true });

      expect(mockTxWithDefault.space.findUnique).toHaveBeenCalledWith({
        where: { id: "space-123" },
        select: { ownerId: true },
      });
      expect(mockTxWithDefault.space.updateMany).toHaveBeenCalledWith({
        where: { ownerId: "user-123", isDefault: true, id: { not: "space-123" } },
        data: { isDefault: false },
      });
    });
  });

  describe("remove", () => {
    it("should delete space and return SpaceResponseDto", async () => {
      (prisma.space.delete as jest.Mock<any>).mockResolvedValue(mockSpace);

      const result = await service.remove("space-123");

      expect(result.id).toBe("space-123");
      expect(prisma.space.delete).toHaveBeenCalledWith({
        where: {
          id: "space-123",
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Space removed", {
        id: "space-123",
      });
    });

    it("should rethrow unknown errors", async () => {
      (prisma.space.delete as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(service.remove("space-123")).rejects.toThrow("DB error");
    });

    it("should throw BadRequestException when trying to remove the default space", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({ isDefault: true });

      await expect(service.remove("space-123")).rejects.toThrow(BadRequestException);
      await expect(service.remove("space-123")).rejects.toThrow("Cannot delete the default space");
    });
  });
});
