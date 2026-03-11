import { Module } from "@nestjs/common";
import { PropertyModule } from "../property/property.module";
import { DatabaseController } from "./database.controller";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Module({
  imports: [PropertyModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, DuplicateDatabaseUseCase],
  exports: [DatabaseService, DuplicateDatabaseUseCase],
})
export class DatabaseModule {}
