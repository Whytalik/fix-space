import { Module } from "@nestjs/common";
import { SpaceRepository } from "../space/space.repository";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { GetRecordContentUseCase } from "./providers/get-record-content.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { UpdateRecordContentUseCase } from "./providers/update-record-content.usecase";
import { RecordController } from "./record.controller";
import { RecordRepository } from "./record.repository";
import { RecordService } from "./record.service";

@Module({
  controllers: [RecordController],
  providers: [
    RecordService,
    RecordRepository,
    FindRecordsUseCase,
    SearchRecordsUseCase,
    GetRecordContentUseCase,
    UpdateRecordContentUseCase,
    SpaceRepository,
  ],
  exports: [RecordService, RecordRepository],
})
export class RecordModule {}
