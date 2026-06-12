import { Module } from "@nestjs/common";
import { SettingsModule } from "@/modules/settings/settings.module";
import { PropertyModule } from "@/modules/property/property.module";
import { ViewModule } from "@/modules/view/view.module";
import { SpaceDataModule } from "@/modules/space/space-data.module";
import { DatabaseController } from "./database.controller";
import { DatabaseDataModule } from "./database-data.module";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Module({
  imports: [PropertyModule, SpaceDataModule, SettingsModule, ViewModule, DatabaseDataModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, DuplicateDatabaseUseCase],
  exports: [DatabaseService, DatabaseDataModule, DuplicateDatabaseUseCase],
})
export class DatabaseModule {}
