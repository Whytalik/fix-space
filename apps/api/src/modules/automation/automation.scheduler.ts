import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

import { AppLogger } from "@/common/logger/app-logger.service";

import { AutomationRepository } from "./repositories/automation.repository";

export interface ScheduleConfig {
  interval: "daily" | "weekly" | "monthly";
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface AutomationScheduledEvent {
  automationId: string;
}

@Injectable()
export class AutomationScheduler implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly logger: AppLogger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly automationRepo: AutomationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext(AutomationScheduler.name);
  }

  async onModuleInit(): Promise<void> {
    this.logger.debug("Registering scheduled automations on startup");
    try {
      const scheduledAutomations = await this.automationRepo.findAllScheduled();
      for (const automation of scheduledAutomations) {
        this.registerJob(automation.id, automation.config as unknown as ScheduleConfig);
      }
      this.logger.log("Scheduled automations registered", { count: scheduledAutomations.length });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn("Could not register scheduled automations on startup — DB may not be ready", { error: errorMessage });
    }
  }

  onModuleDestroy() {
    this.logger.debug("Stopping all scheduled automations");
    const automationJobNames = [...this.schedulerRegistry.getCronJobs().keys()].filter((name) => name.startsWith("automation-"));
    for (const name of automationJobNames) {
      this.schedulerRegistry.deleteCronJob(name);
    }
  }

  registerJob(automationId: string, config: ScheduleConfig): void {
    const cronExpression = this.buildCronExpression(config);
    if (!cronExpression) {
      this.logger.warn("Invalid schedule config, skipping job registration", { automationId });
      return;
    }

    const jobName = this.jobName(automationId);
    if (this.schedulerRegistry.doesExist("cron", jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
    }

    const cronJob = new CronJob(cronExpression, async () => {
      this.logger.debug("Scheduled automation fired", { automationId });
      const automation = await this.automationRepo.findById(automationId);
      if (!automation?.active) {
        this.removeJob(automationId);
        return;
      }
      await this.eventEmitter.emitAsync("automation.scheduled", { automationId } satisfies AutomationScheduledEvent);
    });

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
    this.logger.log("Cron job registered", { automationId, cronExpression });
  }

  removeJob(automationId: string): void {
    const jobName = this.jobName(automationId);
    if (this.schedulerRegistry.doesExist("cron", jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log("Cron job removed", { automationId });
    }
  }

  private buildCronExpression(config: ScheduleConfig): string | null {
    if (!config?.interval || !config?.time) return null;

    const parts = config.time.split(":");
    const hours = parseInt(parts[0] ?? "");
    const minutes = parseInt(parts[1] ?? "");
    if (isNaN(hours) || isNaN(minutes)) return null;

    switch (config.interval) {
      case "daily":
        return `${minutes} ${hours} * * *`;
      case "weekly": {
        const dayOfWeek = config.dayOfWeek ?? 1;
        return `${minutes} ${hours} * * ${dayOfWeek}`;
      }
      case "monthly": {
        const dayOfMonth = config.dayOfMonth ?? 1;
        return `${minutes} ${hours} ${dayOfMonth} * *`;
      }
      default:
        return null;
    }
  }

  private jobName(automationId: string): string {
    return `automation-${automationId}`;
  }
}
