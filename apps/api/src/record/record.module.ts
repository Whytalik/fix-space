import { Module } from "@nestjs/common";
import { SpaceRepository } from "../space/space.repository";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { RecordController } from "./record.controller";
import { RecordRepository } from "./record.repository";
import { RecordService } from "./record.service";

@Module({
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, FindRecordsUseCase, SearchRecordsUseCase, SpaceRepository],
  exports: [RecordService, RecordRepository],
})
export class RecordModule {}
