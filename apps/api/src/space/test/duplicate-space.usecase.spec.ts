import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    space: {
      findUnique: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  },
}));

import { prisma } from "@nucleus/database";
import { DEFAULT_SPACE_SETTINGS } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SettingsService } from "../../settings/settings.service";
import { DuplicateSpaceUseCase } from "../providers/duplicate-space.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSettingsService = {
  getSettings: jest.fn<any>(),
};

const mockSpaceSettings = DEFAULT_SPACE_SETTINGS;

const mockSourceSpace = {
  id: "space-123",
  name: "Original Space",
  icon: "🚀",
  ownerId: "user-123",
  config: { some: "config" },
  sections: [{ id: "sec-1", name: "Routine", position: 0, icon: null, color: null, spaceId: "space-123" }],
  databases: [
    {
      id: "db-1",
      name: "journal",
      title: "Journal",
      icon: null,
      sectionId: "sec-1",
      spaceId: "space-123",
      config: null,
      properties: [
        {
          id: "prop-1",
          name: "Name",
          type: "TEXT",
          position: 0,
          icon: null,
          color: null,
          isRequired: true,
          isPrimary: true,
          databaseId: "db-1",
          config: {},
        },
      ],
      records: [
        {
          id: "rec-1",
          name: "Row 1",
          icon: null,
          databaseId: "db-1",
          config: null,
          values: [{ id: "val-1", propertyId: "prop-1", recordId: "rec-1", value: "hello", computed: false }],
          content: { id: "rc-1", recordId: "rec-1", config: {} },
        },
      ],
    },
  ],
};

