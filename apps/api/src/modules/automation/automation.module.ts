import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/modules/database/database.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { PropertyValueModule } from "@/modules/property-value/property-value.module";
import { RecordModule } from "@/modules/record/record.module";

import { AutomationController } from "./automation.controller";
import { AutomationEngine } from "./automation.engine";
import { AutomationScheduler } from "./automation.scheduler";
import { AutomationService } from "./automation.service";
import { AutomationRepository } from "./repositories/automation.repository";

@Module({
  imports: [PropertyValueModule, RecordModule, NotificationModule, DatabaseModule],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationRepository, AutomationEngine, AutomationScheduler],
  exports: [AutomationService, AutomationRepository, AutomationEngine],
})
export class AutomationModule {}
