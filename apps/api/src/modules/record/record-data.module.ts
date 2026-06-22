import { Module } from "@nestjs/common";

import { RecordRepository } from "./repositories/record.repository";

@Module({
  providers: [RecordRepository],
  exports: [RecordRepository],
})
export class RecordDataModule {}
