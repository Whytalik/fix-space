import { Module } from "@nestjs/common";
import { RecordContentService } from "./record-content.service";
import { RecordContentController } from "./record-content.controller";

@Module({
  controllers: [RecordContentController],
  providers: [RecordContentService],
  exports: [RecordContentService],
})
export class RecordContentModule {}
