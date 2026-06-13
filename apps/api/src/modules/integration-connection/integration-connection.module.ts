import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/modules/database/database.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { PropertyModule } from "@/modules/property/property.module";
import { RecordModule } from "@/modules/record/record.module";
import { CacheModule } from "@/core/cache/cache.module";
import { IntegrationConnectionController } from "./integration-connection.controller";
import { IntegrationConnectionService } from "./integration-connection.service";
import { IntegrationConnectionRepository } from "./repositories/integration-connection.repository";
import { IntegrationProviderFactory } from "./providers/provider.factory";
import { BinanceProvider } from "./providers/binance.provider";
import { SyncRecordService } from "./sync-record.service";
import { IntegrationSyncScheduler } from "./integration-sync.scheduler";
import { SpaceModule } from "@/modules/space/space.module";

@Module({
  imports: [DatabaseModule, NotificationModule, PropertyModule, RecordModule, CacheModule, SpaceModule],
  controllers: [IntegrationConnectionController],
  providers: [
    IntegrationConnectionService,
    IntegrationConnectionRepository,
    IntegrationProviderFactory,
    BinanceProvider,
    SyncRecordService,
    IntegrationSyncScheduler,
  ],
  exports: [IntegrationConnectionService, IntegrationConnectionRepository],
})
export class IntegrationConnectionModule {}
