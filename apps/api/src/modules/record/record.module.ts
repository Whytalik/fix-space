import { Module, forwardRef } from "@nestjs/common";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { RecordController } from "./record.controller";
import { RecordRepository } from "./repositories/record.repository";
import { RecordService } from "./record.service";
import { PropertyModule } from "../property/property.module";

@Module({
  imports: [SettingsModule, forwardRef(() => PropertyModule)],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, FindRecordsUseCase, SearchRecordsUseCase, SpaceRepository],
  exports: [RecordService, RecordRepository],
})
export class RecordModule {}
