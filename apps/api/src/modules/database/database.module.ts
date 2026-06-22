import { Module } from "@nestjs/common";
import { InitializationConfigModule } from "@/core/config/initialization/initialization-config.module";
import { PropertyModule } from "@/modules/property/property.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SpaceDataModule } from "@/modules/space/space-data.module";
import { TemplateModule } from "@/modules/template/template.module";
import { ViewModule } from "@/modules/view/view.module";
import { DatabaseController } from "./database.controller";
import { DatabaseDataModule } from "./database-data.module";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Module({
  imports: [InitializationConfigModule, PropertyModule, SettingsModule, SpaceDataModule, TemplateModule, ViewModule, DatabaseDataModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, DuplicateDatabaseUseCase],
  exports: [DatabaseService, DatabaseDataModule, DuplicateDatabaseUseCase],
})
export class DatabaseModule {}
