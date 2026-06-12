import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AutomationActionType, AutomationStatus, AutomationTrigger } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { NotificationService } from "@/modules/notification/notification.service";
import { PropertyValueService } from "@/modules/property-value/property-value.service";
import { RecordService } from "@/modules/record/record.service";

import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { AutomationEngine } from "../automation.engine";
import { AutomationScheduler } from "../automation.scheduler";
import { AutomationService } from "../automation.service";
import { AutomationRepository } from "../repositories/automation.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: { DbNull: null, InputJsonValue: undefined },
  NotificationType: { INFO: "INFO", ERROR: "ERROR", AUTOMATION: "AUTOMATION", INTEGRATION: "INTEGRATION" },
  prisma: {},
}));

describe("AutomationService", () => {
  let service: AutomationService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockAutomationRepo = {
    countByDatabase: jest.fn(),
    findAllByDatabase: jest.fn(),
    findById: jest.fn(),
    findByOwner: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createLog: jest.fn(),
    findLogsByAutomation: jest.fn(),
  };

  const mockDatabaseRepo = {
    findDatabaseByOwner: jest.fn(),
    findById: jest.fn(),
    findWithSpace: jest.fn(),
  };

  const mockRecordRepo = {
    findById: jest.fn(),
    findManyByDatabase: jest.fn(),
  };

  const mockEngine = {
    evaluateFieldChangeCondition: jest.fn(),
    resolveValue: jest.fn(),
    shouldSkipFilters: jest.fn(),
    matchesFilters: jest.fn(),
    getRecordValue: jest.fn(),
    buildWriteModeDescription: jest.fn(),
  };

  const mockPropertyValueService = {
    create: jest.fn(),
  };

  const mockRecordService = {
    create: jest.fn(),
  };

  const mockScheduler = {
    registerJob: jest.fn(),
    removeJob: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        { provide: AutomationRepository, useValue: mockAutomationRepo },
        { provide: AutomationEngine, useValue: mockEngine },
        { provide: PropertyValueService, useValue: mockPropertyValueService },
        { provide: RecordService, useValue: mockRecordService },
        { provide: AutomationScheduler, useValue: mockScheduler },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: RecordRepository, useValue: mockRecordRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
    jest.clearAllMocks();
  });

  describe("TC-AUTO-U-006: create — limit enforcement", () => {
    it("TC-AUTO-U-006: should throw BadRequestException when 10 automations already exist", async () => {
      (mockDatabaseRepo.findDatabaseByOwner as jest.Mock).mockResolvedValue({ id: "db-1" });
      (mockAutomationRepo.countByDatabase as jest.Mock).mockResolvedValue(10);

      await expect(
        service.create({ databaseId: "db-1", name: "Extra", trigger: AutomationTrigger.ON_RECORD_CREATE, actions: [] }, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("TC-AUTO-U-006: should create successfully when count is below 10", async () => {
      (mockDatabaseRepo.findDatabaseByOwner as jest.Mock).mockResolvedValue({ id: "db-1" });
      (mockAutomationRepo.countByDatabase as jest.Mock).mockResolvedValue(9);
      (mockAutomationRepo.create as jest.Mock).mockResolvedValue({
        id: "auto-new",
        databaseId: "db-1",
        name: "My Auto",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        actions: [],
        active: true,
        config: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(
        { databaseId: "db-1", name: "My Auto", trigger: AutomationTrigger.ON_RECORD_CREATE, actions: [] },
        "user-1",
      );

      expect(result).toBeDefined();
      expect(result.id).toBe("auto-new");
    });
  });

  describe("TC-AUTO-U-008: ownership checks", () => {
    it("TC-AUTO-U-008: findOne should throw NotFoundException when user does not own automation", async () => {
      (mockAutomationRepo.findByOwner as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne("auto-1", "other-user")).rejects.toThrow(NotFoundException);
    });

    it("TC-AUTO-U-008: update should throw NotFoundException when automation not found for owner", async () => {
      (mockAutomationRepo.findByOwner as jest.Mock).mockResolvedValue(null);

      await expect(service.update("auto-1", { name: "New" }, "wrong-user")).rejects.toThrow(NotFoundException);
    });

    it("TC-AUTO-U-008: delete should throw NotFoundException when automation not found for owner", async () => {
      (mockAutomationRepo.findByOwner as jest.Mock).mockResolvedValue(null);

      await expect(service.delete("auto-1", "wrong-user")).rejects.toThrow(NotFoundException);
    });

    it("TC-AUTO-U-008: findAll should throw NotFoundException when database not owned", async () => {
      (mockDatabaseRepo.findDatabaseByOwner as jest.Mock).mockResolvedValue(null);

      await expect(service.findAll("db-1", "wrong-user")).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-AUTO-U-003: recursion guard", () => {
    it("TC-AUTO-U-003: should not execute automation twice in same chain", async () => {
      const automation = {
        id: "auto-1",
        name: "Test Auto",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        active: true,
        actions: [{ type: AutomationActionType.SET_FIELD_VALUE, propertyId: "p", valueType: "FIXED", value: "x" }],
        config: null,
      };

      (mockAutomationRepo.findAllByDatabase as jest.Mock).mockResolvedValue([automation]);
      (mockEngine.resolveValue as jest.Mock).mockReturnValue("x");
      (mockAutomationRepo.createLog as jest.Mock).mockResolvedValue({});
      (mockPropertyValueService.create as jest.Mock).mockResolvedValue({});
      (mockNotificationService.create as jest.Mock).mockResolvedValue({});

      const event = {
        record: { id: "rec-1", databaseId: "db-1", values: [] },
        userId: "user-1",
        skipAutomations: false,
      };

      await service.onRecordCreated(event);

      expect(mockPropertyValueService.create).toHaveBeenCalledTimes(1);
      expect(mockAutomationRepo.createLog).toHaveBeenCalledTimes(1);
    });

    it("TC-AUTO-U-003: should skip event when skipAutomations is true", async () => {
      await service.onRecordCreated({
        record: { id: "rec-1", databaseId: "db-1" },
        userId: "user-1",
        skipAutomations: true,
      });

      expect(mockAutomationRepo.findAllByDatabase).not.toHaveBeenCalled();
    });
  });

  describe("TC-AUTO-U-004: cross-DB cascade prevention", () => {
    it("TC-AUTO-U-004: fieldChanged with skipAutomations=true does not trigger automations", async () => {
      await service.onFieldChanged({
        recordId: "rec-1",
        databaseId: "db-1",
        propertyId: "prop-1",
        oldValue: null,
        newValue: "new",
        userId: "user-1",
        skipAutomations: true,
      });

      expect(mockAutomationRepo.findAllByDatabase).not.toHaveBeenCalled();
    });
  });

  describe("TC-AUTO-U-002: action chain stops on error", () => {
    it("TC-AUTO-U-002: remaining actions not executed after one fails", async () => {
      const automation = {
        id: "auto-chain",
        name: "Chain Auto",
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        active: true,
        actions: [
          { type: AutomationActionType.SET_FIELD_VALUE, propertyId: "p1", valueType: "FIXED", value: "v1" },
          { type: AutomationActionType.SET_FIELD_VALUE, propertyId: "p2", valueType: "FIXED", value: "v2" },
        ],
        config: null,
      };

      (mockAutomationRepo.findAllByDatabase as jest.Mock).mockResolvedValue([automation]);
      (mockEngine.resolveValue as jest.Mock).mockReturnValue("v1");
      (mockPropertyValueService.create as jest.Mock).mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("Write failed"));
      (mockAutomationRepo.createLog as jest.Mock).mockResolvedValue({});
      (mockNotificationService.create as jest.Mock).mockResolvedValue({});

      await service.onRecordCreated({
        record: { id: "rec-1", databaseId: "db-1", values: [] },
        userId: "user-1",
      });

      expect(mockPropertyValueService.create).toHaveBeenCalledTimes(2);
      expect(mockAutomationRepo.createLog).toHaveBeenCalledWith(expect.objectContaining({ status: AutomationStatus.FAILURE }));
    });
  });

  describe("TC-AUTO-U-005: log operations", () => {
    it("TC-AUTO-U-005: getLogs returns automation logs for owner", async () => {
      (mockAutomationRepo.findByOwner as jest.Mock).mockResolvedValue({ id: "auto-1" });
      (mockAutomationRepo.findLogsByAutomation as jest.Mock).mockResolvedValue([
        { id: "log-1", automationId: "auto-1", status: "SUCCESS", result: "ok", sourceRecordId: null, createdAt: new Date() },
      ]);

      const logs = await service.getLogs("auto-1", "user-1");

      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe("SUCCESS");
    });
  });
});
