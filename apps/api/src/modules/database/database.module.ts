import { Module } from "@nestjs/common";
import { PropertyModule } from "../property/property.module";
import { DatabaseController } from "./database.controller";
import { DatabaseRepository } from "./repositories/database.repository";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Module({
  imports: [PropertyModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, DatabaseRepository, DuplicateDatabaseUseCase],
  exports: [DatabaseService, DatabaseRepository, DuplicateDatabaseUseCase],
})
export class DatabaseModule {}
