import { Module, forwardRef } from "@nestjs/common";
import { SettingsModule } from "@/modules/settings/settings.module";
import { PropertyModule } from "@/modules/property/property.module";
import { ViewModule } from "@/modules/view/view.module";
import { SpaceModule } from "@/modules/space/space.module";
import { DatabaseController } from "./database.controller";
import { DatabaseRepository } from "./repositories/database.repository";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Module({
  imports: [forwardRef(() => PropertyModule), forwardRef(() => SpaceModule), SettingsModule, ViewModule],
  controllers: [DatabaseController],
  providers: [DatabaseService, DatabaseRepository, DuplicateDatabaseUseCase],
  exports: [DatabaseService, DatabaseRepository, DuplicateDatabaseUseCase],
})
export class DatabaseModule {}