describe("DuplicateSpaceUseCase", () => {
  let useCase: DuplicateSpaceUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateSpaceUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    useCase = module.get<DuplicateSpaceUseCase>(DuplicateSpaceUseCase);
  });

  describe("execute", () => {
    it("should throw NotFoundException when source space is not found", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(useCase.execute("missing", "user-123")).rejects.toThrow(NotFoundException);
    });

    it("should create new space, sections, databases, properties, records, values and content", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(mockSourceSpace);
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

      const newSpace = { id: "space-new", name: "Custom Name", icon: "🚀", ownerId: "user-123" };
      const newSection = { id: "sec-new" };
      const newDatabase = { id: "db-new" };
      const newProperty = { id: "prop-new" };
      const newRecord = { id: "rec-new" };
      const resultSpace = { ...newSpace, sections: [] };

      const mockTx = {
        space: {
          create: jest.fn<any>().mockResolvedValue(newSpace),
          findUnique: jest.fn<any>().mockResolvedValue(resultSpace),
        },
        section: { create: jest.fn<any>().mockResolvedValue(newSection) },
        database: { create: jest.fn<any>().mockResolvedValue(newDatabase) },
        property: { create: jest.fn<any>().mockResolvedValue(newProperty) },
        record: { create: jest.fn<any>().mockResolvedValue(newRecord) },
        propertyValue: { create: jest.fn<any>().mockResolvedValue({}) },
        recordContent: { create: jest.fn<any>().mockResolvedValue({}) },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("space-123", "user-123", { newName: "Custom Name" });

      expect(mockTx.space.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Custom Name",
          icon: "🚀",
          ownerId: "user-123",
        }),
      });
      expect(mockTx.section.create).toHaveBeenCalledTimes(1);
      expect(mockTx.database.create).toHaveBeenCalledTimes(1);
      expect(mockTx.property.create).toHaveBeenCalledTimes(1);
      expect(mockTx.record.create).toHaveBeenCalledTimes(1);
      expect(mockTx.propertyValue.create).toHaveBeenCalledTimes(1);
      expect(mockTx.recordContent.create).toHaveBeenCalledTimes(1);
    });

    it("should append (Copy) to name when no custom name provided", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(mockSourceSpace);
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

      const newSpace = { id: "space-new", name: "Original Space (Copy)", icon: "🚀", ownerId: "user-123" };
      const resultSpace = { ...newSpace, sections: [] };

      const mockTx = {
        space: {
          create: jest.fn<any>().mockResolvedValue(newSpace),
          findUnique: jest.fn<any>().mockResolvedValue(resultSpace),
        },
        section: { create: jest.fn<any>().mockResolvedValue({ id: "sec-new" }) },
        database: { create: jest.fn<any>().mockResolvedValue({ id: "db-new" }) },
        property: { create: jest.fn<any>().mockResolvedValue({ id: "prop-new" }) },
        record: { create: jest.fn<any>().mockResolvedValue({ id: "rec-new" }) },
        propertyValue: { create: jest.fn<any>().mockResolvedValue({}) },
        recordContent: { create: jest.fn<any>().mockResolvedValue({}) },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("space-123", "user-123");

      expect(mockTx.space.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: "Original Space (Copy)" }),
        }),
      );
    });

    it("should use space settings as fallback when source config is null", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({
        ...mockSourceSpace,
        config: null,
        sections: [],
        databases: [],
      });
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

      const newSpace = { id: "space-new", name: "Copy", icon: "🚀", ownerId: "user-123" };
      const resultSpace = { ...newSpace, sections: [] };

      const mockTx = {
        space: {
          create: jest.fn<any>().mockResolvedValue(newSpace),
          findUnique: jest.fn<any>().mockResolvedValue(resultSpace),
        },
        section: { create: jest.fn<any>() },
        database: { create: jest.fn<any>() },
        property: { create: jest.fn<any>() },
        record: { create: jest.fn<any>() },
        propertyValue: { create: jest.fn<any>() },
        recordContent: { create: jest.fn<any>() },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("space-123", "user-123", { newName: "Copy" });

      expect(mockTx.space.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          config: mockSpaceSettings,
        }),
      });
    });

    it("should map section IDs correctly for database duplication", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(mockSourceSpace);
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

      const newSpace = { id: "space-new" };
      const newSection = { id: "sec-new" };
      const newDatabase = { id: "db-new" };
      const resultSpace = { ...newSpace, sections: [] };

      const mockTx = {
        space: {
          create: jest.fn<any>().mockResolvedValue(newSpace),
          findUnique: jest.fn<any>().mockResolvedValue(resultSpace),
        },
        section: { create: jest.fn<any>().mockResolvedValue(newSection) },
        database: { create: jest.fn<any>().mockResolvedValue(newDatabase) },
        property: { create: jest.fn<any>().mockResolvedValue({ id: "prop-new" }) },
        record: { create: jest.fn<any>().mockResolvedValue({ id: "rec-new" }) },
        propertyValue: { create: jest.fn<any>().mockResolvedValue({}) },
        recordContent: { create: jest.fn<any>().mockResolvedValue({}) },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("space-123", "user-123", { newName: "Copy" });

      expect(mockTx.database.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sectionId: "sec-new" }),
      });
    });

    it("should log duplication summary", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue({
        ...mockSourceSpace,
        sections: [],
        databases: [],
      });
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

      const newSpace = { id: "space-new" };
      const resultSpace = { ...newSpace, sections: [] };

      const mockTx = {
        space: {
          create: jest.fn<any>().mockResolvedValue(newSpace),
          findUnique: jest.fn<any>().mockResolvedValue(resultSpace),
        },
        section: { create: jest.fn<any>() },
        database: { create: jest.fn<any>() },
        property: { create: jest.fn<any>() },
        record: { create: jest.fn<any>() },
        propertyValue: { create: jest.fn<any>() },
        recordContent: { create: jest.fn<any>() },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("space-123", "user-123", { newName: "Copy" });

      expect(mockLogger.log).toHaveBeenCalledWith("Space duplicated", {
        sourceSpaceId: "space-123",
        newSpaceId: "space-new",
        ownerId: "user-123",
      });
    });

    it("should rethrow unknown errors", async () => {
      (prisma.space.findUnique as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("space-123", "user-123")).rejects.toThrow("DB error");
    });
  });
});
