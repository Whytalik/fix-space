import { Module } from "@nestjs/common";

import { DatabaseDataModule } from "@/modules/database/database-data.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SpaceDataModule } from "@/modules/space/space-data.module";
import { ViewModule } from "@/modules/view/view.module";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { RecordController } from "./record.controller";
import { RecordDataModule } from "./record-data.module";
import { RecordService } from "./record.service";
import { PropertyModule } from "../property/property.module";
import { TemplateDataModule } from "../template/template-data.module";
import { RecordContentModule } from "../record-content/record-content.module";

@Module({
  imports: [
    SettingsModule,
    PropertyModule,
    RecordContentModule,
    ViewModule,
    DatabaseDataModule,
    TemplateDataModule,
    SpaceDataModule,
    RecordDataModule,
  ],
  controllers: [RecordController],
  providers: [RecordService, FindRecordsUseCase, SearchRecordsUseCase],
  exports: [RecordService, RecordDataModule],
})
export class RecordModule {}
