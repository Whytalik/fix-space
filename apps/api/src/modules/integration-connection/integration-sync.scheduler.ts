import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { IntegrationStatus, IntegrationService } from "@fixspace/domain";
import { prisma } from "@fixspace/database";
import { AppLogger } from "@/common/logger/app-logger.service";
import { IntegrationConnectionService } from "./integration-connection.service";

@Injectable()
export class IntegrationSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly inProgress = new Set<string>();
  private cronJob: CronJob | null = null;

  constructor(
    private readonly logger: AppLogger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly integrationService: IntegrationConnectionService,
  ) {
    this.logger.setContext(IntegrationSyncScheduler.name);
  }

  onModuleInit(): void {
    this.logger.debug("Registering integration sync scheduler");

    this.cronJob = new CronJob("* * * * *", async () => {
      await this.checkConnections();
    });

    this.schedulerRegistry.addCronJob("integration-sync", this.cronJob);
    this.cronJob.start();

    this.logger.log("Integration sync scheduler registered (every minute)");
  }

  onModuleDestroy(): void {
    if (this.cronJob) {
      void this.cronJob.stop();
      try {
        this.schedulerRegistry.deleteCronJob("integration-sync");
      } catch {
        // ignore
      }
    }
  }

  private async checkConnections(): Promise<void> {
    try {
      const connections = await prisma.integrationConnection.findMany({
        where: {
          status: IntegrationStatus.ACTIVE,
          spaceId: { not: null },
          service: { not: IntegrationService.METATRADER5 },
        },
      });

      const now = Date.now();

      for (const connection of connections) {
        if (this.inProgress.has(connection.id)) {
          this.logger.debug("Sync already in progress, skipping", { connectionId: connection.id });
          continue;
        }

        if (this.shouldSync(connection.lastSyncAt, connection.syncInterval, now)) {
          this.inProgress.add(connection.id);
          this.logger.debug("Scheduled sync triggered", {
            connectionId: connection.id,
            service: connection.service,
          });

          void this.syncConnection(connection.id, connection.userId).finally(() => {
            this.inProgress.delete(connection.id);
          });
        }
      }
    } catch (error) {
      this.logger.warn("Could not check sync connections", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async syncConnection(connectionId: string, userId: string): Promise<void> {
    try {
      const result = await this.integrationService.triggerSync(connectionId, userId);
      this.logger.log("Scheduled sync completed", {
        connectionId,
        synced: result.synced,
        skipped: result.skipped,
      });
    } catch (error) {
      this.logger.error("Scheduled sync failed", {
        connectionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private shouldSync(lastSyncAt: Date | null, syncInterval: number, now: number): boolean {
    if (!lastSyncAt) return true;
    const nextSync = lastSyncAt.getTime() + syncInterval * 60 * 1000;
    return now >= nextSync;
  }
}
