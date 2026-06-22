import { Module } from "@nestjs/common";

import { DatabaseRepository } from "./repositories/database.repository";

@Module({
  providers: [DatabaseRepository],
  exports: [DatabaseRepository],
})
export class DatabaseDataModule {}
