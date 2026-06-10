import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SchedulerRegistry } from "@nestjs/schedule";

import { AppLogger } from "@/common/logger/app-logger.service";
import { AutomationScheduler } from "../automation.scheduler";
import { AutomationRepository } from "../repositories/automation.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {},
  prisma: {},
}));

jest.mock("cron", () => ({
  CronJob: jest.fn().mockImplementation((expr: string, cb: () => void) => ({
    expr,
    cb,
    start: jest.fn(),
  })),
}));

import { CronJob } from "cron";

describe("AutomationScheduler", () => {
  let scheduler: AutomationScheduler;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSchedulerRegistry = {
    doesExist: jest.fn().mockReturnValue(false),
    addCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
  };

  const mockAutomationRepo = {
    findAllScheduled: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
  };

  const mockEventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationScheduler,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
        { provide: AutomationRepository, useValue: mockAutomationRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    scheduler = module.get<AutomationScheduler>(AutomationScheduler);
    jest.clearAllMocks();
    (mockSchedulerRegistry.doesExist as jest.Mock).mockReturnValue(false);
  });

  describe("TC-AUTO-U-001: cron expression building via registerJob", () => {
    it("TC-AUTO-U-001: weekly Monday at 09:00 → cron 0 9 * * 1", () => {
      scheduler.registerJob("auto-1", { interval: "weekly", time: "09:00", dayOfWeek: 1 });

      expect(CronJob).toHaveBeenCalledWith("0 9 * * 1", expect.any(Function));
      expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalledWith("automation-auto-1", expect.anything());
    });

    it("TC-AUTO-U-001: daily at 12:00 → cron 0 12 * * *", () => {
      scheduler.registerJob("auto-2", { interval: "daily", time: "12:00" });

      expect(CronJob).toHaveBeenCalledWith("0 12 * * *", expect.any(Function));
    });

    it("TC-AUTO-U-001: monthly on day 1 at 00:00 → cron 0 0 1 * *", () => {
      scheduler.registerJob("auto-3", { interval: "monthly", time: "00:00", dayOfMonth: 1 });

      expect(CronJob).toHaveBeenCalledWith("0 0 1 * *", expect.any(Function));
    });

    it("TC-AUTO-U-001: invalid time format skips job registration", () => {
      scheduler.registerJob("auto-bad", { interval: "daily", time: "not-a-time" });

      expect(CronJob).not.toHaveBeenCalled();
      expect(mockSchedulerRegistry.addCronJob).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("TC-AUTO-U-001: removes existing job before re-registering", () => {
      (mockSchedulerRegistry.doesExist as jest.Mock).mockReturnValue(true);

      scheduler.registerJob("auto-1", { interval: "daily", time: "08:00" });

      expect(mockSchedulerRegistry.deleteCronJob).toHaveBeenCalledWith("automation-auto-1");
      expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalled();
    });
  });

  describe("removeJob", () => {
    it("removes cron job when it exists", () => {
      (mockSchedulerRegistry.doesExist as jest.Mock).mockReturnValue(true);
      scheduler.removeJob("auto-1");
      expect(mockSchedulerRegistry.deleteCronJob).toHaveBeenCalledWith("automation-auto-1");
    });

    it("does nothing when job does not exist", () => {
      (mockSchedulerRegistry.doesExist as jest.Mock).mockReturnValue(false);
      scheduler.removeJob("auto-missing");
      expect(mockSchedulerRegistry.deleteCronJob).not.toHaveBeenCalled();
    });
  });

  describe("onModuleInit", () => {
    it("registers all active scheduled automations on startup", async () => {
      (mockAutomationRepo.findAllScheduled as jest.Mock).mockResolvedValue([
        { id: "a1", config: { interval: "daily", time: "09:00" } },
        { id: "a2", config: { interval: "weekly", time: "10:00", dayOfWeek: 2 } },
      ]);

      await scheduler.onModuleInit();

      expect(CronJob).toHaveBeenCalledTimes(2);
    });
  });
});
