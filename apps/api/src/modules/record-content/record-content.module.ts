import { Module } from "@nestjs/common";

import { StorageModule } from "../../core/storage/storage.module";

import { RecordContentController } from "./record-content.controller";
import { RecordContentService } from "./record-content.service";
import { RecordContentRepository } from "./repositories/record-content.repository";

@Module({
  imports: [StorageModule],
  controllers: [RecordContentController],
  providers: [RecordContentService, RecordContentRepository],
  exports: [RecordContentService, RecordContentRepository],
})
export class RecordContentModule {}
